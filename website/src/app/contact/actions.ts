"use server";

import { redirect } from "next/navigation";
import { createEnquiry } from "@/lib/store/db";

export async function submitEnquiryAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !message) {
    redirect("/contact?error=missing");
  }

  const enquiry = createEnquiry({
    name,
    email,
    phone,
    subject: subject || "General enquiry",
    message,
  });

  redirect(`/contact?sent=1&id=${enquiry.id}`);
}
