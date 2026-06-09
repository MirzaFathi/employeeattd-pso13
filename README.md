<div align="center">

<img src="public/logo.png" width="120" alt="AttendEase Logo" />

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0e1a,50:1a2547,100:818cf8&height=200&section=header&text=AttendEase&fontSize=56&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Role-Based%20Employee%20Attendance%20Management%20System&descAlignY=60&descSize=17&descColor=a5b4fc" />

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=18&pause=1200&color=818cf8&center=true&vCenter=true&width=600&lines=Next.js+16+App+Router+%2B+TypeScript;JWT+Auth+%2B+Role-Based+Access+Control;MongoDB+Atlas+%2B+Mongoose+v9;Payroll+Engine+%7C+Leave+Management+%7C+GPS+Check-in;Excel+%26+PDF+Export+%7C+Audit+Logs;GSAP+Cinematic+Landing+%7C+Neumorphic+UI)](https://git.io/typing-svg)

<br/>

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT_Auth-black?style=for-the-badge&logo=JSON%20web%20tokens)

<br/>

> **AttendEase** is a complete, production-ready HR management platform built for small to mid-sized teams. From GPS-based check-ins and leave management to payroll generation and role-based dashboards — everything your team needs in one place.
</div>

🌐 **Project ini telah dikembangkan kembali oleh Group 13 PSO C dengan detail sebagai berikut:**
Tentu, ini lanjutan dari rangkuman progres proyek Anda berdasarkan dokumen yang diberikan:

**Project ini telah dikembangkan kembali oleh Group 13 PSO C dengan detail sebagai berikut:**

* **Working CI/CD Pipeline:** Ketika terjadi perubahan terhadap kode pada cabang utama (*branch main*), robot GitHub Actions akan secara otomatis terpicu untuk menjalankan siklus DevOps. Siklus ini diatur menggunakan file `deploy.yml` untuk menjalankan tahap pengujian secara otomatis, dan untuk melakukan *deployment* langsung menuju server produksi di GCP Cloud Run.

* **Automated Unit Testing:** Sistem telah dilengkapi dengan pengujian terotomatisasi menggunakan Jest dan TypeScript. Pengujian difokuskan pada dua modul utama:
    * **Uji Keamanan (Auth & RBAC):** Memvalidasi penerbitan token JWT, enkripsi *password* menggunakan *bcrypt*, mencegah eskalasi hak akses secara ilegal, dan memastikan penolakan terhadap token yang tidak sah.
    * **Uji Logika Bisnis (Payroll Engine):** Memastikan akurasi perhitungan gaji harian, kalkulasi pemotongan akibat absensi atau cuti, kalkulasi kehadiran setengah hari, dan perhitungan hasil akhir gaji bersih beserta bonusnya. Terdapat juga validasi aturan spesifik seperti 3 kali keterlambatan yang dihitung sebagai 1 hari absen.

* **Database Connectivity:** Penyimpanan data sudah bermigrasi dari *local* dan kini sepenuhnya terhubung dengan *cloud* MongoDB Atlas. Migrasi ini memungkinkan aplikasi AttendEase untuk mengakses data pengguna secara *real-time*.

* **Keamanan Repositori & Kredensial:** Menerapkan fitur GitHub Secrets untuk mengenkripsi dan menyembunyikan data kredensial sensitif agar tidak bocor di repositori publik. Kredensial ini meliputi kunci akses GCP (`GCP_CREDENTIALS`, `GCP_PROJECT_ID`, `GCP_REGION`), jalur *registry* (`ARTIFACT_REPO`), tautan database (`MONGODB_URL`), serta kunci keamanan login (`JWT_SECRET` dan `JWT_EXPIRES_IN`).

* **Infrastruktur & Container Registry:** Menggunakan Artifact Registry GCP sebagai tempat penyimpanan *Docker Image* yang terenkripsi sebelum aplikasi dirilis secara *live*. Pengiriman *Docker Image* dilakukan secara otomatis hanya jika kode telah berhasil melewati pengujian.

* **Pengembangan Fitur Tambahan:** Telah menambahkan fitur menu *Calendar* yang ditujukan untuk pengguna *employee* dan *admin* yang menampilkan calendar berseta tanggal libur (kalender terhubung dengan API Indonesia). Menambahkan role finance yang bekerja khusus pada payroll employee. Serta Menambahkan fitur terkait finance yang belum ada yaitu Add Salary, Edit Salary, Add Bonus, dan Print Payslip.
---

## ✨ Main Feature Overview

