/**
 * Map repository errors (see patientRepository thrown `err.code`) to HTTP status + message.
 * Response body stays `{ error: string }`.
 */
function mapRepoHttpError(err, fallbackError) {
  const code = err && err.code;
  const message = (err && err.message) || "";

  if (code === "INVALID_PATIENT_ID") {
    return { status: 400, error: "Invalid patient id" };
  }

  if (code === "PATIENT_NOT_FOUND") {
    return { status: 404, error: "Patient not found" };
  }

  if (code === "P2002") {
    const target = err.meta?.target;
    const targets = Array.isArray(target) ? target : target != null ? [String(target)] : [];
    const isNationalId =
      message.includes("national_id") ||
      targets.some((t) => String(t).includes("national_id"));
    return {
      status: 409,
      error: isNationalId ? "national_id already exists" : "Conflict",
    };
  }

  if (code === "FOREIGN_KEY_VIOLATION") {
    const ctx = err.context;
    const childPatientScoped = new Set([
      "addVitals",
      "addMedicalHistory",
      "addContactInfo",
      "addVisit",
      "addClinicalDocument",
    ]);
    if (childPatientScoped.has(ctx)) {
      return { status: 404, error: "Patient not found" };
    }
    return { status: 400, error: "Invalid patient reference" };
  }

  return { status: 500, error: fallbackError || "Internal Server Error" };
}

module.exports = { mapRepoHttpError };
