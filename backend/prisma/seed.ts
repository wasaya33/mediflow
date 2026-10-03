/**
 * Database Seed Script for MediFlow
 * Populates MongoDB with:
 * - 10 common ICD-10 diagnosis codes
 * - 10 common CPT procedure codes
 * - 1 Sample Organization ("Demo Clinic")
 * - 1 Admin User (admin@mediflow.com) with bcrypt hashed password
 *
 * Execution:
 *   npm run prisma:seed
 */

import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE DATA
// ─────────────────────────────────────────────────────────────────────────────

const DIAGNOSIS_CODES = [
  {
    code: "I10",
    description: "Essential (primary) hypertension",
    category: "Circulatory System",
  },
  {
    code: "E11.9",
    description: "Type 2 diabetes mellitus without complications",
    category: "Endocrine & Metabolic",
  },
  {
    code: "J01.90",
    description: "Acute sinusitis, unspecified",
    category: "Respiratory System",
  },
  {
    code: "J06.9",
    description: "Acute upper respiratory infection, unspecified",
    category: "Respiratory System",
  },
  {
    code: "M54.50",
    description: "Low back pain, unspecified",
    category: "Musculoskeletal System",
  },
  {
    code: "R05.9",
    description: "Cough, unspecified",
    category: "Symptoms & Signs",
  },
  {
    code: "R10.9",
    description: "Abdominal pain, unspecified",
    category: "Symptoms & Signs",
  },
  {
    code: "F41.1",
    description: "Generalized anxiety disorder",
    category: "Mental & Behavioral",
  },
  {
    code: "K21.9",
    description: "Gastro-esophageal reflux disease without esophagitis",
    category: "Digestive System",
  },
  {
    code: "Z00.00",
    description: "Encounter for general adult medical examination without abnormal findings",
    category: "Factors Influencing Health",
  },
];

const PROCEDURE_CODES = [
  {
    code: "99202",
    description: "Office visit for new patient, straightforward 15-29 minutes",
    category: "Evaluation and Management",
    defaultCharge: 115.0,
  },
  {
    code: "99203",
    description: "Office visit for new patient, low complexity 30-44 minutes",
    category: "Evaluation and Management",
    defaultCharge: 175.0,
  },
  {
    code: "99204",
    description: "Office visit for new patient, moderate complexity 45-59 minutes",
    category: "Evaluation and Management",
    defaultCharge: 260.0,
  },
  {
    code: "99212",
    description: "Office visit for established patient, straightforward 10-19 minutes",
    category: "Evaluation and Management",
    defaultCharge: 85.0,
  },
  {
    code: "99213",
    description: "Office visit for established patient, low complexity 20-29 minutes",
    category: "Evaluation and Management",
    defaultCharge: 130.0,
  },
  {
    code: "99214",
    description: "Office visit for established patient, moderate complexity 30-39 minutes",
    category: "Evaluation and Management",
    defaultCharge: 195.0,
  },
  {
    code: "99215",
    description: "Office visit for established patient, high complexity 40-54 minutes",
    category: "Evaluation and Management",
    defaultCharge: 270.0,
  },
  {
    code: "99395",
    description: "Periodic comprehensive preventive medicine, established patient 18-39 years",
    category: "Preventive Medicine",
    defaultCharge: 220.0,
  },
  {
    code: "80053",
    description: "Comprehensive metabolic panel (CMP)",
    category: "Pathology and Laboratory",
    defaultCharge: 65.0,
  },
  {
    code: "85025",
    description: "Complete blood count (CBC) with automated differential",
    category: "Pathology and Laboratory",
    defaultCharge: 45.0,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting MediFlow database seed...\n");

  // 1. Seed ICD-10 Diagnosis Codes
  console.log("📋 Seeding ICD-10 Diagnosis Codes...");
  for (const diag of DIAGNOSIS_CODES) {
    await prisma.diagnosisCode.upsert({
      where: { code: diag.code },
      update: {
        description: diag.description,
        category: diag.category,
        isActive: true,
      },
      create: {
        code: diag.code,
        description: diag.description,
        category: diag.category,
        isActive: true,
      },
    });
  }
  console.log(`   ✔ ${DIAGNOSIS_CODES.length} Diagnosis Codes seeded.`);

  // 2. Seed CPT Procedure Codes
  console.log("📋 Seeding CPT Procedure Codes...");
  for (const proc of PROCEDURE_CODES) {
    await prisma.procedureCode.upsert({
      where: { code: proc.code },
      update: {
        description: proc.description,
        category: proc.category,
        defaultCharge: proc.defaultCharge,
        isActive: true,
      },
      create: {
        code: proc.code,
        description: proc.description,
        category: proc.category,
        defaultCharge: proc.defaultCharge,
        isActive: true,
      },
    });
  }
  console.log(`   ✔ ${PROCEDURE_CODES.length} Procedure Codes seeded.`);

  // 3. Seed Sample Organization
  console.log("🏢 Seeding Sample Organization...");
  const organization = await prisma.organization.upsert({
    where: { slug: "demo-clinic" },
    update: {
      name: "Demo Clinic",
      address: "123 Medical Center Blvd, Suite 400, Austin, TX 78701",
      phone: "+1-512-555-0199",
      email: "contact@democlinic.mediflow.io",
      taxId: "74-1234567",
      settings: {
        currency: "USD",
        timezone: "America/Chicago",
        billingCycle: "MONTHLY",
        autoSubmitClaims: false,
      },
      isActive: true,
    },
    create: {
      name: "Demo Clinic",
      slug: "demo-clinic",
      address: "123 Medical Center Blvd, Suite 400, Austin, TX 78701",
      phone: "+1-512-555-0199",
      email: "contact@democlinic.mediflow.io",
      taxId: "74-1234567",
      settings: {
        currency: "USD",
        timezone: "America/Chicago",
        billingCycle: "MONTHLY",
        autoSubmitClaims: false,
      },
      isActive: true,
    },
  });
  console.log(`   ✔ Organization created/verified: ${organization.name} (${organization.id})`);

  // 4. Seed Sample Admin User
  console.log("👤 Seeding Sample Admin User...");
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash("Admin@123456", saltRounds);

  const adminUser = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: "admin@mediflow.com",
      },
    },
    update: {
      name: "Platform Administrator",
      passwordHash,
      role: UserRole.PLATFORM_ADMIN,
      isActive: true,
    },
    create: {
      organizationId: organization.id,
      name: "Platform Administrator",
      email: "admin@mediflow.com",
      passwordHash,
      role: UserRole.PLATFORM_ADMIN,
      phone: "+1-512-555-0100",
      isActive: true,
    },
  });
  console.log(`   ✔ Admin User created/verified: ${adminUser.email} [${adminUser.role}]`);

  console.log("\n🎉 MediFlow database seed completed successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
