# Prisma Setup Guide

Tento dokument popisuje nastavenie Prisma pre Governance API endpointy.

## Požiadavky

1. **Inštalácia Prisma:**
```bash
cd dashboard
npm install prisma @prisma/client
```

2. **Vytvorenie Prisma Schema:**

Vytvorte súbor `dashboard/prisma/schema.prisma` s nasledujúcou štruktúrou:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Policy {
  id                  String   @id @default(uuid()) @db.Uuid
  policyNumber        String   @unique @map("policy_number") @db.VarChar(50)
  name                String   @db.VarChar(255)
  description         String?  @db.Text
  category            String   @db.VarChar(50)
  scope               Json     @default("[]")
  regulatoryReferences Json    @default("[]") @map("regulatory_references")
  currentVersion      String   @default("1.0.0") @map("current_version") @db.VarChar(20)
  status              String   @default("DRAFT") @db.VarChar(20)
  effectiveDate       DateTime? @map("effective_date") @db.Timestamptz
  expiryDate          DateTime? @map("expiry_date") @db.Timestamptz
  documentUrl         String?  @map("document_url") @db.Text
  documentHash        String?  @map("document_hash") @db.VarChar(64)
  owner               String   @map("owner_id") @db.Uuid
  ownerDepartment     String?  @map("owner_department") @db.VarChar(100)
  reviewers           Json     @default("[]")
  approvers           Json     @default("[]")
  reviewFrequency     String   @default("ANNUAL") @map("review_frequency") @db.VarChar(20)
  lastReviewDate      DateTime? @map("last_review_date") @db.Timestamptz
  nextReviewDate      DateTime @map("next_review_date") @db.Timestamptz
  createdAt           DateTime @default(now()) @map("created_at") @db.Timestamptz
  createdBy           String   @map("created_by") @db.VarChar(255)
  updatedAt           DateTime @updatedAt @map("updated_at") @db.Timestamptz
  
  versions            PolicyVersion[]
  
  @@map("policies")
}

model PolicyVersion {
  id              String    @id @default(uuid()) @db.Uuid
  policyId        String    @map("policy_id") @db.Uuid
  version         String    @db.VarChar(20)
  versionType     String    @map("version_type") @db.VarChar(10)
  documentUrl     String    @map("document_url") @db.Text
  documentHash    String    @map("document_hash") @db.VarChar(64)
  changelog       String?   @db.Text
  status          String    @default("DRAFT") @db.VarChar(20)
  approvalRequestId String? @map("approval_request_id") @db.Uuid
  approvedBy      String?   @map("approved_by") @db.VarChar(255)
  approvedAt       DateTime? @map("approved_at") @db.Timestamptz
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  createdBy       String    @map("created_by") @db.VarChar(255)
  effectiveFrom   DateTime? @map("effective_from") @db.Timestamptz
  effectiveUntil  DateTime? @map("effective_until") @db.Timestamptz
  
  policy          Policy    @relation(fields: [policyId], references: [id], onDelete: Cascade)
  
  @@unique([policyId, version])
  @@map("policy_versions")
}

model ChangeRequest {
  id                  String    @id @default(uuid()) @db.Uuid
  requestNumber       String    @unique @map("request_number") @db.VarChar(50)
  type                String    @db.VarChar(50)
  title               String    @db.VarChar(255)
  description         String    @db.Text
  justification       String    @db.Text
  impactAssessment    Json      @map("impact_assessment")
  relatedPolicyId     String?   @map("related_policy_id") @db.Uuid
  relatedAssetIds     Json      @default("[]") @map("related_asset_ids")
  regulatoryTags      Json      @default("[]") @map("regulatory_tags")
  articles            Json      @default("[]")
  status              String    @default("DRAFT") @db.VarChar(30)
  currentApprovalLevel Int      @default(1) @map("current_approval_level")
  totalApprovalLevels Int       @default(1) @map("total_approval_levels")
  requestedBy         String    @map("requested_by") @db.VarChar(255)
  requestedAt         DateTime  @map("requested_at") @db.Timestamptz
  implementedBy       String?   @map("implemented_by") @db.VarChar(255)
  implementedAt       DateTime? @map("implemented_at") @db.Timestamptz
  implementationNotes String?   @map("implementation_notes") @db.Text
  evidenceEventId     String?   @map("evidence_event_id") @db.Uuid
  createdAt           DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  
  workflow            ApprovalWorkflow?
  
  @@map("governance_change_requests")
}

model ApprovalWorkflow {
  id              String    @id @default(uuid()) @db.Uuid
  changeRequestId String    @map("change_request_id") @db.Uuid
  levels          Json
  currentLevel    Int       @default(1) @map("current_level")
  decisions       Json      @default("[]")
  status          String    @default("IN_PROGRESS") @db.VarChar(20)
  startedAt       DateTime  @map("started_at") @db.Timestamptz
  completedAt     DateTime? @map("completed_at") @db.Timestamptz
  
  changeRequest   ChangeRequest @relation(fields: [changeRequestId], references: [id], onDelete: Cascade)
  actions         ApprovalAction[]
  
  @@map("approval_workflows")
}

model ApprovalAction {
  id              String    @id @default(uuid()) @db.Uuid
  workflowId      String    @map("workflow_id") @db.Uuid
  changeRequestId String    @map("change_request_id") @db.Uuid
  level           Int
  levelName       String    @map("level_name") @db.VarChar(100)
  actorId         String    @map("actor_id") @db.Uuid
  actorName       String    @map("actor_name") @db.VarChar(255)
  actorRole       String    @map("actor_role") @db.VarChar(100)
  decision        String    @db.VarChar(20)
  comments        String?   @db.Text
  conditions      Json      @default("[]")
  delegatedTo     String?   @map("delegated_to") @db.Uuid
  delegationReason String?   @map("delegation_reason") @db.Text
  decidedAt       DateTime  @map("decided_at") @db.Timestamptz
  evidenceEventId String?   @map("evidence_event_id") @db.Uuid
  
  workflow        ApprovalWorkflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  
  @@map("approval_actions")
}

