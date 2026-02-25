mod models;
mod evidence;
mod shield;
mod crypto_shredder;
mod review_queue;
mod routes_evidence;
mod routes_shield;
mod routes_review_queue;
mod routes_erasure;

use actix_web::{web, App, HttpRequest, HttpResponse, HttpServer, get};
use actix_cors::Cors;
use serde::Serialize;
use sqlx::PgPool;
use std::env;
use std::path::Path;

#[derive(Serialize)]
struct UserResponse {
    id: String,
    username: String,
    email: String,
    full_name: Option<String>,
    roles: Vec<String>,
    onboarded: bool,
    enforcement_override: bool,
    company_id: Option<String>,
}

#[derive(Serialize)]
struct LoginResponse {
    token: String,
    user: UserResponse,
}

#[get("/health")]
async fn health() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "veridion-api",
        "version": "1.0.0"
    }))
}

#[get("/api/v1/auth/dev-bypass")]
async fn dev_bypass(pool: web::Data<PgPool>) -> HttpResponse {
    if env::var("RUST_ENV").unwrap_or_else(|_| "development".into()) == "production" {
        return HttpResponse::NotFound().json(serde_json::json!({ "error": "Endpoint not available" }));
    }

    let row: Option<(uuid::Uuid, String, String, Option<String>)> = sqlx::query_as(
        "SELECT id, username, email, full_name FROM users WHERE username = $1 AND active = true"
    )
    .bind("admin")
    .fetch_optional(pool.get_ref())
    .await
    .ok()
    .flatten();

    let (user_id, username, email, full_name) = match row {
        Some(r) => r,
        None => {
            log::warn!("Dev bypass: admin user not found");
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "Admin user not found - run seed_admin or create admin user in database"
            }));
        }
    };

    let secret = match env::var("JWT_SECRET") {
        Ok(s) if !s.is_empty() => s,
        _ => {
            log::warn!("JWT_SECRET not set, using dev default");
            "veridion-api-dev-secret-change-in-production".to_string()
        }
    };

    let now = chrono::Utc::now();
    let exp = (now + chrono::Duration::hours(24)).timestamp() as usize;
    let token = match jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &serde_json::json!({
            "sub": user_id.to_string(),
            "username": username,
            "roles": ["admin", "editor"],
            "onboarded": true,
            "company_id": Option::<String>::None,
            "exp": exp,
            "iat": now.timestamp() as usize
        }),
        &jsonwebtoken::EncodingKey::from_secret(secret.as_ref()),
    ) {
        Ok(t) => t,
        Err(e) => {
            log::error!("JWT encode error: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({ "error": "Failed to generate token" }));
        }
    };

    HttpResponse::Ok().json(LoginResponse {
        token,
        user: UserResponse {
            id: user_id.to_string(),
            username,
            email,
            full_name,
            roles: vec!["admin".to_string(), "editor".to_string()],
            onboarded: true,
            enforcement_override: false,
            company_id: None,
        },
    })
}

#[get("/api/v1/system/config")]
async fn system_config() -> HttpResponse {
    let now = chrono::Utc::now().to_rfc3339();
    HttpResponse::Ok().json(serde_json::json!({
        "runtime_mode": "live",
        "updated_at": now,
        "enforcement_mode": "live",
        "enabled_at": now
    }))
}

#[get("/api/v1/my/enabled-modules")]
async fn enabled_modules() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({ "modules": [] }))
}

#[get("/api/v1/modules")]
async fn modules() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({ "modules": [] }))
}

#[get("/api/v1/auth/me")]
async fn auth_me(req: HttpRequest) -> HttpResponse {
    let auth = req.headers().get("Authorization").and_then(|v| v.to_str().ok());
    let token = match auth {
        Some(s) if s.starts_with("Bearer ") => s.trim_start_matches("Bearer "),
        _ => {
            return HttpResponse::Unauthorized().json(serde_json::json!({ "error": "Missing or invalid Authorization" }));
        }
    };
    let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "veridion-api-dev-secret-change-in-production".to_string());
    let key = jsonwebtoken::DecodingKey::from_secret(secret.as_ref());
    let validation = jsonwebtoken::Validation::default();
    let claims: serde_json::Value = match jsonwebtoken::decode::<serde_json::Value>(token, &key, &validation) {
        Ok(t) => t.claims,
        Err(_) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({ "error": "Invalid token" }));
        }
    };
    let sub = claims.get("sub").and_then(|v| v.as_str()).unwrap_or("");
    let username = claims.get("username").and_then(|v| v.as_str()).unwrap_or("user");
    let roles: Vec<String> = claims.get("roles")
        .and_then(|v| v.as_array())
        .map(|a| a.iter().filter_map(|v| v.as_str().map(String::from)).collect())
        .unwrap_or_else(|| vec!["admin".to_string(), "editor".to_string()]);
    let onboarded = claims.get("onboarded").and_then(|v| v.as_bool()).unwrap_or(true);
    let company_id = claims.get("company_id").and_then(|v| v.as_str()).filter(|s| !s.is_empty()).map(String::from);
    HttpResponse::Ok().json(serde_json::json!({
        "id": sub,
        "username": username,
        "email": null,
        "full_name": null,
        "roles": roles,
        "onboarded": onboarded,
        "enforcement_override": false,
        "company_id": company_id
    }))
}

