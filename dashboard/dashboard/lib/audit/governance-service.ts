import 'server-only';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { GovernanceAuditHelpers } from './lens-helpers';
import { eventIngestionService } from './event-ingestion-service';
import {
  Policy,
  PolicyApproval,
  OversightActivity,
  TrainingProgram,
  TrainingCompletion,
  RoleAssignment,
  GovernanceStats,
  PolicyCategory,
  PolicyStatus,
  ApprovalStatus,
  OversightType,
  RoleType,
} from './governance-types';

// ═══════════════════════════════════════════════════════════════
// GOVERNANCE SERVICE
// ═══════════════════════════════════════════════════════════════

export class GovernanceService {

  // ═══════════════════════════════════════════════════════════════
  // POLICY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create a new policy
   */
  async createPolicy(data: {
    name: string;
    description: string;
    category: PolicyCategory;
    summary: string;
    scope: string[];
    ownerId: string;
    ownerRole: RoleType;
    reviewFrequency: Policy['reviewFrequency'];
    regulations: string[];
    articles: string[];
    requiredApprovalLevel: Policy['requiredApprovalLevel'];
    documentUrl?: string;
  }): Promise<Policy> {
    const policyId = `POL-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const policy: Policy = {
      policyId,
      name: data.name,
      description: data.description,
      category: data.category,
      version: '1.0',
      status: 'DRAFT',
      documentUrl: data.documentUrl,
      summary: data.summary,
      scope: data.scope,
      ownerId: data.ownerId,
      ownerRole: data.ownerRole,
      reviewFrequency: data.reviewFrequency,
      regulations: data.regulations,
      articles: data.articles,
      requiredApprovalLevel: data.requiredApprovalLevel,
      approvals: [],
      createdAt: now,
      updatedAt: now,
    };

    // Store in database (using a generic JSON store for now)
    await this.storePolicy(policy);

    // Create audit event
    await GovernanceAuditHelpers.logPolicyCreated({
      policyId,
      name: data.name,
      category: data.category,
      version: '1.0',
    });

    return policy;
  }

  /**
   * Submit policy for approval
   */
  async submitForApproval(policyId: string, approverIds: string[]): Promise<PolicyApproval[]> {
    const policy = await this.getPolicy(policyId);
    if (!policy) throw new Error('Policy not found');

    const approvals: PolicyApproval[] = [];
    const now = new Date().toISOString();

    for (const approverId of approverIds) {
      const actor = await this.getActor(approverId);

      const approval: PolicyApproval = {
        approvalId: `APR-${Date.now()}-${uuidv4().substring(0, 8)}`,
        policyId,
        version: policy.version,
        status: 'PENDING',
        approverId,
        approverRole: actor?.role || 'COMPLIANCE_OFFICER',
        approverName: actor?.name || 'Unknown',
        requestedAt: now,
      };

      approvals.push(approval);
    }

    // Update policy status
    policy.status = 'PENDING_APPROVAL';
    policy.approvals = [...policy.approvals, ...approvals];
    policy.updatedAt = now;

    await this.storePolicy(policy);

    // Create event
    await eventIngestionService.createEvent({
      eventType: 'GOVERNANCE.POLICY.SUBMITTED',
      sourceSystem: 'governance',
      correlationId: policyId,
      payload: { policyId, approverIds, version: policy.version },
      regulatoryTags: ['DORA', 'NIS2'],
      articles: ['DORA-5', 'NIS2-20'],
    });

    return approvals;
  }

  /**
   * Process approval decision
   */
  async processApproval(
    approvalId: string,
    decision: ApprovalStatus,
    comments?: string,
    conditions?: string
  ): Promise<void> {
    const policies = await this.getAllPolicies();
    let targetPolicy: Policy | null = null;
    let targetApproval: PolicyApproval | null = null;

    for (const policy of policies) {
      const approval = policy.approvals.find((a) => a.approvalId === approvalId);
      if (approval) {
        targetPolicy = policy;
        targetApproval = approval;
        break;
      }
    }

    if (!targetPolicy || !targetApproval) {
      throw new Error('Approval not found');
    }

    const now = new Date().toISOString();
    targetApproval.status = decision;
    targetApproval.comments = comments;
    targetApproval.conditions = conditions;
    targetApproval.respondedAt = now;

    // Check if all approvals are complete
    const allApproved = targetPolicy.approvals.every((a) => a.status === 'APPROVED');
    const anyRejected = targetPolicy.approvals.some((a) => a.status === 'REJECTED');

    if (allApproved) {
      targetPolicy.status = 'APPROVED';
      targetPolicy.effectiveFrom = now;
    } else if (anyRejected) {
      targetPolicy.status = 'DRAFT';
    }

    targetPolicy.updatedAt = now;
    await this.storePolicy(targetPolicy);

    // Create decision event
    await GovernanceAuditHelpers.logPolicyApproved(
      targetPolicy.policyId,
      { version: targetPolicy.version, approvalLevel: targetApproval.approverRole },
      targetApproval.approverId
    );
  }

  /**
   * Get policies requiring review
   */
  async getPoliciesRequiringReview(): Promise<Policy[]> {
    const policies = await this.getAllPolicies();
    const now = new Date();

    return policies.filter((policy) => {
      if (!policy.nextReviewDue) return false;
      return new Date(policy.nextReviewDue) <= now;
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // OVERSIGHT ACTIVITIES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Record oversight activity
   */
  async recordOversightActivity(data: {
    activityType: OversightType;
    title: string;
    description: string;
    scheduledAt: string;
    conductedAt?: string;
    duration?: number;
    participants: OversightActivity['participants'];
    agendaItems: string[];
    decisions: string[];
    actionItems: OversightActivity['actionItems'];
    regulations: string[];
    articles: string[];
    minutesUrl?: string;
  }): Promise<OversightActivity> {
    const activityId = `OVS-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    // Create evidence event first
    const eventResult = await GovernanceAuditHelpers.logOversightActivity({
      activityId,
      activityType: data.activityType,
      description: data.description,
      participants: data.participants.map((p) => p.actorId),
      outcomes: data.decisions.join('; '),
    });

    const activity: OversightActivity = {
      activityId,
      ...data,
      evidenceEventId: eventResult.eventId,
      createdAt: now,
      updatedAt: now,
    };

    await this.storeOversightActivity(activity);

    return activity;
  }

