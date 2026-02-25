import 'server-only';
import { ManagementOversight, RoleAssignment, TrainingRecord } from "./governance-types";
import prisma from "@/lib/prisma";
import { createEvidenceEvent } from "@/lib/audit/evidence-graph";

export class OversightService {
  /**
   * Record management oversight activity
   */
  async recordOversightActivity(
    data: Omit<ManagementOversight, "id" | "evidenceEventId" | "recordedAt">
  ): Promise<ManagementOversight> {
    // Create Evidence Graph event first
    const evidenceEventId = await createEvidenceEvent({
      eventType: `GOVERNANCE.OVERSIGHT.${data.activityType}`,
      severity: "INFO",
      regulatoryTags: data.regulatoryTags as any[],
      articles: data.articles,
      metadata: {
        actorId: data.actorId,
        actorName: data.actorName,
        actorRole: data.actorRole,
        authorityLevel: data.authorityLevel,
        activityType: data.activityType,
        description: data.description,
        decision: data.decision,
        outcome: data.outcome,
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
      },
    });

    // Create oversight record
    const oversight = await prisma.managementOversight.create({
      data: {
        ...data,
        occurredAt: new Date(data.occurredAt),
        evidenceEventId,
        recordedAt: new Date(),
      },
    });

    return oversight as unknown as ManagementOversight;
  }

  /**
   * Assign role to actor
   */
  async assignRole(
    data: Omit<RoleAssignment, "id" | "assignedAt" | "evidenceEventId">
  ): Promise<RoleAssignment> {
    // Check for incompatible roles
    const existingRoles = await prisma.roleAssignment.findMany({
      where: {
        actorId: data.actorId,
        status: "ACTIVE",
      },
    });

    for (const existing of existingRoles) {
      const incompatibleRoles = existing.incompatibleRoles as string[] || [];
      if (incompatibleRoles.includes(data.role)) {
        throw new Error(
          `Role ${data.role} is incompatible with existing role ${existing.role}`
        );
      }
    }

    // Create Evidence Graph event
    const evidenceEventId = await createEvidenceEvent({
      eventType: "GOVERNANCE.ROLE.ASSIGNED",
      severity: "INFO",
      regulatoryTags: ["DORA"],
      articles: ["Art.5"],
      metadata: {
        actorId: data.actorId,
        actorName: data.actorName,
        role: data.role,
        roleType: data.roleType,
        department: data.department,
        authorityLevel: data.authorityLevel,
        assignedBy: data.assignedBy,
      },
    });

    // Create role assignment
    const assignment = await prisma.roleAssignment.create({
      data: {
        ...data,
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveUntil: data.effectiveUntil ? new Date(data.effectiveUntil) : null,
        assignedAt: new Date(),
        evidenceEventId,
      },
    });

    return assignment as unknown as RoleAssignment;
  }

  /**
   * Revoke role from actor
   */
  async revokeRole(assignmentId: string, revokedBy: string, reason: string): Promise<void> {
    const assignment = await prisma.roleAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error("Role assignment not found");
    }

    // Update status
    await prisma.roleAssignment.update({
      where: { id: assignmentId },
      data: {
        status: "REVOKED",
        effectiveUntil: new Date(),
      },
    });

    // Create Evidence Graph event
    await createEvidenceEvent({
      eventType: "GOVERNANCE.ROLE.REVOKED",
      severity: "INFO",
      regulatoryTags: ["DORA"],
      articles: ["Art.5"],
      metadata: {
        assignmentId,
        actorId: assignment.actorId,
        actorName: assignment.actorName,
        role: assignment.role,
        revokedBy,
        reason,
      },
    });
  }

  /**
   * Record training completion
   */
  async recordTraining(
    data: Omit<TrainingRecord, "id" | "evidenceEventId">
  ): Promise<TrainingRecord> {
    // Create Evidence Graph event
    const evidenceEventId = await createEvidenceEvent({
      eventType: "GOVERNANCE.TRAINING.COMPLETED",
      severity: "INFO",
      regulatoryTags: ["DORA"],
      articles: ["Art.5"],
      metadata: {
        actorId: data.actorId,
        actorName: data.actorName,
        trainingType: data.trainingType,
        trainingName: data.trainingName,
        provider: data.provider,
        score: data.score,
        validUntil: data.validUntil,
      },
    });

    // Create training record
    const record = await prisma.trainingRecord.create({
      data: {
        ...data,
        completedAt: new Date(data.completedAt),
        validUntil: new Date(data.validUntil),
        evidenceEventId,
      },
    });

    return record as unknown as TrainingRecord;
  }

  /**
   * Check training compliance for management body
   */
  async checkManagementTrainingCompliance(): Promise<{
    compliant: boolean;
    members: {
      actorId: string;
      actorName: string;
      role: string;
      trainingStatus: "CURRENT" | "EXPIRING_SOON" | "EXPIRED" | "MISSING";
      trainings: TrainingRecord[];
    }[];
  }> {
    // Get management body members
    const managementRoles = await prisma.roleAssignment.findMany({
      where: {
        authorityLevel: { in: ["EXECUTIVE", "BOARD"] },
        status: "ACTIVE",
      },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const requiredTrainings = ["ICT_GOVERNANCE", "ICT_RISK", "CYBERSECURITY", "DORA_COMPLIANCE"];

    const members = await Promise.all(
      managementRoles.map(async (member: { actorId: string; actorName: string; role: string }) => {
        const trainings = await prisma.trainingRecord.findMany({
          where: { actorId: member.actorId },
        });

        // Check if all required trainings are current
        let status: "CURRENT" | "EXPIRING_SOON" | "EXPIRED" | "MISSING" = "CURRENT";

        for (const required of requiredTrainings) {
          const training = trainings.find((t: { trainingType: string }) => t.trainingType === required);
          if (!training) {
            status = "MISSING";
            break;
          }
          const validUntil = new Date(training.validUntil);
          if (validUntil < now) {
            status = "EXPIRED";
          } else if (validUntil < thirtyDaysFromNow && status !== "EXPIRED") {
            status = "EXPIRING_SOON";
          }
        }

        return {
          actorId: member.actorId,
          actorName: member.actorName,
          role: member.role,
          trainingStatus: status,
          trainings: trainings as unknown as unknown as TrainingRecord[],
        };
      })
    );

    const compliant = members.every(
      (m: { trainingStatus: "CURRENT" | "EXPIRING_SOON" | "EXPIRED" | "MISSING" }) => m.trainingStatus === "CURRENT" || m.trainingStatus === "EXPIRING_SOON"
    );

    return { compliant, members };
  }
}

// Singleton instance
export const oversightService = new OversightService();



