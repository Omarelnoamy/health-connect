const REQUIRED_IN_ALL_ENVS = ["DATABASE_URL"];

const ALLOWED_NODE_ENVS = ["development", "test", "production"];

const validateEnv = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const errors = [];
  const warnings = [];

  if (!ALLOWED_NODE_ENVS.includes(nodeEnv)) {
    errors.push(
      `NODE_ENV must be one of: ${ALLOWED_NODE_ENVS.join(", ")}. Received: ${nodeEnv}`
    );
  }

  for (const key of REQUIRED_IN_ALL_ENVS) {
    if (!process.env[key]) {
      const message = `${key} is required but missing.`;
      if (nodeEnv === "production") {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }
  }

  if (nodeEnv === "production" && !process.env.BLOB_READ_WRITE_TOKEN) {
    errors.push(
      "BLOB_READ_WRITE_TOKEN is required in production for Vercel Blob uploads."
    );
  } else if (!process.env.BLOB_READ_WRITE_TOKEN) {
    warnings.push(
      "BLOB_READ_WRITE_TOKEN is not set; uploads use local ./uploads (development only)."
    );
  }

  if (warnings.length > 0) {
    console.warn("[env] Non-production configuration warnings:");
    for (const warning of warnings) {
      console.warn(`[env] - ${warning}`);
    }
  }

  if (errors.length > 0) {
    const formatted = errors.map((error) => `- ${error}`).join("\n");
    throw new Error(`Environment configuration validation failed:\n${formatted}`);
  }
};

module.exports = { validateEnv };