### 👨‍💼 Admin Portal
| Feature | Details |
|---------|---------|
| **Employee Management** | Add, edit, deactivate employees; bulk CSV import; auto Employee ID generation |
| **Attendance Control** | View all attendance records; override status; bulk import; export to Excel/PDF |
| **Leave Management** | Approve or reject with comments; auto leave balance deduction; attendance sync on approval |
| **Payroll Engine** | Monthly bulk generation using a formula-based system; edit bonuses; finalize & lock; email payslips |
| **Reports & Analytics** | Today's stats, monthly bar charts, department pie charts, 6-month trend line, top performers |
| **Department & Shift Mgmt** | Create departments and work shifts with late-arrival thresholds |
| **Settings** | Configure geo-fence radius, office coordinates, and SMTP email |

### 👨‍💻 Employee Portal
| Feature | Details |
|---------|---------|
| **Attendance History** | Calendar view + monthly attendance table; export personal records |
| **Leave Application** | Apply for Sick, Casual, Annual, or Unpaid leave; track balance and status |
| **Payslip** | View monthly salary breakdown; download as PDF |
| **Notifications** | Real-time bell with 30-second polling; mark as read |

### 🔐 Authentication & Security
- `httpOnly` JWT cookie — not accessible via JavaScript
- Bcrypt password hashing (12 salt rounds)
- Role-based middleware protecting all routes
- Auto-logout after 7 days (configurable)
- One check-in per calendar day enforced
- Auto checkout after 12 hours if employee forgets

---

## 🛠 Main Tech Stacks

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Full-stack — SSR + API routes in one |
| Language | TypeScript 5 (strict) | Catch errors at build time, not runtime |
| Database | MongoDB Atlas + Mongoose v9 | Flexible schema, serverless-friendly |
| Auth | JWT + bcryptjs | Stateless, scalable, secure cookies |
| Deployment | Google Cloud Platform | Configured by Github Actions and Secrets |
| Styling | Tailwind CSS v4 | Direct CSS imports, zero config |

---
## 🛠 Another Tech Stacks

| Layer | Technology | Why |
|-------|-----------|-----|
| Animation | GSAP + framer-motion | Cinematic scroll reveals + micro-animations |
| UI Effects | Magic cursor + Radar | Custom sparkle cursor, radar overview section |
| Charts | Recharts | React-native, lightweight charting |
| Export | SheetJS + jsPDF | Excel and PDF on client and server |
| Icons | Lucide React | Consistent, tree-shakeable icon set |
---

## 📁 Project Structure