#[get("/api/v1/audit/alerts")]
async fn audit_alerts() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({ "alerts": [] }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let database_url = database_url.replace("localhost", "127.0.0.1");
    let server_host = env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let server_port: u16 = env::var("SERVER_PORT").unwrap_or_else(|_| "8080".to_string()).parse().expect("SERVER_PORT must be a number");
    let allowed_origins = env::var("ALLOWED_ORIGINS").unwrap_or_else(|_| "http://localhost:3000,http://127.0.0.1:3000".to_string());

    println!("Connecting to database...");
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    let migrations_dir = env::var("MIGRATIONS_PATH")
        .map(|p| Path::new(&p).to_path_buf())
        .unwrap_or_else(|_| Path::new("./migrations").to_path_buf());

    let max_version = std::fs::read_dir(&migrations_dir)
        .ok()
        .and_then(|d| {
            d.filter_map(|e| e.ok())
                .filter_map(|e| {
                    e.file_name().to_str().and_then(|n| {
                        n.split('_').next().and_then(|v| v.parse::<i64>().ok())
                    })
                })
                .max()
        })
        .unwrap_or(0);

    if max_version > 0 {
        let deleted = sqlx::query("DELETE FROM _sqlx_migrations WHERE version > $1")
            .bind(max_version)
            .execute(&pool)
            .await;
        if let Ok(res) = deleted {
            if res.rows_affected() > 0 {
                println!("Cleaned {} stale migration record(s) (version > {}).", res.rows_affected(), max_version);
            }
        }
    }

    if env::var("RESET_MIGRATIONS").map(|v| v == "1" || v.eq_ignore_ascii_case("true")).unwrap_or(false) {
        println!("RESET_MIGRATIONS set: dropping _sqlx_migrations to re-run all migrations.");
        let _ = sqlx::query("DROP TABLE IF EXISTS _sqlx_migrations").execute(&pool).await;
    }

    println!("Running migrations from {:?}...", migrations_dir);
    sqlx::migrate::Migrator::new(migrations_dir)
        .await
        .expect("Failed to create migrator")
        .run(&pool)
        .await
        .expect("Failed to run migrations");
    println!("Migrations applied.");

    let origins: Vec<String> = allowed_origins.split(',').map(|s| s.trim().to_string()).collect();

    println!("Veridion API starting on http://{}:{}", server_host, server_port);
    println!("  Health:          GET  /health");
    println!("  Dev login:       GET  /api/v1/auth/dev-bypass");
    println!("  Evidence events: GET  /api/v1/evidence/events");
    println!("  Shield evaluate: POST /api/v1/shield/evaluate (synchronous runtime enforcement)");
    println!("  Shield ingest:   POST /api/v1/shield/ingest-logs (batch processing)");
    println!("  Shield stats:    GET  /api/v1/lenses/sovereign-shield/stats");
    println!("  SCC register:    POST /api/v1/scc-registries");
    println!("  SCC list:        GET  /api/v1/scc-registries");
    println!("  SCC revoke:      DELETE /api/v1/scc-registries/{{id}}");
    println!("  Review queue:    GET  /api/v1/review-queue");
    println!("  Erasure:         POST /api/v1/lenses/gdpr-rights/erasure/execute");

    HttpServer::new(move || {
        let mut cors = Cors::default()
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec![actix_web::http::header::AUTHORIZATION, actix_web::http::header::CONTENT_TYPE]);
        for origin in &origins {
            cors = cors.allowed_origin(origin.as_str());
        }
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .wrap(cors)
            .service(health)
            .service(dev_bypass)
            .service(system_config)
            .service(enabled_modules)
            .service(modules)
            .service(auth_me)
            .service(audit_alerts)
            .configure(routes_evidence::configure)
            .configure(routes_shield::configure)
            .configure(routes_review_queue::configure)
            .configure(routes_erasure::configure)
    })
    .bind((server_host.as_str(), server_port))?
    .run()
    .await
}
