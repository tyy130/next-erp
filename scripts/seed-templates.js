const { neon } = require("@neondatabase/serverless");
const fs = require("fs");

async function main() {
  const connStr = "postgresql://neondb_owner:npg_B4GKQbA3vyZY@ep-solitary-scene-apk7vwr5-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  
  const sql = neon(connStr);

  const templates = [
    {
      type: "welcome",
      name: "Welcome Email",
      subject: "Welcome to the team, {employee_name}! 🎉",
      description: "Sent to new employees when they are added to the system",
      available_vars: "{employee_name}, {role}, {start_date}, {company_name}, {login_url}",
      body_html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Plus Jakarta Sans',Inter,sans-serif;background:#f9fafb;margin:0;padding:0}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}.header{background:#0f172a;padding:24px 32px}.header h2{color:#fff;margin:0;font-size:18px;font-weight:600}.body{padding:32px;color:#374151;line-height:1.6;font-size:15px}.body h3{margin-top:0;color:#111827;font-size:20px}.footer{border-top:1px solid #e5e7eb;padding:16px 32px;font-size:12px;color:#9ca3af}.btn{display:inline-block;background:#0f172a;color:#fff!important;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:14px;margin-top:16px}</style></head><body><div class="wrap"><div class="header"><h2>{company_name}</h2></div><div class="body"><h3>Welcome aboard, {employee_name}!</h3><p>We are thrilled to have you join us{start_date_phrase} as <strong>{role}</strong>.</p><p>Your account has been set up. Use it to manage your leave requests, view payslips, and stay up to date with company news.</p>{login_prompt}<p>If you have any questions, reach out to HR and we will be happy to help.</p><p>Welcome to the family!</p></div><div class="footer">Sent by {company_name} ERP</div></div></body></html>`
    },
    {
      type: "birthday",
      name: "Birthday Greeting",
      subject: "Happy Birthday, {employee_name}! 🎉",
      description: "Automated birthday greeting sent to employees",
      available_vars: "{employee_name}, {company_name}",
      body_html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Plus Jakarta Sans',Inter,sans-serif;background:#f9fafb;margin:0;padding:0}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}.header{background:#0f172a;padding:24px 32px}.header h2{color:#fff;margin:0;font-size:18px;font-weight:600}.body{padding:32px;color:#374151;line-height:1.6;font-size:15px}.body h3{margin-top:0;color:#111827;font-size:20px}.footer{border-top:1px solid #e5e7eb;padding:16px 32px;font-size:12px;color:#9ca3af}</style></head><body><div class="wrap"><div class="header"><h2>{company_name}</h2></div><div class="body"><h3>Happy Birthday, {employee_name}!</h3><p>The whole team is wishing you an amazing day filled with joy and celebration. We are lucky to have you!</p><p>Enjoy your special day!</p></div><div class="footer">From the {company_name} team</div></div></body></html>`
    },
    {
      type: "anniversary",
      name: "Work Anniversary",
      subject: "Happy {milestone} Anniversary, {employee_name}! 🎂",
      description: "Automated work anniversary greeting sent on the employee hire date anniversary",
      available_vars: "{employee_name}, {milestone}, {company_name}",
      body_html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Plus Jakarta Sans',Inter,sans-serif;background:#f9fafb;margin:0;padding:0}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}.header{background:#0f172a;padding:24px 32px}.header h2{color:#fff;margin:0;font-size:18px;font-weight:600}.body{padding:32px;color:#374151;line-height:1.6;font-size:15px}.body h3{margin-top:0;color:#111827;font-size:20px}.footer{border-top:1px solid #e5e7eb;padding:16px 32px;font-size:12px;color:#9ca3af}</style></head><body><div class="wrap"><div class="header"><h2>{company_name}</h2></div><div class="body"><h3>Happy {milestone} Anniversary, {employee_name}!</h3><p>Today marks <strong>{milestone}</strong> since you joined. We are so grateful for everything you bring — your dedication, skill, and energy make a real difference.</p><p>Here is to many more!</p></div><div class="footer">Sent by {company_name} ERP</div></div></body></html>`
    },
    {
      type: "leave_decision",
      name: "Leave Request Decision",
      subject: "Your leave request has been {status}",
      description: "Sent to employee when leave request is approved or rejected",
      available_vars: "{employee_name}, {status}, {leave_type}, {start_date}, {end_date}, {days}, {company_name}",
      body_html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Plus Jakarta Sans',Inter,sans-serif;background:#f9fafb;margin:0;padding:0}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}.header{background:#0f172a;padding:24px 32px}.header h2{color:#fff;margin:0;font-size:18px;font-weight:600}.body{padding:32px;color:#374151;line-height:1.6;font-size:15px}.body h3{margin-top:0;color:#111827;font-size:20px}.badge{display:inline-block;border-radius:6px;padding:4px 10px;font-size:13px;font-weight:600}.badge-approved{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}.badge-rejected{background:#fef2f2;color:#991b1b;border:1px solid #fca5a5}.table{width:100%;border-collapse:collapse;margin:16px 0}.table th{background:#f9fafb;text-align:left;padding:8px 12px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;border:1px solid #e5e7eb}.table td{padding:10px 12px;border:1px solid #e5e7eb;font-size:14px}.footer{border-top:1px solid #e5e7eb;padding:16px 32px;font-size:12px;color:#9ca3af}</style></head><body><div class="wrap"><div class="header"><h2>{company_name}</h2></div><div class="body"><h3>Leave Request {status_title}</h3><p>Hi {employee_name}, your {leave_type} request has been <strong>{status}</strong>.</p><table class="table"><tr><th>From</th><th>To</th><th>Days</th><th>Status</th></tr><tr><td>{start_date}</td><td>{end_date}</td><td>{days}</td><td><span class="badge badge-{status}">{status}</span></td></tr></table>{status_message}</div><div class="footer">Sent by {company_name} ERP</div></div></body></html>`
    },
    {
      type: "payslip",
      name: "Payslip Notification",
      subject: "Your payslip for {period_start} – {period_end}",
      description: "Sent to each employee when a payroll run is marked as paid",
      available_vars: "{employee_name}, {period_start}, {period_end}, {gross_pay}, {deductions}, {net_pay}, {company_name}",
      body_html: [
        '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:\'Plus Jakarta Sans\',Inter,sans-serif;background:#f9fafb;margin:0;padding:0}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}.header{background:#0f172a;padding:24px 32px}.header h2{color:#fff;margin:0;font-size:18px;font-weight:600}.body{padding:32px;color:#374151;line-height:1.6;font-size:15px}.body h3{margin-top:0;color:#111827;font-size:20px}.table{width:100%;border-collapse:collapse;margin:16px 0}.table th{background:#f9fafb;text-align:left;padding:8px 12px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;border:1px solid #e5e7eb}.table td{padding:10px 12px;border:1px solid #e5e7eb;font-size:14px}.footer{border-top:1px solid #e5e7eb;padding:16px 32px;font-size:12px;color:#9ca3af}</style></head><body><div class="wrap"><div class="header"><h2>{company_name}</h2></div><div class="body"><h3>Payslip &mdash; {period_start} to {period_end}</h3><p>Hi {employee_name}, your salary has been processed.</p><table class="table"><tr><th>Item</th><th style="text-align:right">Amount</th></tr><tr><td>Gross Pay</td><td style="text-align:right">{gross_pay}</td></tr><tr><td>Deductions</td><td style="text-align:right;color:#dc2626">-{deductions}</td></tr><tr><td><strong>Net Pay</strong></td><td style="text-align:right"><strong>{net_pay}</strong></td></tr></table><p>Payment initiated. Allow 1&ndash;2 business days.</p></div><div class="footer">Sent by {company_name} ERP &middot; Confidential</div></div></body></html>'
      ].join('')
    }
  ];

  for (const t of templates) {
    await sql`
      INSERT INTO email_templates (type, name, subject, body_html, enabled, is_default, description, available_vars)
      VALUES (${t.type}, ${t.name}, ${t.subject}, ${t.body_html}, true, true, ${t.description}, ${t.available_vars})
    `;
    console.log(`Seeded: ${t.type}`);
  }

  console.log("All default templates seeded successfully");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
