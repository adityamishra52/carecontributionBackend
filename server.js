import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDB } from "./config/db.js";
import activityRoutes from "./routes/activityRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import transparencyRoutes from "./routes/transparencyRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { normalizeApiPayload } from "./utils/apiResponse.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultAllowedOrigins = [
  "https://support-kindness.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

for (const origin of [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  ...defaultAllowedOrigins,
]) {
  if (origin && !allowedOrigins.includes(origin)) {
    allowedOrigins.push(origin);
  }
}

function isLocalBrowserOrigin(origin) {
  try {
    const parsed = new URL(origin);
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}

function isVercelOrigin(origin) {
  try {
    const parsed = new URL(origin);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin) {
  return (
    allowedOrigins.includes(origin) ||
    isLocalBrowserOrigin(origin) ||
    isVercelOrigin(origin)
  );
}

const app = express();

app.set("trust proxy", 1);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Admin-Password"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 350,
  })
);

app.use(mongoSanitize());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    return originalJson(normalizeApiPayload(body, res.statusCode));
  };

  next();
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Care Contribution API is running",
    data: null,
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend running",
    data: null,
  });
});

app.use("/api/contact", contactRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/supporters", supportRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/transparency", transparencyRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "File too large. Max image size is 5MB."
          : err.message,
      data: null,
    });
  }

  if (
    err?.message?.includes("Only JPG") ||
    err?.message?.includes("Only jpg") ||
    err?.message?.includes("Only JPEG") ||
    err?.message?.includes("Only png") ||
    err?.message?.includes("Only webp")
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  return next(err);
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

connectDB(mongoUri)
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });

    server.on("error", (error) => {
      console.error(`Server failed to start: ${error.message}`);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
