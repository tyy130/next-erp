CREATE TYPE "public"."employee_status" AS ENUM('active', 'inactive', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."leave_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('single', 'married', 'divorced', 'widowed');--> statement-breakpoint
CREATE TYPE "public"."pay_type" AS ENUM('hourly', 'salary');--> statement-breakpoint
CREATE TYPE "public"."payroll_status" AS ENUM('draft', 'processing', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('call', 'email', 'note', 'meeting', 'task');--> statement-breakpoint
CREATE TYPE "public"."contact_type" AS ENUM('contact', 'company');--> statement-breakpoint
CREATE TYPE "public"."deal_stage" AS ENUM('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."account_type" AS ENUM('asset', 'liability', 'equity', 'income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."bill_status" AS ENUM('draft', 'received', 'partial', 'paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'done');--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"parent_id" integer,
	"lead_id" varchar(255),
	"status" boolean DEFAULT true,
	"org_id" varchar(255) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "designations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"status" boolean DEFAULT true,
	"org_id" varchar(255) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"comment" text NOT NULL,
	"created_by" varchar(255),
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"employee_id" varchar(20),
	"department_id" integer,
	"designation_id" integer,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"mobile" varchar(20),
	"date_of_birth" date,
	"gender" "gender",
	"marital_status" "marital_status",
	"nationality" varchar(100),
	"hire_date" date,
	"type" varchar(50) DEFAULT 'employee',
	"status" "employee_status" DEFAULT 'active',
	"salary" numeric(10, 2),
	"pay_rate" numeric(10, 2),
	"pay_type" "pay_type" DEFAULT 'salary',
	"avatar_url" text,
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100),
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "holidays" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"start" date NOT NULL,
	"end" date,
	"recurring" boolean DEFAULT false,
	"description" text,
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"leave_type_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days" integer NOT NULL,
	"reason" text,
	"status" "leave_status" DEFAULT 'pending',
	"approved_by" varchar(255),
	"approved_at" timestamp,
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leave_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"color" varchar(10) DEFAULT '#3b82f6',
	"max_days" integer DEFAULT 15,
	"carry_forward" boolean DEFAULT false,
	"require_approval" boolean DEFAULT true,
	"status" boolean DEFAULT true,
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payroll_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"status" "payroll_status" DEFAULT 'draft',
	"total_gross" numeric(15, 2) DEFAULT '0',
	"total_deductions" numeric(15, 2) DEFAULT '0',
	"total_net" numeric(15, 2) DEFAULT '0',
	"notes" text,
	"org_id" varchar(255) NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payslips" (
	"id" serial PRIMARY KEY NOT NULL,
	"payroll_run_id" integer NOT NULL,
	"employee_id" integer NOT NULL,
	"employee_name" varchar(255) NOT NULL,
	"gross_pay" numeric(15, 2) NOT NULL,
	"deductions" numeric(15, 2) DEFAULT '0',
	"net_pay" numeric(15, 2) NOT NULL,
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "activity_type" NOT NULL,
	"title" varchar(255),
	"message" text,
	"contact_id" integer,
	"company_id" integer,
	"deal_id" integer,
	"created_by" varchar(255),
	"due_date" timestamp,
	"completed" boolean DEFAULT false,
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contact_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"org_id" varchar(255) NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "contact_type" DEFAULT 'contact',
	"first_name" varchar(100),
	"last_name" varchar(100),
	"email" varchar(255),
	"phone" varchar(50),
	"mobile" varchar(50),
	"website" varchar(255),
	"company_id" integer,
	"job_title" varchar(150),
	"group_id" integer,
	"owner_id" varchar(255),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100),
	"zip" varchar(20),
	"notes" text,
	"status" varchar(50) DEFAULT 'active',
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"website" varchar(255),
	"industry" varchar(100),
	"employees" integer,
	"annual_revenue" numeric(15, 2),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100),
	"zip" varchar(20),
	"notes" text,
	"owner_id" varchar(255),
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"value" numeric(15, 2),
	"stage" "deal_stage" DEFAULT 'lead',
	"contact_id" integer,
	"company_id" integer,
	"pipeline_id" integer,
	"owner_id" varchar(255),
	"close_date" date,
	"probability" integer DEFAULT 0,
	"notes" text,
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pipelines" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"stages" jsonb DEFAULT '["Lead","Qualified","Proposal","Negotiation","Won","Lost"]'::jsonb,
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bill_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"bill_id" integer NOT NULL,
	"ledger_id" integer,
	"description" text NOT NULL,
	"qty" numeric(10, 2) NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"line_total" numeric(15, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"bill_number" varchar(50) NOT NULL,
	"vendor_id" integer,
	"vendor_name" varchar(255),
	"trn_date" date NOT NULL,
	"due_date" date,
	"billing_address" text,
	"discount" numeric(10, 2) DEFAULT '0',
	"subtotal" numeric(15, 2) NOT NULL,
	"tax_total" numeric(15, 2) DEFAULT '0',
	"total" numeric(15, 2) NOT NULL,
	"amount_due" numeric(15, 2) NOT NULL,
	"status" "bill_status" DEFAULT 'draft',
	"notes" text,
	"org_id" varchar(255) NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chart_of_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255),
	"type" "account_type" NOT NULL,
	"parent_id" integer,
	"system" boolean DEFAULT false,
	"status" boolean DEFAULT true,
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"description" text NOT NULL,
	"qty" numeric(10, 2) NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"line_total" numeric(15, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"contact_id" integer,
	"contact_name" varchar(255),
	"trn_date" date NOT NULL,
	"due_date" date,
	"billing_address" text,
	"discount" numeric(10, 2) DEFAULT '0',
	"discount_type" varchar(20) DEFAULT 'flat',
	"subtotal" numeric(15, 2) NOT NULL,
	"tax_total" numeric(15, 2) DEFAULT '0',
	"total" numeric(15, 2) NOT NULL,
	"amount_due" numeric(15, 2) NOT NULL,
	"status" "invoice_status" DEFAULT 'draft',
	"notes" text,
	"org_id" varchar(255) NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "journal_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"journal_id" integer NOT NULL,
	"ledger_id" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "journals" (
	"id" serial PRIMARY KEY NOT NULL,
	"trn_date" date NOT NULL,
	"ref" varchar(255),
	"narration" text,
	"org_id" varchar(255) NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ledgers" (
	"id" serial PRIMARY KEY NOT NULL,
	"chart_id" integer NOT NULL,
	"code" varchar(50),
	"name" varchar(255) NOT NULL,
	"system" boolean DEFAULT false,
	"balance" numeric(15, 2) DEFAULT '0',
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer,
	"amount" numeric(15, 2) NOT NULL,
	"payment_date" date NOT NULL,
	"method" varchar(50) DEFAULT 'bank_transfer',
	"reference" varchar(255),
	"notes" text,
	"org_id" varchar(255) NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'todo',
	"priority" "task_priority" DEFAULT 'medium',
	"assignee_id" varchar(255),
	"assignee_name" varchar(255),
	"due_date" date,
	"org_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'planning',
	"client_name" varchar(255),
	"budget" numeric(15, 2),
	"start_date" date,
	"end_date" date,
	"manager_id" varchar(255),
	"org_id" varchar(255) NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"body_html" text NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false,
	"org_id" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "email_templates_key_unique" UNIQUE("key")
);
