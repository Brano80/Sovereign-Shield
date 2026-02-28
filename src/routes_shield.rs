use actix_web::{web, HttpResponse, get, post, delete};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::evidence::{self, CreateEventParams};
use crate::shield::{Decision, TransferContext, evaluate_transfer, evaluate_transfer_with_db, all_country_classifications, country_name};
use crate::review_queue;

#[derive(Deserialize)]
pub struct IngestLogEntry {
    #[serde(alias = "sourceIp", alias = "source_ip")]
    pub source_ip: Option<String>,
    #[serde(alias = "destIp", alias = "dest_ip")]
    pub dest_ip: Option<String>,
    pub protocol: Option<String>,
    #[serde(alias = "dataSize", alias = "data_size")]
    pub data_size: Option<u64>,
    pub timestamp: Option<String>,
    #[serde(alias = "userAgent", alias = "user_agent")]
    pub user_agent: Option<String>,
    #[serde(alias = "requestPath", alias = "request_path")]
    pub request_path: Option<String>,
    #[serde(alias = "destinationCountryCode", alias = "destination_country_code")]
    pub destination_country_code: Option<String>,
    #[serde(alias = "destinationCountry", alias = "destination_country")]
    pub destination_country: Option<String>,
    #[serde(alias = "dataCategories", alias = "data_categories")]
    pub data_categories: Option<Vec<String>>,
    #[serde(alias = "partnerName", alias = "partner_name")]
    pub partner_name: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvaluateRequest {
    pub destination_country_code: Option<String>,
    pub destination_country: Option<String>,
    pub data_categories: Option<Vec<String>>,
    pub partner_name: Option<String>,
    pub source_ip: Option<String>,
    pub dest_ip: Option<String>,
    pub data_size: Option<u64>,
    pub protocol: Option<String>,
    pub user_agent: Option<String>,
    pub request_path: Option<String>,
}

#[post("/api/v1/shield/evaluate")]
pub async fn evaluate(
    pool: web::Data<PgPool>,
    body: web::Json<EvaluateRequest>,
) -> HttpResponse {
    let ctx = TransferContext {
        destination_country_code: body.destination_country_code.clone(),
        destination_country: body.destination_country.clone(),
        data_categories: body.data_categories.clone(),
        partner_name: body.partner_name.clone(),
        source_ip: body.source_ip.clone(),
        dest_ip: body.dest_ip.clone(),
        data_size: body.data_size,
        protocol: body.protocol.clone(),
        user_agent: body.user_agent.clone(),
        request_path: body.request_path.clone(),
    };

    let decision = match evaluate_transfer_with_db(pool.get_ref(), &ctx).await {
        Ok(d) => d,
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "EVALUATION_FAILED",
                "message": e,
            }));
        }
    };
    let dest_code = ctx.destination_country_code.clone().unwrap_or_default();
    let dest_name = if dest_code.is_empty() {
        ctx.destination_country.clone().unwrap_or("Unknown".into())
    } else {
        country_name(&dest_code)
    };

    let correlation_id = Uuid::new_v4().to_string();

    let payload = serde_json::json!({
        "destination_country": dest_name,
        "destination_country_code": dest_code,
        "country_status": decision.country_status,
        "decision": decision.decision.to_string(),
        "reason": decision.reason,
        "data_categories": ctx.data_categories,
        "data_size": ctx.data_size,
        "source_ip": ctx.source_ip,
        "dest_ip": ctx.dest_ip,
        "protocol": ctx.protocol,
        "user_agent": ctx.user_agent,
        "request_path": ctx.request_path,
        "partner_name": ctx.partner_name,
    });

    let params = CreateEventParams {
        event_type: decision.event_type.clone(),
        severity: decision.severity.clone(),
        source_system: "sovereign-shield".into(),
        regulatory_tags: vec!["GDPR".into()],
        articles: decision.articles.clone(),
        payload: payload.clone(),
        correlation_id: Some(correlation_id.clone()),
        causation_id: None,
        source_ip: ctx.source_ip.clone(),
        source_user_agent: ctx.user_agent.clone(),
    };

    let (event_id, review_id) = match evidence::create_event(pool.get_ref(), params).await {
        Ok(event_row) => {
            let review_id = if decision.decision == Decision::REVIEW {
                let action = format!("transfer_data_to_{}", dest_code.to_lowercase());
                match review_queue::create_review(
                    pool.get_ref(),
                    "sovereign-shield",
                    &action,
                    "sovereign-shield",
                    &serde_json::json!({
                        "destination": dest_name,
                        "destination_country_code": dest_code,
                        "data_categories": ctx.data_categories,
                        "reason": decision.reason,
                    }),
                    &event_row.event_id,
                ).await {
                    Ok(seal_id) => Some(seal_id),
                    Err(e) => {
                        log::error!("Failed to create review for event {}: {}", event_row.event_id, e);
                        None
                    }
                }
            } else {
                None
            };
            (Some(event_row.event_id), review_id)
        }
        Err(e) => {
            log::error!("Failed to create evidence event: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "EVIDENCE_CREATION_FAILED",
                "message": format!("Failed to create evidence: {}", e),
            }));
        }
    };

    HttpResponse::Ok().json(serde_json::json!({
        "decision": decision.decision.to_string(),
        "reason": decision.reason,
        "severity": decision.severity,
        "articles": decision.articles,
        "country_status": decision.country_status,
        "evidence_id": event_id,
        "review_id": review_id,
        "timestamp": Utc::now().to_rfc3339(),
    }))
}

