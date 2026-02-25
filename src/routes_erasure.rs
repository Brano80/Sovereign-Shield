use actix_web::{web, HttpResponse, post};
use chrono::Utc;
use serde::Deserialize;
use sqlx::PgPool;

use crate::crypto_shredder;
use crate::evidence::{self, CreateEventParams};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ErasureRequest {
    pub request_id: String,
    pub user_id: String,
    pub grounds: String,
    pub confirmation: String,
}

#[post("/api/v1/lenses/gdpr-rights/erasure/execute")]
pub async fn execute_erasure(
    pool: web::Data<PgPool>,
    body: web::Json<ErasureRequest>,
) -> HttpResponse {
    let expected_confirmation = format!("ERASE {}", body.user_id);
    if body.confirmation != expected_confirmation {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "INVALID_CONFIRMATION",
            "message": format!("Confirmation must be 'ERASE {}'", body.user_id),
        }));
    }

    let (crypto_log_id, shredded_items, total_records, total_size) =
        match crypto_shredder::execute_erasure(
            pool.get_ref(),
            &body.user_id,
            &body.request_id,
            &body.grounds,
        ).await {
            Ok(result) => result,
            Err(e) => {
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "ERASURE_FAILED",
                    "message": e,
                }));
            }
        };

    let now = Utc::now();
    let params = CreateEventParams {
        event_type: "GDPR_ERASURE_COMPLETED".into(),
        severity: "L4".into(),
        source_system: "crypto-shredder".into(),
        regulatory_tags: vec!["GDPR".into()],
        articles: vec!["GDPR Art. 17".into()],
        payload: serde_json::json!({
            "requestId": body.request_id,
            "userId": body.user_id,
            "grounds": body.grounds,
            "executedAt": now.to_rfc3339(),
            "shreddedItems": shredded_items,
            "cryptoLogId": crypto_log_id,
            "totalRecords": total_records,
            "totalSizeMb": total_size,
        }),
        correlation_id: Some(body.request_id.clone()),
        causation_id: None,
        source_ip: None,
        source_user_agent: None,
    };

    if let Err(e) = evidence::create_event(pool.get_ref(), params).await {
        return HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "EVIDENCE_LOGGING_FAILED",
            "message": format!("Failed to log erasure to evidence graph: {}", e),
        }));
    }

    let cert_id = format!("CERT-{}-{}", body.request_id, now.format("%Y%m%d%H%M%S"));

    HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "requestId": body.request_id,
        "userId": body.user_id,
        "executedAt": now.to_rfc3339(),
        "executedBy": "admin",
        "grounds": body.grounds,
        "shreddedItems": shredded_items,
        "summary": {
            "totalRecords": total_records,
            "totalSizeMb": total_size,
            "cryptoLogId": crypto_log_id,
            "evidenceSealed": true,
            "integrityLevel": "L4"
        },
        "certificate": {
            "id": cert_id,
            "issuedAt": now.to_rfc3339(),
            "issuedBy": "Veridion API Crypto-Shredder",
            "compliance": "GDPR Article 17 - Right to Erasure",
            "verification": format!("Evidence sealed with L4 integrity: {}", crypto_log_id),
        }
    }))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(execute_erasure);
}
