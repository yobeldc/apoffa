-- prisma/migrations/20260702000000_init/migration.sql
-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME,
    "court" TEXT,
    "judges" TEXT,
    "parties" TEXT,
    "summary" TEXT,
    "content" TEXT,
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "pdfUrl" TEXT,
    "pdfText" TEXT,
    "year" INTEGER,
    "caseType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "indexedAt" DATETIME,
    "vectorIds" TEXT,
    "searchText" TEXT,
    "dataQuality" TEXT NOT NULL DEFAULT 'pending'
);

-- CreateTable
CREATE TABLE "Paragraph" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "vectorId" TEXT,
    "classification" TEXT,
    CONSTRAINT "Paragraph_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseBreakdown" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "facts" TEXT,
    "issues" TEXT,
    "holdings" TEXT,
    "reasoning" TEXT,
    "dissent" TEXT,
    "significance" TEXT,
    "fullText" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model" TEXT,
    CONSTRAINT "CaseBreakdown_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "citedCase" TEXT NOT NULL,
    "citedCaseId" TEXT,
    "context" TEXT,
    "paragraph" INTEGER,
    CONSTRAINT "Citation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IngestionJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "processedItems" INTEGER NOT NULL DEFAULT 0,
    "failedItems" INTEGER NOT NULL DEFAULT 0,
    "cases" TEXT,
    "logs" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "SavedCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "notes" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "filters" TEXT,
    "results" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Case_year_idx" ON "Case"("year");

-- CreateIndex
CREATE INDEX "Case_caseType_idx" ON "Case"("caseType");

-- CreateIndex
CREATE INDEX "Case_dataQuality_idx" ON "Case"("dataQuality");

-- CreateIndex
CREATE INDEX "Case_sourceName_idx" ON "Case"("sourceName");

-- CreateIndex
CREATE INDEX "Paragraph_caseId_idx" ON "Paragraph"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseBreakdown_caseId_key" ON "CaseBreakdown"("caseId");

-- CreateIndex
CREATE INDEX "Citation_caseId_idx" ON "Citation"("caseId");

-- CreateIndex
CREATE INDEX "Citation_citedCaseId_idx" ON "Citation"("citedCaseId");

-- CreateIndex
CREATE INDEX "IngestionJob_status_idx" ON "IngestionJob"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SavedCase_caseId_key" ON "SavedCase"("caseId");
