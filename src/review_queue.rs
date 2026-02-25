use chrono::Utc;
use sha2::{Sha256, Digest};
use sqlx::PgPool;
use uuid::Uuid;

use crate::evidence::{self, CreateEventParams};
use crate::models::{ComplianceRecordRow, HumanOversightRow, ReviewItemResponse};

fn sha256_hex(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    format!("{:x}", hasher.finalize())
}

pub async fn create_review(
    pool: &PgPool,
    agent_id: &str,
    action: &str,
    module: &str,
    context: &serde_json::Value,
    evidence_event_id: &str,
) -> Result<String, String> {
    let seal_id = format!("SEAL-{}", Uuid::new_v4().to_string().replace('-', "")[..16].to_uppercase());
    let tx_id = format!("TX-{}", Uuid::new_v4().to_string().replace('-', "")[..12].to_uppercase());
    let payload_hash = sha256_hex(&serde_json::to_string(context).unwrap_or_default());

    sqlx::query(
        r#"INSERT INTO compliance_records
            (agent_id, action_summary, seal_id, status, human_oversight_status, tx_id, payload_hash)
           VALUES ($1, $2, $3, 'PENDING_REVIEW', 'PENDING', $4, $5)"#
    )
    .bind(agent_id)
    .bind(action)
    .bind(&seal_id)
    .bind(&tx_id)
    .bind(&payload_hash)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to create compliance record: {}", e))?;

    sqlx::query(
        "INSERT INTO human_oversight (seal_id, status) VALUES ($1, 'PENDING')"
    )
    .bind(&seal_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to create human oversight entry: {}", e))?;

    Ok(seal_id)
}

pub async fn list_reviews(pool: &PgPool, status: Option<&str>) -> Result<Vec<ReviewItemResponse>, String> {
    let rows: Vec<(ComplianceRecordRow, HumanOversightRow)> = if let Some(s) = status {
        let cr_rows: Vec<ComplianceRecordRow> = sqlx::query_as(
            r#"SELECT cr.* FROM compliance_records cr
               JOIN human_oversight ho ON ho.seal_id = cr.seal_id
               WHERE ho.status = $1
               ORDER BY cr.created_at DESC"#
        )
        .bind(s)
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

        let ho_rows: Vec<HumanOversightRow> = sqlx::query_as(
            "SELECT * FROM human_oversight WHERE status = $1 ORDER BY created_at DESC"
        )
        .bind(s)
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

        cr_rows.into_iter().zip(ho_rows.into_iter()).collect()
    } else {
        let cr_rows: Vec<ComplianceRecordRow> = sqlx::query_as(
            r#"SELECT cr.* FROM compliance_records cr
               JOIN human_oversight ho ON ho.seal_id = cr.seal_id
               ORDER BY cr.created_at DESC"#
        )
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

        let ho_rows: Vec<HumanOversightRow> = sqlx::query_as(
            "SELECT * FROM human_oversight ORDER BY created_at DESC"
        )
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

        cr_rows.into_iter().zip(ho_rows.into_iter()).collect()
    };

    let reviews: Vec<ReviewItemResponse> = rows.into_iter().map(|(cr, ho)| {
        let final_decision = match ho.status.as_str() {
            "APPROVED" => Some("ALLOW".to_string()),
            "REJECTED" => Some("BLOCK".to_string()),
            _ => None,
        };
        let status = match ho.status.as_str() {
            "PENDING" => "PENDING",
            "APPROVED" | "REJECTED" => "DECIDED",
            _ => &ho.status,
        };

        ReviewItemResponse {
            id: cr.seal_id.clone(),
            created: cr.created_at.to_rfc3339(),
            agent_id: cr.agent_id.clone(),
            action: cr.action_summary.clone(),
            module: "sovereign-shield".to_string(),
            suggested_decision: "REVIEW".to_string(),
            context: serde_json::json!({
                "seal_id": cr.seal_id,
                "tx_id": cr.tx_id,
                "risk_level": cr.risk_level,
            }),
            status: status.to_string(),
            evidence_id: cr.seal_id.clone(),
            decided_by: ho.reviewer_id.clone(),
            decision_reason: ho.comments.clone(),
            final_decision,
            decided_at: ho.decided_at.map(|t| t.to_rfc3339()),
            expires_at: None,
        }
    }).collect();

    Ok(reviews)
}

pub async fn decide_review(
    pool: &PgPool,
    seal_id: &str,
    decision: &str,
    reviewer_id: &str,
    comments: &str,
) -> Result<(), String> {
    let ho_status = match decision {
        "ALLOW" | "APPROVE" => "APPROVED",
        "BLOCK" | "REJECT" => "REJECTED",
        _ => return Err(format!("Invalid decision: {}", decision)),
    };

    let result = sqlx::query(
        "UPDATE human_oversight SET status = $1, reviewer_id = $2, decided_at = $3, comments = $4 WHERE seal_id = $5 AND status = 'PENDING'"
    )
    .bind(ho_status)
    .bind(reviewer_id)
    .bind(Utc::now())
    .bind(comments)
    .bind(seal_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to update human oversight: {}", e))?;

    if result.rows_affected() == 0 {
        return Err("Review not found or already decided".into());
    }

    sqlx::query(
        "UPDATE compliance_records SET human_oversight_status = $1 WHERE seal_id = $2"
    )
    .bind(ho_status)
    .bind(seal_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to update compliance record: {}", e))?;

    let params = CreateEventParams {
        event_type: format!("HUMAN_OVERSIGHT_{}", ho_status),
        severity: "L2".into(),
        source_system: "human-oversight".into(),
        regulatory_tags: vec!["GDPR".into()],
        articles: vec!["GDPR Art. 22".into()],
        payload: serde_json::json!({
            "seal_id": seal_id,
            "decision": ho_status,
            "reviewer_id": reviewer_id,
            "comments": comments,
        }),
        correlation_id: Some(seal_id.to_string()),
        causation_id: None,
        source_ip: None,
        source_user_agent: None,
    };

    if let Err(e) = evidence::create_event(pool, params).await {
        log::error!("Failed to create evidence event for review decision: {}", e);
    }

    Ok(())
}
