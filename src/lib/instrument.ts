import type { SurveyInstrument, SurveyOption } from "@/lib/types";

const other: SurveyOption = { value: "Otro", label: "Otro", hasTextInput: true };

const communityTopics: SurveyOption[] = [
  { value: "Derechos humanos", label: "Derechos humanos" },
  { value: "Igualdad de género", label: "Igualdad de género" },
  { value: "Diversidad sexual y de género", label: "Diversidad sexual y de género" },
  { value: "Salud sexual y prevención del VIH", label: "Salud sexual y prevención del VIH" },
  { value: "Prevención de violencias", label: "Prevención de violencias" },
  { value: "Migración y trata de personas", label: "Migración y trata de personas" },
  { value: "Trabajo sexual y derechos", label: "Trabajo sexual y derechos" },
  { value: "Liderazgo e incidencia", label: "Liderazgo e incidencia" },
  { value: "Fortalecimiento comunitario", label: "Fortalecimiento comunitario" },
  other,
];

export const surveyInstrument: SurveyInstrument = {
  id: "crece-vinculacion-comunitaria",
  version: "2026-10-v1",
  title: "Encuesta breve de vinculación comunitaria",
  description:
    "Queremos conocer su vínculo con las organizaciones comunitarias y los temas sobre los que le gustaría recibir información o participar en futuras actividades.",
  confirmation: "Gracias por acercarse a la comunidad CRECE",
  sections: [
    {
      id: "vinculo",
      title: "Su vínculo con la organización",
      shortTitle: "Vínculo",
      description:
        "Estas preguntas nos permiten conocer qué relación mantiene con la organización comunitaria.",
      questions: [
        {
          id: "relacion_obc",
          type: "single",
          prompt: "¿Cuál es su relación con la organización que compartió esta encuesta?",
          required: true,
          options: [
            { value: "Soy integrante o asociada/o", label: "Soy integrante o asociada/o" },
            { value: "He participado en sus actividades", label: "He participado en sus actividades" },
            { value: "Soy aliada/o o colaboradora/or", label: "Soy aliada/o o colaboradora/or" },
            { value: "Soy amiga/o o familiar de una persona integrante", label: "Soy amiga/o o familiar de una persona integrante" },
            { value: "Recibí la invitación de una persona conocida", label: "Recibí la invitación de una persona conocida" },
            { value: "La encontré en redes sociales", label: "La encontré en redes sociales" },
            other,
          ],
        },
        {
          id: "conocimiento_obc",
          type: "single",
          prompt: "Antes de recibir esta encuesta, ¿cuánto conocía el trabajo de esta organización?",
          required: true,
          options: [
            { value: "Conocía bien su trabajo", label: "Conocía bien su trabajo" },
            { value: "Conocía algunas de sus actividades", label: "Conocía algunas de sus actividades" },
            { value: "Solo conocía su nombre", label: "Solo conocía su nombre" },
            { value: "No la conocía", label: "No la conocía" },
          ],
        },
        {
          id: "participacion_previa",
          type: "single",
          prompt: "¿Ha participado anteriormente en alguna actividad de esta organización?",
          required: true,
          options: [
            { value: "Sí", label: "Sí" },
            { value: "No", label: "No" },
            { value: "No estoy segura/o", label: "No estoy segura/o" },
          ],
        },
        {
          id: "temas_reconocidos",
          type: "multiple",
          prompt: "¿Con qué temas relaciona el trabajo de esta organización?",
          helper: "Puede seleccionar más de una opción.",
          required: false,
          options: communityTopics,
          showWhen: (answers) => answers.conocimiento_obc !== "No la conocía",
        },
      ],
    },
    {
      id: "intereses",
      title: "Intereses y participación",
      shortTitle: "Intereses",
      description:
        "Sus respuestas ayudarán a preparar actividades y convocatorias pertinentes para las comunidades del proyecto.",
      questions: [
        {
          id: "temas_interes",
          type: "multiple",
          prompt: "¿Sobre qué temas le interesaría recibir información o participar en una actividad?",
          helper: "Puede seleccionar más de una opción.",
          required: true,
          options: communityTopics,
        },
        {
          id: "actividades_preferidas",
          type: "multiple",
          prompt: "¿En qué tipo de actividades le interesaría participar?",
          required: true,
          options: [
            { value: "Taller presencial", label: "Taller presencial" },
            { value: "Taller virtual", label: "Taller virtual" },
            { value: "Encuentro comunitario", label: "Encuentro comunitario" },
            { value: "Campaña o feria informativa", label: "Campaña o feria informativa" },
            { value: "Asesoría u orientación", label: "Asesoría u orientación" },
            { value: "Actividad cultural o comunicacional", label: "Actividad cultural o comunicacional" },
            other,
          ],
        },
        {
          id: "departamento",
          type: "single",
          prompt: "¿En qué departamento reside actualmente?",
          required: true,
          options: [
            { value: "Lima", label: "Lima" },
            { value: "Callao", label: "Callao" },
            { value: "Tumbes", label: "Tumbes" },
            other,
          ],
        },
        {
          id: "distrito",
          type: "text",
          prompt: "¿En qué distrito o localidad reside?",
          required: false,
          placeholder: "Escriba el distrito o localidad",
        },
        {
          id: "vinculacion_comunitaria",
          type: "multiple",
          prompt: "De manera opcional, ¿con cuáles de estas comunidades o experiencias se identifica o vincula?",
          helper: "Puede seleccionar más de una opción o elegir «Prefiero no responder».",
          required: false,
          options: [
            { value: "Mujeres trans", label: "Mujeres trans" },
            { value: "Mujeres lesbianas, bisexuales u otras orientaciones sexuales diversas", label: "Mujeres lesbianas, bisexuales u otras orientaciones sexuales diversas" },
            { value: "Mujeres que realizan o realizaron trabajo sexual", label: "Mujeres que realizan o realizaron trabajo sexual" },
            { value: "Mujeres migrantes", label: "Mujeres migrantes" },
            { value: "Personas que viven con VIH", label: "Personas que viven con VIH" },
            { value: "Familiares, amistades o personas aliadas", label: "Familiares, amistades o personas aliadas" },
            other,
            { value: "Prefiero no responder", label: "Prefiero no responder" },
          ],
        },
        {
          id: "disposicion_compartir",
          type: "single",
          prompt: "¿Estaría dispuesta/o a compartir futuras convocatorias con otras personas de su red?",
          required: true,
          options: [
            { value: "Sí", label: "Sí" },
            { value: "Tal vez", label: "Tal vez" },
            { value: "No", label: "No" },
          ],
        },
        {
          id: "alcance_estimado",
          type: "single",
          prompt: "Aproximadamente, ¿con cuántas personas podría compartir una convocatoria?",
          required: true,
          options: [
            { value: "1 a 5 personas", label: "1 a 5 personas" },
            { value: "6 a 20 personas", label: "6 a 20 personas" },
            { value: "21 a 50 personas", label: "21 a 50 personas" },
            { value: "Más de 50 personas", label: "Más de 50 personas" },
            { value: "No sabría estimarlo", label: "No sabría estimarlo" },
          ],
          showWhen: (answers) => answers.disposicion_compartir !== "No",
        },
      ],
    },
    {
      id: "contacto",
      title: "Contacto para futuras actividades",
      shortTitle: "Contacto",
      description:
        "Puede responder sin dejar datos de contacto. Solo los solicitamos si desea recibir invitaciones del proyecto CRECE.",
      questions: [
        {
          id: "autoriza_contacto",
          type: "single",
          prompt: "¿Desea recibir información o invitaciones sobre futuras actividades del proyecto CRECE?",
          required: true,
          options: [
            { value: "Sí, autorizo que me contacten", label: "Sí, autorizo que me contacten" },
            { value: "No deseo que me contacten", label: "No deseo que me contacten" },
          ],
        },
        {
          id: "nombre_preferido",
          type: "text",
          prompt: "Nombre o nombre social",
          required: true,
          placeholder: "Escriba cómo desea que le llamemos",
          showWhen: (answers) => answers.autoriza_contacto === "Sí, autorizo que me contacten",
        },
        {
          id: "medio_contacto",
          type: "single",
          prompt: "¿Por qué medio prefiere que le contactemos?",
          required: true,
          options: [
            { value: "WhatsApp", label: "WhatsApp" },
            { value: "Correo electrónico", label: "Correo electrónico" },
            { value: "Llamada telefónica", label: "Llamada telefónica" },
          ],
          showWhen: (answers) => answers.autoriza_contacto === "Sí, autorizo que me contacten",
        },
        {
          id: "dato_contacto",
          type: "text",
          prompt: "Número de teléfono o correo electrónico",
          required: true,
          inputMode: "text",
          placeholder: "Escriba el dato de contacto correspondiente",
          showWhen: (answers) => answers.autoriza_contacto === "Sí, autorizo que me contacten",
        },
        {
          id: "horario_contacto",
          type: "multiple",
          prompt: "¿En qué momentos suele tener mayor disponibilidad?",
          required: false,
          options: [
            { value: "Mañanas", label: "Mañanas" },
            { value: "Tardes", label: "Tardes" },
            { value: "Noches", label: "Noches" },
            { value: "Fines de semana", label: "Fines de semana" },
          ],
          showWhen: (answers) => answers.autoriza_contacto === "Sí, autorizo que me contacten",
        },
        {
          id: "comentario",
          type: "textarea",
          prompt: "¿Hay algún tema o actividad que le gustaría proponer?",
          required: false,
          placeholder: "Escriba su propuesta o comentario",
        },
      ],
    },
  ],
};
