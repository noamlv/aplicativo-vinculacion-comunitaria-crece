# Aplicativo de vinculación comunitaria CRECE

Encuesta breve para mapear el alcance de las redes de las organizaciones de base comunitaria, el conocimiento de su trabajo, los temas de interés y la disposición de las personas para participar en futuras actividades del proyecto CRECE.

La versión `2026-10-v2` incorpora la organización remitente como primera pregunta, lenguaje inclusivo con `x`, datos de contacto separados y validación de celulares peruanos de nueve dígitos.

## Desarrollo local

```bash
npm install
npm run dev
```

Sin variables de entorno, la aplicación funciona en modo de demostración y no almacena respuestas.

## Enlaces de referencia

El aplicativo admite parámetros para identificar la ruta de difusión:

```text
/?obc=Nombre%20de%20la%20OBC&lider=L02&ref=OBC05-L02
```

- `obc`: nombre de la organización que distribuye el enlace;
- `lider`: código interno del liderazgo;
- `ref`: código único de referencia para el análisis de alcance.

## Almacenamiento

Las respuestas se registran en `survey_submissions` con el identificador `crece-vinculacion-comunitaria`. Los datos de contacto autorizados se conservan en el contexto privado del envío y no se incluyen en el JSON analítico de respuestas.

Las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` deben configurarse únicamente en el servidor.
