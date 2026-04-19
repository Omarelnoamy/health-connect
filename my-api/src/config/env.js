const { validateEnv } = require("./validateEnv");

const parseCsv = (value = "") =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3002),
  appPort: Number(process.env.APP_PORT || 3002),
  apiPort: Number(process.env.API_PORT || process.env.PORT || 3002),
  corsAllowedOrigins: parseCsv(
    process.env.CORS_ALLOWED_ORIGINS ||
      "http://localhost:3002,http://127.0.0.1:3002"
  ),
  /** Vercel Blob read-write token (required in production for uploads). */
  blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN || "",
};

validateEnv();

module.exports = { env };
