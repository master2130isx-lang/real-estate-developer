# Estado del Proyecto y Guía de Continuidad (Handover)

Este documento es la **fuente de verdad** para pausar y reanudar el desarrollo de la plataforma inmobiliaria sin perder el contexto técnico ni de negocio.

---

## 🚀 Cómo Reanudar en una Nueva Conversación

En cualquier momento que inicies una nueva conversación con el asistente de IA, simplemente envía este mensaje:

> **"Hola, por favor lee `ESTADO_DEL_PROYECTO.md` y continuemos con el desarrollo donde lo dejamos. Mi prioridad hoy es: [indicar el tema o 'revisar los siguientes pasos']."**

El asistente leerá este archivo automáticamente y tendrá el 100% del contexto fresco.

---

## 📌 Resumen Ejecutivo del Proyecto

- **Nombre:** Plataforma Comercial Inmobiliaria (Landing de Conversión + Panel del Asesor).
- **Desarrollo principal:** Fraccionamiento *Valle de los Encinos*, Salinas Victoria, N.L.
- **Modelo insignia:** *Modelo Águila Premier* ($1,180,000 MXN | 2 plantas, 2 recámaras + estancia, 1.5 baños, cochera 2 autos, vitropiso, patio y pasillo lateral).
- **Stack Tecnológico:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Vanilla CSS + Tailwind utilities, Lucide React.
- **Repositorio:** `master2130isx-lang/real-estate-developer` (Rama: `main`).
- **Hosting:** Vercel (Despliegue continuo por cada push a `main`).

---

## ✅ Funcionalidades Construidas y Probadas al 100%

### 1. Landing Page Pública (`/`)
- Header con navegación directa a modelos, amenidades, ubicación, contacto y acceso al panel.
- Galería interactiva con **11 fotografías reales en alta resolución** de la casa muestra del *Modelo Águila Premier*.
- Calculadora interactiva de crédito Infonavit / bancario con estimación de mensualidad y enganche.
- Sección de Confianza del Asesor (*AdvisorTrust*) y Footer con redes sociales dinámicas (Facebook, Instagram, TikTok, YouTube).
- Botón flotante de WhatsApp responsive (optimizado para celular sin encimarse con botones de navegación).
- Rutas GPS directas (Google Maps y Waze) para llegar a la caseta principal de Valle de los Encinos.

### 2. Formulario de Precalificación y Captura de NSS (`PrequalificationForm`)
- Proceso guiado en 3 a 4 pasos (presupuesto, plazo, forma de compra y contacto).
- **Regla fundamental de atribución:** Captura de NSS para Infonavit con consentimiento expreso de privacidad (LFPDPPP).
- El envío web **nunca** promete un bloqueo definitivo automático; indica claramente que el asesor gestionará el registro de 15 días ante el mecanismo interno de la inmobiliaria.
- Opción de solicitar orientación previa sin capturar NSS si el cliente aún no lo tiene a la mano.

### 3. Panel de Productividad del Asesor Comercial (`/panel`)
- **Tira Ejecutiva de Métricas:** Visitas de hoy, Visitas por confirmar, NSS pendientes de registrar en inmobiliaria, Exclusividades de 15 días activas y Total de cartera.
- **Agenda de Citas:** Tarjetas compactas con filtros (*Todas, Hoy, Por Confirmar, Confirmadas, Canceladas, Archivadas*). Botones de acción rápida para confirmar, reagendar o enviar WhatsApp con un solo clic.
- **Cartera de Prospectos:** Tabla completa con buscador en tiempo real, filtros por estado comercial y prioridad de atribución.
- **Expediente del Prospecto (`LeadDetailModal`):** Resumen de contacto, estado de atribución de 15 días, detalles de visita, notas internas y bitácora de auditoría con protocolo seguro de revelado de NSS.
- **Generador de Mensajes de WhatsApp (`WhatsAppDraftModal`):** 6 plantillas de alta conversión (confirmación de cita, ubicación GPS, recordatorio, ficha técnica con fotos, asesoría Infonavit y mensaje libre).

### 4. Módulo de Configuración Comercial (`CommercialSettingsModal`)
- Administrable directamente desde el botón en el encabezado del panel:
  - Nombre del Asesor y Cargo.
  - Nombre de la Inmobiliaria / Desarrolladora.
  - Teléfono y WhatsApp comercial.
  - Correo electrónico y notas de caseta/oficina.
  - Redes Sociales (Facebook, Instagram, TikTok, YouTube).
  - Pestaña de Bot de Telegram con conector de Webhook para Vercel en 1 clic.

