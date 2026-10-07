"use client";

import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  LockKeyhole,
  Pencil,
  RotateCcw,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { surveyInstrument } from "@/lib/instrument";
import {
  answerForDisplay,
  cleanVisibleAnswers,
  isQuestionAnswered,
  isQuestionVisible,
  questionError,
} from "@/lib/survey";
import type { AnswerValue, Answers, SurveyQuestion } from "@/lib/types";

const DRAFT_KEY = "crece-community-outreach-draft-v2";
const CONTACT_FIELDS = new Set([
  "nombre_preferido",
  "numero_celular",
  "correo_electronico",
  "autoriza_contacto",
  "medio_contacto",
  "horario_contacto",
]);

type View = "intro" | "survey" | "review" | "submitted";
type ReferralContext = {
  organization: string | null;
  leaderCode: string | null;
  referralCode: string | null;
};

function QuestionControl({
  question,
  answers,
  onChange,
  invalid,
}: {
  question: SurveyQuestion;
  answers: Answers;
  onChange: (key: string, value: AnswerValue) => void;
  invalid: boolean;
}) {
  const value = answers[question.id];
  const describedBy = invalid ? `${question.id}-error` : undefined;

  if (question.type === "text" || question.type === "textarea") {
    const shared = {
      id: question.id,
      className: "text-input",
      value: typeof value === "string" ? value : "",
      placeholder: question.placeholder,
      "aria-invalid": invalid,
      "aria-describedby": describedBy,
      maxLength: question.maxLength,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const nextValue = question.inputMode === "tel"
          ? event.target.value.replace(/\D/g, "").slice(0, question.maxLength)
          : event.target.value;
        onChange(question.id, nextValue);
      },
    };
    return question.type === "textarea" ? (
      <textarea {...shared} rows={4} />
    ) : (
      <input {...shared} type="text" inputMode={question.inputMode} />
    );
  }

  const isMultiple = question.type === "multiple";
  const selectedValues = Array.isArray(value) ? value : [];
  return (
    <div
      className="option-grid"
      role={isMultiple ? "group" : "radiogroup"}
      aria-describedby={describedBy}
    >
      {question.options?.map((option) => {
        const selected = isMultiple ? selectedValues.includes(option.value) : value === option.value;
        const otherValue = answers[`${question.id}__otro`];
        return (
          <div className="option-wrap" key={option.value}>
            <label className={`option ${isMultiple ? "checkbox-option" : ""} ${selected ? "selected" : ""}`}>
              <input
                type={isMultiple ? "checkbox" : "radio"}
                name={question.id}
                value={option.value}
                checked={selected}
                onChange={() => {
                  if (!isMultiple) {
                    onChange(question.id, option.value);
                    return;
                  }
                  let next = selected
                    ? selectedValues.filter((item) => item !== option.value)
                    : [...selectedValues, option.value];
                  if (option.value === "Prefiero no responder" && !selected) {
                    next = [option.value];
                  } else if (option.value !== "Prefiero no responder") {
                    next = next.filter((item) => item !== "Prefiero no responder");
                  }
                  onChange(question.id, next);
                }}
              />
              <span className="radio-mark" aria-hidden="true" />
              <span>{option.label}</span>
            </label>
            {selected && option.hasTextInput ? (
              <input
                className="text-input other-input"
                type="text"
                value={typeof otherValue === "string" ? otherValue : ""}
                placeholder="Especifique"
                aria-label={`Especifique la respuesta para ${question.prompt}`}
                onChange={(event) => onChange(`${question.id}__otro`, event.target.value)}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="header-copy">
        <p className="eyebrow">PROYECTO CRECE · VINCULACIÓN COMUNITARIA</p>
        <h1>Conectemos con su comunidad</h1>
        <p className="header-lead">
          Una iniciativa de ONUSIDA Perú desarrollada junto con organizaciones de base comunitaria.
        </p>
      </div>
      <div className="brand-lockup" aria-label="ONUSIDA Perú y Proyecto CRECE">
        <Image
          className="onusida-logo"
          src="/assets/logo-onusida.png"
          width={479}
          height={221}
          priority
          alt="ONUSIDA"
        />
        <Image
          className="crece-logo"
          src="/assets/logo-crece.png"
          width={215}
          height={218}
          priority
          alt="Proyecto CRECE"
        />
      </div>
    </header>
  );
}

export default function QuestionnaireApp() {
  const [view, setView] = useState<View>("intro");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [consented, setConsented] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewSubmission, setPreviewSubmission] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [context, setContext] = useState<ReferralContext>({
    organization: null,
    leaderCode: null,
    referralCode: null,
  });
  const topRef = useRef<HTMLDivElement>(null);

  const allQuestions = useMemo(
    () => surveyInstrument.sections.flatMap((section) => section.questions),
    [],
  );
  const currentSection = surveyInstrument.sections[sectionIndex];
  const visibleQuestions = currentSection.questions.filter((question) =>
    isQuestionVisible(question, answers),
  );
  const overallVisibleQuestions = allQuestions.filter((question) =>
    isQuestionVisible(question, answers),
  );
  const answeredCount = overallVisibleQuestions.filter((question) =>
    isQuestionAnswered(question, answers),
  ).length;
  const progress = Math.round((answeredCount / overallVisibleQuestions.length) * 100) || 0;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const organization = params.get("obc");
      setContext({
        organization,
        leaderCode: params.get("lider"),
        referralCode: params.get("ref"),
      });
      if (organization) {
        setAnswers((current) => current.nombre_organizacion_obc
          ? current
          : { ...current, nombre_organizacion_obc: organization });
      }

      const rawDraft = window.sessionStorage.getItem(DRAFT_KEY);
      if (!rawDraft) return;
      try {
        const draft = JSON.parse(rawDraft) as {
          answers?: Answers;
          sectionIndex?: number;
          consented?: boolean;
        };
        if (draft.answers) setAnswers(draft.answers);
        if (typeof draft.sectionIndex === "number") {
          setSectionIndex(Math.min(draft.sectionIndex, surveyInstrument.sections.length - 1));
        }
        if (draft.consented) setConsented(true);
      } catch {
        window.sessionStorage.removeItem(DRAFT_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!consented || view === "submitted") return;
    window.sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ answers, sectionIndex, consented }),
    );
  }, [answers, consented, sectionIndex, view]);

  function updateAnswer(key: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setTouched((current) => {
      const next = new Set(current);
      next.delete(key.replace(/__otro$/, ""));
      return next;
    });
  }

  function moveToTop() {
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function continueSection() {
    const invalid = visibleQuestions.filter((question) => questionError(question, answers));
    if (invalid.length > 0) {
      setTouched((current) => new Set([...current, ...invalid.map((question) => question.id)]));
      requestAnimationFrame(() => document.querySelector<HTMLElement>(".question.has-error")?.focus());
      return;
    }
    if (sectionIndex === surveyInstrument.sections.length - 1) setView("review");
    else setSectionIndex((current) => current + 1);
    moveToTop();
  }

  function previousSection() {
    if (sectionIndex === 0) setView("intro");
    else setSectionIndex((current) => current - 1);
    moveToTop();
  }

  function editSection(index: number) {
    setSectionIndex(index);
    setView("survey");
    moveToTop();
  }

  async function submitSurvey() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const cleaned = cleanVisibleAnswers(answers, allQuestions);
      const authorizesContact = cleaned.autoriza_contacto === "Sí";
      const contact = {
        authorized: authorizesContact,
        preferredName: String(cleaned.nombre_preferido ?? ""),
        phone: String(cleaned.numero_celular ?? ""),
        email: String(cleaned.correo_electronico ?? ""),
        method: authorizesContact ? String(cleaned.medio_contacto ?? "") : null,
        availability: authorizesContact && Array.isArray(cleaned.horario_contacto)
          ? cleaned.horario_contacto
          : [],
      };
      const analyticalAnswers = Object.fromEntries(
        Object.entries(cleaned).filter(([key]) => !CONTACT_FIELDS.has(key)),
      );

      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instrumentId: surveyInstrument.id,
          instrumentVersion: surveyInstrument.version,
          consented: true,
          context,
          answers: analyticalAnswers,
          contact,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        preview?: boolean;
        submissionId?: string;
      };
      if (!response.ok) throw new Error(payload.error ?? "No se pudo registrar la respuesta.");
      setPreviewSubmission(Boolean(payload.preview));
      setSubmissionId(payload.submissionId ?? null);
      setView("submitted");
      window.sessionStorage.removeItem(DRAFT_KEY);
      moveToTop();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo registrar la respuesta.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetSurvey() {
    window.sessionStorage.removeItem(DRAFT_KEY);
    setAnswers({});
    setTouched(new Set());
    setConsented(false);
    setSectionIndex(0);
    setSubmissionId(null);
    setPreviewSubmission(false);
    setView("intro");
    moveToTop();
  }

  const hasReferral = context.organization || context.leaderCode || context.referralCode;

  return (
    <main className="page-shell">
      <div ref={topRef} />
      <Header />

      {view === "intro" ? (
        <section className="intro-layout" aria-labelledby="intro-title">
          <div className="intro-copy">
            <p className="section-kicker">Encuesta breve · 2 a 3 minutos</p>
            <h2 id="intro-title">Queremos conocer sus intereses</h2>
            <p>{surveyInstrument.description}</p>
            {hasReferral ? (
              <div className="activity-context referral-context">
                <strong>Invitación comunitaria</strong>
                {context.organization ? <span>Organización: {context.organization}</span> : null}
                {context.referralCode ? <span>Código: {context.referralCode}</span> : null}
              </div>
            ) : null}
          </div>
          <div className="privacy-panel">
            <ShieldCheck aria-hidden="true" />
            <h3>Participación voluntaria</h3>
            <p>
              Sus respuestas serán utilizadas por el proyecto CRECE para conocer redes e intereses comunitarios y compartir futuras convocatorias. El proyecto CRECE es una iniciativa de ONUSIDA Perú desarrollada junto con organizaciones de base comunitaria.
            </p>
            <label className="consent-check">
              <input
                type="checkbox"
                checked={consented}
                onChange={(event) => setConsented(event.target.checked)}
              />
              <span>He leído la información y acepto participar.</span>
            </label>
            <button
              className="button primary wide"
              type="button"
              disabled={!consented}
              onClick={() => {
                setView("survey");
                moveToTop();
              }}
            >
              Comenzar <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </section>
      ) : null}

      {view === "survey" ? (
        <div className="survey-layout">
          <aside className="stepper" aria-label="Secciones del cuestionario">
            {context.organization ? <div className="profile-chip">{context.organization}</div> : null}
            <div className="progress-copy"><span>Avance</span><strong>{progress}%</strong></div>
            <div className="progress-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
            <ol>
              {surveyInstrument.sections.map((section, index) => (
                <li className={index === sectionIndex ? "active" : index < sectionIndex ? "done" : ""} key={section.id}>
                  <span className="step-number">{index < sectionIndex ? <Check aria-hidden="true" /> : index + 1}</span>
                  <span>{section.shortTitle}</span>
                </li>
              ))}
            </ol>
            <p className="draft-note"><LockKeyhole aria-hidden="true" /> El avance se conserva durante esta sesión.</p>
          </aside>

          <section className="form-panel" aria-labelledby="section-title">
            <div className="form-heading">
              <p className="section-kicker">Sección {sectionIndex + 1} de {surveyInstrument.sections.length}</p>
              <h2 id="section-title">{currentSection.title}</h2>
              <p>{currentSection.description}</p>
              <p className="required-note"><span aria-hidden="true">*</span> Pregunta obligatoria</p>
            </div>
            <div className="question-list">
              {visibleQuestions.map((question, index) => {
                const error = touched.has(question.id) ? questionError(question, answers) : null;
                return (
                  <div className={`question ${error ? "has-error" : ""}`} key={question.id} tabIndex={error ? -1 : undefined}>
                    <div className="question-heading">
                      <span className="question-index">{index + 1}</span>
                      <div>
                        <label htmlFor={question.type === "text" || question.type === "textarea" ? question.id : undefined}>
                          {question.prompt} {question.required ? <span className="required-mark">*</span> : null}
                        </label>
                        {question.helper ? <p>{question.helper}</p> : null}
                      </div>
                    </div>
                    <QuestionControl question={question} answers={answers} onChange={updateAnswer} invalid={Boolean(error)} />
                    {error ? <p className="field-error" id={`${question.id}-error`}><AlertCircle aria-hidden="true" /> {error}</p> : null}
                  </div>
                );
              })}
            </div>
            <div className="form-actions">
              <button className="button secondary" type="button" onClick={previousSection}><ArrowLeft aria-hidden="true" /> Atrás</button>
              <button className="button primary" type="button" onClick={continueSection}>
                {sectionIndex === surveyInstrument.sections.length - 1 ? "Revisar respuestas" : "Continuar"}
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {view === "review" ? (
        <section className="review-panel" aria-labelledby="review-title">
          <div className="review-heading">
            <ClipboardCheck aria-hidden="true" />
            <div><p className="section-kicker">Último paso</p><h2 id="review-title">Revise sus respuestas</h2><p>Puede volver a cualquier sección antes de enviar el formulario.</p></div>
          </div>
          {hasReferral ? (
            <div className="review-profile">
              <span>Invitación asociada</span>
              <strong>{[context.organization, context.referralCode].filter(Boolean).join(" · ")}</strong>
            </div>
          ) : null}
          <div className="review-sections">
            {surveyInstrument.sections.map((section, index) => (
              <section className="review-section" key={section.id}>
                <div className="review-section-head"><h3>{section.title}</h3><button className="icon-text-button" type="button" onClick={() => editSection(index)}><Pencil aria-hidden="true" /> Editar</button></div>
                <dl>
                  {section.questions.filter((question) => isQuestionVisible(question, answers)).map((question) => (
                    <div key={question.id}><dt>{question.prompt}</dt><dd>{answerForDisplay(question, answers)}</dd></div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
          {submitError ? <p className="submit-error"><AlertCircle aria-hidden="true" /> {submitError}</p> : null}
          <div className="form-actions">
            <button className="button secondary" type="button" onClick={() => editSection(surveyInstrument.sections.length - 1)}><ArrowLeft aria-hidden="true" /> Atrás</button>
            <button className="button primary" type="button" disabled={submitting} onClick={submitSurvey}>{submitting ? "Enviando..." : "Enviar respuestas"} <Check aria-hidden="true" /></button>
          </div>
        </section>
      ) : null}

      {view === "submitted" ? (
        <section className="success-panel" aria-labelledby="success-title">
          <CheckCircle2 aria-hidden="true" />
          <p className="section-kicker">Formulario completado</p>
          <h2 id="success-title">{surveyInstrument.confirmation}</h2>
          {previewSubmission ? <p className="preview-message">Esta es una versión de demostración. La respuesta no fue enviada a una base de datos.</p> : <p>La respuesta fue registrada correctamente.</p>}
          {submissionId ? <small>Referencia: {submissionId.slice(0, 8).toUpperCase()}</small> : null}
          <div className="success-actions">
            <button className="button secondary" type="button" onClick={resetSurvey}><RotateCcw aria-hidden="true" /> Registrar otra respuesta</button>
            <a className="button primary" href="https://portal-herramientas-crece.vercel.app/"><Share2 aria-hidden="true" /> Ver herramientas CRECE</a>
          </div>
        </section>
      ) : null}

      <footer className="site-footer"><span>Proyecto CRECE</span><span>Monitoreo y Evaluación</span></footer>
    </main>
  );
}
