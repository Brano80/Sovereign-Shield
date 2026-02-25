# REGULUS: Legal consistency review

This document reviews the Veridion Nexus / Sovereign Shield project for legal inconsistencies in GDPR and transfer-related wording, country classifications, and article references. It does not constitute legal advice.

---

## 1. GDPR article references

### 1.1 Art. 44–49 (transfers to third countries)

- **Usage**: Dashboard subtitle “GDPR Art. 44-49 • International Data Transfers”; landing “GDPR Art. 44-49 — Runtime Enforcement” and “evaluates every transfer against GDPR Art. 44-49”.
- **Assessment**: **Correct.** Chapter V (Arts. 44–49) governs transfers of personal data to third countries. Art. 44 is the general principle; Art. 45 adequacy; Art. 46 appropriate safeguards (SCC, BCR, etc.); Arts. 48–49 derogations.
- **Suggestion**: No change required. Optionally add “Chapter V” once for clarity.

### 1.2 Maximum fine “4%” and Art. 44

- **Current text** (landing): *“4% … Of global annual turnover for Art. 44 transfer violations.”*
- **Issue**: The **level** of the fine (up to 4% of turnover) is set by **Art. 83(5) GDPR**, not Art. 44. Art. 44 describes the transfer principle; Art. 83 sets administrative fines.
- **Recommendation**: Align with the Regulation, e.g.:
  - *“Up to 4% of global annual turnover (Art. 83(5)) for violations of the transfer rules (Art. 44 ff.).”*
  - Or: *“Max fine (GDPR): 4% of global annual turnover (Art. 83(5)) for serious infringements including unlawful transfers (Chapter V).”*

### 1.3 Art. 17 (erasure)

- **Usage**: Landing “GDPR Art. 17 Erasure on Demand”; pricing “Crypto Shredder (GDPR Art. 17)”.
- **Assessment**: **Correct.** Art. 17 is the right to erasure. Describing key shredding as a technical means to support erasure is consistent.

### 1.4 Art. 32 (security) and Evidence Vault

- **Usage**: Evidence Vault subtitle “GDPR Art. 32 • Audit Archive & Evidence Chain”.
- **Issue**: Art. 32 concerns **security of processing** (integrity, confidentiality, availability). An “audit archive” and “evidence chain” relate more directly to **accountability** (Art. 5(2)), **controller responsibility** (Art. 24), and **records of processing** (Art. 30).
- **Recommendation**: Either:
  - Broaden the reference: e.g. *“GDPR Art. 5(2), 24, 30, 32 • Audit Archive & Evidence Chain”*, or
  - Use a generic formulation: *“GDPR compliance • Audit archive & evidence chain”*, and keep Art. 32 only where you explicitly describe security measures.

---

## 2. Legal basis for transfers

- **Landing**: *“every single transfer requires a legal basis: an adequacy decision, a valid Standard Contractual Clause, or a binding corporate rule”*.
- **Assessment**: **Substantively correct** for the main routes (Art. 45 adequacy; Art. 46(2)(a) BCR; Art. 46(2)(c) SCC). Incomplete as a full list.
- **Recommendation**: For strict legal accuracy, add that other appropriate safeguards under Art. 46 (e.g. certification, codes of conduct with binding commitments) and, where applicable, derogations under Art. 49 may also provide a basis. Suggested wording: *“… adequacy decision (Art. 45), appropriate safeguards such as Standard Contractual Clauses or binding corporate rules (Art. 46), or, in specific cases, derogations (Art. 49).”*

---

## 3. Country classifications

### 3.1 Adequate countries list (dashboard – Adequate Countries page)

- **Current list**: Andorra, Argentina, Canada, Faroe Islands, Guernsey, Israel, Isle of Man, Japan, Jersey, New Zealand, Republic of Korea, Switzerland, United Kingdom, Uruguay.
- **Assessment**: Broadly aligned with EU Commission adequacy decisions. The list is **static** and can become outdated when the Commission adopts, amends, or repeals decisions.
- **Recommendations**:
  - Add a disclaimer, e.g. *“Based on EU Commission adequacy decisions. List may not be exhaustive or current; check official Commission sources.”*
  - Optionally add a link to the Commission’s adequacy decisions page.
  - Consider a “last updated” date or periodic review process.

### 3.2 “Blocked” countries

