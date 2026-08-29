"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { submitEnquiryAction } from "@/app/contact/actions";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a contact number"),
  subject: z.string().min(2, "Choose a subject"),
  message: z.string().min(10, "Please share a bit more detail"),
});

type FormValues = z.infer<typeof schema>;

export function EnquiryForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "Stay enquiry",
      message: "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        const data = new FormData();
        Object.entries(values).forEach(([key, value]) => data.set(key, value));
        await submitEnquiryAction(data);
      })}
    >
      <label className="block text-sm text-muted">
        Name *
        <input
          {...register("name")}
          className="mt-1 w-full border border-line bg-fog px-3 py-2 text-pine outline-none focus:border-lichen"
        />
        {errors.name ? (
          <span className="mt-1 block text-xs text-pine">{errors.name.message}</span>
        ) : null}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-muted">
          Email *
          <input
            type="email"
            {...register("email")}
            className="mt-1 w-full border border-line bg-fog px-3 py-2 text-pine outline-none focus:border-lichen"
          />
          {errors.email ? (
            <span className="mt-1 block text-xs text-pine">
              {errors.email.message}
            </span>
          ) : null}
        </label>
        <label className="block text-sm text-muted">
          Phone *
          <input
            {...register("phone")}
            className="mt-1 w-full border border-line bg-fog px-3 py-2 text-pine outline-none focus:border-lichen"
          />
          {errors.phone ? (
            <span className="mt-1 block text-xs text-pine">
              {errors.phone.message}
            </span>
          ) : null}
        </label>
      </div>
      <label className="block text-sm text-muted">
        Subject *
        <select
          {...register("subject")}
          className="mt-1 w-full border border-line bg-fog px-3 py-2 text-pine outline-none focus:border-lichen"
        >
          <option>Stay enquiry</option>
          <option>Availability question</option>
          <option>Directions / transfers</option>
          <option>Experiences</option>
          <option>Other</option>
        </select>
      </label>
      <label className="block text-sm text-muted">
        Message *
        <textarea
          rows={5}
          {...register("message")}
          className="mt-1 w-full border border-line bg-fog px-3 py-2 text-pine outline-none focus:border-lichen"
        />
        {errors.message ? (
          <span className="mt-1 block text-xs text-pine">
            {errors.message.message}
          </span>
        ) : null}
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-pine px-6 py-3 text-sm text-fog transition hover:bg-pine-soft disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : "Submit enquiry"}
      </button>
    </form>
  );
}