#[post("/api/v1/shield/ingest-logs")]
pub async fn ingest_logs(
    pool: web::Data<PgPool>,
    body: web::Json<Vec<IngestLogEntry>>,
) -> HttpResponse {
    let mut processed = 0u64;

    for entry in body.into_inner() {
        let ctx = TransferContext {
            destination_country_code: entry.destination_country_code.clone(),
            destination_country: entry.destination_country.clone(),
            data_categories: entry.data_categories.clone(),
            partner_name: entry.partner_name.clone(),
            source_ip: entry.source_ip.clone(),
            dest_ip: entry.dest_ip.clone(),
            data_size: entry.data_size,
            protocol: entry.protocol.clone(),
            user_agent: entry.user_agent.clone(),
            request_path: entry.request_path.clone(),
        };

        let decision = evaluate_transfer(&ctx);
        let dest_code = ctx.destination_country_code.clone().unwrap_or_default();
        let dest_name = if dest_code.is_empty() {
            ctx.destination_country.clone().unwrap_or("Unknown".into())
        } else {
            country_name(&dest_code)
        };

        let correlation_id = Uuid::new_v4().to_string();

        let payload = serde_json::json!({
            "destination_country": dest_name,
            "destination_country_code": dest_code,
            "country_status": decision.country_status,
            "decision": decision.decision.to_string(),
            "reason": decision.reason,
            "data_categories": ctx.data_categories,
            "data_size": ctx.data_size,
            "source_ip": ctx.source_ip,
            "dest_ip": ctx.dest_ip,
            "protocol": ctx.protocol,
            "user_agent": ctx.user_agent,
            "request_path": ctx.request_path,
            "partner_name": ctx.partner_name,
        });

        let params = CreateEventParams {
            event_type: decision.event_type.clone(),
            severity: decision.severity.clone(),
            source_system: "sovereign-shield".into(),
            regulatory_tags: vec!["GDPR".into()],
            articles: decision.articles.clone(),
            payload: payload.clone(),
            correlation_id: Some(correlation_id.clone()),
            causation_id: None,
            source_ip: ctx.source_ip.clone(),
            source_user_agent: ctx.user_agent.clone(),
        };

        match evidence::create_event(pool.get_ref(), params).await {
            Ok(event_row) => {
                if decision.decision == Decision::REVIEW {
                    let action = format!("transfer_data_to_{}", dest_code.to_lowercase());
                    if let Err(e) = review_queue::create_review(
                        pool.get_ref(),
                        "sovereign-shield",
                        &action,
                        "sovereign-shield",
                        &serde_json::json!({
                            "destination": dest_name,
                            "destination_country_code": dest_code,
                            "data_categories": ctx.data_categories,
                            "reason": decision.reason,
                        }),
                        &event_row.event_id,
                    ).await {
                        log::error!("Failed to create review for event {}: {}", event_row.event_id, e);
                    }
                }
                processed += 1;
            }
            Err(e) => {
                log::error!("Failed to create evidence event: {}", e);
            }
        }
    }

    HttpResponse::Ok().json(serde_json::json!({
        "processed": processed,
        "timestamp": Utc::now().to_rfc3339(),
    }))
}

