import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function randomToken() {
  return randomBytes(24).toString("base64url");
}

function randomPassword() {
  return randomBytes(9).toString("base64url");
}

const COMMITTEE_MEMBERS = [
  { name: "Committee Member 1", email: "committee1@example.org" },
  { name: "Committee Member 2", email: "committee2@example.org" },
  { name: "Committee Member 3", email: "committee3@example.org" },
  { name: "Committee Member 4", email: "committee4@example.org" },
  { name: "Committee Member 5", email: "committee5@example.org" },
  { name: "Committee Member 6", email: "committee6@example.org" },
];

async function seedCommittee() {
  console.log("\n=== Committee login credentials (save these now) ===");
  for (const member of COMMITTEE_MEMBERS) {
    const password = randomPassword();
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.committeeMember.upsert({
      where: { email: member.email },
      update: { name: member.name, passwordHash },
      create: { name: member.name, email: member.email, passwordHash },
    });
    console.log(`  ${member.email}  /  ${password}`);
  }
  console.log("=== Replace these placeholder names/emails before real use ===\n");
}

async function seedSampleApplicant() {
  const existing = await prisma.applicant.findFirst({
    where: { email: "sample.applicant@example.org" },
  });
  if (existing) {
    console.log("Sample applicant already exists, skipping.");
    return;
  }

  const applicant = await prisma.applicant.create({
    data: {
      fullName: "Jordan Sample",
      email: "sample.applicant@example.org",
      unweightedGpa: 3.7,
      weightedGpa: 4.2,
      cteCoursework:
        "Completed a full-year sequence in the Health Sciences CTE pathway (Intro to Health Sciences, Anatomy & Physiology).",
      extracurriculars:
        "HOSA club officer, varsity soccer, volunteer at St. Charles Medical Center (2 hrs/week).",
      essay1:
        "CTE courses gave me hands-on experience I could never get from a textbook alone. ".repeat(8),
      essay2:
        "Sophomore year my family faced a period of housing instability, and I learned to keep showing up anyway. ".repeat(8),
      essay3:
        "I organized a peer-tutoring program at my school that now serves over thirty students each term. ".repeat(8),
      status: "under_review",
    },
  });

  const now = new Date();
  const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

  await prisma.recommender.create({
    data: {
      applicantId: applicant.id,
      name: "Pat Teacher",
      email: "pat.teacher@example.org",
      relationship: "Teacher",
      token: randomToken(),
      status: "received",
      sentAt: eightDaysAgo,
      submittedAt: now,
      letterText:
        "Jordan is one of the most dedicated students I've taught in the CTE Health Sciences pathway...",
      ratings: JSON.stringify({ workEthic: 5, reliability: 5, readiness: 4 }),
    },
  });

  await prisma.recommender.create({
    data: {
      applicantId: applicant.id,
      name: "Sam Counselor",
      email: "sam.counselor@example.org",
      relationship: "Counselor",
      token: randomToken(),
      status: "sent",
      sentAt: eightDaysAgo,
    },
  });

  console.log(`Seeded sample applicant "${applicant.fullName}" (${applicant.id}).`);
}

async function main() {
  await seedCommittee();
  await seedSampleApplicant();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
