# DataVision AI — Automated BI Dashboard & Data Engineering Platform

DataVision AI is an enterprise-grade automated business intelligence web application that transforms raw CSV and Excel datasets into interactive, cross-filtered BI dashboards without hardcoded metrics or static assumptions.

---

## Phase 1 Implementation: UI Foundation & File Upload

### Core Modules Implemented:
1. **SaaS Landing Page**:
   - Modern hero section ("Turn Your Data Into Intelligent Dashboards")
   - Value propositions (100% Dynamic Schema, Data Quality Audit, Centralized Cross-Filtering, 7 Executive BI Themes)
   - Guided 11-step pipeline banner with clear user navigation

2. **Responsive Sidebar & Top Navigation**:
   - 10 sections: Overview, Upload Dataset, Data Profile, Data Quality, Transform Data, Data Preview, Dashboard, AI Insights, Reports, Settings
   - Collapsible desktop & tablet sidebar
   - Active state indicators, lock badges for stages pending data upload, and loaded dataset summary card

3. **11-Stage Workflow Stepper**:
   - Progress indicator covering all 11 stages defined in the master specification
   - Step status tracking (Active, Completed, Unlocked, Locked)
   - Non-destructive stage navigation allowing backward and forward movement without losing state

4. **Robust Drag-and-Drop File Upload**:
   - Drag & drop zone with active hover states and animated upload indicators
   - Browse files button with native file chooser integration
   - Format validation: `.csv`, `.xlsx`, `.xls`
   - File size validation with a 50 MB threshold and transparent error banners
   - Multi-sheet Excel inspector with interactive sheet selection modal

5. **Multi-Domain Sample Datasets**:
   - One-click loading for 4 realistic enterprise datasets:
     - **Sales & Retail E-Commerce** (25 rows, 13 cols)
     - **Workforce & Talent Analytics** (20 rows, 11 cols)
     - **SaaS Financial & Growth KPIs** (12 rows, 10 cols)
     - **Hospital Clinical & Operations** (15 rows, 10 cols)

6. **Dataset State & Validation Management**:
   - Centralized `DatasetContext` tracking active datasets, file metadata, raw headers, row records, and step progress
   - Ready-state overview displaying total rows, columns, detected format, and detected header badges

---

## Running the Application

### Prerequisites:
- Node.js (v18+)
- npm or yarn

### Steps:
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (already installed)
npm install

# Start the Vite development server
npm run dev

# Build for production
npm run build
```

The application runs on `http://localhost:5173`.
