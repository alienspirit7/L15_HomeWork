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