### 5. Bot de Telegram Bidireccional (`@RED192142_bot`)
- Notificación instantánea en el celular del asesor ante cada nuevo registro o solicitud de cita.
- **NSS capturado visible** en bloque monoespaciado para que el asesor pueda copiarlo con 1 toque en su celular.
- **Botones interactivos en Telegram:**
  - `[ ✅ Confirmar Cita ]`: Confirma la cita en el sistema y elimina el loop de carga.
  - `[ ❌ Cancelar Cita ]`: Registra la cancelación.
  - `[ 💬 Abrir WhatsApp del Cliente ]`: Abre WhatsApp con el mensaje personalizado listo para enviar.
- **Herramientas de Telegram incluidas:**
  - `scripts/telegram-local-poller.mjs`: Poller para pruebas locales.
  - `/api/telegram/webhook`: Endpoint para producción en Vercel.
  - `/api/telegram/setup-webhook`: Conector automático de Webhook.

### 6. Base de Datos Definitiva en la Nube (Supabase PostgreSQL)
- **Persistencia real en Vercel Serverless:** Mapeo nativo de tablas `leads`, `commercial_config` y `funnel_events`.
- **Arquitectura de Resiliencia con Fallback Híbrido:** Si Supabase no está configurado o pierde conectividad, el sistema cae en `/tmp` y JSON local automáticamente sin interrumpir el funcionamiento ni arrojar errores de pantalla blanca.
- **Auto-sembrado inteligente:** Si la tabla `leads` está recién creada y vacía, el servidor migra automáticamente los registros iniciales para que el panel nunca quede vacío.
- **Herramientas de Base de Datos incluidas:**
  - `supabase/schema.sql`: Script DDL listo para copiar y ejecutar en el SQL Editor de Supabase con 1 clic.
  - `/api/db/status`: Endpoint de diagnóstico en tiempo real de salud, latencia y conteo de registros.
  - Pestaña **"Base de Datos"** en `CommercialSettingsModal` con semáforo de conexión, comprobador en vivo y copiador de script SQL.

---

## 🔐 Configuración de Variables de Entorno (Producción y Local)

| Variable | Descripción | Dónde configurarla |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | `.env.local` (Local) y Vercel Settings > Environment Variables |
| `TELEGRAM_ADVISOR_CHAT_ID` | ID de Chat de Telegram (`948786976`) | `.env.local` (Local) y Vercel Settings > Environment Variables |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (`https://...supabase.co`) | `.env.local` (Local) y Vercel Settings > Environment Variables |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave secreta service_role de Supabase para backend | `.env.local` (Local) y Vercel Settings > Environment Variables |

> [!NOTE]
> Consulta `.env.example` para una plantilla comentada de todas las variables del sistema.

---

## 💾 Estado de la Persistencia en Vercel (Producción)

- **Producción con Supabase:** La aplicación cuenta con integración completa con `@supabase/supabase-js`. Para activarla en cualquier instancia de Vercel solo se requiere configurar `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- **Modo Local / Desconectado:** En desarrollo local o antes de ingresar credenciales, la plataforma utiliza de forma segura su memoria caché, `src/data/leadsStore.json` y `/tmp`, permitiendo probar y demostrar el 100% de las funciones sin necesidad de internet ni base de datos externa.

---

## 📋 Próximos Pasos Sugeridos para la Siguiente Sesión

Elige cualquiera de estos temas al reanudar según la prioridad del cliente:

1. **Sección Interactiva "Cómo Llegar" / Mapa:**
   - Añadir mapa interactivo (Google Maps embebido o Leaflet) con rutas sugeridas desde Monterrey, San Nicolás y Escobedo hacia la caseta de Valle de los Encinos.
2. **Automatización de Correos Electrónicos (Email Notifications):**
   - Integrar Resend o Nodemailer para enviar automáticamente un correo formal al cliente con los detalles de su cita y una copia al correo del asesor.
3. **Catálogo Multi-Modelo:**
   - Incorporar fichas técnicas y galerías de los modelos restantes de la desarrolladora en Valle de los Encinos conforme entreguen su material.

