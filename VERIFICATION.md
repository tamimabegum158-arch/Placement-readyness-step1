# Step 4 Verification Checklist

## Skill Extraction Test
- **JD:** "React, Node.js, SQL, AWS"
- **Expected:** React + Node.js under **Web**, SQL under **Data**, AWS under **Cloud/DevOps**
- **Implementation:** `src/lib/skillCategories.js` defines Web: [React, Node.js, ...], Data: [SQL, ...], Cloud/DevOps: [AWS, ...]. `extractSkills()` does case-insensitive match. Results page shows only categories with detected skills, grouped by category label.

## Fallback Test
- **JD:** "Looking for a strong leader with communication skills."
- **Expected:** No keywords matched → **General fresher stack**
- **Implementation:** When `Object.keys(categories).length === 0`, we set `categories['General'] = ['General fresher stack']` and `isGeneralFresher: true`. Results show "General: General fresher stack".

## Round-wise Checklist
- **Expected:** 4 rounds; specific items; React detection adds frontend tasks.
- **Implementation:** `generateChecklist()` returns 4 rounds. Round 3 includes "Prepare frontend deep-dive (state, hooks, performance)" when `hasWeb` (Web category has any skill).

## 7-Day Plan
- **Expected:** Plan adapts to skills; SQL present → database revision.
- **Implementation:** `generatePlan()` uses `hasReact`, `hasData`; Day 6 includes "Prepare: indexing, queries, normalization" when `hasData`. Day 1–2 includes "Revise core CS: OOP, DBMS, OS, Networks".

## Interview Questions
- **Expected:** 10 questions; skill-specific; no generic fluff.
- **Implementation:** `generateQuestions()` pushes skill-based questions first (DSA, OOP, SQL, React, Node, Python, Java, Cloud, Testing), then fills to 10 with generic only when needed.

## Readiness Score
- **Expected:** Short JD + no company → lower; long JD + company + role → higher; cap 100.
- **Implementation:** `computeReadinessScore()`: start 35, +5 per category (max 30), +10 company, +10 role, +10 if JD length > 800; `Math.min(100, Math.max(0, score))`.

## History Persistence
- **Expected:** Analyze → History lists entry; refresh still there; click entry loads full analysis.
- **Implementation:** `saveAnalysis()` writes to `localStorage` key `placement_readiness_history`. History page reads `getAllHistory()`; click navigates to `/dashboard/results?id=<id>`; Results reads `getHistoryById(id)` or `getLatestHistory()`.

## Edge Cases
- **Empty JD:** Analyze form validates; `trimmedJd` empty → "Please paste the job description." shown.
- **5000-char JD:** No max length; string handled in memory; readiness +10 if length > 800.
- **Close browser, reopen:** History in localStorage persists.

## How to Manually Test
1. `npm start` → http://localhost:3001 → Dashboard → Analyze.
2. Paste "React, Node.js, SQL, AWS" (+ company/role optional) → Analyze → confirm Web, Data, Cloud/DevOps and 4 rounds, 7-day plan, 10 questions.
3. Analyze again with "Looking for a strong leader with communication skills." → confirm "General fresher stack".
4. Go to History → confirm entry listed → refresh → still there → click entry → full results load.
5. Submit empty JD → confirm validation message.

---

# Step 5 Verification Checklist (Interactive Results & Export)

## Skill Toggle Test
- **Expected:** Each skill has "I know this" / "Need practice"; default = Need practice; toggling one to "I know this" increases readiness score instantly.
- **Implementation:** `skillConfidenceMap[skill] || 'practice'`; `setSkillConfidence` → `updateEntry({ skillConfidenceMap, readinessScore: liveScore })`; `computeLiveScore(base + 2*know - 2*practice)` with `clampScore(0, 100)`.

## Score Bounds
- **Expected:** All "I know" → score ≤ 100; all "Need practice" → score ≥ 0; no negatives, no overflow.
- **Implementation:** `clampScore(score) = Math.min(100, Math.max(0, Math.round(score)))`.

## Persistence
- **Expected:** Toggle skills → refresh → toggles preserved; open same entry from History → toggles and updated score retained.
- **Implementation:** Every toggle calls `updateHistoryEntry(entry.id, { skillConfidenceMap, readinessScore })`; History loads via `getHistoryById(id)` from localStorage.

## Export
- **Expected:** Copy 7-day plan / Copy checklist / Copy 10 questions (plain text); Download as TXT with Company, Role, Score, Skills, Checklist, Plan, Questions. No detected skills (General fresher) → TXT still valid.
- **Implementation:** `planToText`, `checklistToText`, `questionsToText`; `buildFullTxt(entry)` includes all sections; General category yields "General: General fresher stack" and plan/checklist/questions from analysis.

## Action Next Box
- **Expected:** Top 3 weak skills (practice-marked); suggests "Start Day 1 plan now."; clear, not noisy, not gamified.
- **Implementation:** `top3Weak = practiceSkills.slice(0, 3)`; one line "Start Day 1 plan now."; minimal copy.

---

# Step 6 Verification Checklist (Company Intel & Round Mapping)

## Company Intel
- **Amazon:** Classified as Enterprise (2000+); Typical hiring focus = "Structured DSA and core CS fundamentals...".
- **XyzTech (unknown):** Defaults to Startup (<200); Typical hiring focus = "Practical problem-solving and stack depth...".
- **Empty company:** No company intel card; `entry.companyIntel` is null; no crash. Demo note only when intel is shown.

## Round Mapping
- **Infosys + DSA, OOP, SQL:** Enterprise + DSA → 4 rounds: Online Test (DSA + Aptitude) → Technical (DSA + Core CS) → Tech + Projects → HR.
- **StartupX + React, Node.js:** Startup + hasReactNode → 3 rounds: Practical coding → System discussion → Culture fit.
- **Timeline:** Vertical layout; numbered circles; connector line between rounds; each round shows "Why this round matters".

## Persistence
- Analysis with company → History → open same entry: company intel and round mapping still visible (stored in entry; not overwritten by skill toggles).
