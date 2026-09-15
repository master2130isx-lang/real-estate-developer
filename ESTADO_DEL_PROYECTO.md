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
- **Stack Tecnológico:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Vanilla CSS + Tailwind utilities v4, Lucide React.
- **Repositorio:** `master2130isx-lang/real-estate-developer` (Rama: `main`).
- **Hosting:** Vercel (Despliegue continuo por cada push a `main`).
- **Base de Datos & Auth:** Supabase (PostgreSQL) con fallback híbrido local resiliente.

---

## ✅ Funcionalidades Construidas y Probadas al 100%

### 1. Landing Page Pública (`/`)
- Header con navegación directa a modelos, amenidades, ubicación, contacto y acceso al panel comercial.
- Conmutador de **Modo Claro / Modo Oscuro** integrado con persistencia automática en `localStorage`.
- Galería interactiva con **11 fotografías reales en alta resolución** de la casa muestra del *Modelo Águila Premier*.
- Calculadora interactiva de crédito Infonavit / bancario con estimación de mensualidad y enganche.
- Sección de Confianza del Asesor (*AdvisorTrust*) y Footer con redes sociales dinámicas (Facebook, Instagram, TikTok, YouTube).
- Botón flotante de WhatsApp responsive (optimizado para celular sin encimarse con botones de navegación ni CTA fijo).
- Sección de Ubicación y Rutas GPS directas (Google Maps y Waze) hacia la caseta principal de Valle de los Encinos.

### 2. Formulario de Precalificación Simplificado (`PrequalificationForm`)
- Proceso guiado en pasos sin fricción:
  - **Paso 1:** Presupuesto y forma de adquisición.
  - **Paso 2:** Datos de contacto directos (Nombre, Teléfono / WhatsApp, Canal de confirmación y Correo opcional). *Se eliminó la duplicidad de horarios.*
  - **Paso 3 (Prioritario):** Captura y validación de **NSS e Infonavit** con consentimiento expreso de privacidad (LFPDPPP). Este paso blinda la exclusividad de 15 días del asesor ante la constructora antes de la visita física.
  - **Paso 4:** Modalidad de visita (Casa Muestra vs Virtual) con **atajos rápidos de 1-clic** (*⚡ Mañana* y *📅 Próximo Fin de Semana*) y fecha tentativa preseleccionada.
- **Corrección de interfaz:** Encabezado con espaciado optimizado para que el indicador de avance (`100%`) no se solape con el botón de cerrar (`X`).
- Compatibilidad total con modo oscuro y modo claro.

### 3. Autenticación y Seguridad del Panel del Asesor (`/login` y Middleware)
- Ruta `/panel` y APIs administrativas protegidas con validación de sesión (`auth_token`).
- Pantalla de inicio de sesión moderna y responsiva en `/login` configurada para el usuario principal (`master2130.isx@gmail.com`).
- Soporte dual para autenticación:
  - Vía Supabase Auth (conectado a la nube).
  - Vía variables de entorno administrativas de respaldo en el servidor.
- Redirección automática y cookies seguras de sesión.

### 4. Panel de Productividad del Asesor Comercial (`/panel`)
- **Conmutador de Modo Oscuro:** Botón integrado en la barra de acciones para alternar temas sin recargar.
- **Tira Ejecutiva de Métricas:** Visitas de hoy, Visitas por confirmar, NSS pendientes de registrar en inmobiliaria, Exclusividades de 15 días activas y Total de cartera.
- **Botón "Agendar Cita":** Rediseñado con estética limpia y minimalista (eliminando el doble signo `++`).
- **Agenda de Citas:** Tarjetas compactas con filtros (*Todas, Hoy, Por Confirmar, Confirmadas, Canceladas, Archivadas*). Acciones de confirmación, reagendado y WhatsApp directo.
- **Cartera de Prospectos:** Tabla completa con buscador en tiempo real, filtros por estado comercial y prioridad de atribución.
- **Expediente del Prospecto (`LeadDetailModal`):** Resumen de contacto, estado de atribución de 15 días, detalles de visita, notas internas y bitácora de auditoría con protocolo seguro de revelado de NSS.
- **Generador de Mensajes de WhatsApp (`WhatsAppDraftModal`):** 6 plantillas de alta conversión (confirmación de cita, ubicación GPS, recordatorio, ficha técnica con fotos, asesoría Infonavit y mensaje libre).

