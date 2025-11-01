# Project Prompts & Actions Log

This file documents the series of prompts from the user and the corresponding actions taken to build and refine the "Interactive Gaussian Distribution & K-Means Clustering" web application.

---

### Prompt 1: Initial Application Build

**User Prompt:**
> "I want to build a web-page where user can input percent of the overlap between 3 distributions she wants to build of how many sample size per distribution (sizes of distributions are equal), then click the button to build distributions and it would build 3 gaussian distributions with that percent overlap the user asked for (+/- 5%). Each distribution will have it's own color (Blue, Red and Orange). Once the distributions build, 3 buttons appear: "Move Blue", "Move Red" and "Move Orange". Once one of the buttons clicked, the clicked button keeps the color, the other 2 buttons should grey out. The chosen color distribution should now become available for the user to move it around the screen with the help if keyboard arrows. The user should now see the Note on the top of the screen that they can now move the [color] distribution with the help of the keyboard arrows (up, down, left, right) and user should click Enter once they are done moving the distribution. Once Enter is clicked, 3 buttons appear noting that the user can now "explode" one of the distributions (Explode Blue, Explode Red, Explode Orange). Once one of the buttons clicked, the clicked button keeps the color, the other 2 buttons should grey out. After the button is clicked, the relevant distribution (depending on the color of the button) gets randomly reassign the position to its points. Once it's done, the button to define new groups should appear. Once the button is clicked, the process of K-Means should start with hyper param to reorganize the dots into 3 new groups. All the dots should keep their original color, and cycle around the points should be added of green, black and violet colors showing their new groups allocation. Once the best groups are found and new dots are illustrated, add statistics on K-Means process (number of runs and error statistics). After it's all done, suggest the user to try 2 or 4 groups allocation (2 buttons). If user clicks one of the buttons, repeat the above logic (take the distribution prior to K-Means and allocate to 2 or 4 groups (per user's choice). If it's 2 groups, again all the points keep their original colors, 2 new groups are presented as cycles around the dots (Green and Black). If it's 4 groups, again all the points keep their original 3 colors, 4 new groups are presented as cycles around the dots (Green, Black, Violet and Turquoise). Once the new allocation is done, present the statistics of 2 (or 4) groups vs 3 groups. One other functionality that should be allowed is for user to click any point in distribution and see cos distance to each of the distributions centers."

**Action Taken:**
Built the entire React application from the ground up based on these detailed specifications. This involved creating the project structure, components (`Controls`, `ScatterPlot`, `Statistics`, `Notification`), type definitions, and the main `App.tsx` to manage state and user flow. Initial logic used the Gemini API for data generation and clustering.

---

### Prompt 2: Fix Runtime Error

**User Prompt:**
> "Fix the following errors: Uncaught TypeError: Cannot convert undefined or null to object"

**Action Taken:**
Diagnosed and fixed a runtime error that occurred when trying to access properties of a potentially uninitialized object. Added defensive checks in `App.tsx` to ensure `distributions` and `initialCentroids` are always initialized as objects, even if an API response is incomplete. Also resolved several related TypeScript errors.

---

### Prompt 3: Fix Plotting Bug (Part 1)

**User Prompt:**
> "After running to build distribution, nothing was plotted on the users screen"

**Action Taken:**
Identified an edge case where the plot would fail to render if all generated data points had zero variance (i.e., were in the same location). The fix involved modifying the `ScatterPlot` component to enforce a minimum `viewBox` width and height, ensuring the plot area is always valid.

---

### Prompt 4: Fix Plotting Bug (Part 2)

**User Prompt:**
> "Still the same issue - I don't see any distributions shown in the right side of the screen"

**Action Taken:**
Discovered a more subtle bug where non-finite numbers (`NaN`, `Infinity`) in the coordinate data could break the plot's boundary calculations. Implemented a data sanitization step in `ScatterPlot.tsx` to filter out any invalid points before rendering, making the component more robust.

---

### Prompt 5: Remove API & Refactor Core Logic

**User Prompt:**
> "Change the overlap be 30% always, let user choose samples size only. Change gemini service to actual code that builds the distribution. Change the gemini service to actual python code. Don't use gemini api calls at all."

**Action Taken:**
Removed all reliance on the Gemini API. The core logic for generating Gaussian distributions and running the K-Means algorithm was re-implemented in client-side TypeScript (`utils/distribution.ts`, `utils/kmeans.ts`). The UI was updated to remove the "Overlap %" input, fixing it at a constant 30%.

---

### Prompt 6: Fix Keyboard Event Bug

**User Prompt:**
> "after i moved distribution and clicked Enter, the distribution I moved automatically exploded. I wanted user to click to button to explode it"

**Action Taken:**
Fixed a bug where the 'Enter' key press was being handled twice: once by our keyboard listener and again by the browser's default behavior, causing an immediate "click" on the new buttons. Added `event.preventDefault()` to the 'Enter' key handler in `App.tsx` to solve this.

---

### Prompt 7: Change Cluster Visualization (Sizes)

