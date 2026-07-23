-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "unweightedGpa" REAL NOT NULL,
    "weightedGpa" REAL NOT NULL,
    "cteCoursework" TEXT NOT NULL,
    "extracurriculars" TEXT NOT NULL,
    "essay1" TEXT NOT NULL,
    "essay2" TEXT NOT NULL,
    "essay3" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'under_review',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicantId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UploadedFile_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recommender" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_sent',
    "sentAt" DATETIME,
    "remindedAt" DATETIME,
    "submittedAt" DATETIME,
    "letterText" TEXT,
    "letterFileId" TEXT,
    "ratings" TEXT,
    CONSTRAINT "Recommender_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Recommender_letterFileId_fkey" FOREIGN KEY ("letterFileId") REFERENCES "UploadedFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommitteeMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicantId" TEXT NOT NULL,
    "committeeMemberId" TEXT NOT NULL,
    "score" INTEGER,
    "comments" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_committeeMemberId_fkey" FOREIGN KEY ("committeeMemberId") REFERENCES "CommitteeMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Recommender_token_key" ON "Recommender"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Recommender_letterFileId_key" ON "Recommender"("letterFileId");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMember_email_key" ON "CommitteeMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Review_applicantId_committeeMemberId_key" ON "Review"("applicantId", "committeeMemberId");
