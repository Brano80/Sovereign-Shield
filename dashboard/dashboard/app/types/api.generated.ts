export interface paths {
    "/admin/config/reload": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["reload_configs"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/transfers/derogations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_derogations"];
        put?: never;
        post: operations["create_derogation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/transfers/mechanisms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_mechanisms"];
        put?: never;
        post: operations["create_mechanism"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/consent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all consents (admin endpoint) */
        get: operations["get_consents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/consent/grant": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Grant consent for a user */
        post: operations["grant_consent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/consent/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get consent statistics */
        get: operations["get_consent_stats"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/consent/user/{user_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get user consents and history */
        get: operations["get_user_consents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/consent/withdraw": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Withdraw consent for the authenticated user */
        post: operations["withdraw_consent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/dora/art28/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get TPRM dashboard data */
        get: operations["get_tprm_dashboard"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/dora/art28/monitoring": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get risk monitoring data */
        get: operations["get_risk_monitoring_data"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/dora/art28/risk-matrix": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get risk matrix data for visualization */
        get: operations["get_risk_matrix_data"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art15/alerts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get active alerts */
        get: operations["get_alerts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art15/alerts/{alert_id}/acknowledge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Acknowledge an alert */
        put: operations["acknowledge_alert"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art15/systems": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all AI systems for the company */
        get: operations["get_ai_systems"];
        put?: never;
        /** Register a new AI system for performance monitoring */
        post: operations["register_ai_system"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art15/systems/{system_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a specific AI system by ID */
        get: operations["get_ai_system"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art15/systems/{system_id}/compliance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get compliance snapshot for an AI system */
        get: operations["get_compliance_snapshot"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art15/systems/{system_id}/drift": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Submit drift detection data for an AI system */
        post: operations["submit_drift_detection"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art15/systems/{system_id}/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Submit performance metrics for an AI system */
        post: operations["submit_performance_metrics"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art15/systems/{system_id}/performance-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get performance history for an AI system */
        get: operations["get_performance_history"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art15/systems/{system_id}/robustness": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Submit robustness test results for an AI system */
        post: operations["submit_robustness_test"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art15/systems/{system_id}/security": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Report a security event for an AI system */
        post: operations["report_security_event"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art5/alerts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get recent alerts */
        get: operations["get_recent_alerts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art5/analytics/traffic": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get traffic analytics */
        get: operations["get_traffic_analytics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art5/analyze": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Analyze AI request for prohibited practices */
        post: operations["analyze_request"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art5/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Article 5 categories status */
        get: operations["get_categories_status"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art5/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Article 5 configuration */
        get: operations["get_article5_config"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art5/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Article 5 dashboard data */
        get: operations["get_dashboard_data"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art5/feed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get real-time monitoring feed */
        get: operations["get_realtime_feed"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art5/report": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Export compliance report */
        get: operations["export_compliance_report"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-act/art5/systems": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get AI systems inventory */
        get: operations["get_systems_inventory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-compliance/decisions/pending": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List pending decisions for Human Oversight Queue */
        get: operations["list_pending_decisions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai-compliance/transparency/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get transparency dashboard statistics
         * @description Aggregates data from both ai_decisions and transparency_logs tables
         */
        get: operations["get_transparency_dashboard_stats"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai/deployer/check-purpose": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Check purpose limitation compliance */
        post: operations["check_purpose_compliance"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai/deployer/compliance-report": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get deployer compliance report */
        get: operations["get_compliance_report"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai/deployer/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get deployer obligations configuration */
        get: operations["get_deployer_config"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai/deployer/usage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Submit AI usage record */
        post: operations["submit_usage_record"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai/quality/check": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Run quality checks on AI component */
        post: operations["run_quality_check"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai/quality/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get quality management configuration */
        get: operations["get_quality_config"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ai/quality/validate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Validate AI quality management system compliance */
        get: operations["validate_quality_system"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List API keys */
        get: operations["list_api_keys"];
        put?: never;
        /** Create a new API key */
        post: operations["create_api_key"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api_keys/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get API key details */
        get: operations["get_api_key"];
        put?: never;
        post?: never;
        /** Revoke API key */
        delete: operations["revoke_api_key"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/article15/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get dashboard overview data */
        get: operations["get_dashboard_data_api_v1_article15_dashboard"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/audit/alerts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get alerts with pagination and filtering */
        get: operations["get_alerts_api_v1_audit_alerts"];
        put?: never;
        /** Create a new alert */
        post: operations["create_alert"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/audit/clocks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List active regulatory clocks */
        get: operations["get_active_clocks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/audit/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get audit events */
        get: operations["get_audit_events"];
        put?: never;
        /** Create audit event */
        post: operations["create_audit_event"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/audit/events-by-regulation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Events by regulation for stacked bar breakdown */
        get: operations["get_events_by_regulation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/audit/integrity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Integrity summary for overview panel */
        get: operations["get_integrity_summary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/audit/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** KPI stats for Audit & Evidence overview */
        get: operations["get_audit_stats"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/datasets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List datasets for current tenant. */
        get: operations["list_datasets"];
        put?: never;
        /** Register a dataset and run a simple deploy gate (fail-closed). */
        post: operations["create_dataset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/datasets/{dataset_id}/deploy-gate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Deploy gate check (fail-closed) for a dataset. */
        get: operations["check_deploy_gate"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evaluate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evaluate an action for compliance
         * @description This endpoint evaluates an action against all enabled compliance modules
         *     and returns a decision with sealed evidence.
         *
         *     **Authentication**: Requires API key via `X-API-Key` header or `Authorization: Bearer <key>`
         *
         *     **Rate Limiting**: 60 requests per minute per API key
         *
         *     **Regulatory Purpose**:
         *     - GDPR Article 25: Data protection by design
         *     - AI Act Article 14: Human oversight
         *     - Multi-regulation evaluation (GDPR, AI Act, DORA, NIS2)
         */
        post: operations["evaluate_action"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/actors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create actor */
        post: operations["create_evidence_actor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/artifacts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create artifact */
        post: operations["create_evidence_artifact"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/clocks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create regulatory clock */
        post: operations["create_evidence_clock"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/compliance-query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Run compliance query */
        post: operations["run_compliance_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/controls": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create control */
        post: operations["create_evidence_control"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/debug/generate-test-events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Generate test evidence events for development */
        post: operations["generate_test_evidence_events"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/debug/recent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Debug endpoint to check evidence without company_id filtering */
        get: operations["get_recent_evidence_debug"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create evidence decision */
        post: operations["create_evidence_decision"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get evidence events */
        get: operations["get_evidence_events"];
        put?: never;
        /** Create evidence event */
        post: operations["create_evidence_event_route"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/generate-package": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Generate evidence package */
        post: operations["generate_evidence_package"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/integrity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Check integrity */
        get: operations["check_integrity"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/evidence/verify-integrity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify evidence chain integrity */
        post: operations["verify_evidence_integrity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/fria/assessments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List FRIA assessments */
        get: operations["list_fria_assessments"];
        put?: never;
        /** Create FRIA assessment */
        post: operations["create_fria_assessment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/fria/assessments/{assessment_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get FRIA assessment by ID */
        get: operations["get_fria_assessment"];
        /** Update FRIA assessment */
        put: operations["update_fria_assessment"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/fria/assessments/{assessment_id}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Approve assessment */
        post: operations["approve_assessment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/fria/assessments/{assessment_id}/risk-factors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Add risk factor to assessment */
        post: operations["add_risk_factor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/fria/assessments/{assessment_id}/submit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Submit assessment for review */
        post: operations["submit_assessment_for_review"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/fria/auto-trigger": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Auto-trigger FRIA assessment */
        post: operations["auto_trigger_fria"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/fria/compliance-report": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get FRIA compliance report */
        get: operations["get_fria_compliance_report"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/fria/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get FRIA configuration */
        get: operations["get_fria_config"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_lenses"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/ai-act-art16": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ai_act_art16_provider_obligations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/ai-act-art17": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ai_act_art17_quality_management"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/ai-act-art26": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ai_act_art26_deployer_obligations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/ai-act-art5": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ai_act_art5_prohibited_practices"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/ai-act-performance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ai_act_performance"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/ai-act-transparency": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ai_act_transparency"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/audit-evidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["audit_evidence"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/dora-assets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["dora_assets"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/dora-tprm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["dora_tprm"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/gdpr-consent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["gdpr_consent"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/gdpr-rights": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["gdpr_rights"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/gdpr-rights/erasure/execute": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** GDPR Rights Crypto-Shred Execution */
        post: operations["gdpr_rights_erasure_execute"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/gdpr-rights/export/compliance-report": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** GDPR Rights Export Compliance Report (PDF) */
        get: operations["gdpr_rights_export_compliance_report"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/gdpr-rights/export/erasure-certificates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** GDPR Rights Export Erasure Certificates */
        get: operations["gdpr_rights_export_erasure_certificates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/gdpr-rights/export/requests-csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** GDPR Rights Export All Requests (CSV) */
        get: operations["gdpr_rights_export_requests_csv"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/gdpr-rights/export/sla-performance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** GDPR Rights Export SLA Performance Report */
        get: operations["gdpr_rights_export_sla_performance"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/gdpr-rights/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** GDPR Rights Overview Data */
        get: operations["gdpr_rights_overview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/gdpr-rights/recent-activity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** GDPR Rights Recent Activity */
        get: operations["gdpr_rights_recent_activity"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/gdpr-rights/requires-attention": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** GDPR Rights Requires Attention */
        get: operations["gdpr_rights_requires_attention"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/risk-overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["risk_overview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/sovereign-shield": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["sovereign_shield"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/sovereign-shield/countries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** GET /api/v1/lenses/sovereign-shield/countries - Get Sovereign Shield country compliance data */
        get: operations["sovereign_shield_countries"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/sovereign-shield/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** GET /api/v1/lenses/sovereign-shield/stats - Get Sovereign Shield transfer statistics */
        get: operations["sovereign_shield_stats"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/sovereign-shield/transfers/by-destination": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** GET /api/v1/lenses/sovereign-shield/transfers/by-destination - Get transfer data by destination country */
        get: operations["sovereign_shield_transfers_by_destination"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Real-time Lens stream (SSE).
         * @description Emits `LensFinding` as JSON events (Lens output DTO; read-only aggregation).
         */
        get: operations["stream_enforcement_decisions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/unified-incidents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["unified_incidents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/lenses/{lens_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_lens"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/modules/gdpr-article-13-14/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get transparency configuration for a company */
        get: operations["get_transparency_config"];
        /** Create or update transparency configuration for a company */
        put: operations["upsert_transparency_config"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/modules/gdpr-article-13-14/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get transparency injection metrics for a company */
        get: operations["get_transparency_metrics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/audit-integrity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List recent audit-log integrity reports. */
        get: operations["list_audit_integrity_reports"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/audit-integrity/latest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get latest audit-log integrity report. */
        get: operations["get_audit_integrity_latest"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/scc": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all SCC registries */
        get: operations["list_sccs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/scc/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register a new SCC agreement */
        post: operations["register_scc"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/scc/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Update an existing SCC agreement */
        put: operations["update_scc"];
        post?: never;
        /** Delete an SCC agreement */
        delete: operations["delete_scc"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/companies/{company_id}/modules/{module_name}/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get company module configuration */
        get: operations["get_company_module_config"];
        put?: never;
        /** Set company module configuration */
        post: operations["set_company_module_config"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/config/art5_patterns": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_art5_patterns"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/config/enforcement_labels": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_enforcement_labels"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/config/enforcement_matrix": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_enforcement_matrix"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/config/transfer_seed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_transfer_seed"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dora-lite/compliance-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get DORA Lite compliance status */
        get: operations["get_dora_lite_compliance_status"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dora-lite/incidents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get DORA Lite incidents */
        get: operations["get_dora_lite_incidents"];
        put?: never;
        /** Create a DORA Lite incident (Article 10 simplified) */
        post: operations["create_dora_lite_incident"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dora-lite/risks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get DORA Lite ICT Risk Register (Article 8) */
        get: operations["get_dora_lite_risks"];
        put?: never;
        /** Create DORA Lite ICT Risk (Article 8) */
        post: operations["create_dora_lite_risk"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dora-lite/sla-monitoring": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get DORA Lite SLA monitoring */
        get: operations["get_dora_lite_sla_monitoring"];
        put?: never;
        /** Create DORA Lite SLA monitoring (Article 11 simplified) */
        post: operations["create_dora_lite_sla_monitoring"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dora-lite/vendors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get DORA Lite vendors */
        get: operations["get_dora_lite_vendors"];
        put?: never;
        /** Create a DORA Lite vendor (Article 9 simplified) */
        post: operations["create_dora_lite_vendor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/modules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get all modules with their activation status
         * @description By default, only returns Veridion Nexus Lite suite modules (is_lite = true)
         *     Use ?all=true query parameter to get all modules
         */
        get: operations["list_modules"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/modules/by-regulation/{regulation}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get modules by regulation */
        get: operations["get_modules_by_regulation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/modules/gdpr-article-12/notices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all privacy notices for a company */
        get: operations["list_privacy_notices"];
        put?: never;
        /** Create a privacy notice */
        post: operations["create_privacy_notice"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/modules/gdpr-article-12/notices/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a privacy notice by ID */
        get: operations["get_privacy_notice"];
        /** Update a privacy notice */
        put: operations["update_privacy_notice"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/modules/gdpr-article-12/notices/{id}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Publish a privacy notice */
        post: operations["publish_privacy_notice"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/modules/gdpr-article-12/templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get privacy notice templates */
        get: operations["get_privacy_notice_templates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/modules/{name}/config-schema": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get module configuration schema */
        get: operations["get_module_config_schema"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/modules/{name}/disable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Disable a module */
        post: operations["disable_module"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/modules/{name}/enable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Enable a module */
        post: operations["enable_module"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/modules/{name}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Check if a module is enabled (public endpoint for SDKs) */
        get: operations["get_module_status"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wizard/calculate-price": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Calculate pricing based on selected modules and number of systems */
        post: operations["calculate_price"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wizard/company-profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create or update company profile */
        post: operations["create_company_profile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wizard/company-profile/{company_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get company profile by ID */
        get: operations["get_company_profile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wizard/export-certificate/{company_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Export Statement of Conformity certificate */
        get: operations["export_certificate"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wizard/recommend-modules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Get recommended modules based on company profile */
        post: operations["recommend_modules"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wizard/start-trial": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Start free trial (30 days in Shadow Mode) */
        post: operations["start_trial"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wizard/subscription/{company_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get current subscription for a company */
        get: operations["get_subscription"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wizard/upgrade": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upgrade from trial to paid subscription */
        post: operations["upgrade_subscription"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AiDecision: {
            /** Format: uuid */
            companyId: string;
            confidenceScore?: number | null;
            /** Format: date-time */
            createdAt: string;
            decisionId: string;
            decisionOutcome: string;
            decisionReasoning?: string | null;
            /** Format: date-time */
            decisionTimestamp: string;
            decisionType: string;
            humanReviewNotes?: string | null;
            humanReviewRequired: boolean;
            /** Format: date-time */
            humanReviewedAt?: string | null;
            humanReviewerId?: string | null;
            /** Format: uuid */
            id: string;
            legalEffect?: string | null;
            reviewDecision?: string | null;
            significantImpact: boolean;
            status: string;
            systemId?: string | null;
            /** Format: date-time */
            updatedAt: string;
            userId: string;
        };
        AiDecisionStats: {
            /** Format: double */
            averageConfidenceScore?: number | null;
            /** Format: int64 */
            highConfidenceDecisions: number;
            /** Format: int64 */
            humanReviewRequiredCount: number;
            /** Format: int64 */
            lowConfidenceDecisions: number;
            /** Format: int64 */
            pendingReview: number;
            /** Format: int64 */
            reviewed: number;
            /** Format: int64 */
            significantImpactCount: number;
            /** Format: int64 */
            totalDecisions: number;
            /** Format: int64 */
            underReview: number;
        };
        ApiKeyInfoResponse: {
            active: boolean;
            /** Format: uuid */
            company_id?: string | null;
            /** Format: date-time */
            created_at: string;
            description?: string | null;
            /** Format: date-time */
            expires_at?: string | null;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            last_used_at?: string | null;
            name: string;
            permissions: string[];
            /** Format: uuid */
            user_id?: string | null;
        };
        ApiKeysListResponse: {
            api_keys: components["schemas"]["ApiKeyInfoResponse"][];
            total_count: number;
        };
        /** @description Appeal Decision Request */
        AppealDecisionRequest: {
            /**
             * @description Reason for appeal (required)
             * @example I believe the decision was incorrect
             */
            appeal_reason: string;
            /**
             * @description Decision ID to appeal
             * @example DECISION-2024-01-15-ABC123
             */
            decision_id: string;
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        Art5Patterns: {
            categories: string[];
            checksum: string;
            human_review: string;
            updated_at: string;
            /** Format: int32 */
            version: number;
        };
        ArticleMetric: {
            article_reference: string;
            /** Format: int64 */
            count: number;
        };
        /** @description Assign Retention Policy Request */
        AssignRetentionRequest: {
            /**
             * @description Policy name to assign
             * @example GDPR_COMPLIANCE_RECORDS
             */
            policy_name: string;
            /**
             * @description Record ID (seal_id, consent_id, dpia_id, etc.)
             * @example SEAL-2024-01-15-ABC123
             */
            record_id: string;
            /**
             * @description Record type: COMPLIANCE_RECORD, CONSENT_RECORD, DPIA, etc.
             * @example COMPLIANCE_RECORD
             */
            record_type: string;
        };
        /** @description Automated Decision Response */
        AutomatedDecisionResponse: {
            /**
             * @description Action type that triggered the decision
             * @example credit_scoring
             */
            action_type: string;
            /**
             * @description Decision ID for tracking
             * @example DECISION-2024-01-15-ABC123
             */
            decision_id: string;
            /**
             * @description Decision outcome: APPROVED, REJECTED, PENDING, CONDITIONAL
             * @example REJECTED
             */
            decision_outcome: string;
            /**
             * @description Explanation of the decision
             * @example Credit score below threshold
             */
            decision_reasoning?: string | null;
            /**
             * @description When decision was made
             * @example 2024-01-15 14:30:00
             */
            decision_timestamp: string;
            /**
             * @description Whether human review is required
             * @example true
             */
            human_review_required: boolean;
            /**
             * @description Legal effect of the decision
             * @example Loan application denied
             */
            legal_effect?: string | null;
            /**
             * @description Seal ID of the compliance record
             * @example SEAL-2024-01-15-ABC123
             */
            seal_id: string;
            /**
             * @description Whether decision significantly affects the individual
             * @example true
             */
            significant_impact: boolean;
            /**
             * @description Status: PENDING_REVIEW, UNDER_REVIEW, REVIEWED, APPEALED, OVERRIDDEN
             * @example PENDING_REVIEW
             */
            status: string;
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        /** @description Get Automated Decisions Response */
        AutomatedDecisionsResponse: {
            /** @description List of all automated decisions */
            decisions: components["schemas"]["AutomatedDecisionResponse"][];
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        CalculatePriceRequest: {
            /** Format: int32 */
            num_systems: number;
            selected_modules: string[];
        };
        CompanyProfileResponse: {
            ai_use_cases: string[];
            company_name: string;
            company_size: string;
            country: string;
            deployment_preference: string;
            /** Format: int32 */
            estimated_ai_systems: number;
            /** Format: uuid */
            id: string;
            industry: string;
            regulatory_requirements: string[];
            status?: string | null;
            wizard_completed: boolean;
        };
        /** @description Consent Request (GDPR Article 7) */
        ConsentRequest: {
            /**
             * @description Consent method: EXPLICIT, IMPLICIT, OPT_IN, OPT_OUT
             * @example EXPLICIT
             */
            consent_method?: string | null;
            /**
             * @description Consent text shown to user
             * @example I consent to processing of my data for AI purposes
             */
            consent_text?: string | null;
            /**
             * @description Type of consent: PROCESSING, STORAGE, TRANSFER, MARKETING
             * @example PROCESSING
             */
            consent_type: string;
            /**
             * @description Expiration date (optional)
             * @example 2025-12-31 23:59:59
             */
            expires_at?: string | null;
            /**
             * @description IP address (for audit)
             * @example 192.168.1.1
             */
            ip_address?: string | null;
            /**
             * @description Legal basis: CONSENT, CONTRACT, LEGAL_OBLIGATION, VITAL_INTERESTS, PUBLIC_TASK, LEGITIMATE_INTERESTS
             * @example CONSENT
             */
            legal_basis: string;
            /**
             * @description Purpose of processing
             * @example AI model training and inference
             */
            purpose: string;
            /**
             * @description User agent (for audit)
             * @example Mozilla/5.0...
             */
            user_agent?: string | null;
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        /** @description Consent Response */
        ConsentResponse: {
            /**
             * @description Consent record ID
             * @example 550e8400-e29b-41d4-a716-446655440000
             */
            consent_id: string;
            /**
             * @description Consent type
             * @example PROCESSING
             */
            consent_type: string;
            /**
             * @description When consent expires
             * @example 2025-12-31 23:59:59
             */
            expires_at?: string | null;
            /**
             * @description Whether consent is granted
             * @example true
             */
            granted: boolean;
            /**
             * @description When consent was granted
             * @example 2024-01-15 14:30:00
             */
            granted_at?: string | null;
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
            /**
             * Format: int32
             * @description Version of consent text
             * @example 1
             */
            version: number;
        };
        CreateApiKeyRequest: {
            /** Format: uuid */
            company_id?: string | null;
            description?: string | null;
            /** Format: date-time */
            expires_at?: string | null;
            name: string;
            permissions: string[];
        };
        CreateApiKeyResponse: {
            api_key: string;
            key_info: components["schemas"]["ApiKeyInfoResponse"];
            message: string;
        };
        CreateDORALiteIncidentRequest: {
            description: string;
            impact_description?: string | null;
            incident_type: string;
            mitigation_steps?: string | null;
            severity: string;
        };
        CreateDORALiteRiskRequest: {
            category: string;
            impact_level: string;
            mitigation_strategy?: string | null;
            risk_name: string;
            status?: string | null;
        };
        CreateDORALiteSLARequest: {
            /** Format: double */
            actual_performance?: number | null;
            impact_on_critical_function?: boolean | null;
            /** Format: date-time */
            monitoring_period_end: string;
            /** Format: date-time */
            monitoring_period_start: string;
            monitoring_source?: string | null;
            monthly_report_url?: string | null;
            notes?: string | null;
            service_name: string;
            service_type: string;
            sla_metric?: string | null;
            /** Format: double */
            sla_target_uptime: number;
            /** Format: uuid */
            vendor_id?: string | null;
        };
        CreateDORALiteVendorRequest: {
            contact_email?: string | null;
            country_code?: string | null;
            notes?: string | null;
            risk_level?: string | null;
            service_description?: string | null;
            /** Format: double */
            sla_uptime_percentage?: number | null;
            vendor_name: string;
            vendor_type: string;
        };
        DORALiteComplianceStatus: {
            article10Compliant: boolean;
            article11Compliant: boolean;
            article8Compliant: boolean;
            article9Compliant: boolean;
            /** Format: double */
            complianceScore: number;
            /** Format: int64 */
            incidentCount: number;
            /** Format: date-time */
            lastUpdated: string;
            recommendations: string[];
            /** Format: int64 */
            riskCount: number;
            /** Format: int64 */
            slaCount: number;
            /** Format: int64 */
            vendorCount: number;
        };
        DORALiteIncident: {
            /** Format: date-time */
            createdAt: string;
            description: string;
            /** Format: date-time */
            detectedAt: string;
            /** Format: uuid */
            id: string;
            impactDescription?: string | null;
            incidentType: string;
            mitigationSteps?: string | null;
            /** Format: date-time */
            reportedAt?: string | null;
            reportedToAuthority: boolean;
            /** Format: date-time */
            resolvedAt?: string | null;
            severity: string;
            status: string;
            /** Format: date-time */
            updatedAt: string;
        };
        DORALiteIncidentList: {
            incidents: components["schemas"]["DORALiteIncident"][];
            /** Format: int64 */
            open_incidents: number;
            /** Format: int64 */
            resolved_incidents: number;
            /** Format: int64 */
            total: number;
        };
        DORALiteRisk: {
            category: string;
            /** Format: uuid */
            companyId: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: uuid */
            id: string;
            impactLevel: string;
            mitigationStrategy?: string | null;
            riskName: string;
            status: string;
            /** Format: date-time */
            updatedAt: string;
        };
        DORALiteSLAMonitoring: {
            /** Format: double */
            actualPerformance?: number | null;
            actualUptime?: number | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: int32 */
            downtimeMinutes: number;
            /** Format: uuid */
            id: string;
            impactOnCriticalFunction: boolean;
            /** Format: int32 */
            incidentsCount: number;
            /** Format: date-time */
            monitoringPeriodEnd: string;
            /** Format: date-time */
            monitoringPeriodStart: string;
            monitoringSource?: string | null;
            monthlyReportUrl?: string | null;
            notes?: string | null;
            serviceName: string;
            serviceType: string;
            slaMet: boolean;
            slaMetric?: string | null;
            slaTargetUptime: number;
            /** Format: date-time */
            updatedAt: string;
            /** Format: uuid */
            vendorId?: string | null;
            vendorName?: string | null;
        };
        DORALiteVendor: {
            contactEmail?: string | null;
            countryCode?: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            lastReviewedAt?: string | null;
            notes?: string | null;
            riskLevel: string;
            serviceDescription?: string | null;
            slaUptimePercentage?: number | null;
            /** Format: date-time */
            updatedAt: string;
            vendorName: string;
            vendorType: string;
        };
        /** @description Data Breach Report (GDPR Article 33-34) */
        DataBreachReport: {
            /**
             * Format: int32
             * @description Estimated number of affected records
             * @example 42
             */
            affected_records_count?: number | null;
            /**
             * @description Affected user IDs
             * @example ["user-123", "user-456"]
             */
            affected_users: string[];
            /**
             * @description Type of breach
             * @example UNAUTHORIZED_ACCESS
             */
            breach_type: string;
            /**
             * @description Description of the breach
             * @example Unauthorized access detected
             */
            description: string;
            /**
             * @description Timestamp when breach was detected
             * @example 2024-01-15 14:30:00
             */
            detected_at: string;
        };
        /** @description Data Breach Response */
        DataBreachResponse: {
            /**
             * @description Timestamp when reported to authority
             * @example 2024-01-15 14:35:00
             */
            authority_notified_at?: string | null;
            /**
             * @description Breach ID for tracking
             * @example BREACH-2024-01-15-001
             */
            breach_id: string;
            /**
             * @description Notification status
             * @example REPORTED
             */
            status: string;
            /**
             * @description Timestamp when users were notified
             * @example 2024-01-15 14:40:00
             */
            users_notified_at?: string | null;
        };
        /** @description Data Subject Access Request (GDPR Article 15) */
        DataSubjectAccessRequest: {
            /**
             * @description User ID requesting access
             * @example user-123
             */
            user_id: string;
        };
        /** @description Data Subject Access Response */
        DataSubjectAccessResponse: {
            /**
             * @description Timestamp of export
             * @example 2024-01-15 14:30:00
             */
            exported_at: string;
            /**
             * @description Export format: JSON
             * @example json
             */
            format: string;
            /** @description All records associated with the user */
            records: components["schemas"]["DataSubjectRecord"][];
        };
        /** @description Individual record in data subject export */
        DataSubjectRecord: {
            action_summary: string;
            risk_level?: string | null;
            seal_id: string;
            status: string;
            timestamp: string;
        };
        /** @description Data Subject Rectification Request (GDPR Article 16) */
        DataSubjectRectificationRequest: {
            /**
             * @description Corrected data
             * @example Corrected action description
             */
            corrected_data: string;
            /**
             * @description Seal ID of record to rectify
             * @example SEAL-2024-01-15-ABC123
             */
            seal_id: string;
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        /** @description DPIA Request (Data Protection Impact Assessment) */
        DpiaRequest: {
            /**
             * @description Activity name
             * @example AI Credit Scoring System
             */
            activity_name: string;
            /**
             * @description Date of approval/sign-off (YYYY-MM-DD format) - deprecated, use dpo_approved_at
             * @example 2024-12-17
             */
            approval_date?: string | null;
            /**
             * @description Created by (user ID or system)
             * @example dpia-manager-001
             */
            created_by: string;
            /**
             * @description Categories of personal data processed
             * @example ["Financial data", "Credit history", "Employment data"]
             */
            data_categories: string[];
            /**
             * @description Categories of data subjects
             * @example ["Loan applicants", "Existing customers"]
             */
            data_subject_categories: string[];
            /**
             * @description Description of processing activity
             * @example Automated credit scoring using machine learning
             */
            description: string;
            /**
             * @description Date of approval/sign-off (ISO 8601 format string, e.g., "2024-12-17T10:30:00Z")
             * @example 2024-12-17T10:30:00Z
             */
            dpo_approved_at?: string | null;
            /**
             * @description DPO / Representative full name (for sign-off)
             * @example John Doe
             */
            dpo_name?: string | null;
            /**
             * @description DPO / Representative role/title
             * @example Data Protection Officer
             */
            dpo_role?: string | null;
            /**
             * @description Identified risks
             * @example ["Discrimination risk", "Data breach risk", "Incorrect scoring"]
             */
            identified_risks: string[];
            /**
             * @description Whether the DPIA is signed off (legal declaration accepted)
             * @example true
             */
            is_signed_off?: boolean | null;
            /**
             * @description Legal basis for processing
             * @example LEGITIMATE_INTERESTS
             */
            legal_basis: string;
            /**
             * @description Legal declaration acceptance (must be true to commit) - deprecated, use is_signed_off
             * @example true
             */
            legal_declaration_accepted?: boolean | null;
            /**
             * @description Proposed mitigation measures
             * @example ["Bias testing", "Encryption", "Human oversight"]
             */
            mitigation_measures: string[];
            /**
             * @description Purposes of processing
             * @example ["Credit assessment", "Risk evaluation"]
             */
            processing_purposes: string[];
            /**
             * @description Initial risk level assessment
             * @example HIGH
             */
            risk_level: string;
        };
        /** @description DPIA Response */
        DpiaResponse: {
            /** @description Activity name */
            activity_name: string;
            /**
             * @description Whether consultation is required
             * @example true
             */
            consultation_required: boolean;
            /**
             * @description Created at
             * @example 2024-01-15 14:30:00
             */
            created_at: string;
            /**
             * @description DPIA ID
             * @example DPIA-2024-001
             */
            dpia_id: string;
            /**
             * @description Date of approval/sign-off (YYYY-MM-DD format)
             * @example 2024-12-17
             */
            dpo_approved_at?: string | null;
            /**
             * @description DPO / Representative full name (for sign-off)
             * @example John Doe
             */
            dpo_name?: string | null;
            /**
             * @description DPO / Representative role/title
             * @example Data Protection Officer
             */
            dpo_role?: string | null;
            /**
             * @description Legal declaration acceptance (must be true to commit)
             * @example true
             */
            is_signed_off?: boolean | null;
            /**
             * @description Risk level
             * @example HIGH
             */
            risk_level: string;
            /**
             * @description Status
             * @example DRAFT
             */
            status: string;
        };
        /** @description Get All DPIAs Response */
        DpiasResponse: {
            /** @description List of all DPIAs */
            dpias: components["schemas"]["DpiaResponse"][];
        };
        EnableModuleRequest: {
            notes?: string | null;
        };
        EnforcementRule: {
            article: string;
            default_action_on_timeout: string;
            fallback_on_miss: string;
            /** Format: int32 */
            human_sla_hours?: number | null;
            level: string;
            name: string;
            notes?: string | null;
            regulation: string;
        };
        /** @description Evaluate request (matches EvaluateRequest but with OpenAPI annotations) */
        EvaluateApiRequest: {
            /**
             * @description Action being performed (e.g., "data_transfer", "ai_inference")
             * @example data_transfer
             */
            action: string;
            /**
             * @description Agent ID performing the action
             * @example agent-001
             */
            agentId: string;
            /** Format: uuid */
            companyId?: string | null;
            /**
             * @description Context containing regulatory-relevant data
             *     Expected fields: data_categories, destination, data_subjects, legal_basis, sector, etc.
             */
            context: unknown;
        };
        /** @description Evaluate response (matches EvaluateResponse) */
        EvaluateApiResponse: {
            /** @description Correlation ID for tracing this evaluation */
            correlationId: string;
            /** @description Final aggregated decision (strictest-wins) */
            decision: string;
            /** @description Evidence event ID (sealed in Evidence Graph) */
            evidenceId: string;
            /** @description Enforcement mode: "enforce" or "shadow" */
            mode: string;
            /** @description Results from all evaluated modules */
            modules: components["schemas"]["ModuleResultApi"][];
            /** Format: date-time */
            timestamp: string;
        };
        /** @description Human Oversight Request (EU AI Act Article 14) */
        HumanOversightRequest: {
            /**
             * @description Reason for requiring human oversight
             * @example High-risk financial decision
             */
            reason?: string | null;
            /**
             * @description Seal ID of the action requiring oversight
             * @example SEAL-2024-01-15-ABC123
             */
            seal_id: string;
        };
        /** @description Human Oversight Response */
        HumanOversightResponse: {
            /**
             * @description Comments from reviewer
             * @example Approved after risk review
             */
            comments?: string | null;
            /**
             * @description Timestamp of decision
             * @example 2024-01-15 14:35:00
             */
            decided_at: string;
            /**
             * @description Human reviewer ID
             * @example reviewer-001
             */
            reviewer_id?: string | null;
            /**
             * @description Approval status: APPROVED, REJECTED, PENDING
             * @example APPROVED
             */
            status: string;
        };
        InjectionTypeMetric: {
            /** Format: int64 */
            count: number;
            injection_type: string;
            /** Format: int64 */
            success_count: number;
            /** Format: double */
            success_rate: number;
        };
        /** @description Lift Restriction Request */
        LiftRestrictionRequest: {
            /**
             * @description Lifted by (user ID or system identifier)
             * @example admin-001
             */
            lifted_by?: string | null;
            /**
             * @description Reason for lifting restriction (optional)
             * @example Data accuracy confirmed
             */
            reason?: string | null;
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        LoginRequest: {
            password: string;
            username: string;
        };
        LoginResponse: {
            token: string;
            user: components["schemas"]["UserResponse"];
        };
        ModuleInfo: {
            category: string;
            description?: string | null;
            display_category?: string | null;
            display_name: string;
            enabled: boolean;
            /** Format: uuid */
            id: string;
            name: string;
            requires_license: boolean;
        };
        ModuleRecommendationResponse: {
            core_modules: components["schemas"]["RecommendedModule"][];
            /** Format: int32 */
            optional_count: number;
            /** Format: int32 */
            recommended_count: number;
            recommended_modules: components["schemas"]["RecommendedModule"][];
            /** Format: int32 */
            required_count: number;
        };
        ModuleResponse: {
            message: string;
            status: string;
        };
        ModuleResultApi: {
            articles: string[];
            decision: string;
            moduleName: string;
            reason: string;
            regulation: string;
            severity: string;
        };
        ModulesListResponse: {
            modules: components["schemas"]["ModuleInfo"][];
        };
        /** @description Get Objections Response */
        ObjectionsResponse: {
            /** @description List of all objections (active and historical) */
            objections: components["schemas"]["ProcessingObjectionResponse"][];
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        PendingDecisionsResponse: {
            decisions: components["schemas"]["AiDecision"][];
            /** Format: int64 */
            total: number;
        };
        PricingBreakdown: {
            /** Format: double */
            base_price: number;
            module_prices: {
                [key: string]: number;
            };
            /** Format: double */
            per_system_price: number;
            /** Format: double */
            savings_annual: number;
            /** Format: double */
            total_annual: number;
            /** Format: double */
            total_monthly: number;
        };
        PrivacyNoticeResponse: {
            /** Format: uuid */
            company_id: string;
            content: string;
            /** Format: date-time */
            created_at: string;
            /** Format: uuid */
            id: string;
            language_code: string;
            notice_type: string;
            /** Format: date-time */
            published_at?: string | null;
            status: string;
            /** Format: date-time */
            updated_at: string;
            /** Format: int32 */
            version: number;
        };
        PrivacyNoticesListResponse: {
            notices: components["schemas"]["PrivacyNoticeResponse"][];
        };
        /** @description Processing Objection Request (GDPR Article 21) */
        ProcessingObjectionRequest: {
            /**
             * @description Legal basis being objected to (e.g., "LEGITIMATE_INTERESTS", "PUBLIC_TASK")
             * @example LEGITIMATE_INTERESTS
             */
            legal_basis?: string | null;
            /**
             * @description Specific actions to object (for PARTIAL or SPECIFIC_ACTION type)
             * @example ["credit_scoring", "automated_decision"]
             */
            objected_actions?: string[] | null;
            /**
             * @description Type of objection: FULL, PARTIAL, SPECIFIC_ACTION, DIRECT_MARKETING, PROFILING
             * @example PARTIAL
             */
            objection_type: string;
            /**
             * @description Reason for objection (optional)
             * @example User objects to processing based on legitimate interests
             */
            reason?: string | null;
            /**
             * @description User ID objecting to processing
             * @example user-123
             */
            user_id: string;
        };
        /** @description Processing Objection Response */
        ProcessingObjectionResponse: {
            /**
             * @description Objection ID for tracking
             * @example OBJECT-2024-01-15-ABC123
             */
            objection_id: string;
            /**
             * @description Objection type
             * @example PARTIAL
             */
            objection_type: string;
            /**
             * @description Rejection reason (if rejected)
             * @example Processing necessary for legal obligations
             */
            rejection_reason?: string | null;
            /**
             * @description When objection was requested
             * @example 2024-01-15 14:30:00
             */
            requested_at: string;
            /**
             * @description Status: ACTIVE, WITHDRAWN, REJECTED, RESOLVED
             * @example ACTIVE
             */
            status: string;
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        /** @description Processing Restriction Request (GDPR Article 18) */
        ProcessingRestrictionRequest: {
            /**
             * @description Optional expiration date
             * @example 2025-12-31 23:59:59
             */
            expires_at?: string | null;
            /**
             * @description Reason for restriction (optional)
             * @example Disputing accuracy of data
             */
            reason?: string | null;
            /**
             * @description Specific actions to restrict (for PARTIAL or SPECIFIC_ACTION type)
             * @example ["credit_scoring", "automated_decision"]
             */
            restricted_actions?: string[] | null;
            /**
             * @description Type of restriction: FULL, PARTIAL, SPECIFIC_ACTION
             * @example PARTIAL
             */
            restriction_type: string;
            /**
             * @description User ID requesting restriction
             * @example user-123
             */
            user_id: string;
        };
        /** @description Processing Restriction Response */
        ProcessingRestrictionResponse: {
            /**
             * @description When restriction expires (if applicable)
             * @example 2025-12-31 23:59:59
             */
            expires_at?: string | null;
            /**
             * @description When restriction was requested
             * @example 2024-01-15 14:30:00
             */
            requested_at: string;
            /**
             * @description Restriction ID for tracking
             * @example RESTRICT-2024-01-15-ABC123
             */
            restriction_id: string;
            /**
             * @description Restriction type
             * @example PARTIAL
             */
            restriction_type: string;
            /**
             * @description Status: ACTIVE, LIFTED, EXPIRED
             * @example ACTIVE
             */
            status: string;
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        /** @description Proxy request configuration */
        ProxyRequest: {
            /** @description Request body (legacy field name) */
            body?: unknown;
            /** @description Request headers */
            headers?: unknown;
            /**
             * @description HTTP method
             * @example POST
             */
            method?: string;
            /** @description Request payload (JSON object to be sanitized for GDPR compliance) */
            payload?: unknown;
            /**
             * @description Target URL to proxy to
             * @example https://api.openai.com/v1/chat/completions
             */
            target_url: string;
        };
        RecentInjection: {
            article_reference?: string | null;
            injection_success: boolean;
            injection_type: string;
            interaction_id: string;
            /** Format: date-time */
            interaction_timestamp: string;
        };
        RecommendModulesRequest: {
            ai_exposure?: string | null;
            ai_use_cases: string[];
            data_footprint?: string | null;
            industry: string;
            regulatory_requirements: string[];
            target_countries?: string[];
        };
        RecommendedModule: {
            category: string;
            description?: string | null;
            display_name: string;
            module_name: string;
            priority: string;
            recommendation_reason: string;
            requires_license: boolean;
        };
        RegisterRequest: {
            /** Format: uuid */
            company_id?: string | null;
            email: string;
            full_name?: string | null;
            password: string;
            username: string;
        };
        RegisterResponse: {
            message: string;
            user: components["schemas"]["UserResponse"];
        };
        /** @description Reject Objection Request (GDPR Article 21(1) - must provide reason) */
        RejectObjectionRequest: {
            /**
             * @description Rejected by (user ID or system identifier)
             * @example admin-001
             */
            rejected_by?: string | null;
            /**
             * @description Reason for rejection (REQUIRED per GDPR Article 21(1))
             * @example Processing is necessary for the performance of a task carried out in the public interest
             */
            rejection_reason: string;
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        /** @description Request Human Review Request (GDPR Article 22) */
        RequestReviewRequest: {
            /**
             * @description Decision ID to review
             * @example DECISION-2024-01-15-ABC123
             */
            decision_id?: string | null;
            /**
             * @description Reason for requesting review (optional)
             * @example User disputes the automated decision
             */
            reason?: string | null;
            /**
             * @description Seal ID to review (alternative to decision_id)
             * @example SEAL-2024-01-15-ABC123
             */
            seal_id?: string | null;
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        /** @description Request Review Response */
        RequestReviewResponse: {
            /**
             * @description Decision ID
             * @example DECISION-2024-01-15-ABC123
             */
            decision_id: string;
            /**
             * @description Message
             * @example Review requested successfully
             */
            message: string;
            /**
             * @description Status after review request
             * @example UNDER_REVIEW
             */
            status: string;
        };
        /** @description Get Restrictions Response */
        RestrictionsResponse: {
            /** @description List of all restrictions (active and historical) */
            restrictions: components["schemas"]["ProcessingRestrictionResponse"][];
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        /** @description Get All Retention Policies Response */
        RetentionPoliciesResponse: {
            /** @description List of all retention policies */
            policies: components["schemas"]["RetentionPolicyResponse"][];
        };
        /** @description Retention Policy Request */
        RetentionPolicyRequest: {
            /**
             * @description Whether to automatically delete after expiration
             * @example true
             */
            auto_delete?: boolean | null;
            /**
             * @description Data category
             * @example PERSONAL_DATA
             */
            data_category: string;
            /**
             * @description Description
             * @example Personal data retention policy
             */
            description?: string | null;
            /**
             * @description Legal basis for retention
             * @example GDPR Article 5(1)(e) - Storage Limitation
             */
            legal_basis: string;
            /**
             * Format: int32
             * @description Days before expiration to send notification
             * @example 30
             */
            notification_days_before?: number | null;
            /**
             * @description Policy name
             * @example GDPR_PERSONAL_DATA
             */
            policy_name: string;
            /**
             * Format: int32
             * @description Retention period in days
             * @example 1095
             */
            retention_period_days: number;
        };
        /** @description Retention Policy Response */
        RetentionPolicyResponse: {
            /** @description Auto delete enabled */
            auto_delete: boolean;
            /** @description Created at */
            created_at: string;
            /** @description Data category */
            data_category: string;
            /** @description Policy ID */
            policy_id: string;
            /** @description Policy name */
            policy_name: string;
            /**
             * Format: int32
             * @description Retention period in days
             */
            retention_period_days: number;
        };
        /** @description Retention Status Response */
        RetentionStatusResponse: {
            /**
             * Format: int64
             * @description Days until expiration
             */
            days_until_expiration: number;
            /** @description Deletion status */
            deletion_status: string;
            /** @description Expires at */
            expires_at: string;
            /** @description Policy name */
            policy_name: string;
            /** @description Record ID */
            record_id: string;
            /** @description Record type */
            record_type: string;
        };
        /** @description Risk Assessment for EU AI Act Article 9 or DORA Article 8 */
        RiskAssessment: {
            /**
             * @description Timestamp of assessment
             * @example 2024-01-15 14:30:00
             */
            assessed_at: string;
            /** @description Optional stored assessment document (baseline / audit) */
            document_content?: string | null;
            /** @description Optional signed/hashed document fingerprint for the assessment (baseline / audit) */
            document_hash?: string | null;
            /**
             * @description Mitigation actions taken (aggregated list)
             * @example ["Sovereign lock enabled", "Human oversight required"]
             */
            mitigation_actions: string[];
            /**
             * @description Regulatory framework context: AI_ACT (EU AI Act Article 9) or DORA (DORA Article 8)
             * @example AI_ACT
             */
            regulatory_framework: string;
            /** @description List of identified risk items with detailed scoring */
            risk_factors: string[];
            /**
             * @description Risk level: LOW, MEDIUM, HIGH
             * @example MEDIUM
             */
            risk_level: string;
        };
        RiskMatrixData: {
            vendors: components["schemas"]["RiskMatrixVendor"][];
        };
        RiskMatrixVendor: {
            blocked: boolean;
            criticality: string;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            last_assessment: string;
            name: string;
            risk_level: string;
            /** Format: double */
            risk_score: number;
            vendor_type: string;
        };
        /** @description Simulation request */
        SimulationRequest: {
            agent_filter?: string[] | null;
            business_function_filter?: string[] | null;
            location_filter?: string[] | null;
            policy_config: unknown;
            policy_type: string;
            /** Format: int64 */
            time_offset_days?: number | null;
            /** Format: int64 */
            time_range_days?: number | null;
        };
        /** @description Simulation result showing impact */
        SimulationResult: {
            affected_agents: string[];
            affected_endpoints: {
                [key: string]: number;
            };
            critical_agents: string[];
            estimated_impact: string;
            partial_impact_agents: string[];
            policy_type: string;
            requests_by_business_function?: {
                [key: string]: number;
            } | null;
            requests_by_country: {
                [key: string]: number;
            };
            requests_by_location?: {
                [key: string]: number;
            } | null;
            /** Format: date-time */
            simulation_timestamp: string;
            /** Format: int64 */
            total_requests: number;
            /** Format: int64 */
            would_allow: number;
            /** Format: int64 */
            would_block: number;
        };
        SubscriptionResponse: {
            /** Format: double */
            annual_price?: number | null;
            /** Format: uuid */
            company_id: string;
            /** Format: int32 */
            days_remaining?: number | null;
            /** Format: uuid */
            id: string;
            /** Format: double */
            monthly_price?: number | null;
            status: string;
            subscription_type: string;
            trial_end_date?: string | null;
            trial_start_date?: string | null;
        };
        TransferDatasetsSeed: {
            adequacy_decisions: string[];
            transfer_derogations: string[];
            transfer_mechanisms: string[];
        };
        /** @description Request to create/update transparency configuration */
        TransparencyConfigRequest: {
            automated_decision_info?: string | null;
            controller_address?: string | null;
            controller_email?: string | null;
            controller_name?: string | null;
            custom_disclosure_text?: string | null;
            dpo_email?: string | null;
            dpo_name?: string | null;
            dpo_phone?: string | null;
            injection_enabled?: boolean;
            injection_format?: string;
            legal_basis?: string | null;
            legal_basis_description?: string | null;
            logic_explanation?: string | null;
            privacy_policy_url?: string | null;
            processing_purposes?: string[];
            recipients_categories?: string[];
            retention_period?: string | null;
            rights_info_url?: string | null;
            significance_consequences?: string | null;
            supported_languages?: string[];
            third_country_transfers?: boolean;
            transfer_safeguards?: string | null;
        };
        /** @description Transparency configuration response */
        TransparencyConfigResponse: {
            automated_decision_info?: string | null;
            /** Format: uuid */
            company_id: string;
            compliance_status: string;
            controller_address?: string | null;
            controller_email?: string | null;
            controller_name?: string | null;
            /** Format: date-time */
            created_at: string;
            custom_disclosure_text?: string | null;
            dpo_email?: string | null;
            dpo_name?: string | null;
            dpo_phone?: string | null;
            /** Format: uuid */
            id: string;
            injection_enabled: boolean;
            injection_format: string;
            legal_basis?: string | null;
            legal_basis_description?: string | null;
            logic_explanation?: string | null;
            privacy_policy_url?: string | null;
            processing_purposes: string[];
            recipients_categories: string[];
            retention_period?: string | null;
            rights_info_url?: string | null;
            significance_consequences?: string | null;
            supported_languages: string[];
            third_country_transfers: boolean;
            transfer_safeguards?: string | null;
            /** Format: date-time */
            updated_at: string;
        };
        TransparencyDashboardResponse: {
            decisionStats: components["schemas"]["AiDecisionStats"];
            transparencyStats: components["schemas"]["TransparencyStats"];
        };
        TransparencyLogSummary: {
            errorMessage?: string | null;
            injectionType: string;
            /** Format: date-time */
            interactionTimestamp: string;
            systemId: string;
        };
        /** @description Transparency injection metrics response */
        TransparencyMetricsResponse: {
            by_article: components["schemas"]["ArticleMetric"][];
            by_injection_type: components["schemas"]["InjectionTypeMetric"][];
            /** Format: int64 */
            failed_injections: number;
            recent_injections: components["schemas"]["RecentInjection"][];
            /** Format: double */
            success_rate: number;
            /** Format: int64 */
            successful_injections: number;
            /** Format: int64 */
            total_injections: number;
        };
        TransparencyStats: {
            /** Format: int64 */
            contactInfoInjections: number;
            /** Format: int64 */
            disclosureInjections: number;
            /** Format: int64 */
            failedInjections: number;
            /** Format: int64 */
            purposeInjections: number;
            recentFailures: components["schemas"]["TransparencyLogSummary"][];
            /** Format: int64 */
            rightsInfoInjections: number;
            /** Format: double */
            successRate: number;
            /** Format: int64 */
            successfulInjections: number;
            /** Format: int64 */
            totalInteractions: number;
        };
        /** @description Update DPIA Request */
        UpdateDpiaRequest: {
            /**
             * @description Next review date
             * @example 2025-01-15 14:30:00
             */
            next_review_date?: string | null;
            /**
             * @description Residual risks after mitigation
             * @example ["Low residual discrimination risk"]
             */
            residual_risks?: string[] | null;
            /**
             * @description Review comments
             * @example DPIA approved after mitigation measures implemented
             */
            review_comments?: string | null;
            /**
             * @description Reviewed by
             * @example reviewer-001
             */
            reviewed_by?: string | null;
            /**
             * @description Risk level update
             * @example MEDIUM
             */
            risk_level?: string | null;
            /**
             * @description Status update
             * @example APPROVED
             */
            status?: string | null;
        };
        UpgradeRequest: {
            billing_cycle: string;
            /** Format: uuid */
            company_id: string;
            subscription_type: string;
        };
        /** @description Get User Consents Response */
        UserConsentsResponse: {
            /** @description List of all consents */
            consents: components["schemas"]["ConsentResponse"][];
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        UserResponse: {
            /** Format: uuid */
            company_id?: string | null;
            email: string;
            enforcement_override: boolean;
            full_name?: string | null;
            /** Format: uuid */
            id: string;
            onboarded: boolean;
            roles: string[];
            username: string;
        };
        /** @description Withdraw Consent Request */
        WithdrawConsentRequest: {
            /**
             * @description Consent type to withdraw
             * @example PROCESSING
             */
            consent_type?: string | null;
            /**
             * @description Reason for withdrawal (optional)
             * @example No longer needed
             */
            reason?: string | null;
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
        /** @description Withdraw Objection Request */
        WithdrawObjectionRequest: {
            /**
             * @description Reason for withdrawing objection (optional)
             * @example User no longer objects to processing
             */
            reason?: string | null;
            /**
             * @description User ID
             * @example user-123
             */
            user_id: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    reload_configs: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Configs reloaded from disk */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    list_derogations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List derogations */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
        };
    };
    create_derogation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Derogation created */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    list_mechanisms: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List mechanisms */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
        };
    };
    create_mechanism: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Mechanism created */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    get_consents: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consents retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden - Admin access required */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    grant_consent: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Consent granted successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_consent_stats: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consent statistics retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_user_consents: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description User ID */
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description User consents retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserConsentsResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    withdraw_consent: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WithdrawConsentRequest"];
            };
        };
        responses: {
            /** @description Consent withdrawn successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_tprm_dashboard: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description TPRM dashboard data */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_risk_monitoring_data: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Risk monitoring data */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_risk_matrix_data: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Risk matrix data */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RiskMatrixData"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_alerts: {
        parameters: {
            query?: {
                /** @description Filter by status (pending, acknowledged, resolved, false_positive) */
                status?: string | null;
                /** @description Filter by severity (low, medium, high, critical) */
                severity?: string | null;
                /** @description Maximum number of alerts to return (default: 50) */
                limit?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Alerts retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    acknowledge_alert: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Alert ID */
                alert_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Alert acknowledged successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Alert not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_ai_systems: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description AI systems retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    register_ai_system: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description AI system registered successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_ai_system: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description AI system ID */
                system_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description AI system retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description AI system not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_compliance_snapshot: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description AI system ID */
                system_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Compliance snapshot retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description AI system not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    submit_drift_detection: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description AI system ID */
                system_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Drift detection recorded successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description AI system not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    submit_performance_metrics: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description AI system ID */
                system_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Performance metrics recorded successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description AI system not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_performance_history: {
        parameters: {
            query?: {
                /** @description Number of days to look back (default: 30) */
                days?: number | null;
            };
            header?: never;
            path: {
                /** @description AI system ID */
                system_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Performance history retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description AI system not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    submit_robustness_test: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description AI system ID */
                system_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Robustness test recorded successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description AI system not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    report_security_event: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description AI system ID */
                system_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Security event recorded successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description AI system not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_recent_alerts: {
        parameters: {
            query: {
                /**
                 * @description Filter by status
                 * @example PENDING
                 */
                status: string;
                /**
                 * @description Maximum number of alerts to return
                 * @example 20
                 */
                limit: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Alerts retrieved */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_traffic_analytics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Traffic analytics retrieved */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    analyze_request: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Analysis completed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_categories_status: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Categories status retrieved */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_article5_config: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Configuration retrieved */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_dashboard_data: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Dashboard data retrieved */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_realtime_feed: {
        parameters: {
            query: {
                /**
                 * @description Maximum number of feed items to return
                 * @example 50
                 */
                limit: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Feed data retrieved */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    export_compliance_report: {
        parameters: {
            query: {
                /**
                 * @description Export format (json/pdf)
                 * @example pdf
                 */
                format: string;
                /**
                 * @description Report period (daily/weekly/monthly)
                 * @example monthly
                 */
                period: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Report exported */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_systems_inventory: {
        parameters: {
            query: {
                /**
                 * @description Filter by status
                 * @example ACTIVE
                 */
                status: string;
                /**
                 * @description Filter by risk level
                 * @example MEDIUM
                 */
                riskLevel: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Systems inventory retrieved */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    list_pending_decisions: {
        parameters: {
            query?: {
                /** @description Maximum number of decisions to return (default: 50) */
                limit?: number | null;
                /** @description Number of decisions to skip (default: 0) */
                offset?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of pending decisions */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PendingDecisionsResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_transparency_dashboard_stats: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Dashboard statistics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TransparencyDashboardResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    check_purpose_compliance: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Purpose compliance checked */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_compliance_report: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Compliance report generated */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_deployer_config: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Deployer configuration retrieved */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    submit_usage_record: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Usage record submitted successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    run_quality_check: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Quality check completed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_quality_config: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Quality configuration retrieved */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    validate_quality_system: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Quality system validation completed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    list_api_keys: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of API keys */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiKeysListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_api_key: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateApiKeyRequest"];
            };
        };
        responses: {
            /** @description API key created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateApiKeyResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_api_key: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description API key details */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiKeyInfoResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description API key not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    revoke_api_key: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description API key revoked */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description API key not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_dashboard_data_api_v1_article15_dashboard: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Dashboard data retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_alerts_api_v1_audit_alerts: {
        parameters: {
            query: {
                /**
                 * @description Maximum number of alerts to return
                 * @example 50
                 */
                limit: string;
                /**
                 * @description Number of alerts to skip
                 * @example 0
                 */
                offset: string;
                /**
                 * @description Filter by alert status
                 * @example ACTIVE
                 */
                status: string;
                /**
                 * @description Filter by alert severity
                 * @example CRITICAL
                 */
                severity: string;
                /**
                 * @description Filter by alert category
                 * @example COMPLIANCE
                 */
                category: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    create_alert: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": unknown;
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid alert data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_active_clocks: {
        parameters: {
            query?: {
                /** @description Filter by status (e.g., RUNNING) */
                status?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    get_audit_events: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    create_audit_event: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    get_events_by_regulation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    get_integrity_summary: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    get_audit_stats: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    list_datasets: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Datasets */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_dataset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Dataset registered */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    check_deploy_gate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Dataset UUID */
                dataset_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Deploy gate result */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    evaluate_action: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EvaluateApiRequest"];
            };
        };
        responses: {
            /** @description Evaluation completed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EvaluateApiResponse"];
                };
            };
            /** @description Unauthorized - Invalid or missing API key */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Rate limit exceeded */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_evidence_actor: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Actor created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_evidence_artifact: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Artifact created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_evidence_clock: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Clock created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    run_compliance_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Compliance query executed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Query not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_evidence_control: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Control created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    generate_test_evidence_events: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Test events generated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_recent_evidence_debug: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Recent evidence events (no company filter) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_evidence_decision: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Decision created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_evidence_events: {
        parameters: {
            query?: {
                /** @description Filter by source system */
                source_system?: string | null;
                /** @description Filter by event type */
                event_type?: string | null;
                /** @description Filter by severity */
                severity?: string | null;
                /** @description Limit results */
                limit?: number | null;
                /** @description Offset for pagination */
                offset?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Events retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_evidence_event_route: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Event created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    generate_evidence_package: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Evidence package ZIP file generated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    check_integrity: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Integrity check completed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    verify_evidence_integrity: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Integrity check completed successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    list_fria_assessments: {
        parameters: {
            query: {
                /** @description Page number (1-based) */
                page: number;
                /** @description Items per page */
                page_size: number;
                /** @description Filter by status */
                status?: string | null;
                /** @description Filter by AI system type */
                system_type?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Assessments retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_fria_assessment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Assessment created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_fria_assessment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Assessment retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Assessment not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    update_fria_assessment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Assessment updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Assessment not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    approve_assessment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Assessment approved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden - insufficient permissions */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Assessment not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    add_risk_factor: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description Risk factor added successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Assessment not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    submit_assessment_for_review: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Assessment submitted for review successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Assessment not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    auto_trigger_fria: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description FRIA triggered successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description FRIA not required or invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_fria_compliance_report: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Compliance report generated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_fria_config: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description FRIA configuration retrieved */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    list_lenses: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List lenses */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    ai_act_art16_provider_obligations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    ai_act_art17_quality_management: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    ai_act_art26_deployer_obligations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    ai_act_art5_prohibited_practices: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    ai_act_performance: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    ai_act_transparency: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    audit_evidence: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    dora_assets: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    dora_tprm: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    gdpr_consent: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    gdpr_rights: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    gdpr_rights_erasure_execute: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": unknown;
            };
        };
        responses: {
            /** @description Erasure executed successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    gdpr_rights_export_compliance_report: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Compliance report PDF */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
        };
    };
    gdpr_rights_export_erasure_certificates: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Erasure certificates CSV */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
        };
    };
    gdpr_rights_export_requests_csv: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description All requests CSV export */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
        };
    };
    gdpr_rights_export_sla_performance: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description SLA performance report */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    gdpr_rights_overview: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description GDPR Rights overview data */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    gdpr_rights_recent_activity: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description GDPR Rights recent activity */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    gdpr_rights_requires_attention: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description GDPR Rights requires attention items */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    risk_overview: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    sovereign_shield: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    sovereign_shield_countries: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Sovereign Shield country data */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    sovereign_shield_stats: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Sovereign Shield statistics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    sovereign_shield_transfers_by_destination: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Transfer data by destination */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    stream_enforcement_decisions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description SSE stream of EnforcementDecision events */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    unified_incidents: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    get_lens: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Lens id */
                lens_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lens detail */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    get_transparency_config: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Transparency configuration */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TransparencyConfigResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Configuration not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    upsert_transparency_config: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TransparencyConfigRequest"];
            };
        };
        responses: {
            /** @description Configuration saved */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TransparencyConfigResponse"];
                };
            };
            /** @description Invalid request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_transparency_metrics: {
        parameters: {
            query?: {
                /** @description Number of days to include (default: 30) */
                days?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Transparency metrics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TransparencyMetricsResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    list_audit_integrity_reports: {
        parameters: {
            query?: {
                /** @description Max rows (default 50, max 200) */
                limit?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Integrity reports */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_audit_integrity_latest: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Latest integrity report */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    list_sccs: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of all SCC registries */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    register_scc: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description SCC registration successful */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    update_scc: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description SCC registry ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description SCC update successful */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SCC not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    delete_scc: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description SCC registry ID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description SCC deletion successful */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SCC not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_company_module_config: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                company_id: string;
                module_name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    set_company_module_config: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                company_id: string;
                module_name: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": unknown;
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ModuleResponse"];
                };
            };
        };
    };
    get_art5_patterns: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current Art.5 patterns */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Art5Patterns"];
                };
            };
        };
    };
    get_enforcement_labels: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Enforcement labels (article -> level) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EnforcementRule"][];
                };
            };
        };
    };
    get_enforcement_matrix: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current enforcement matrix */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EnforcementRule"][];
                };
            };
        };
    };
    get_transfer_seed: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current transfer validation seed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TransferDatasetsSeed"];
                };
            };
        };
    };
    get_dora_lite_compliance_status: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description DORA Lite compliance status */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DORALiteComplianceStatus"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_dora_lite_incidents: {
        parameters: {
            query?: {
                /** @description Filter by status */
                status?: string | null;
                /** @description Filter by severity */
                severity?: string | null;
                /** @description Limit results */
                limit?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of incidents */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DORALiteIncidentList"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_dora_lite_incident: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateDORALiteIncidentRequest"];
            };
        };
        responses: {
            /** @description Incident created */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DORALiteIncident"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_dora_lite_risks: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of ICT risks */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DORALiteRisk"][];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_dora_lite_risk: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateDORALiteRiskRequest"];
            };
        };
        responses: {
            /** @description Risk created */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DORALiteRisk"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_dora_lite_sla_monitoring: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of SLA monitoring */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DORALiteSLAMonitoring"][];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_dora_lite_sla_monitoring: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateDORALiteSLARequest"];
            };
        };
        responses: {
            /** @description SLA monitoring created */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DORALiteSLAMonitoring"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    get_dora_lite_vendors: {
        parameters: {
            query?: {
                /** @description Filter by vendor type */
                vendor_type?: string | null;
                /** @description Filter by risk level */
                risk_level?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of vendors */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DORALiteVendor"][];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    create_dora_lite_vendor: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateDORALiteVendorRequest"];
            };
        };
        responses: {
            /** @description Vendor created */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DORALiteVendor"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    list_modules: {
        parameters: {
            query?: {
                /** @description If true, returns all modules. Default: false (Lite suite only) */
                all?: boolean | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ModulesListResponse"];
                };
            };
        };
    };
    get_modules_by_regulation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                regulation: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ModulesListResponse"];
                };
            };
        };
    };
    list_privacy_notices: {
        parameters: {
            query?: {
                /** @description Filter by notice type */
                notice_type?: string | null;
                /** @description Filter by language code */
                language_code?: string | null;
                /** @description Filter by status */
                status?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrivacyNoticesListResponse"];
                };
            };
        };
    };
    create_privacy_notice: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrivacyNoticeResponse"];
                };
            };
        };
    };
    get_privacy_notice: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrivacyNoticeResponse"];
                };
            };
        };
    };
    update_privacy_notice: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrivacyNoticeResponse"];
                };
            };
        };
    };
    publish_privacy_notice: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrivacyNoticeResponse"];
                };
            };
        };
    };
    get_privacy_notice_templates: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    get_module_config_schema: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    disable_module: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ModuleResponse"];
                };
            };
        };
    };
    enable_module: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EnableModuleRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ModuleResponse"];
                };
            };
        };
    };
    get_module_status: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    calculate_price: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CalculatePriceRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    create_company_profile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CompanyProfileResponse"];
                };
            };
        };
    };
    get_company_profile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CompanyProfileResponse"];
                };
            };
        };
    };
    export_certificate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Statement of Conformity (Markdown) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Company profile not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Failed to generate certificate */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    recommend_modules: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RecommendModulesRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    start_trial: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubscriptionResponse"];
                };
            };
        };
    };
    get_subscription: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubscriptionResponse"];
                };
            };
        };
    };
    upgrade_subscription: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpgradeRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubscriptionResponse"];
                };
            };
        };
    };
}