```
employeeattd-pso13/
├── __tests__/
│   └── unit/
│       ├── auth/
│       │   └── auth-rbac.test.ts
│       ├── holidays/
│       │   └── holidays.test.ts
│       └── payroll/
│           └── payroll-engine.test.ts
├── .agents/
│   └── skills/
│       ├── find-skills/
│       │   └── SKILL.md
│       ├── frontend-design/
│       │   ├── LICENSE.txt
│       │   └── SKILL.md
│       └── skill-creator/
│           ├── agents/
│           │   ├── analyzer.md
│           │   ├── comparator.md
│           │   └── grader.md
│           ├── assets/
│           │   └── eval_review.html
│           ├── eval-viewer/
│           │   ├── generate_review.py
│           │   └── viewer.html
│           ├── LICENSE.txt
│           ├── references/
│           │   └── schemas.md
│           ├── scripts/
│           │   ├── __init__.py
│           │   ├── aggregate_benchmark.py
│           │   ├── generate_report.py
│           │   ├── improve_description.py
│           │   ├── package_skill.py
│           │   ├── quick_validate.py
│           │   ├── run_eval.py
│           │   ├── run_loop.py
│           │   └── utils.py
│           └── SKILL.md
├── .dockerignore
├── .env.example
├── .env.local
├── .github/
│   └── workflows/
│       └── ci-deploy.yml
├── .gitignore
├── .qoder/
│   └── repowiki/
│       └── en/
│           ├── content/
│           │   ├── API Reference/
│           │   │   ├── API Reference.md
│           │   │   ├── Attendance Endpoints.md
│           │   │   ├── Authentication Endpoints.md
│           │   │   └── User Management Endpoints.md
│           │   ├── Architecture Overview/
│           │   │   ├── Architecture Overview.md
│           │   │   ├── Authentication Middleware.md
│           │   │   ├── Database Layer.md
│           │   │   ├── Routing Architecture.md
│           │   │   └── Security Patterns.md
│           │   ├── Attendance Management/
│           │   │   ├── Attendance Management.md
│           │   │   ├── Attendance Statistics and Reporting.md
│           │   │   ├── Check-in and Check-out Operations.md
│           │   │   ├── Data Model and Schema.md
│           │   │   └── UI Components and Interfaces.md
│           │   ├── Authentication System/
│           │   │   ├── Authentication Overview.md
│           │   │   ├── Authentication System.md
│           │   │   ├── Login and Logout Flow.md
│           │   │   ├── Middleware and Route Protection.md
│           │   │   └── Registration and Profile Management.md
│           │   ├── Configuration & Deployment.md
│           │   ├── Getting Started.md
│           │   ├── Skill System/
│           │   │   ├── Creative & Design Skills.md
│           │   │   ├── Document Processing Skills.md
│           │   │   ├── Enterprise Communication Skills.md
│           │   │   ├── Skill Creator Tools.md
│           │   │   ├── Skill Specification.md
│           │   │   ├── Skill System.md
│           │   │   ├── Theme Factory System.md
│           │   │   ├── UI-UX Pro Max Skill.md
│           │   │   └── Web Artifacts Builder.md
│           │   ├── Troubleshooting & FAQ.md
│           │   ├── UI Components/
│           │   │   ├── Flow Field Background.md
│           │   │   ├── NeuButton Component.md
│           │   │   ├── NeuCard Component.md
│           │   │   ├── NeuDialog Component.md
│           │   │   ├── NeuInput Component.md
│           │   │   ├── NeuSelect Component.md
│           │   │   ├── NeuTable Component.md
│           │   │   ├── NeuToast Component.md
│           │   │   └── UI Components.md
│           │   └── User Management.md
│           └── meta/
│               └── repowiki-metadata.json
├── .windsurf/
│   └── plans/
│       └── footer-integration-702af8.md
├── AGENTS.md
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx
│   │   │   ├── audit-logs/
│   │   │   │   └── page.tsx
│   │   │   ├── departments/
│   │   │   │   └── page.tsx
│   │   │   ├── employees/
│   │   │   │   └── page.tsx
│   │   │   ├── holidays/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── leaves/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── payroll/
│   │   │   │   └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── shifts/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── employee/
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── leaves/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── payslip/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── admin/
│   │   │   └── test-email/
│   │   │       └── route.ts
│   │   ├── attendance/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   ├── check-in/
│   │   │   │   └── route.ts
│   │   │   ├── check-out/
│   │   │   │   └── route.ts
│   │   │   ├── import/
│   │   │   │   └── route.ts
│   │   │   ├── route.ts
│   │   │   ├── stats/
│   │   │   │   └── route.ts
│   │   │   └── today-summary/
│   │   │       └── route.ts
│   │   ├── audit-logs/
│   │   │   └── route.ts
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── logout/
│   │   │   │   └── route.ts
│   │   │   ├── me/
│   │   │   │   └── route.ts
│   │   │   ├── register/
│   │   │   │   └── route.ts
│   │   │   └── seed/
│   │   │       └── route.ts
│   │   ├── departments/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── employees/
│   │   │   ├── import/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── export/
│   │   │   ├── attendance/
│   │   │   │   └── route.ts
│   │   │   ├── employees/
│   │   │   │   └── route.ts
│   │   │   └── payslip/
│   │   │       └── [userId]/
│   │   │           └── route.ts
│   │   ├── holidays/
│   │   │   └── route.ts
│   │   ├── leaves/
│   │   │   ├── [id]/
│   │   │   │   ├── approve/
│   │   │   │   │   └── route.ts
│   │   │   │   └── reject/
│   │   │   │       └── route.ts
│   │   │   ├── all/
│   │   │   │   └── route.ts
│   │   │   ├── apply/
│   │   │   │   └── route.ts
│   │   │   └── my/
│   │   │       └── route.ts
│   │   ├── notifications/
│   │   │   ├── [id]/
│   │   │   │   └── read/
│   │   │   │       └── route.ts
│   │   │   └── route.ts
│   │   ├── payroll/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   ├── my/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── reports/
│   │   │   ├── department/
│   │   │   │   └── route.ts
│   │   │   ├── employee-stats/
│   │   │   │   └── route.ts
│   │   │   ├── monthly/
│   │   │   │   └── route.ts
│   │   │   ├── top-performers/
│   │   │   │   └── route.ts
│   │   │   └── trend/
│   │   │       └── route.ts
│   │   ├── settings/
│   │   │   └── location/
│   │   │       └── route.ts
│   │   └── shifts/
│   │       ├── [id]/
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── CLAUDE.md
├── components/
│   ├── attendance/
│   │   ├── attendance-export.tsx
│   │   ├── attendance-filters.tsx
│   │   ├── attendance-stats.tsx
│   │   ├── attendance-table.tsx
│   │   └── check-in-out-panel.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── charts/
│   │   ├── attendance-bar-chart.tsx
│   │   ├── attendance-trend-chart.tsx
│   │   └── department-pie-chart.tsx
│   ├── DashboardCalendar.tsx
│   ├── home/
│   │   ├── particle-intro-section.tsx
│   │   └── project-radar-section.tsx
│   ├── layout/
│   │   ├── admin-sidebar.tsx
│   │   ├── employee-sidebar.tsx
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   ├── navbar.tsx
│   │   └── notification-bell.tsx
│   └── ui/
│       ├── animated-background.tsx
│       ├── auth-fuse.tsx
│       ├── bento-grid.tsx
│       ├── button.tsx
│       ├── chip-loader.tsx
│       ├── empty-state.tsx
│       ├── flickering-footer.tsx
│       ├── flow-field-background.tsx
│       ├── glow-button.tsx
│       ├── list-2.tsx
│       ├── magic-cursor-client.tsx
│       ├── magic-cursor.tsx
│       ├── neu-avatar.tsx
│       ├── neu-badge.tsx
│       ├── neu-button.tsx
│       ├── neu-card.tsx
│       ├── neu-dialog.tsx
│       ├── neu-input.tsx
│       ├── neu-select.tsx
│       ├── neu-stat-card.tsx
│       ├── neu-table.tsx
│       ├── neu-toast.tsx
│       ├── particle-text-effect.tsx
│       ├── radar-effect.tsx
│       ├── scroll-to-top.tsx
│       ├── separator.tsx
│       ├── spinner.tsx
│       └── tube-light-navbar.tsx
├── Dockerfile
├── eslint.config.mjs
├── jest.config.ts
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── email.ts
│   ├── geolocation.ts
│   ├── holidays.ts
│   ├── middleware-helpers.ts
│   ├── notifications.ts
│   ├── SidebarContext.tsx
│   └── utils.ts
├── models/
│   ├── Attendance.ts
│   ├── AuditLog.ts
│   ├── Department.ts
│   ├── Leave.ts
│   ├── Notification.ts
│   ├── Payroll.ts
│   ├── Shift.ts
│   └── User.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── PROJECT_DETAILS.md
├── proxy.ts
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── logo.png
│   └── window.svg
├── README.md
├── scripts/
│   ├── diagnostic-db.ts
│   ├── fix-windows-dns.ps1
│   └── test-db.ts
├── SKILL.md
├── skills/
├── skills-lock.json
├── tes.md
├── tsconfig.json
├── types/
│   └── index.ts
└── ui-ux-pro-max-skill/
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+ (LTS)
- MongoDB Atlas free tier account
- Gmail account with App Password enabled (for SMTP)

### 1. Clone the repository

```bash
git clone https://github.com/Konete326/Employee-Attendance.git
cd Employee-Attendance
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env.local`

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendease

# Authentication
JWT_SECRET=your_minimum_32_character_random_secret_here
JWT_EXPIRES_IN=7d

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Office Geo-location (set your office coordinates)
OFFICE_LAT=24.8607
OFFICE_LNG=67.0011
OFFICE_RADIUS_METERS=100
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. First-time setup

Navigate to `/register` — the **first user automatically becomes Admin**. After that, only the Admin can add new employees from the dashboard.

---

## 🧪 Development Commands

```bash
npm run dev      # Start dev server → http://localhost:3000
npm run build    # Production build (Turbopack)
npm run start    # Start production server
npm run lint     # ESLint check
```

---

## 🚀 Deployment

AttendEase is deployed on Google Cloud Run with automatic deployments on every `git push` to `main`.
https://my-app-service-298471478049.asia-southeast2.run.app/

---

<div align="center">

## ✍️ Built By

**Muhammad Sameer**  
*Original Full-Stack Developer*

**Mirza Fathi Taufiqurrahman**
*DevOps & Cloud Engineer*

**Hafidz Putra Dermawan**
*DevOps & Cloud Engineer*
<br/>

[![Email](https://img.shields.io/badge/Email-sameerdevexpert%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:sameerdevexpert@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sameer-akram-52662a28a/)

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:818cf8,50:1a2547,100:0a0e1a&height=120&section=footer" />

</div>
