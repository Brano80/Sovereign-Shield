# Governance API Implementation - Part 2/3

## ✅ Dokončené súbory

### Infraštruktúra
1. **`lib/prisma.ts`** - Prisma client setup s singleton pattern
2. **`lib/audit/evidence-graph.ts`** - Evidence Graph service pre vytváranie audit trail záznamov

### Services
3. **`lib/dora/policy-service.ts`** - Policy Service s metódami:
   - `createPolicy()` - Vytvorenie novej policy
   - `submitForApproval()` - Odoslanie policy na schválenie
   - `processApproval()` - Spracovanie rozhodnutia o schválení
   - `checkSegregationOfDuties()` - Kontrola segregácie zodpovedností

4. **`lib/dora/oversight-service.ts`** - Oversight Service s metódami:
   - `recordOversightActivity()` - Zaznamenanie management oversight aktivity
   - `assignRole()` - Priradenie roly s kontrolou nekompatibilných rolí
   - `revokeRole()` - Odvolanie roly
   - `recordTraining()` - Zaznamenanie dokončenia školenia
   - `checkManagementTrainingCompliance()` - Kontrola compliance školenia pre management

### API Endpoints
5. **`app/api/v1/governance/route.ts`** - Hlavný Governance API endpoint s views:
   - `view=summary` - Governance summary s metrikami
   - `view=policies` - Zoznam policies s filtrami
   - `view=change-requests` - Zoznam change requests
   - `view=my-approvals` - Zoznam schválení pre konkrétneho actora
   - `view=oversight` - Management oversight aktivity
   - `view=training` - Status školenia

6. **`app/api/v1/governance/policies/route.ts`** - POST endpoint pre vytvorenie policy

7. **`app/api/v1/governance/policies/[id]/submit/route.ts`** - POST endpoint pre odoslanie policy na schválenie

8. **`app/api/v1/governance/approvals/[id]/route.ts`** - POST endpoint pre spracovanie rozhodnutia o schválení

## 📋 Potrebné kroky pred použitím

### 1. Inštalácia Prisma
```bash
cd dashboard
npm install prisma @prisma/client
```

### 2. Vytvorenie Prisma Schema
Vytvorte súbor `dashboard/prisma/schema.prisma` podľa návodu v `PRISMA_SETUP.md`.

### 3. Generovanie Prisma Client
```bash
npx prisma generate
```

### 4. Nastavenie DATABASE_URL
Uistite sa, že máte nastavenú premennú prostredia v `.env`:
```bash
DATABASE_URL=postgresql://veridion:veridion_password@localhost:5432/veridion_nexus
```

### 5. Evidence Events Table
**Dôležité:** Funkcia `createEvidenceEvent()` v `lib/audit/evidence-graph.ts` vyžaduje existenciu tabuľky `evidence_events`. 

Ak tabuľka neexistuje, buď:
- Vytvorte migráciu pre `evidence_events` tabuľku
- Alebo upravte `createEvidenceEvent()` aby používala existujúcu audit tabuľku

## ✅ Validácia

Po nastavení Prisma, otestujte všetky endpointy:

- [ ] GET `/api/v1/governance?view=summary` - Governance summary
- [ ] GET `/api/v1/governance?view=policies` - Policies list
- [ ] GET `/api/v1/governance?view=change-requests` - Change requests
- [ ] GET `/api/v1/governance?view=my-approvals&actorId=...` - My approvals
- [ ] GET `/api/v1/governance?view=oversight&period=30d` - Oversight activities
- [ ] GET `/api/v1/governance?view=training` - Training status
- [ ] POST `/api/v1/governance/policies` - Create policy
- [ ] POST `/api/v1/governance/policies/[id]/submit` - Submit for approval
- [ ] POST `/api/v1/governance/approvals/[id]` - Process approval

## 🔧 Funkcionalita

### Policy Service
- ✅ Vytváranie policies s Evidence Graph integraciou
- ✅ Multi-level approval workflows
- ✅ Segregation of duties kontrola
- ✅ Automatická aktivácia policy po schválení všetkých úrovní

### Oversight Service
- ✅ Zaznamenávanie management oversight aktivít
- ✅ Role assignments s kontrolou nekompatibilných rolí
- ✅ Training compliance tracking
- ✅ Management body training compliance check

### API Endpoints
- ✅ Governance summary s kompletnými metrikami
- ✅ Filtrovanie policies a change requests
- ✅ Approval queue tracking
- ✅ Training compliance reporting

## 📝 Poznámky

1. **Actor Context:** Niektoré endpointy (napr. `my-approvals`) vyžadujú `actorId` parameter. V produkcii by toto malo byť automaticky získané z autentifikácie.

2. **User Service Integration:** V `policy-service.ts` sú niektoré polia (napr. `actorName`, `actorRole`) prázdne s komentárom "Should be fetched from user service". Tieto by mali byť doplnené integráciou s user service.

3. **Error Handling:** Všetky endpointy majú základné error handling, ale v produkcii by mali byť rozšírené o špecifickejšie error messages a logging.

4. **Type Safety:** Všetky typy sú definované v `lib/dora/governance-types.ts` a používajú sa konzistentne v celom kóde.

## 🚀 Ďalšie kroky

1. Dokončiť Prisma setup podľa `PRISMA_SETUP.md`
2. Otestovať všetky endpointy
3. Integrovať s user service pre získanie actor informácií
4. Pridať autentifikáciu a autorizáciu middleware
5. Rozšíriť error handling a logging

