import { Resend } from "resend";

let _instance: Resend | null = null;

export function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_instance) _instance = new Resend(process.env.RESEND_API_KEY);
  return _instance;
}