model ManagementOversight {
  id                String    @id @default(uuid()) @db.Uuid
  activityType      String    @map("activity_type") @db.VarChar(50)
  actorId           String    @map("actor_id") @db.Uuid
  actorName         String    @map("actor_name") @db.VarChar(255)
  actorRole         String    @map("actor_role") @db.VarChar(100)
  authorityLevel     String    @map("authority_level") @db.VarChar(20)
  description       String    @db.Text
  relatedEntityType String?   @map("related_entity_type") @db.VarChar(50)
  relatedEntityId   String?   @map("related_entity_id") @db.Uuid
  decision          String?   @db.Text
  outcome           String?   @db.Text
  regulatoryTags    Json      @default("[]") @map("regulatory_tags")
  articles          Json      @default("[]")
  evidenceEventId   String    @map("evidence_event_id") @db.Uuid
  documentReferences Json     @default("[]") @map("document_references")
  occurredAt        DateTime  @map("occurred_at") @db.Timestamptz
  recordedAt        DateTime  @default(now()) @map("recorded_at") @db.Timestamptz
  
  @@map("management_oversight")
}

model RoleAssignment {
  id                String    @id @default(uuid()) @db.Uuid
  actorId           String    @map("actor_id") @db.Uuid
  actorName         String    @map("actor_name") @db.VarChar(255)
  role              String    @db.VarChar(100)
  roleType          String    @map("role_type") @db.VarChar(50)
  department        String    @db.VarChar(100)
  authorityLevel     String    @map("authority_level") @db.VarChar(20)
  canApprove         Boolean   @default(false) @map("can_approve")
  approvalLimit      Decimal?  @map("approval_limit") @db.Decimal(15, 2)
  incompatibleRoles Json      @default("[]") @map("incompatible_roles")
  effectiveFrom      DateTime  @map("effective_from") @db.Timestamptz
  effectiveUntil     DateTime? @map("effective_until") @db.Timestamptz
  status             String    @default("ACTIVE") @db.VarChar(20)
  assignedBy         String    @map("assigned_by") @db.VarChar(255)
  assignedAt         DateTime  @default(now()) @map("assigned_at") @db.Timestamptz
  evidenceEventId    String?   @map("evidence_event_id") @db.Uuid
  
  @@map("role_assignments")
}

model TrainingRecord {
  id                    String    @id @default(uuid()) @db.Uuid
  actorId               String    @map("actor_id") @db.Uuid
  actorName             String    @map("actor_name") @db.VarChar(255)
  actorRole             String    @map("actor_role") @db.VarChar(100)
  trainingType          String    @map("training_type") @db.VarChar(50)
  trainingName          String    @map("training_name") @db.VarChar(255)
  provider              String?   @db.VarChar(255)
  completedAt           DateTime  @map("completed_at") @db.Timestamptz
  validUntil            DateTime  @map("valid_until") @db.Timestamptz
  score                 Decimal?  @db.Decimal(5, 2)
  certificateUrl        String?   @map("certificate_url") @db.Text
  regulatoryRequirement String?   @map("regulatory_requirement") @db.VarChar(50)
  evidenceEventId       String?   @map("evidence_event_id") @db.Uuid
  
  @@map("training_records")
}

// Poznámka: EvidenceEvent model musí byť vytvorený podľa existujúcej štruktúry evidence events v databáze
// Tento model je potrebný pre createEvidenceEvent funkciu
model EvidenceEvent {
  id              String    @id @default(uuid()) @db.Uuid
  eventType       String    @map("event_type")
  severity        String
  description     String
  regulatoryTags   Json      @default("[]") @map("regulatory_tags")
  articles        Json      @default("[]")
  metadata        Json      @default("{}")
  detectedAt      DateTime  @default(now()) @map("detected_at") @db.Timestamptz
  
  @@map("evidence_events")
}
```

3. **Generovanie Prisma Client:**

```bash
npx prisma generate
```

4. **Nastavenie DATABASE_URL:**

Uistite sa, že máte nastavenú premennú prostredia `DATABASE_URL` v `.env` súbore:

```bash
DATABASE_URL=postgresql://veridion:veridion_password@localhost:5432/veridion_nexus
```

## Poznámky

- **Evidence Events:** Model `EvidenceEvent` musí byť vytvorený podľa existujúcej štruktúry v databáze. Ak tabuľka `evidence_events` neexistuje, bude potrebné ju vytvoriť alebo upraviť `createEvidenceEvent` funkciu.

- **Field Mapping:** Prisma schema používa `@map()` na mapovanie camelCase field names na snake_case database columns.

- **Relations:** Všetky vzťahy medzi modelmi sú definované pomocou `@relation()`.

## Validácia

Po nastavení Prisma, skontrolujte že všetky endpointy fungujú:

- ✅ GET /api/v1/governance?view=summary
- ✅ GET /api/v1/governance?view=policies
- ✅ GET /api/v1/governance?view=change-requests
- ✅ GET /api/v1/governance?view=my-approvals
- ✅ POST /api/v1/governance/policies
- ✅ POST /api/v1/governance/policies/[id]/submit
- ✅ POST /api/v1/governance/approvals/[id]

