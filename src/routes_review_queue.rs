use actix_web::{web, HttpResponse, get, post};
use serde::Deserialize;
use sqlx::PgPool;

use crate::review_queue;

#[derive(Deserialize)]
pub struct ListQuery {
    pub status: Option<String>,
}

#[get("/api/v1/review-queue")]
pub async fn list_reviews(
    pool: web::Data<PgPool>,
    query: web::Query<ListQuery>,
) -> HttpResponse {
    match review_queue::list_reviews(pool.get_ref(), query.status.as_deref()).await {
        Ok(reviews) => {
            let pending = reviews.iter().filter(|r| r.status == "PENDING").count();
            let decided = reviews.iter().filter(|r| r.status == "DECIDED").count();
            let expired = reviews.iter().filter(|r| r.status == "EXPIRED").count();
            let total = reviews.len();

            HttpResponse::Ok().json(serde_json::json!({
                "reviews": reviews,
                "total": total,
                "pending": pending,
                "decided": decided,
                "expired": expired,
            }))
        }
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": e,
        })),
    }
}

#[get("/api/v1/human_oversight/pending")]
pub async fn get_pending(pool: web::Data<PgPool>) -> HttpResponse {
    match review_queue::list_reviews(pool.get_ref(), Some("PENDING")).await {
        Ok(reviews) => HttpResponse::Ok().json(serde_json::json!({
            "reviews": reviews,
            "total": reviews.len(),
        })),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": e,
        })),
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DecisionBody {
    pub decision: String,
    pub reason: String,
    pub reviewer_id: Option<String>,
}

#[post("/api/v1/action/{seal_id}/approve")]
pub async fn approve_action(
    pool: web::Data<PgPool>,
    path: web::Path<String>,
    body: web::Json<DecisionBody>,
) -> HttpResponse {
    let seal_id = path.into_inner();
    let reviewer = body.reviewer_id.as_deref().unwrap_or("admin");

    match review_queue::decide_review(pool.get_ref(), &seal_id, "APPROVE", reviewer, &body.reason).await {
        Ok(()) => HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "sealId": seal_id,
            "decision": "APPROVED",
        })),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": e,
        })),
    }
}

#[post("/api/v1/action/{seal_id}/reject")]
pub async fn reject_action(
    pool: web::Data<PgPool>,
    path: web::Path<String>,
    body: web::Json<DecisionBody>,
) -> HttpResponse {
    let seal_id = path.into_inner();
    let reviewer = body.reviewer_id.as_deref().unwrap_or("admin");

    match review_queue::decide_review(pool.get_ref(), &seal_id, "REJECT", reviewer, &body.reason).await {
        Ok(()) => HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "sealId": seal_id,
            "decision": "REJECTED",
        })),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": e,
        })),
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(list_reviews)
       .service(get_pending)
       .service(approve_action)
       .service(reject_action);
}