  /**
   * Get upcoming oversight activities
   */
  async getUpcomingOversightActivities(days: number = 30): Promise<OversightActivity[]> {
    const activities = await this.getAllOversightActivities();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return activities
      .filter((activity) => {
        const scheduled = new Date(activity.scheduledAt);
        return scheduled >= now && scheduled <= futureDate && !activity.conductedAt;
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  // ═══════════════════════════════════════════════════════════════
  // TRAINING MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create training program
   */
  async createTrainingProgram(data: {
    name: string;
    description: string;
    trainingType: TrainingProgram['trainingType'];
    targetRoles: RoleType[];
    mandatory: boolean;
    frequency: TrainingProgram['frequency'];
    duration: number;
    assessmentRequired: boolean;
    passingScore?: number;
    regulations: string[];
    articles: string[];
    contentUrl?: string;
  }): Promise<TrainingProgram> {
    const programId = `TRN-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const program: TrainingProgram = {
      programId,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await this.storeTrainingProgram(program);

    return program;
  }

  /**
   * Record training completion
   */
  async recordTrainingCompletion(data: {
    programId: string;
    actorId: string;
    actorName: string;
    actorRole: RoleType;
    score?: number;
    certificateUrl?: string;
  }): Promise<TrainingCompletion> {
    const program = await this.getTrainingProgram(data.programId);
    if (!program) throw new Error('Training program not found');

    const completionId = `CMP-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const passed = program.assessmentRequired
      ? (data.score ?? 0) >= (program.passingScore ?? 70)
      : true;

    // Calculate expiry based on frequency
    let expiresAt: string | undefined;
    if (program.frequency !== 'ONE_TIME') {
      const expiry = new Date();
      switch (program.frequency) {
        case 'QUARTERLY': expiry.setMonth(expiry.getMonth() + 3); break;
        case 'SEMI_ANNUAL': expiry.setMonth(expiry.getMonth() + 6); break;
        case 'ANNUAL': expiry.setFullYear(expiry.getFullYear() + 1); break;
      }
      expiresAt = expiry.toISOString();
    }

    // Create evidence event
    const eventResult = await eventIngestionService.createEvent({
      eventType: 'GOVERNANCE.TRAINING.COMPLETED',
      sourceSystem: 'governance',
      correlationId: completionId,
      payload: {
        programId: data.programId,
        programName: program.name,
        actorId: data.actorId,
        score: data.score,
        passed,
      },
      regulatoryTags: program.regulations as any[],
      articles: program.articles,
    });

    const completion: TrainingCompletion = {
      completionId,
      programId: data.programId,
      actorId: data.actorId,
      actorName: data.actorName,
      actorRole: data.actorRole,
      status: 'COMPLETED',
      completedAt: now,
      expiresAt,
      score: data.score,
      passed,
      certificateUrl: data.certificateUrl,
      evidenceEventId: eventResult.eventId,
      createdAt: now,
      updatedAt: now,
    };

    await this.storeTrainingCompletion(completion);

    return completion;
  }

  /**
   * Get training compliance status
   */
  async getTrainingComplianceStatus(): Promise<{
    overall: number;
    byProgram: { programId: string; programName: string; completionRate: number }[];
    overdue: { actorId: string; actorName: string; programId: string; programName: string }[];
  }> {
    const programs = await this.getAllTrainingPrograms();
    const completions = await this.getAllTrainingCompletions();
    const roles = await this.getAllRoleAssignments();

    const activeRoles = roles.filter((r) => r.isActive);
    const byProgram: { programId: string; programName: string; completionRate: number }[] = [];
    const overdue: { actorId: string; actorName: string; programId: string; programName: string }[] = [];

    for (const program of programs) {
      if (!program.mandatory) continue;

      const targetActors = activeRoles.filter((r) => program.targetRoles.includes(r.role));
      const programCompletions = completions.filter(
        (c) => c.programId === program.programId && c.status === 'COMPLETED' && c.passed
      );

      const completedActorIds = new Set(programCompletions.map((c) => c.actorId));
      const incompleteActors = targetActors.filter((r) => !completedActorIds.has(r.actorId));

      const completionRate = targetActors.length > 0
        ? (programCompletions.length / targetActors.length) * 100
        : 100;

      byProgram.push({
        programId: program.programId,
        programName: program.name,
        completionRate: Math.round(completionRate),
      });

      for (const actor of incompleteActors) {
        overdue.push({
          actorId: actor.actorId,
          actorName: actor.actorName,
          programId: program.programId,
          programName: program.name,
        });
      }
    }

    const overall = byProgram.length > 0
      ? byProgram.reduce((sum, p) => sum + p.completionRate, 0) / byProgram.length
      : 100;

    return {
      overall: Math.round(overall),
      byProgram,
      overdue,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // ROLE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Assign role to actor
   */
  async assignRole(data: {
    actorId: string;
    actorName: string;
    actorEmail: string;
    role: RoleType;
    department: string;
    authorityLevel: RoleAssignment['authorityLevel'];
    canApprove: boolean;
    canEscalate: boolean;
    effectiveFrom: string;
    effectiveUntil?: string;
    backupActorId?: string;
    backupActorName?: string;
  }): Promise<RoleAssignment> {
    const assignmentId = `ROL-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const assignment: RoleAssignment = {
      assignmentId,
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await this.storeRoleAssignment(assignment);

    // Create actor in evidence graph if not exists
    await this.ensureActorExists(data.actorId, data.actorName, data.role, data.authorityLevel);

    // Create event
    await eventIngestionService.createEvent({
      eventType: 'GOVERNANCE.ROLE.ASSIGNED',
      sourceSystem: 'governance',
      correlationId: assignmentId,
      payload: {
        actorId: data.actorId,
        role: data.role,
        department: data.department,
        authorityLevel: data.authorityLevel,
      },
      regulatoryTags: ['DORA', 'NIS2'],
      articles: ['DORA-5', 'NIS2-20'],
    });

    return assignment;
  }

  /**
   * Get role assignments
   */
  async getRoleAssignments(): Promise<RoleAssignment[]> {
    return this.getAllRoleAssignments();
  }

  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD STATS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get governance dashboard statistics
   */
  async getDashboardStats(): Promise<GovernanceStats> {
    const policies = await this.getAllPolicies();
    const activities = await this.getAllOversightActivities();
    const programs = await this.getAllTrainingPrograms();
    const roles = await this.getAllRoleAssignments();
    const trainingStatus = await this.getTrainingComplianceStatus();

    const now = new Date();

    // Policy stats
    const activePolicies = policies.filter((p) => p.status === 'ACTIVE' || p.status === 'APPROVED');
    const pendingApproval = policies.filter((p) => p.status === 'PENDING_APPROVAL');
    const overdueReview = policies.filter((p) => {
      if (!p.nextReviewDue) return false;
      return new Date(p.nextReviewDue) < now;
    });

    // Approval stats
    const allApprovals = policies.flatMap((p) => p.approvals);
    const pendingApprovals = allApprovals.filter((a) => a.status === 'PENDING');
    const approvedApprovals = allApprovals.filter((a) => a.status === 'APPROVED');
    const rejectedApprovals = allApprovals.filter((a) => a.status === 'REJECTED');

    // Oversight stats
    const scheduledActivities = activities.filter((a) => !a.conductedAt);
    const completedActivities = activities.filter((a) => a.conductedAt);
    const upcomingActivities = await this.getUpcomingOversightActivities(30);

    // Role stats
    const activeRoles = roles.filter((r) => r.isActive);
    const requiredRoles: RoleType[] = ['DPO', 'CISO', 'CTO', 'BOARD_MEMBER'];
    const assignedRequiredRoles = requiredRoles.filter((role) =>
      activeRoles.some((r) => r.role === role)
    );
    const vacantRoles = requiredRoles.length - assignedRequiredRoles.length;

    return {
      policies: {
        total: policies.length,
        active: activePolicies.length,
        pendingApproval: pendingApproval.length,
        overdueReview: overdueReview.length,
      },
      approvals: {
        pending: pendingApprovals.length,
        approved: approvedApprovals.length,
        rejected: rejectedApprovals.length,
      },
      oversight: {
        scheduled: scheduledActivities.length,
        completed: completedActivities.length,
        upcoming: upcomingActivities.slice(0, 5),
      },
      training: {
        programs: programs.length,
        completionRate: trainingStatus.overall,
        overdueCount: trainingStatus.overdue.length,
      },
      roles: {
        assigned: activeRoles.length,
        vacant: vacantRoles,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIVATE STORAGE METHODS
  // ═══════════════════════════════════════════════════════════════

  private async storePolicy(policy: Policy): Promise<void> {
    // In production, use actual database table
    // For now, store in a generic JSON column or separate table
    await prisma.evidence_artifacts.upsert({
      where: { artifact_id: `policy-${policy.policyId}` },
      create: {
        artifact_id: `policy-${policy.policyId}`,
        artifact_type: 'REPORT',
        name: `Policy: ${policy.name}`,
        hash: '',
        hash_algorithm: 'SHA-256',
        storage_ref: `governance/policies/${policy.policyId}`,
        storage_type: 'STANDARD',
        signature_type: 'NONE',
        related_event_ids: [],
        metadata: policy as any,
        created_at: policy.createdAt,
        updated_at: policy.updatedAt,
      },
      update: {
        metadata: policy as any,
        updated_at: policy.updatedAt,
      },
    });
  }

  private async getPolicy(policyId: string): Promise<Policy | null> {
    const artifact = await prisma.evidence_artifacts.findUnique({
      where: { artifact_id: `policy-${policyId}` },
    });
    return artifact?.metadata as Policy | null;
  }

  private async getAllPolicies(): Promise<Policy[]> {
    const artifacts = await prisma.evidence_artifacts.findMany({
      where: { artifact_id: { startsWith: 'policy-' } },
    });
    return artifacts.map((a: { metadata: unknown }) => a.metadata as unknown as Policy);
  }

  private async storeOversightActivity(activity: OversightActivity): Promise<void> {
    await prisma.evidence_artifacts.upsert({
      where: { artifact_id: `oversight-${activity.activityId}` },
      create: {
        artifact_id: `oversight-${activity.activityId}`,
        artifact_type: 'REPORT',
        name: `Oversight: ${activity.title}`,
        hash: '',
        hash_algorithm: 'SHA-256',
        storage_ref: `governance/oversight/${activity.activityId}`,
        storage_type: 'STANDARD',
        signature_type: 'NONE',
        related_event_ids: [],
        metadata: activity as any,
        created_at: activity.createdAt,
        updated_at: activity.updatedAt,
      },
      update: {
        metadata: activity as any,
        updated_at: activity.updatedAt,
      },
    });
  }

  private async getAllOversightActivities(): Promise<OversightActivity[]> {
    const artifacts = await prisma.evidence_artifacts.findMany({
      where: { artifact_id: { startsWith: 'oversight-' } },
    });
    return artifacts.map((a: { metadata: unknown }) => a.metadata as unknown as OversightActivity);
  }

  private async storeTrainingProgram(program: TrainingProgram): Promise<void> {
    await prisma.evidence_artifacts.upsert({
      where: { artifact_id: `training-program-${program.programId}` },
      create: {
        artifact_id: `training-program-${program.programId}`,
        artifact_type: 'REPORT',
        name: `Training: ${program.name}`,
        hash: '',
        hash_algorithm: 'SHA-256',
        storage_ref: `governance/training/${program.programId}`,
        storage_type: 'STANDARD',
        signature_type: 'NONE',
        related_event_ids: [],
        metadata: program as any,
        created_at: program.createdAt,
        updated_at: program.updatedAt,
      },
      update: {
        metadata: program as any,
        updated_at: program.updatedAt,
      },
    });
  }

  private async getTrainingProgram(programId: string): Promise<TrainingProgram | null> {
    const artifact = await prisma.evidence_artifacts.findUnique({
      where: { artifact_id: `training-program-${programId}` },
    });
    return artifact?.metadata as TrainingProgram | null;
  }

  private async getAllTrainingPrograms(): Promise<TrainingProgram[]> {
    const artifacts = await prisma.evidence_artifacts.findMany({
      where: { artifact_id: { startsWith: 'training-program-' } },
    });
    return artifacts.map((a: { metadata: unknown }) => a.metadata as unknown as TrainingProgram);
  }

  private async storeTrainingCompletion(completion: TrainingCompletion): Promise<void> {
    await prisma.evidence_artifacts.upsert({
      where: { artifact_id: `training-completion-${completion.completionId}` },
      create: {
        artifact_id: `training-completion-${completion.completionId}`,
        artifact_type: 'SIGNED_RECORD',
        name: `Training Completion: ${completion.actorName}`,
        hash: '',
        hash_algorithm: 'SHA-256',
        storage_ref: `governance/completions/${completion.completionId}`,
        storage_type: 'STANDARD',
        signature_type: 'NONE',
        related_event_ids: [],
        metadata: completion as any,
        created_at: completion.createdAt,
        updated_at: completion.updatedAt,
      },
      update: {
        metadata: completion as any,
        updated_at: completion.updatedAt,
      },
    });
  }

  private async getAllTrainingCompletions(): Promise<TrainingCompletion[]> {
    const artifacts = await prisma.evidence_artifacts.findMany({
      where: { artifact_id: { startsWith: 'training-completion-' } },
    });
    return artifacts.map((a: { metadata: unknown }) => a.metadata as unknown as TrainingCompletion);
  }

  private async storeRoleAssignment(assignment: RoleAssignment): Promise<void> {
    await prisma.evidence_artifacts.upsert({
      where: { artifact_id: `role-${assignment.assignmentId}` },
      create: {
        artifact_id: `role-${assignment.assignmentId}`,
        artifact_type: 'SIGNED_RECORD',
        name: `Role: ${assignment.role} - ${assignment.actorName}`,
        hash: '',
        hash_algorithm: 'SHA-256',
        storage_ref: `governance/roles/${assignment.assignmentId}`,
        storage_type: 'STANDARD',
        signature_type: 'NONE',
        related_event_ids: [],
        metadata: assignment as any,
        created_at: assignment.createdAt,
        updated_at: assignment.updatedAt,
      },
      update: {
        metadata: assignment as any,
        updated_at: assignment.updatedAt,
      },
    });
  }

  private async getAllRoleAssignments(): Promise<RoleAssignment[]> {
    const artifacts = await prisma.evidence_artifacts.findMany({
      where: { artifact_id: { startsWith: 'role-' } },
    });
    return artifacts.map((a: { metadata: unknown }) => a.metadata as unknown as RoleAssignment);
  }

  private async getActor(actorId: string): Promise<{ name: string; role: RoleType } | null> {
    const actor = await prisma.evidence_actors.findUnique({
      where: { actor_id: actorId },
    });
    return actor ? { name: actor.name || 'Unknown', role: actor.role as RoleType } : null;
  }

  private async ensureActorExists(
    actorId: string,
    name: string,
    role: RoleType,
    authorityLevel: string
  ): Promise<void> {
    const existing = await prisma.evidence_actors.findUnique({
      where: { actor_id: actorId },
    });

    if (!existing) {
      await prisma.evidence_actors.create({
        data: {
          actor_id: actorId,
          actor_type: 'USER',
          name,
          role,
          authority_level: authorityLevel,
          org_unit: 'Veridion',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }
  }
}

// Singleton instance
export const governanceService = new GovernanceService();