#[get("/api/v1/lenses/sovereign-shield/stats")]
pub async fn shield_stats(pool: web::Data<PgPool>) -> HttpResponse {
    let total_transfers: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM evidence_events WHERE source_system = 'sovereign-shield'"
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap_or(0);

    let blocked_today: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM evidence_events WHERE source_system = 'sovereign-shield' AND event_type = 'DATA_TRANSFER_BLOCKED' AND created_at >= CURRENT_DATE"
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap_or(0);

    let pending_reviews: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM human_oversight WHERE status = 'PENDING'"
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap_or(0);

    let active_agents: i64 = sqlx::query_scalar(
        "SELECT COUNT(DISTINCT payload->>'source_ip') FROM evidence_events WHERE source_system = 'sovereign-shield' AND created_at >= NOW() - INTERVAL '24 hours'"
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap_or(0);

    #[derive(sqlx::FromRow)]
    struct AttentionRow {
        destination_country_code: Option<String>,
        decision: Option<String>,
        occurrence_count: Option<i64>,
        first_seen: Option<chrono::DateTime<chrono::Utc>>,
        last_seen: Option<chrono::DateTime<chrono::Utc>>,
        event_id: Option<String>,
        system_name: Option<String>,
    }

    let attention_rows: Vec<AttentionRow> = sqlx::query_as(
        r#"SELECT
            payload->>'destination_country_code' as destination_country_code,
            payload->>'decision' as decision,
            COUNT(*) as occurrence_count,
            MIN(created_at) as first_seen,
            MAX(created_at) as last_seen,
            MIN(event_id) as event_id,
            MIN(payload->>'source_ip') as system_name
        FROM evidence_events
        WHERE source_system = 'sovereign-shield'
          AND event_type IN ('DATA_TRANSFER_BLOCKED', 'DATA_TRANSFER_REVIEW')
        GROUP BY payload->>'destination_country_code', payload->>'decision'
        ORDER BY COUNT(*) DESC
        LIMIT 20"#
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    let requires_attention: Vec<serde_json::Value> = attention_rows.iter().map(|r| {
        let code = r.destination_country_code.clone().unwrap_or_default();
        serde_json::json!({
            "eventId": r.event_id,
            "destinationCountry": country_name(&code),
            "destinationCountryCode": code,
            "systemName": r.system_name.clone().unwrap_or("unknown".into()),
            "occurrenceCount": r.occurrence_count.unwrap_or(0),
            "firstSeen": r.first_seen.map(|t| t.to_rfc3339()),
            "lastSeen": r.last_seen.map(|t| t.to_rfc3339()),
            "decision": r.decision,
        })
    }).collect();

    HttpResponse::Ok().json(serde_json::json!({
        "totalTransfers": total_transfers,
        "activeAdequateCount": 13,
        "totalAdequateWhitelistCount": 15,
        "sccCoverage": {
            "percentage": 0,
            "trend": 0,
            "covered": 0,
            "total": 6
        },
        "blockedToday": blocked_today,
        "pendingApprovals": pending_reviews,
        "expiringSccs": 0,
        "dataVolumeToday": 0,
        "highRiskDestinations": 0,
        "activeAgents": active_agents,
        "requiresAttention": requires_attention,
    }))
}

#[get("/api/v1/lenses/sovereign-shield/countries")]
pub async fn shield_countries(pool: web::Data<PgPool>) -> HttpResponse {
    let mut countries = all_country_classifications();

    #[derive(sqlx::FromRow)]
    struct CountryTransferCount {
        country_code: Option<String>,
        transfer_count: Option<i64>,
    }

    let counts: Vec<CountryTransferCount> = sqlx::query_as(
        r#"SELECT
            payload->>'destination_country_code' as country_code,
            COUNT(*) as transfer_count
        FROM evidence_events
        WHERE source_system = 'sovereign-shield'
          AND payload->>'destination_country_code' IS NOT NULL
        GROUP BY payload->>'destination_country_code'"#
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    for country in &mut countries {
        let code = country.get("code").and_then(|v| v.as_str()).unwrap_or("");
        let transfer_count = counts.iter()
            .find(|c| c.country_code.as_deref() == Some(code))
            .and_then(|c| c.transfer_count)
            .unwrap_or(0);
        country.as_object_mut().map(|obj| {
            obj.insert("transfers".into(), serde_json::json!(transfer_count));
            obj.insert("mechanisms".into(), serde_json::json!(0));
        });
    }

    HttpResponse::Ok().json(countries)
}

#[get("/api/v1/lenses/sovereign-shield/requires-attention")]
pub async fn shield_requires_attention(pool: web::Data<PgPool>) -> HttpResponse {
    #[derive(sqlx::FromRow)]
    struct Row {
        destination_country_code: Option<String>,
        decision: Option<String>,
        occurrence_count: Option<i64>,
        first_seen: Option<chrono::DateTime<chrono::Utc>>,
        last_seen: Option<chrono::DateTime<chrono::Utc>>,
        event_id: Option<String>,
        system_name: Option<String>,
    }

    let rows: Vec<Row> = sqlx::query_as(
        r#"SELECT
            payload->>'destination_country_code' as destination_country_code,
            payload->>'decision' as decision,
            COUNT(*) as occurrence_count,
            MIN(created_at) as first_seen,
            MAX(created_at) as last_seen,
            MIN(event_id) as event_id,
            MIN(payload->>'source_ip') as system_name
        FROM evidence_events
        WHERE source_system = 'sovereign-shield'
          AND event_type IN ('DATA_TRANSFER_BLOCKED', 'DATA_TRANSFER_REVIEW')
        GROUP BY payload->>'destination_country_code', payload->>'decision'
        ORDER BY COUNT(*) DESC
        LIMIT 20"#
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    let items: Vec<serde_json::Value> = rows.iter().map(|r| {
        let code = r.destination_country_code.clone().unwrap_or_default();
        serde_json::json!({
            "eventId": r.event_id,
            "destinationCountry": country_name(&code),
            "destinationCountryCode": code,
            "systemName": r.system_name.clone().unwrap_or("unknown".into()),
            "occurrenceCount": r.occurrence_count.unwrap_or(0),
            "firstSeen": r.first_seen.map(|t| t.to_rfc3339()),
            "lastSeen": r.last_seen.map(|t| t.to_rfc3339()),
            "decision": r.decision,
            "blockedReason": null,
        })
    }).collect();

    HttpResponse::Ok().json(items)
}

#[get("/api/v1/lenses/sovereign-shield/transfers/by-destination")]
pub async fn transfers_by_destination(pool: web::Data<PgPool>) -> HttpResponse {
    #[derive(sqlx::FromRow)]
    struct Row {
        destination: Option<String>,
        status: Option<String>,
        count: Option<i64>,
    }

    let rows: Vec<Row> = sqlx::query_as(
        r#"SELECT
            payload->>'destination_country' as destination,
            payload->>'country_status' as status,
            COUNT(*) as count
        FROM evidence_events
        WHERE source_system = 'sovereign-shield'
          AND payload->>'destination_country' IS NOT NULL
        GROUP BY payload->>'destination_country', payload->>'country_status'
        ORDER BY COUNT(*) DESC
        LIMIT 20"#
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    let items: Vec<serde_json::Value> = rows.iter().map(|r| {
        let status_label = match r.status.as_deref() {
            Some("adequate_protection") | Some("eu_eea") => "Adequate",
            Some("scc_required") => "SCC",
            Some("blocked") => "Blocked",
            _ => "Unknown",
        };
        serde_json::json!({
            "destination": r.destination,
            "status": status_label,
            "count": r.count.unwrap_or(0),
        })
    }).collect();

    HttpResponse::Ok().json(items)
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SccRegistryRequest {
    pub partner_name: String,
    pub destination_country_code: String,
    pub expires_at: Option<String>,
    pub notes: Option<String>,
}

#[derive(sqlx::FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SccRegistryRow {
    pub id: Uuid,
    pub partner_name: String,
    pub destination_country_code: String,
    pub status: String,
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
    pub registered_by: Option<String>,
    pub registered_at: chrono::DateTime<chrono::Utc>,
    pub notes: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[post("/api/v1/scc-registries")]
pub async fn register_scc(
    pool: web::Data<PgPool>,
    body: web::Json<SccRegistryRequest>,
) -> HttpResponse {
    let expires_at = body.expires_at.as_ref().and_then(|s| {
        chrono::DateTime::parse_from_rfc3339(s)
            .ok()
            .map(|dt| dt.with_timezone(&chrono::Utc))
    });

    let dest_upper = body.destination_country_code.to_uppercase();
    let row = match sqlx::query_as::<_, SccRegistryRow>(
        r#"INSERT INTO scc_registries 
           (partner_name, destination_country_code, status, expires_at, registered_by, notes)
           VALUES ($1, $2, 'active', $3, 'admin', $4)
           RETURNING *"#
    )
    .bind(&body.partner_name)
    .bind(&dest_upper)
    .bind(&expires_at)
    .bind(&body.notes)
    .fetch_one(pool.get_ref())
    .await {
        Ok(r) => r,
        Err(e) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "REGISTRATION_FAILED",
                "message": format!("Failed to register SCC: {}", e),
            }));
        }
    };

    // Auto-approve pending review items whose transfer matches this SCC (destination country)
    if let Ok(n) = review_queue::approve_pending_reviews_for_scc(
        pool.get_ref(),
        &dest_upper,
        Some(body.partner_name.as_str()),
    )
    .await
    {
        if n > 0 {
            log::info!("SCC registration auto-approved {} pending review(s) for {}", n, dest_upper);
        }
    }

    HttpResponse::Created().json(serde_json::json!({
        "id": row.id.to_string(),
        "partnerName": row.partner_name,
        "destinationCountryCode": row.destination_country_code,
        "status": row.status,
        "expiresAt": row.expires_at.map(|t| t.to_rfc3339()),
        "registeredBy": row.registered_by,
        "registeredAt": row.registered_at.to_rfc3339(),
        "notes": row.notes,
        "createdAt": row.created_at.to_rfc3339(),
        "updatedAt": row.updated_at.to_rfc3339(),
    }))
}

#[get("/api/v1/scc-registries")]
pub async fn list_scc_registries(
    pool: web::Data<PgPool>,
) -> HttpResponse {
    let rows: Vec<SccRegistryRow> = match sqlx::query_as::<_, SccRegistryRow>(
        "SELECT * FROM scc_registries ORDER BY registered_at DESC"
    )
    .fetch_all(pool.get_ref())
    .await {
        Ok(r) => r,
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "QUERY_FAILED",
                "message": format!("Failed to list SCC registries: {}", e),
            }));
        }
    };

    let items: Vec<serde_json::Value> = rows.iter().map(|r| {
        serde_json::json!({
            "id": r.id.to_string(),
            "partnerName": r.partner_name,
            "destinationCountryCode": r.destination_country_code,
            "status": r.status,
            "expiresAt": r.expires_at.map(|t| t.to_rfc3339()),
            "registeredBy": r.registered_by,
            "registeredAt": r.registered_at.to_rfc3339(),
            "notes": r.notes,
            "createdAt": r.created_at.to_rfc3339(),
            "updatedAt": r.updated_at.to_rfc3339(),
        })
    }).collect();

    HttpResponse::Ok().json(serde_json::json!({
        "registries": items,
        "total": items.len(),
    }))
}

