# Interactive Gaussian Distribution & K-Means Playground

This project began its life in **Google AI Studio** and was completed and refined locally with the help of **Codex**. The result is a fully client-side playground for exploring Gaussian distributions and K-Means clustering.

![Google AI Studio mockup](Images/Screenshot%202025-11-01%20at%2023.28.35.png)

---

## 1. Getting Started Locally

Follow these steps to run the app on your machine:

1. **Clone the repository**
   ```bash
   git clone <your-fork-or-clone-url>
   cd L15_HomeWork
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the Vite dev server**
   ```bash
   npm run dev
   ```
4. **Open the app** at the printed URL (default: `http://localhost:5173`).

No external services are required; the Gaussian sampling and K-Means clustering run entirely in the browser.

---

## 2. Development Journey

1. **Google AI Studio Prototype** – The UI and basic flow were designed and mocked up in AI Studio (see screenshot above).
2. **Local Refinement with Codex** – All runtime logic, React components, and visual polish were rebuilt in this repository using Vite + React + TypeScript.

### Why TypeScript (Not Python)?
- The entire playground runs client-side inside the browser. TypeScript compiles to JavaScript, letting Vite/React execute the Gaussian generation and K-Means logic without any backend services.
- Keeping the compute in the browser removes the need for Python runtime hosting or WebAssembly bridges, so interaction latency stays low.
- TypeScript provides static typing and integrates directly with the React components, allowing us to evolve UI and mathematical logic together in one codebase.

Along the way, we iteratively:
- Migrated off Gemini API calls to a pure TypeScript implementation.
- Enriched the UI with centroid markers, misallocation highlights, and distance tooltips.
- Added clustering diagnostics to compare k=3 against alternate Ks (2 or 4) with narrative recommendations.

---

## 3. App Workflow Overview

1. **Build Distributions** – Enter a sample size per distribution (overlap is calibrated automatically). Click *Build Distributions* to generate three Gaussian blobs (blue, red, orange).
2. **Move Distributions** – Select a distribution to move. Use arrow keys to reposition it, then press **Enter** to confirm.
3. **Explode Distribution** – Pick a distribution to “explode”; it splits into two cohesive clusters that relocate randomly.
4. **Run K-Means (k=3)** – Define new groups and inspect cluster statistics (iterations, SSE, intra/inter-cluster distances).
5. **Try k=2 or k=4** – Compare alternate clusterings. A recommendation panel explains which split is best and why.
6. **Inspect Points** – Click any point to see Euclidean distances to each cluster centroid in the latest run.

---

## 4. Key Application Units

| Module | Responsibility |
| --- | --- |
| `App.tsx` | Orchestrates state machine, user interactions, clustering runs, notifications. |
| `components/Controls.tsx` | Sidebar controls for building/moving/exploding distributions and running K-Means variants. |
| `components/ScatterPlot.tsx` | Renders points, cluster shapes, centroid markers, and misallocation highlights. |
| `components/Statistics.tsx` | Presents SSE, intra/inter-cluster metrics, and the k-selection recommendation. |
| `components/Notification.tsx` | Displays contextual hints (e.g., “Use arrow keys to move the blue distribution”). |
| `utils/distribution.ts` | Generates Gaussian distributions and computes the actual overlap percentage. |
| `utils/kmeans.ts` | Pure TypeScript implementation of K-Means clustering. |
| `utils/math.ts` | Utility helpers for Euclidean distances and cluster metrics. |
| `types.ts` | Reusable type definitions shared across the app. |

The app uses a simple state enum (`AppState`) to guide the user through each step, ensuring the UI only exposes relevant actions at the right time.

---

## 5. Repository Structure

```text
L15_HomeWork/
├── App.tsx
├── Images/
│   └── (walkthrough screenshots)
├── README.md
├── PROMPTS.md
├── components/
│   ├── Controls.tsx
│   ├── Notification.tsx
│   ├── ScatterPlot.tsx
│   └── Statistics.tsx
├── index.html
├── index.tsx
├── package.json
├── package-lock.json
├── tsconfig.json
├── types.ts
├── utils/
│   ├── distribution.ts
│   ├── kmeans.ts
│   └── math.ts
└── vite.config.ts
```

---

## 6. Visual Walkthrough

### Build & Inspect Distributions
![Distributions built](Images/Screenshot%202025-11-01%20at%2023.22.28.png)

### Move a Distribution
![Move distribution hint](Images/Screenshot%202025-11-01%20at%2023.22.42.png)
![Move in progress](Images/Screenshot%202025-11-01%20at%2023.22.54.png)

### Explode into Sub-Clusters
![Exploded distribution](Images/Screenshot%202025-11-01%20at%2023.23.19.png)

### K-Means Results
![K-Means statistics](Images/Screenshot%202025-11-01%20at%2023.23.34.png)

### K-Means Recommendations
![Recommendation panel 1](Images/Screenshot%202025-11-01%20at%2023.23.52.png)
![Recommendation panel 2](Images/Screenshot%202025-11-01%20at%2023.24.18.png)

Each screenshot corresponds to a step in the journey described above, making it easy to follow along while using the app.

---

## 7. Scripts & Tooling

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload. |
| `npm run build` | Produce a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |

---

## 8. Contributing & Future Ideas

- Add persistence for custom layouts or clustering runs.
- Introduce export/import of generated datasets.
- Extend the comparison panel to support arbitrary k-values beyond {2,3,4}.

If you extend the playground, feel free to open a pull request describing your changes.

---

Happy exploring! 🎲🧠📊
