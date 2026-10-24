# 🚀 AI-Powered Finance Tracker — Project Updates & Changelog

This document provides a comprehensive log of all architectural improvements, scalability enhancements, security upgrades, bug fixes, and coding standards applied to the project.

---

## 📋 Table of Contents
1. [Coding Standards & Interview-Ready Style Guide](#1-coding-standards--interview-ready-style-guide)
2. [Database & Scalability Bottlenecks Resolved](#2-database--scalability-bottlenecks-resolved)
3. [Authentication & Security Architecture](#3-authentication--security-architecture)
4. [Account Management & Data Privacy](#4-account-management--data-privacy)
5. [Edge Cases & Bug Fixes](#5-edge-cases--bug-fixes)
6. [System Health & Verification](#6-system-health--verification)
7. [Job Interview Quick-Reference Cheatsheet](#7-job-interview-quick-reference-cheatsheet)

---

## 1. Coding Standards & Interview-Ready Style Guide

### Conventions Applied Across Frontend (`client/`) & Backend (`server/`)
- **No Semicolons**: Modern, clean JavaScript style without trailing semicolons.
- **Component Declarations**: All React components use standard function declarations (`function ComponentName() {}`) with `export default ComponentName` at the bottom.
- **Explicit Variable Scoping**:
  - `let` is used for regular variables, functions, and handler definitions.
  - `const` is reserved exclusively for `useState` tuple destructuring (`const [val, setVal] = useState(...)`).
- **Named Event Handlers**: Handlers are defined as named `let` functions above the JSX return statement (no anonymous inline arrow functions in JSX).
- **Strict Equality**: Always using `===` and `!==`.
- **Human-Written, Explorable Code**: Code avoids heavy, esoteric abstractions so each file can be easily explained line-by-line during technical interviews.
- **Skill Created**: Saved in `.agents/skills/varun-react-style/SKILL.md`.

---

## 2. Database & Scalability Bottlenecks Resolved

### 🔴 Bottleneck 1: In-Memory Processing ➔ MongoDB Aggregation Pipelines
- **Problem**: Previously, `dashboardController.js` and `authController.js` fetched all transactions into Node.js heap memory and computed totals using JavaScript `.reduce()` and `.filter()`. With large transaction volumes, this leads to \(O(N)\) memory spikes and thread blocking.
- **Solution**: Replaced in-memory loops with native MongoDB `$facet` aggregation pipelines.
  - MongoDB performs filtering, grouping, and summation directly on the database engine.
  - The Node.js server receives only a single calculated summary object, reducing network payload and CPU utilization to \(O(1)\).

### 🔴 Bottleneck 2: Database Connection Pooling
- **Problem**: Default Mongoose connection settings can lead to socket starvation under concurrent traffic.
- **Solution**: Configured connection pool parameters in `server/server.js`:
  - `maxPoolSize: 20` (allows up to 20 concurrent database operations)
  - `minPoolSize: 5` (keeps warm standby connections ready)
  - `serverSelectionTimeoutMS: 5000` (fails fast on network disconnects rather than hanging requests indefinitely)

### 🔴 Bottleneck 3: Synchronous AI Execution ➔ In-Memory Caching & Smart Invalidation
- **Problem**: Generating AI financial insights on every dashboard load is slow and costly (whether hitting OpenAI API or running deep heuristics).
- **Solution**:
  - Implemented an in-memory cache with a 15-minute Time-To-Live (TTL) in `server/controllers/aiController.js`.
  - Added **transaction-based invalidation**: whenever a user creates, edits, or deletes a transaction (`transactionController.js`), `clearAICache(userId)` is invoked. Cached insights stay instantly available while guaranteeing data freshness.

### 🔴 Bottleneck 4: Single-Threaded Process ➔ Multi-Core Node.js Clustering
- **Problem**: Standard Node.js runs on a single core, underutilizing multi-core CPUs.
- **Solution**:
  - Created `server/cluster.js` using Node.js's native `cluster` module to fork worker processes matching `os.cpus().length`, with automatic worker resurrection upon unexpected termination.
  - Added `ecosystem.config.cjs` for production process management via PM2.

### 🔴 Bottleneck 5: Rate Limiting
- **Problem**: Unprotected authentication endpoints allow brute-force attacks.
- **Solution**: Hardened `express-rate-limit` configurations to prevent automated credential stuffing on login and registration routes.

---

## 3. Authentication & Security Architecture

### Upgraded to Dual-Token Authentication with httpOnly Cookies
- **Problem**: Storing raw JWTs exclusively in `localStorage` exposes tokens to Cross-Site Scripting (XSS) attacks. Additionally, single 7-day tokens cannot be invalidated without complex token blacklists.
- **Solution**:
  1. **Short-Lived Access Token (15 mins)**: Sent in response for in-memory / state usage.
  2. **Long-Lived Refresh Token (7 days)**: Stored in an `httpOnly`, `SameSite=Lax`, `Secure` (in production) cookie that client-side JavaScript cannot read.
  3. **New API Endpoints**:
     - `POST /api/auth/refresh`: Verifies the refresh token cookie and issues a fresh 15-minute access token.
     - `POST /api/auth/logout`: Clears the refresh token cookie and revokes the session.
  4. **Frontend Axios Interceptors (`client/src/utils/api.js`)**:
     - Automatically attaches the Bearer token to outgoing API requests.
     - Intercepts `401 Unauthorized` responses and queues failing requests while silently requesting a new token via `/api/auth/refresh`.
     - Automatically retries queued requests once the token is refreshed without disrupting the user.

---

## 4. Account Management & Data Privacy

### "Delete Account" Feature with Cascading Cleanup
- **Backend (`server/controllers/authController.js` & `server/routes/authRoutes.js`)**:
  - Created `DELETE /api/auth/account`.
  - Implemented **cascading data cleanup**: Deletes the user document, and simultaneously purges all associated transactions (`Transaction.deleteMany({ userId })`) and budget configurations (`Budget.deleteMany({ userId })`) to prevent orphan records.
  - Clears authentication cookies upon deletion.
- **Frontend (`client/src/pages/Profile.jsx`)**:
  - Added a dedicated "Danger Zone" card with warning badge and confirmation prompt.
  - Dispatches `deleteAccount()`, cleans up Redux auth state, and redirects the user to `/login`.

---

## 5. Edge Cases & Bug Fixes

### 🐞 Fix 1: Mongoose Validation Errors Returning 400 Instead of 500
- **Files**: `server/controllers/transactionController.js` & `server/controllers/budgetController.js`
- **Issue**: Submitting invalid enum values or schema violations caused Mongoose to throw `ValidationError` or `CastError`, which fell through to a generic `500 Internal Server Error`.
- **Fix**: Added explicit error checks in `catch` blocks:
  ```javascript
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
  ```

### 🐞 Fix 2: Month & Year Clamping in Reports API
- **File**: `server/controllers/reportController.js`
- **Issue**: Inputting out-of-range months (e.g. `month=15`) or invalid years caused JavaScript's `Date` constructor to roll over into future years (e.g. month 15 became next year's March).
- **Fix**: Clamped `month` strictly between 1 and 12 (`Math.min(12, Math.max(1, rawMonth))`) and validated `year` between 1970 and 2100 with a fallback to the current year.

### 🐞 Fix 3: Defensive Casting against String Concatenation
- **File**: `server/services/financeAnalyzer.js`
- **Issue**: If transaction amounts arrived or were stored as strings, `.reduce((sum, t) => sum + t.amount, 0)` performed string concatenation (`0 + "500" = "0500"`).
- **Fix**: Wrapped all reductions, category totals, and monthly bucket aggregations with `Number(t.amount) || 0`.

### 🐞 Fix 4: Unhandled Promise Rejection on Transaction Deletion
- **File**: `client/src/pages/Transactions.jsx`
- **Issue**: `handleDeleteClick` executed `await dispatch(removeTransactionById(item._id)).unwrap()`. If the backend failed or was unreachable, the uncaught rejection produced an error in the browser console.
- **Fix**: Wrapped the call in a `try / catch` block and surfaced user feedback via the UI status banner (`setMessage(...)`).

### 🐞 Fix 5: Password Change Form Autofill Collisions & Visibility
- **Files**: `client/src/pages/Profile.jsx` & `server/controllers/authController.js`
- **Issue**: Browser password managers (e.g. Chrome) aggressively autofilled both the "Current password" and "New password" fields with the same saved password on `localhost`, triggering *"New password must be different from current password"*, while masked inputs hid what was typed.
- **Fix**: Added explicit `autoComplete="current-password"` and `autoComplete="new-password"` attributes, added interactive **Show / Hide** password toggles, added client-side pre-validation, and added input trimming on the backend.

---

## 6. System Health & Verification

- **Frontend Build (`npm run build`)**: Vite builds cleanly into `dist/` with 0 syntax or bundling errors.
- **Backend Service**: Running stably on port 5055 with active Mongoose connection pooling and auto-reloading via Nodemon.
- **Code Style Compliance**: Verified 100% adherence to `varun-react-style` (zero semicolons, clean `let` scoping, function declarations, preserved Tailwind design).

---

## 7. Job Interview Quick-Reference Cheatsheet

| Topic | What to Say in an Interview |
| :--- | :--- |
| **Why MongoDB Aggregation?** | *"Instead of pulling thousands of raw documents into Node.js memory and using JavaScript `.reduce()`, I offloaded the calculation to MongoDB using `$facet` and aggregation pipelines. This keeps memory usage \(O(1)\) and reduces network transfer significantly."* |
| **Why Dual-Token Auth?** | *"Storing JWTs in `localStorage` is vulnerable to XSS. I implemented short-lived 15-minute access tokens in memory and a 7-day refresh token stored in an `httpOnly, SameSite=Lax` cookie. An Axios response interceptor silently refreshes the token on 401s."* |
| **Why In-Memory Caching for AI?** | *"AI prompts and heuristic engines are computationally heavy. I implemented an in-memory TTL cache with transaction-aware invalidation: whenever a transaction is added, updated, or deleted, the user's AI cache is evicted so fresh data is computed only when necessary."* |
| **How is Cascading Deletion Handled?** | *"When a user deletes their account, the controller runs a cascading cleanup that deletes the user profile and all associated transactions and budgets to prevent orphaned data in the database."* |