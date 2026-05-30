-- Migration: Update email_templates and create email_logs
-- Drop old table and recreate with new schema (safe: templates will be re-seeded)

DROP TABLE IF EXISTS email_templates CASCADE;

CREATE TYPE email_template_type AS ENUM ('welcome', 'birthday', 'anniversary', 'leave_decision', 'payslip');

CREATE TABLE email_templates (
  id serial PRIMARY KEY,
  type email_template_type NOT NULL UNIQUE,
  name varchar(200) NOT NULL,
  subject varchar(500) NOT NULL,
  body_html text NOT NULL,
  enabled boolean DEFAULT true,
  is_default boolean DEFAULT false,
  description text,
  available_vars text,
  org_id varchar(255),
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

CREATE TYPE email_log_status AS ENUM ('queued', 'sent', 'failed', 'bounced');

CREATE TABLE email_logs (
  id serial PRIMARY KEY,
  template_id integer REFERENCES email_templates(id),
  template_type varchar(100),
  to_email varchar(255) NOT NULL,
  to_name varchar(255),
  subject varchar(500) NOT NULL,
  status email_log_status DEFAULT 'queued',
  error_message text,
  resend_id varchar(255),
  org_id varchar(255),
  created_at timestamp DEFAULT NOW()
);

-- Insert default templates
INSERT INTO email_templates (type, name, subject, body_html, enabled, is_default, description, available_vars) VALUES
('welcome', 'Welcome Email',
 'Welcome to the team, {employee_name}! 🎉',
 '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Plus Jakarta Sans,Inter,sans-serif;background:#f9fafb;margin:0;padding:0}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}.header{background:#0f172a;padding:24px 32px}.header h2{color:#fff;margin:0;font-size:18px;font-weight:600;letter-spacing:-0.02em}.body{padding:32px;color:#374151;line-height:1.6;font-size:15px}.body h3{margin-top:0;color:#111827;font-size:20px}.footer{border-top:1px solid #e5e7eb;padding:16px 32px;font-size:12px;color:#9ca3af}.btn{display:inline-block;background:#0f172a;color:#fff!important;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:14px;margin-top:16px}</style></head><body><div class="wrap"><div class="header"><h2>{company_name}</h2></div><div class="body"><h3>Welcome aboard, {employee_name}!</h3><p>We are thrilled to have you join us{start_date} as <strong>{role}</strong>.</p><p>Your account has been set up. Use it to manage your leave requests, view payslips, and stay up to date with company news.</p>{login_prompt}<p>If you have any questions, reach out to HR and we will be happy to help.</p><p>Welcome to the family!</p></div><div class="footer">Sent by {company_name} ERP · Your all-in-one business platform</div></div></body></html>',
 true, true, 'Sent to new employees when they are added to the system',
 '{employee_name}, {role}, {start_date}, {company_name}, {login_url}, {login_prompt}'),

('birthday', 'Birthday Greeting',
 'Happy Birthday, {employee_name}! 🎉',
 '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Plus Jakarta Sans,Inter,sans-serif;background:#f9fafb;margin:0;padding:0}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}.header{background:#0f172a;padding:24px 32px}.header h2{color:#fff;margin:0;font-size:18px;font-weight:600;letter-spacing:-0.02em}.body{padding:32px;color:#374151;line-height:1.6;font-size:15px}.body h3{margin-top:0;color:#111827;font-size:20px}.footer{border-top:1px solid #e5e7eb;padding:16px 32px;font-size:12px;color:#9ca3af}</style></head><body><div class="wrap"><div class="header"><h2>{company_name}</h2></div><div class="body"><h3>Happy Birthday, {employee_name}!</h3><p>The whole team is wishing you an amazing day filled with joy and celebration. We are lucky to have you with us!</p><p>Enjoy your special day!</p></div><div class="footer">From the {company_name} team</div></div></body></html>',
 true, true,
 'Automated birthday greeting sent to employees',
 '{employee_name}, {company_name}'),

('anniversary', 'Work Anniversary',
 'Happy {milestone} Anniversary, {employee_name}! 🎂',
 '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Plus Jakarta Sans,Inter,sans-serif;background:#f9fafb;margin:0;padding:0}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}.header{background:#0f172a;padding:24px 32px}.header h2{color:#fff;margin:0;font-size:18px;font-weight:600;letter-spacing:-0.02em}.body{padding:32px;color:#374151;line-height:1.6;font-size:15px}.body h3{margin-top:0;color:#111827;font-size:20px}.footer{border-top:1px solid #e5e7eb;padding:16px 32px;font-size:12px;color:#9ca3af}</style></head><body><div class="wrap"><div class="header"><h2>{company_name}</h2></div><div class="body"><h3>Happy {milestone} Anniversary, {employee_name}!</h3><p>Today marks <strong>{milestone}</strong> since you joined the team. We are so grateful for everything you bring — your dedication, skill, and energy make a real difference.</p><p>Here is to many more!</p><p>With appreciation,<br/>The Team</p></div><div class="footer">Sent by {company_name} ERP</div></div></body></html>',
 true, true,
 'Automated work anniversary greeting sent on the employee hire date anniversary',
 '{employee_name}, {milestone}, {company_name}'),

('leave_decision', 'Leave Request Decision',
 'Your leave request has been {status}',
 '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Plus Jakarta Sans,Inter,sans-serif;background:#f9fafb;margin:0;padding:0}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}.header{background:#0f172a;padding:24px 32px}.header h2{color:#fff;margin:0;font-size:18px;font-weight:600;letter-spacing:-0.02em}.body{padding:32px;color:#374151;line-height:1.6;font-size:15px}.body h3{margin-top:0;color:#111827;font-size:20px}.badge{display:inline-block;border-radius:6px;padding:4px 10px;font-size:13px;font-weight:600}.badge.approved{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}.badge.rejected{background:#fef2f2;color:#991b1b;border:1px solid #fca5a5}.table{width:100%;border-collapse:collapse;margin:16px 0}.table th{background:#f9fafb;text-align:left;padding:8px 12px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border:1px solid #e5e7eb}.table td{padding:10px 12px;border:1px solid #e5e7eb;font-size:14px}.footer{border-top:1px solid #e5e7eb;padding:16px 32px;font-size:12px;color:#9ca3af}</style></head><body><div class="wrap"><div class="header"><h2>{company_name}</h2></div><div class="body"><h3>Leave Request {status_title}</h3><p>Hi {employee_name}, your {leave_type} request has been <strong>{status}</strong>.</p><table class="table"><tr><th>From</th><th>To</th><th>Days</th><th>Status</th></tr><tr><td>{start_date}</td><td>{end_date}</td><td>{days}</td><td><span class="badge {status_class}">{status}</span></td></tr></table>{status_message}</div><div class="footer">Sent by {company_name} ERP</div></div></body></html>',
 true, true,
 'Sent to employee when their leave request is approved or rejected',
 '{employee_name}, {status}, {status_title}, {status_class}, {status_message}, {leave_type}, {start_date}, {end_date}, {days}, {company_name}'),

('payslip', 'Payslip Notification',
 'Your payslip for {period_start} – {period_end}',
 '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Plus Jakarta Sans,Inter,sans-serif;background:#f9fafb;margin:0;padding:0}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}.header{background:#0f172a;padding:24px 32px}.header h2{color:#fff;margin:0;font-size:18px;font-weight:600;letter-spacing:-0.02em}.body{padding:32px;color:#374151;line-height:1.6;font-size:15px}.body h3{margin-top:0;color:#111827;font-size:20px}.table{width:100%;border-collapse:collapse;margin:16px 0}.table th{background:#f9fafb;text-align:left;padding:8px 12px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border:1px solid #e5e7eb}.table td{padding:10px 12px;border:1px solid #e5e7eb;font-size:14px}.footer{border-top:1px solid #e5e7eb;padding:16px 32px;font-size:12px;color:#9ca3af}</style></head><body><div class="wrap"><div class="header"><h2>{company_name}</h2></div><div class="body"><h3>Payslip — {period_start} to {period_end}</h3><p>Hi {employee_name}, your salary for this period has been processed.</p><table class="table"><tr><th>Item</th><th style="text-align:right">Amount</th></tr><tr><td>Gross Pay</td><td style="text-align:right">${gross_pay}</td></tr><tr><td>Deductions</td><td style="text-align:right;color:#dc2626">-${deductions}</td></tr><tr><td><strong>Net Pay</strong></td><td style="text-align:right"><strong>${net_pay}</strong></td></tr></table><p>Payment has been initiated to your registered bank account. Please allow 1–2 business days.</p></div><div class="footer">Sent by {company_name} ERP · Confidential</div></div></body></html>',
 true, true,
 'Sent to each employee when a payroll run is marked as paid',
 '{employee_name}, {period_start}, {period_end}, {gross_pay}, {deductions}, {net_pay}, {company_name}');