#[derive(Deserialize)]
pub struct DeleteSccPath {
    pub id: String,
}

#[delete("/api/v1/scc-registries/{id}")]
pub async fn revoke_scc(
    pool: web::Data<PgPool>,
    path: web::Path<DeleteSccPath>,
) -> HttpResponse {
    let id = match Uuid::parse_str(&path.id) {
        Ok(u) => u,
        Err(_) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "INVALID_ID",
                "message": "Invalid UUID format",
            }));
        }
    };

    let result = sqlx::query(
        "UPDATE scc_registries SET status = 'revoked' WHERE id = $1 AND status = 'active'"
    )
    .bind(id)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => {
            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "id": path.id,
                "status": "revoked",
            }))
        }
        Ok(_) => {
            HttpResponse::NotFound().json(serde_json::json!({
                "error": "NOT_FOUND",
                "message": "SCC registry not found or already revoked",
            }))
        }
        Err(e) => {
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "REVOKE_FAILED",
                "message": format!("Failed to revoke SCC: {}", e),
            }))
        }
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(evaluate)
       .service(ingest_logs)
       .service(shield_stats)
       .service(shield_countries)
       .service(shield_requires_attention)
       .service(transfers_by_destination)
       .service(register_scc)
       .service(list_scc_registries)
       .service(revoke_scc);
}