- **Current framing**: “Blocked Countries” / “No transfer permitted under policy.”
- **Assessment**: **Legally consistent** if understood as **organisational policy**. The GDPR does not prohibit transfers to specific countries by name; it requires a legal basis (adequacy, Art. 46 safeguards, or Art. 49 derogations). A controller may decide as a matter of policy not to transfer to certain destinations.
- **Recommendation**: Keep the footer note that blocked = “not permitted as transfer destinations **under current policy**”. Avoid stating that the EU or GDPR “bans” these countries.

### 3.3 SovereignMap vs Adequate Countries page

- **SCC Required**:  
  - **SovereignMap** (`SovereignMap.tsx`): `US, AU, BR, MX, SG, ZA` (no India).  
  - **Adequate Countries page**: Includes India (IN) in “SCC Required”.  
  - **Inconsistency**: India appears as SCC-required on the Adequate Countries page but is not in the map’s `SCC_REQUIRED_COUNTRIES` set, so the map will not show India as “SCC Required”.
- **Blocked**:  
  - **SovereignMap**: `CN, RU, KP, IR, SY, VE, BY` (includes Venezuela, VE).  
  - **Adequate Countries page**: China, Russia, Iran, North Korea, Syria, Belarus (no Venezuela).  
  - **Inconsistency**: Venezuela is blocked on the map but not listed under “Blocked Countries” on the page.

**Recommendation**: Make the two sources of truth consistent:

- Add **IN** (India) to `SCC_REQUIRED_COUNTRIES` in `SovereignMap.tsx` if the policy is that India is SCC-required, **or** remove India from the Adequate Countries “SCC Required” list if not.
- Either add **Venezuela (VE)** to the “Blocked Countries” list on the Adequate Countries page, or remove **VE** from `BLOCKED_COUNTRIES` in `SovereignMap.tsx`.

---

## 4. Other wording

### 4.1 “Illegal” transfers

- **Landing**: “blocks illegal ones” (transfers).
- **Assessment**: **Acceptable** in an informal sense (transfers without a legal basis can be unlawful). For maximum precision, “unlawful” or “without a legal basis” is closer to GDPR language.

### 4.2 Chart labels (landing)

- **Current**: `"GDPR Art.44", "GDPR Art.46", "SCC Required", "Art.45 Adequacy"`.
- **Note**: “SCC Required” and “Art.45 Adequacy” mix article references (Art. 45, Art. 46) with shorthand. Art. 45 = adequacy; Art. 46 = appropriate safeguards (including SCC).
- **Recommendation**: For consistency, consider “Art. 45 (Adequacy)” and “Art. 46 (SCC / safeguards)”.

### 4.3 72-hour breach notification

- **Landing**: “GDPR Breach Notification (72h)”.
- **Assessment**: **Correct.** Art. 33(1) requires notification to the supervisory authority without undue delay and, where feasible, no later than 72 hours.

---

## 5. Summary of recommended changes

| Priority | Item | Status |
|----------|------|--------|
| High | 4% fine attribution | Change “Art. 44” to “Art. 83(5)” (or “Art. 83(5) for Art. 44 ff. violations”) where describing the **level** of the fine. |
| High | Map vs Adequate Countries | **Done.** SovereignMap: IN and full SCC list; VE removed from blocked. |
| Medium | Evidence Vault – Art. 32 | Broaden or soften the Art. 32 reference so it is not the sole legal basis for “audit archive & evidence chain” (consider Art. 5(2), 24, 30 or generic “GDPR compliance”). |
| Medium | Legal basis wording | **Done.** Art. 45, 46, 49 referenced on landing and adequate-countries footer. |
| Low | Adequate countries | Add disclaimer and/or link to Commission adequacy list; consider “last updated” or review process. |
| Low | Chart labels | Optionally use “Art. 45 (Adequacy)” and “Art. 46 (SCC)” for consistency. |
| Low | “Illegal” | Optionally replace with “unlawful” or “without a legal basis” where targeting strict legal wording. |

---

*Review generated for internal consistency and alignment with GDPR terminology. Not legal advice. Have a qualified lawyer confirm any changes for your jurisdiction and use case.*

---

**Implementation status (February 2026):** All recommendations above have been implemented: 4% fine → Art. 83(5); map aligned with Adequate Countries (IN in SCC, VE removed from blocked); Evidence Vault subtitle → Art. 5(2), 24, 30, 32; legal basis wording → Art. 45, 46, 49 on landing and footer; adequate countries disclaimer, "Last reviewed" date, and Commission link; chart labels → Art. 44/45/46/49; hero → "transfers without a legal basis"; Chapter V used; blocked = policy note; Art. 33(1) for breach; legal disclaimer on Adequate Countries page.
