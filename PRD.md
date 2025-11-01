# Product Requirements Document (PRD)

## Project: Interactive Gaussian Distribution & K-Means Playground  
**Last Updated:** 2025-11-02  
**Development Time:** 1 day (1 engineer)  

---

## 1. Overview
This document specifies the requirements for an interactive web application that guides users through generating, manipulating, and clustering Gaussian distributions. The application originated in Google AI Studio and is now maintained as a standalone Vite + React + TypeScript project. The goal is to provide a visually intuitive sandbox for demonstrating K-Means clustering concepts, including experimentation with alternate `k` values and understanding cluster quality metrics.

---

## 2. Objectives & Success Criteria
### Primary Objectives
1. Allow a user to generate three Gaussian distributions with configurable sample size and calibrated overlap.
2. Provide interactive controls to reposition or “explode” distributions to observe clustering effects.
3. Run K-Means clustering for `k = 3`, display results, and support comparison with alternative `k` values (`2` and `4`).
4. Deliver clear visual and textual feedback, including centroid markers, misallocated point indicators, distance measurements, and clustering recommendations.

### Success Criteria
- A user can complete the end-to-end flow (generate → manipulate → cluster → compare) in < 2 minutes without guidance.
- Visualizations render without runtime errors in modern browsers (Chrome/Edge/Firefox/Safari).
- The statistics panel correctly computes and displays intra-cluster and inter-centroid metrics for every \(k\) run.
- The recommendation copy updates immediately after any reclustering.

---

## 3. Users & Use Cases
### Target Users
- **Data science instructors** demonstrating clustering concepts.
- **Students** exploring Gaussian distributions and K-Means behavior.
- **ML practitioners** prototyping or explaining clustering intuition.

### Key Use Cases
1. **Generate & Inspect:** Set sample size, create distributions, observe actual overlap.
2. **Manipulate & Observe:** Move and explode distributions to see how clusterability changes.
3. **Run K-Means:** Execute clustering with `k = 3`, inspect metrics, then experiment with `k = 2` or `k = 4`.
4. **Point Inspection:** Click a point to understand its distance to current cluster centroids and identify misallocations.

---

## 4. Functional Requirements
| ID | Requirement | Priority |
| --- | --- | --- |
| FR-1 | User can input a positive integer sample size and build three Gaussian distributions. | Must |
| FR-2 | App computes actual overlap percentage by measuring nearest-centroid assignments. | Must |
| FR-3 | User can select a distribution and move it using keyboard arrows; `Enter` confirms movement. | Must |
| FR-4 | User can “explode” a distribution, splitting it into two cohesive sub-clusters at random locations. | Must |
| FR-5 | App runs K-Means for `k = 3`, displaying iterations, SSE, intra/inter distances, and centroids. | Must |
| FR-6 | User can initiate K-Means for `k = 2` or `k = 4`; results are compared against `k = 3`. | Must |
| FR-7 | Statistics panel provides recommendation text indicating the preferred `k` and rationale. | Must |
| FR-8 | Scatter plot shows original distribution colors, cluster shapes, centroid markers, and misallocated point highlights. | Must |
| FR-9 | Clicking any point displays Euclidean distances to each centroid in the latest run. | Must |
| FR-10 | “Back to k=3 Result” button restores baseline clustering view after experimentation. | Should |
| FR-11 | Visual walkthrough assets and README instructions reflect actual UI flow. | Should |

---

## 5. Non-Functional Requirements
| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-1 | Application must run entirely client-side; no back-end dependencies. | Must |
| NFR-2 | Initial load should complete in < 3 seconds on a typical broadband connection. | Should |
| NFR-3 | No console errors or unhandled promise rejections during typical use. | Must |
| NFR-4 | Codebase adheres to TypeScript strictness defined by `tsconfig.json`. | Should |
| NFR-5 | Support latest versions of Chrome, Edge, Firefox, and Safari. | Should |

---

## 6. UX & Interaction Flow
1. **Landing State:** Controls prompt the user to input sample size and build distributions.
2. **Post-Build:** Scatter plot appears with three color-coded distributions and displayed overlap percentage.
3. **Move Flow:** User clicks “Move {Color}”, receives notification, uses arrow keys, presses `Enter` to confirm.
4. **Explode Flow:** “Explode {Color}” redistributes the chosen distribution into two random clusters.
5. **K-Means Flow:** “Define New Groups (K-Means)” runs clustering with `k = 3`; results populate statistics panel.
6. **Alternate K:** Buttons for `k = 2` and `k = 4` rerun clustering and update recommendations; “Back to k=3 Result” reverts.
7. **Point Drill-Down:** Clicking a point opens a panel with distance metrics to each centroid.

Screenshots in `Images/` illustrate each phase and are referenced in the README visual walkthrough.

---

## 7. Technical Notes
- Frontend stack: **React 19**, **TypeScript 5.8**, **Vite 6**, **Tailwind CDN** for rapid styling.
- Gaussian generation: Box-Muller transform seeds three distributions with preset centroids and calibrated standard deviation.
- Overlap calculation: For each point, nearest centroid (by Euclidean distance) determines whether it belongs to another color’s region; aggregated gap yields percentage overlap.
- K-Means implementation: Custom TypeScript module performing squared Euclidean distance assignments, with max iterations (100) and random centroid initialization.
- Metrics: `calculateClusterMetrics` computes average intra-cluster distance, average/min inter-centroid distance, and a separation/compactness score.
- Misallocation detection: Points flagged when assigned centroid is not the nearest one.
- State management: `AppState` enum drives UI transitions; React hooks maintain data and async flows.

---

## 8. Deliverables
- Updated README (live walkthrough + setup instructions).
- Maintained prompt log in `PROMPTS.md`.
- PRD (this document) outlining scope and requirements.
- Source code in repository, ready for `npm install && npm run dev`.
- Optional production build via `npm run build` (outputs `dist/`).

---

## 9. Open Questions / Future Enhancements
1. Should users be able to set custom overlap percentages or distribution count? (Currently fixed to three distributions with calibrated overlap.)
2. Would exporting clustering results or point data as CSV aid instructors?
3. Should the recommendation panel support arbitrary `k` values (`k > 4`) with dynamic slider input?
4. Could we introduce a tutorial overlay guiding first-time users through the flow?

---

## 10. Timeline
| Task | Est. Time |
| --- | --- |
| Review existing implementation & assets | 0.5 hours |
| Document requirements and workflow | 2 hours |
| QA walkthrough against requirements | 1 hour |
| Buffer & polish | 0.5 hours |
| **Total** | **1 day (approx. 4 hours actual dev effort, remainder for validation)** |

---

## 11. Approval
- **Product Owner:** _TBD_  
- **Engineering Lead:** _TBD_  
- **Design:** _N/A (existing UI refined in code)_  

Once approved, this PRD serves as the baseline for maintenance tasks and potential enhancements.
