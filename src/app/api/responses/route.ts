import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

const answerSchema = z.union([
  z.string().max(4000),
  z.array(z.string().max(500)).max(20),
]);

const contactSchema = z
  .object({
    authorized: z.boolean(),
    preferredName: z.string().trim().min(1).max(200),
    phone: z.string().regex(/^9\d{8}$/),
    email: z.union([z.literal(""), z.string().email().max(254)]),
    method: z.enum(["WhatsApp", "Correo electrónico", "Llamada telefónica"]).nullable(),
    availability: z.array(z.string().max(80)).max(10),
  })
  .strict()
  .superRefine((contact, context) => {
    if (contact.authorized && !contact.method) {
      context.addIssue({
        code: "custom",
        path: ["method"],
        message: "Seleccione el medio de contacto preferido.",
      });
    }
  });

const submissionSchema = z.object({
  instrumentId: z.literal("crece-vinculacion-comunitaria"),
  instrumentVersion: z.string().min(1).max(40),
  consented: z.literal(true),
  context: z
    .object({
      organization: z.string().max(200).nullable(),
      leaderCode: z.string().max(120).nullable(),
      referralCode: z.string().max(120).nullable(),
    })
    .strict(),
  answers: z.record(z.string(), answerSchema),
  contact: contactSchema,
});

export async function POST(request: Request) {
  const parsed = submissionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La respuesta contiene campos incompletos o con un formato no válido." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ preview: true, submissionId: crypto.randomUUID() });
  }

  const { data, error } = await supabase
    .from("survey_submissions")
    .insert({
      instrument_id: parsed.data.instrumentId,
      instrument_version: parsed.data.instrumentVersion,
      context: {
        ...parsed.data.context,
        authorizedContact: parsed.data.contact,
      },
      answers: parsed.data.answers,
      source: "web_app",
      status: "received",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Unable to store community outreach submission", error);
    return NextResponse.json(
      { error: "No se pudo registrar la respuesta. Intente nuevamente." },
      { status: 500 },
    );
  }

  return NextResponse.json({ preview: false, submissionId: data.id });
}