**User Prompt:**
> "Instead of adding the colored circle around the dots after new groups were defined. Change the dots size (Small, Medium, Large for 3 groups, Small and Large for 2 groups and Small, Medium, Large and Extra Larger for 4 groups)"

**Action Taken:**
Modified the `ScatterPlot` component's rendering logic. Instead of drawing colored outlines to show cluster assignments, the component now changes the radius of each point based on its assigned cluster.

---

### Prompt 8: Change Cluster Visualization (Shapes)

**User Prompt:**
> "Instead of using sizes, use different forms of points: ball, square, triangle and romb"

**Action Taken:**
Further refined the cluster visualization in `ScatterPlot.tsx`. The component was updated to render a unique SVG shape (circle, square, triangle, or rhombus) for each cluster, providing a clearer distinction between groups.

---

### Prompt 9: Refactor "Explode" Functionality

**User Prompt:**
> "When exploding the distribution, make it instead of random reallocation of points move the entire distribution to a new (random) place and change its density (enlarge or make it more dense).Could you summarize the prompts used and what was done?"

**Action Taken:**
Rewrote the `handleExplodeSelect` function in `App.tsx`. The new logic moves the entire selected distribution to a new random location within the plot's bounds and regenerates its points with a new random standard deviation, effectively changing its density. Also provided a summary of the session's prompts and actions.

---

### Prompt 10: Create This Log File

**User Prompt:**
> "Create an md file where you keep all the exact prompts from this session and short desciption of what was done after the prompt"

**Action Taken:**
Created this `PROMPTS.md` file to document the entire development history of the session.

---

### Prompt 11: Running The App

**User Prompt:**
> How do I run this app?

**Action Taken:** Inspected the project setup, reviewed `package.json`, and explained the steps (`npm install`, optional `.env.local`, `npm run dev`) to launch the Vite React app locally.

---

### Prompt 12: Gemini Usage

**User Prompt:**
> What is being done with gemini?

**Action Taken:** Searched the codebase, confirmed no runtime references to `@google/genai`, and reported that Gemini was unused aside from dependency declarations.

---

### Prompt 13: Removing Gemini Service

**User Prompt:**
> Can I safely remove gemini_service?

**Action Taken:** Verified `services/geminiService.ts` was unused and advised it was safe to delete.

---

### Prompt 14: Confirm Removal

**User Prompt:**
> Yes, let's remove

**Action Taken:** Deleted the empty `services/geminiService.ts` file/directory entry.

---

### Prompt 15: npm Install Explanation

**User Prompt:**
> What does npm install do?

**Action Taken:** Explained that `npm install` resolves dependencies from `package.json`, creates `node_modules`, and captures exact versions in the lockfile.

---

### Prompt 16: Removing @google/genai

**User Prompt:**
> It mensions google/genai, can it be removed?

**Action Taken:** Removed `@google/genai` from `package.json` and the CDN import in `index.html`.

---

### Prompt 17: Viewing The App Locally

**User Prompt:**
> If I want to see what the code does, how do I do that on my local machine?

**Action Taken:** Reiterated the local workflow—`npm install`, `npm run dev`, optional `npm run build && npm run preview`.

---

### Prompt 18: Dependency Count

**User Prompt:**
> It added 114 packages, why was it needed?

**Action Taken:** Clarified that installing Vite/React pulls a large transitive dependency tree, hence 114 packages.

---

### Prompt 19: Installation Safety

**User Prompt:**
> Is it save to install these dependences?

**Action Taken:** Noted they are standard Vite/React packages, advised following organizational security practices when installing.

---

### Prompt 20: Package Review

**User Prompt:**
> Could you review these packages for me?

**Action Taken:** Reviewed each dependency version (React 19, Vite 6, TypeScript 5.8 RC, etc.), highlighted stability considerations, and suggested pinning if necessary.

---

### Prompt 21: Install Location

**User Prompt:**
> Was it installed in the path only? or was anything installed in the root?

**Action Taken:** Confirmed `npm install` only affected the project directory (`node_modules`, `package-lock.json`), nothing global.

---

### Prompt 22: Ignore myenv

**User Prompt:**
> add gitignore to ignore those myenv insalls/files

**Action Taken:** Created `.gitignore` covering `node_modules/`, `myenv/`, and `.env.local`.

---

### Prompt 23: Ignore .DS_Store

**User Prompt:**
> .DS_Store should also be ignored

**Action Taken:** Added `.DS_Store` to `.gitignore`.

---

### Prompt 24: Tracked .DS_Store

**User Prompt:**
> Why do I still see .DS_Store in the list of changes to commit?

**Action Taken:** Explained that `.DS_Store` was already tracked and suggested `git rm --cached` to remove it from version control.

---

### Prompt 25: Remove services Folder

**User Prompt:**
> remove folder services

**Action Taken:** Removed the now-empty `services/` directory.

---

### Prompt 26: Running The App (Again)

**User Prompt:**
> So what should I do now to see the app working on my local machine?

**Action Taken:** Reconfirmed the local development workflow using `npm install` and `npm run dev`.

