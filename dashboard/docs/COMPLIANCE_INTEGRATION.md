# Compliance Overview Integration

## Overview

The Compliance Overview system provides real-time compliance scoring across GDPR, DORA, NIS2, and EU AI Act regulations.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLIANCE SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│  │   Evidence  │────►│  45 Queries │────►│   Scores    │  │
│  │    Graph    │     │   Engine    │     │   Service   │  │
│  └─────────────┘     └─────────────┘     └─────────────┘  │
│         │                   │                   │          │
│         └───────────────────┼───────────────────┘          │
│                             │                              │
│                             ▼                              │
│                    ┌─────────────┐                         │
│                    │  REST API   │                         │
│                    │  /api/v1/   │                         │
│                    │ compliance  │                         │
│                    └─────────────┘                         │
│                             │                              │
│         ┌───────────────────┼───────────────────┐          │
│         ▼                   ▼                   ▼          │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│  │  Executive  │     │  Detailed   │     │   Lenses    │  │
│  │    View     │     │    View     │     │   Landing   │  │
│  └─────────────┘     └─────────────┘     └─────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/compliance?view=overview` | GET | Full compliance data |
| `/api/v1/compliance?view=summary` | GET | Lightweight summary |
| `/api/v1/compliance/{regulation}` | GET | Regulation details |
| `/api/v1/compliance/articles` | GET | Article list |
| `/api/v1/compliance/articles/{id}` | GET | Article detail |
| `/api/v1/compliance/history` | GET | Historical data |
| `/api/v1/compliance` | POST | Actions (recalculate, storeSnapshot) |

## Article Mappings

### GDPR (12 articles)
- Art.6: Lawfulness of Processing
- Art.7: Conditions for Consent
- Art.15-20: Data Subject Rights
- Art.25: Data Protection by Design
- Art.30: Records of Processing
- Art.32: Security of Processing
- Art.33: Breach Notification (72h)
- Art.34: Subject Notification
- Art.35: DPIA
- Art.44-49: International Transfers

### DORA (15 articles)
- Art.5: ICT Governance
- Art.6-14: Risk Management & Protection
- Art.17,19: Incident Classification & Reporting
- Art.28-30: Third-Party Risk Management

### NIS2 (5 articles)
- Art.20: Management Accountability
- Art.21: Security Measures
- Art.23: Incident Notification (24h/72h/1M)

### AI Act (8 articles)
- Art.5: Prohibited Practices
- Art.9: Risk Management
- Art.11-15: Documentation, Records, Transparency, Oversight, Accuracy
- Art.52: Chatbot Disclosure

## Score Calculation

```
Article Score = Query Result (PROVEN=100, PARTIAL=50, NOT_PROVEN=0)
Regulation Score = Weighted Average of Article Scores
Overall Score = Average of Regulation Scores (weighted by article count)
```

## Status Thresholds

| Score | Status |
|-------|--------|
| 80-100% | COMPLIANT |
| 50-79% | PARTIAL |
| 1-49% | NON_COMPLIANT |
| 0% | NOT_ASSESSED |

## Usage

### NPM Scripts

```bash
# Test API endpoints
npm run compliance:test

# Store monthly snapshot
npm run compliance:snapshot

# Force recalculation
npm run compliance:recalculate
```

### React Hooks

```typescript
import { useComplianceSummary, useRegulationScore } from '@/hooks/useComplianceData';

// Get overall summary
const { data, isLoading, refresh } = useComplianceSummary();

// Get specific regulation
const { data: gdpr } = useRegulationScore('GDPR');
```

## Export

- **CSV**: Downloads compliance data as CSV file
- **PDF**: Opens printable HTML report in new window

## Caching

- Score calculations cached for 5 minutes
- Auto-refresh every 5 minutes in UI
- Force refresh available via API or UI button

## Views

### Executive View
- Hero card with overall compliance score
- High-level regulation cards
- 6-month trend analysis
- Critical metrics (alerts, clocks, gaps)
- Quick action buttons

### Detailed View
- Full compliance dashboard
- Regulation detail panels
- Article-level drill-down
- Monthly summary charts
- Interactive components

## Integration Points

### Alert Service
- Automatic alert creation for compliance events
- Critical gap notifications
- Regulatory clock alerts

### Evidence Graph
- Real-time query execution
- Evidence-based scoring
- Audit trail integration

### Dashboard Layout
- Alert banner integration
- Responsive design
- Navigation consistency

## Monitoring & Maintenance

### Health Checks
- API endpoint validation
- Data freshness monitoring
- Error rate tracking

### Performance
- Query execution time monitoring
- Cache hit rates
- UI response times

### Data Quality
- Query result validation
- Score calculation verification
- Historical data integrity

## Troubleshooting

### Common Issues

**Scores not updating:**
- Check cache TTL (5 minutes)
- Verify query execution
- Check Evidence Graph connectivity

**API errors:**
- Validate endpoint URLs
- Check authentication
- Review server logs

**UI not loading:**
- Verify component imports
- Check hook dependencies
- Review console errors

### Debug Commands

```bash
# Force score recalculation
npm run compliance:recalculate

# Test all endpoints
npm run compliance:test

# Store monthly snapshot
npm run compliance:snapshot
```

## Future Enhancements

- **Advanced Analytics**: Trend prediction, risk scoring
- **Custom Dashboards**: User-configurable views
- **Automated Remediation**: AI-powered gap resolution
- **Multi-tenant Support**: Organization-specific scoring
- **Regulatory Updates**: Automatic article mapping updates
