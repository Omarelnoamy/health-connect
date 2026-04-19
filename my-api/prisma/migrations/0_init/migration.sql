-- Baseline migration: records the schema shape for fresh environments.
-- For existing databases (e.g. Neon) that already have these tables, do NOT run this file by hand.
-- Instead: `npx prisma migrate resolve --applied 0_init` then `npx prisma migrate deploy`
-- See https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/baselining

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "patients" (
    "patient_id" SERIAL NOT NULL,
    "full_name" TEXT,
    "birth_date" DATE,
    "gender" TEXT,
    "national_id" TEXT,
    "nationality" TEXT,
    "language_spoken" TEXT,
    "blood_type" TEXT,
    "profile_photo_path" TEXT,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "contact_info" (
    "contact_id" SERIAL NOT NULL,
    "patient_id" INTEGER,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "emergency_name" TEXT,
    "emergency_relation" TEXT,
    "emergency_phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("contact_id")
);

-- CreateTable
CREATE TABLE "medical_history" (
    "history_id" SERIAL NOT NULL,
    "patient_id" INTEGER,
    "allergies" TEXT,
    "current_medications" TEXT,
    "past_medical_history" TEXT,
    "surgical_history" TEXT,
    "family_history" TEXT,
    "immunization_records" TEXT,
    "chronic_conditions" TEXT,
    "mental_health_conditions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "vitals" (
    "vital_id" SERIAL NOT NULL,
    "patient_id" INTEGER,
    "temperature" DECIMAL(65,30),
    "blood_pressure" TEXT,
    "heart_rate" INTEGER,
    "height_cm" DECIMAL(5,2),
    "weight_kg" DECIMAL(65,30),
    "notes" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vitals_pkey" PRIMARY KEY ("vital_id")
);

-- CreateTable
CREATE TABLE "visits" (
    "visit_id" SERIAL NOT NULL,
    "patient_id" INTEGER,
    "visit_date" TIMESTAMP(6),
    "doctor_name" TEXT,
    "reason" TEXT,
    "diagnosis" TEXT,
    "treatment" TEXT,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("visit_id")
);

-- CreateTable
CREATE TABLE "clinical_documents" (
    "document_id" SERIAL NOT NULL,
    "patient_id" INTEGER,
    "document_name" TEXT,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_type" VARCHAR(255),
    "file_path" TEXT,

    CONSTRAINT "clinical_documents_pkey" PRIMARY KEY ("document_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_national_id_key" ON "patients"("national_id");

-- AddForeignKey
ALTER TABLE "contact_info" ADD CONSTRAINT "contact_info_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_history" ADD CONSTRAINT "medical_history_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_documents" ADD CONSTRAINT "clinical_documents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE SET NULL ON UPDATE CASCADE;