---

### Prompt 27: Explode Behavior Change

**User Prompt:**
> When exploding the distribution, make it instead of random reallocation of points move the entire distribution to a new (random) place and change its density (enlarge or make it more dense).

**Action Taken:** Reworked `handleExplodeSelect` so an exploded distribution shifts wholesale to a new center and applies a random scaling factor.

---

### Prompt 28: Distance From Latest Clusters

**User Prompt:**
> When user clicks the point, make the calculation of distance be about the centers of the groups created the last

**Action Taken:** Updated point-click logic to reference the latest clustering result (reclustered if present) when computing distances.

---

### Prompt 29: Build Artifact Explanation

**User Prompt:**
> What is the newly created file of index-D3YHjtKe.js? What is it's functionality and why do I need it?

**Action Taken:** Explained the Vite production bundle artifact and when it is used.

---

### Prompt 30: Remove Build Output

**User Prompt:**
> I don't plan actual deploy, so lets remove it

**Action Taken:** Deleted the generated `dist/` folder.

---

### Prompt 31: Show Centroids & Rename

**User Prompt:**
> Add to each step where distributions are plotted - these distributions Centroids in a clear, easy to see manner. Also when user clicks to see the distance to centroids, instead of colling distribution 1, distribution 2, distribution 3, call them as per the forms used

**Action Taken:** Added centroid markers/labels to `ScatterPlot` and renamed distance labels to match shape names.

---

### Prompt 32: Match Reclustering Centroid Shapes

**User Prompt:**
> Make the centroids visuals of the re-allocated distributions (after explode) be per their relevant distribution form

**Action Taken:** Aligned K-Means centroid markers with their cluster shapes (circle, square, triangle, rhombus).

---

### Prompt 33: Flag Misallocated Points

**User Prompt:**
> Mark the points with wrong allocation with white color. Wrong allocation where the point is squared and is assigned to square distribution group, but the distance to some other centroid is actually smaller

**Action Taken:** Computed nearest-centroid distances per point and colored misallocated points white with colored outlines.

---

### Prompt 34: Cosine Distance Question

**User Prompt:**
> Why when checking specific point I see that cos distance is lower to the centroid that is further on the plot?

**Action Taken:** Clarified cosine distance measures directional similarity, not Euclidean proximity.

---

### Prompt 35: K-Means Distance Metric

**User Prompt:**
> Which distance K-Means uses?

**Action Taken:** Confirmed the algorithm uses squared Euclidean distance internally.

---

### Prompt 36: Switch To Euclidean Distances

**User Prompt:**
> Let's change to Euclidian then

**Action Taken:** Replaced cosine distance with Euclidean distance for point-click summaries and utility functions.

---

### Prompt 37: Cluster Metrics & Recommendation

**User Prompt:**
> Calculate both intra-cluster distance and  inter-cluster distance when comparing k=3 and (k=2 or k=4). Make decision which of the options is better and explain to the user why

**Action Taken:** Added cluster metric calculations, stored summaries, and surfaced a recommendation comparing k=3 vs. k=2/4 in the stats panel.

---

### Prompt 38: package-lock.json Purpose

**User Prompt:**
> What is package-lock.json? do I need it?

**Action Taken:** Explained the lockfile’s role in reproducible installs and advised keeping it.

---

### Prompt 39: Clarify Recommendation Text

**User Prompt:**
> Add clear definition which split (k=3 or k=2(4)) is better and why, using provided statistics.

**Action Taken:** Enhanced the stats UI to highlight the selected best split and list detailed metrics for both configurations.

---

### Prompt 40: Recommendation Visibility

**User Prompt:**
> The explanation is not visible in UI.

**Action Taken:** Fixed hook dependencies so the recommendation recalculates and renders after reclustering.

---

### Prompt 41: Separation Concern

**User Prompt:**
> It currently says the following: Recommendation ... Aren't we looking for the higher centroids separation?

**Action Taken:** Clarified copy to describe the trade-off between compactness and separation when the ratio favours an alternative k.

---

### Prompt 42: Explode Into Two Groups

**User Prompt:**
> When making group explode, split the distribution into 2 and then move each part randomly and make it grouped together more or less (randomly)

**Action Taken:** Modified explode logic to split distributions into two sub-clusters, relocate each, and adjust cohesion randomly.

---

### Prompt 43: Reset To k=3

**User Prompt:**
> add an option for the user to get back to the k=3 version

**Action Taken:** Added a “Back to k=3 Result” button in the controls to restore the baseline clustering view.

---

### Prompt 44: Actual Overlap Calculation

**User Prompt:**
> When building the first distribution, calculate actual overlap of the distributions built and not simple reporting of the default overlap asked

**Action Taken:** Computed real overlap by checking which centroid each point is closest to, replacing the fixed 30% value.

---

### Prompt 45: Update Prompt Log

**User Prompt:**
> Update Prompts.md file with all the exact prompts used in this chat. Keep the current file design

**Action Taken:** Appended all newer prompts (11–45) to this log while preserving the original format.
