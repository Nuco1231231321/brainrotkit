"use client";

import { Send } from "lucide-react";
import type { FormEvent } from "react";
import { siteConfig } from "@/lib/site";

export function ContactForm() {
  function openSupportEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name") ?? "").trim();
    const email = String(fields.get("email") ?? "").trim();
    const topic = String(fields.get("topic") ?? "Product support").trim();
    const message = String(fields.get("message") ?? "").trim();
    const subject = encodeURIComponent(`[${topic}] BrainrotKit support request`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${siteConfig.supportEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <form className="contact-form" onSubmit={openSupportEmail}>
      <div className="field-grid two">
        <div className="field-group"><label htmlFor="contact-name">Name</label><input id="contact-name" name="name" required autoComplete="name" /></div>
        <div className="field-group"><label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" required autoComplete="email" /></div>
      </div>
      <div className="field-group"><label htmlFor="contact-topic">Topic</label><select id="contact-topic" name="topic" defaultValue="Product support"><option>Product support</option><option>Billing</option><option>Safety</option><option>Copyright</option><option>Data deletion</option></select></div>
      <div className="field-group"><label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" required rows={6} aria-describedby="contact-help" /></div>
      <p id="contact-help">Do not include passwords, card numbers or full private document contents.</p>
      <button type="submit" className="button-primary"><Send aria-hidden="true" size={16} /> Open email request</button>
    </form>
  );
}