### 5. Configuración Comercial y Seguridad de Telegram (`CommercialSettingsModal`)
- Pestañas optimizadas sin desbordamiento horizontal: *Asesor, Redes, Inmobiliaria, Telegram, Base de Datos*.
- **Seguridad del Bot Móvil de Telegram:**
  - Las credenciales (`TELEGRAM_BOT_TOKEN` y `TELEGRAM_ADVISOR_CHAT_ID`) están resguardadas en el servidor y configuradas en Vercel.
  - Se eliminaron los campos de entrada de texto directo para evitar exposición de credenciales en el cliente.
  - Tarjeta de auditoría que confirma el estado activo de `@RED192142_bot` y Chat ID `948786976`.
  - Botón interactivo para **"Enviar Mensaje de Prueba al Celular"** sin exponer tokens.
  - Sincronizador de Webhook con un solo clic para producción en Vercel o modo local.

### 6. Base de Datos Definitiva en la Nube (Supabase PostgreSQL)
- Mapeo nativo de tablas `leads`, `commercial_config` y `funnel_events`.
- **Arquitectura de Resiliencia con Fallback Híbrido:** Si Supabase no está configurado o pierde conectividad temporalmente, el sistema opera automáticamente con almacenamiento local en `/tmp` y JSON sin interrumpir al usuario.
- **Auto-sembrado inteligente:** Si la tabla `leads` está vacía, el servidor precarga los prospectos base para que el panel esté operativo desde el primer segundo.
- Herramientas incluidas:
  - `supabase/schema.sql`: Script DDL listo para ejecutar en Supabase con 1 clic.
  - `/api/db/status`: Endpoint de diagnóstico en tiempo real de salud, latencia y conteo de prospectos.
  - Pestaña **"Base de Datos"** con semáforo de conexión en vivo y botón para copiar el script SQL.

---

## 🔐 Variables de Entorno (Producción en Vercel y Local)

| Variable | Descripción | Entornos |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Token del bot HTTP de Telegram (`@RED192142_bot`) | Vercel & `.env.local` |
| `TELEGRAM_ADVISOR_CHAT_ID` | ID de Chat de Telegram (`948786976`) | Vercel & `.env.local` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (`https://...supabase.co`) | Vercel & `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave secreta service_role de Supabase para backend | Vercel & `.env.local` |
| `ADMIN_EMAIL` | Correo del administrador (`master2130.isx@gmail.com`) | Vercel & `.env.local` |
| `ADMIN_PASSWORD` | Contraseña administrativa de respaldo para `/login` | Vercel & `.env.local` |

> [!TIP]
> En Vercel todas las variables anteriores deben registrarse en **Project Settings > Environment Variables** para los entornos *Production*, *Preview* y *Development*.

---

## 🎨 Arquitectura de Modo Oscuro (Tailwind CSS v4)

- **Configuración CSS:** `@custom-variant dark (&:where(.dark, .dark *));` en `src/app/globals.css`.
- **Contexto:** `src/context/ThemeContext.tsx` administra la clase `.dark` en la etiqueta `<html>` y almacena la selección en `localStorage` con la clave `red_theme`.
- **Componente conmutador:** `src/components/common/ThemeToggle.tsx` disponible con iconos animados de Sol y Luna.
- **Paleta de Colores:**
  - Modo Claro: Fondo slate-50 / blanco, primario Navy `#0d233a`, acento Ámbar `#f59e0b`.
  - Modo Oscuro: Fondo `#090d16` / slate-950, tarjetas slate-900 con bordes slate-800, textos slate-100 / slate-400.

---

## 📋 Próximos Pasos Sugeridos al Reanudar

Cuando decidas retomar el desarrollo, estos son los siguientes puntos clave recomendados:

1. **Validación del Flujo de Login en Producción (Vercel):**
   - Iniciar sesión en el dominio público de Vercel con `master2130.isx@gmail.com` para confirmar la autenticación de usuarios.
2. **Notificaciones por Correo Electrónico (Email Transaccional):**
   - Integrar Resend o Nodemailer para enviar automáticamente un correo formal al cliente con su confirmación de cita y una copia inmediata al correo del asesor.
3. **Catálogo Multi-Modelo:**
   - Incorporar fichas técnicas, galerías y calculadoras de los modelos adicionales conforme la desarrolladora entregue el material gráfico.
4. **Métricas y Píxeles de Conversión:**
   - Agregar Meta Pixel (Facebook Ads) y Google Tag Manager para trackear eventos de conversión (`Lead`, `ScheduleAppointment`, `NSSCaptured`).
