# NextERP — Open-Source Business Management Platform

**NextERP** is a modern, open-source ERP built with Next.js, designed for small-to-medium businesses that want an all-in-one platform for HR, CRM, accounting, and operations — without the enterprise price tag.

![NextERP Dashboard](https://next-erp-six.vercel.app/og.png)

**Live Demo:** [https://next-erp-six.vercel.app](https://next-erp-six.vercel.app)

## Features

### 🏢 Human Resources (HRM)
- **Employee management** — profiles, departments, roles, hire dates
- **Leave management** — request, approve/reject with email notifications
- **Payroll** — run payroll, auto-generate payslips, email to employees
- **Automated emails** — welcome, birthday, work anniversary greetings
- **Customizable email templates** — edit subject, HTML body, preview, test send

### 🤝 Customer Relationship Management (CRM)
- **Contacts & companies** — full contact profiles with activity history
- **Deal pipeline** — track deals through customizable stages
- **Pipeline analytics** — visual breakdown by stage and value

### 📊 Accounting
- **Invoices** — create, send, track status (draft → sent → paid → overdue)
- **Expenses** — log and categorize business expenses
- **Chart of accounts** — full double-entry bookkeeping structure
- **Financial reports** — revenue, outstanding invoices, cash flow

### 📁 Products
- **Product management** — track what you're building or selling
- **Task tracking** — kanban-style task boards per product
- **Progress analytics** — task completion, budget tracking

### ⚙️ System
- **Organization settings** — company profile, billing, timezone, currency
- **Email template editor** — full HTML editor with live preview and test sends
- **Email history log** — track every email sent with delivery status
- **Role-based access** — Clerk-powered auth with organization management
- **Mobile responsive** — works on phones, tablets, and desktops

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Auth | Clerk (organizations, SSO, user management) |
| Database | Neon (serverless PostgreSQL) |
| ORM | Drizzle ORM |
| Email | Resend |
| Charts | Recharts |
| Deployment | Vercel |

## Quick Start

### Prerequisites
- Node.js 18+
- A [Clerk](https://clerk.com) account (free tier works)
- A [Neon](https://neon.tech) database (free tier works)
- A [Resend](https://resend.com) API key (optional, for emails)

### 1. Clone and install

```bash
git clone https://github.com/tyy130/next-erp.git
cd next-erp
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Clerk (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (required)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Email (optional — emails silently no-op without this)
RESEND_API_KEY=re_...

# Cron security (any random string)
CRON_SECRET=your-random-secret-here
```

### 3. Push the database schema

```bash
npx drizzle-kit push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sign up, create an organization, and you're in.

### 5. Deploy to Vercel

```bash
vercel --prod
```

Connect your Clerk and Neon accounts in the Vercel dashboard for production env vars.

## Project Structure

```
src/
├── app/
│   ├── (auth)/            # Sign in / sign up pages
│   ├── (dashboard)/       # Main app (protected)
│   │   ├── dashboard/     # Overview with KPI cards + charts
│   │   ├── hrm/           # Employees, departments, leaves, payroll
│   │   ├── crm/           # Contacts, companies, deals
│   │   ├── accounting/    # Invoices, expenses, chart of accounts
│   │   ├── products/      # Product management + task tracking
│   │   └── settings/      # Org settings, email templates
│   └── api/               # API routes (cron, email, org)
├── components/
│   ├── dashboard/         # Recharts chart components
│   ├── layout/            # Sidebar, header
│   ├── ui/                # shadcn/ui primitives
│   └── hrm/               # HR-specific components
├── lib/                   # Email, resend, utilities
├── db/
│   └── schema/            # Drizzle schema (14 tables)
└── actions/               # Server actions
```

## Database Schema

14 tables across 5 modules:

- **HRM:** employees, departments, designations, leave_types, leave_requests, employee_notes, holidays, payroll_runs, payslips
- **CRM:** contacts, crm_companies, deals, pipelines, crm_activities, contact_groups
- **Accounting:** invoices, invoice_items, bills, bill_items, payments, chart_of_accounts, journals, journal_details, ledgers
- **Products:** projects, project_tasks
- **System:** email_templates, email_logs, organization_settings

## Roadmap

- [ ] Recurring invoices
- [ ] Time tracking
- [ ] Document/file attachments
- [ ] API keys for third-party integrations
- [ ] Webhook subscriptions
- [ ] Multi-currency support
- [ ] Advanced reporting with date ranges
- [ ] Import/export (CSV)
- [ ] Dark mode toggle

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](./LICENSE) © 2025 NextERP

---

Built with ❤️ by [TacticDev](https://tactidev.com)
