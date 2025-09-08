-- CreateTable
CREATE TABLE "Career" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "schedule" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "cesResolution" TEXT NOT NULL,
    "directorName" TEXT NOT NULL,
    "directorEmail" TEXT NOT NULL,
    "accreditations" TEXT[],
    "mission" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "objectives" TEXT[],
    "graduateProfile" TEXT NOT NULL,
    "professionalProfile" TEXT NOT NULL,
    "curriculumPdfUrl" TEXT,
    "curriculumDescription" TEXT NOT NULL,
    "subjects" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Career_code_key" ON "Career"("code");
