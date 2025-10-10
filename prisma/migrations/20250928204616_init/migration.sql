/*
  Warnings:

  - You are about to drop the column `cost` on the `maintenance_records` table. All the data in the column will be lost.
  - Added the required column `category` to the `maintenance_records` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "imported_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "reportData" TEXT NOT NULL,
    "rawData" TEXT,
    "summary" TEXT,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "vehicleId" TEXT NOT NULL,
    CONSTRAINT "imported_reports_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "service_reminders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reminderType" TEXT NOT NULL,
    "dueMileage" INTEGER,
    "dueDate" DATETIME,
    "intervalMiles" INTEGER,
    "intervalMonths" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "maintenanceRecordId" TEXT,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "service_reminders_maintenanceRecordId_fkey" FOREIGN KEY ("maintenanceRecordId") REFERENCES "maintenance_records" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "service_reminders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "service_reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tags" TEXT,
    "ocrText" TEXT,
    "ocrConfidence" REAL,
    "extractedData" TEXT,
    "processingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "processingError" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "documentDate" DATETIME,
    "mileage" INTEGER,
    "totalCost" REAL,
    "shopName" TEXT,
    "vehicleId" TEXT,
    "userId" TEXT NOT NULL,
    "maintenanceRecordId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "documents_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documents_maintenanceRecordId_fkey" FOREIGN KEY ("maintenanceRecordId") REFERENCES "maintenance_records" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_maintenance_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "totalCost" REAL,
    "partsCost" REAL,
    "laborCost" REAL,
    "mileage" INTEGER,
    "date" DATETIME NOT NULL,
    "nextServiceDue" DATETIME,
    "nextServiceMileage" INTEGER,
    "serviceBy" TEXT,
    "shopAddress" TEXT,
    "shopPhone" TEXT,
    "serviceDetails" TEXT,
    "notes" TEXT,
    "warrantyInfo" TEXT,
    "receiptImages" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "maintenance_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "maintenance_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_maintenance_records" ("createdAt", "date", "description", "id", "mileage", "notes", "serviceBy", "title", "type", "updatedAt", "userId", "vehicleId") SELECT "createdAt", "date", "description", "id", "mileage", "notes", "serviceBy", "title", "type", "updatedAt", "userId", "vehicleId" FROM "maintenance_records";
DROP TABLE "maintenance_records";
ALTER TABLE "new_maintenance_records" RENAME TO "maintenance_records";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
