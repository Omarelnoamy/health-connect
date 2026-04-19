-- MIME types (e.g. application/pdf, image/jpeg, application/vnd...docx) exceed VARCHAR(10).
ALTER TABLE "clinical_documents" ALTER COLUMN "file_type" SET DATA TYPE VARCHAR(255);
