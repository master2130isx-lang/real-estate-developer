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
- Cintillo superior de alta legibilidad (*Top Bar*): `"VISITAS PRIVADAS · MONTERREY, NUEVO LEÓN"` optimizado con tipografía nítida en negrita y color profundo de alto contraste (`dark:text-[#071A2C] font-bold`), resolviendo el problema de bajo contraste anterior.
- **Optimización Integral de Velocidad Móvil y Google PageSpeed:**
  - **LCP Optimizado:** Precarga en `<head>` (`<link rel="preload" as="image" fetchpriority="high">`) y `fetchPriority="high"` en la imagen de portada del Hero sin dependencia del renderizado de cliente.
  - **Ahorro de ~2.7 MB en imágenes:** Activación de Next.js Image Optimization con formatos modernos `AVIF` y `WebP`. Miniaturas de galería re-escaladas a `sizes="(max-width: 768px) 93px, 100px"`, `quality={60}` y `loading="lazy"`.
  - **Carga diferida de Google Maps:** El iframe se carga mediante `IntersectionObserver` (`rootMargin: '350px'`), ahorrando ~465 KB de JS inicial y eliminando 210 ms de bloqueo en el hilo principal.
  - **Fragmentación de JS y reducción de ~48 KiB iniciales:** Se migraron los componentes secundarios y modales (`PrequalificationForm`, `PrivacyModal`, `WhatsAppFloatingButton`, `LocationMapSection`, `FaqSection`, `AdvisorTrust`) a `next/dynamic` con `{ ssr: false }`, eliminando la tarea larga de 82 ms en el hilo principal.
  - **Eliminación de bloqueo de renderizado en CSS:** Configuración de `display: 'swap'` en todas las fuentes y poda de pesos no utilizados en Google Fonts (`layout.tsx`).
  - **Compilación JS moderna sin polyfills:** Target `ES2022` en `tsconfig.json` y archivo `.browserslistrc` explícito (`defaults and fully supports es6-module`, Baseline 2023+) para erradicar los 14 KiB de polyfills heredados.
  - **Accesibilidad (WCAG AA/AAA):** Botones de WhatsApp actualizados a verde oscuro `#128C7E` (contraste 4.6:1 con texto blanco), botón de Waze a `bg-sky-700`, badge de "Caseta 24/7" estilizado (`bg-emerald-950/90 text-emerald-300 border border-emerald-600/40 text-[11px]`), corrección de contraste en textos atenuados (`--color-text-muted: #54504A`), números de pasos `"01"`, `"02"`, `"03"`, textos del footer (`#D1D5DB`) y jerarquía de encabezados semánticos (`h1 -> h2 -> h3 -> h4`).
  - **Objetivos táctiles (Tap Targets):** Botones y enlaces interactivos con tamaño mínimo de 44x44 / 48x48 px en navbar, menú móvil y footer.
  - **Seguridad y Cabeceras HTTP:** HSTS (`preload`), X-Frame-Options (`SAMEORIGIN`), Cross-Origin-Opener-Policy (`same-origin`), X-Content-Type-Options (`nosniff`) y Referrer-Policy.
- **Portada Principal Dinámica e Interactiva (`Hero`):**
  - Ya no depende de una imagen estática fija. Permite seleccionar qué modelo de casa y qué imagen se exhiben en la portada principal.
  - Muestra una ficha flotante con el nombre del modelo, su precio en tiempo real y el badge *"Casa Muestra en Exhibición"*.
  - El botón *"Conocer la casa muestra"* abre automáticamente el formulario de precalificación con ese modelo preseleccionado.
- Conmutador de **Modo Claro / Modo Oscuro** integrado con persistencia automática en `localStorage`.
- Galería interactiva con fotografías reales en alta resolución.
- Calculadora interactiva de crédito Infonavit / bancario con estimación de mensualidad y enganche.
- Sección de Confianza del Asesor (*AdvisorTrust*) y Footer con redes sociales dinámicas (Facebook, Instagram, TikTok, YouTube).
- Botón flotante de WhatsApp responsive (optimizado para celular sin encimarse con botones de navegación ni CTA fijo).
- Sección de Ubicación y Rutas GPS directas (Google Maps y Waze) hacia la caseta principal de Valle de los Encinos.

### 2. Formulario de Precalificación Optimizado a 3 Pasos (`PrequalificationForm`)
- Proceso ultra optimizado sin fricción:
  - **Paso 1: Modelo y Forma de Compra:** Selección directa de la vivienda en inventario y esquema de crédito (Infonavit, FOVISSSTE, Bancario, Contado). Se eliminaron campos innecesarios (ubicación fija en Valle de los Encinos, rango de presupuesto y plazo de compra).
  - **Paso 2: Datos de Contacto y Validación Crediticia:** Nombre completo y WhatsApp con atributos semánticos de autocompletado nativo del navegador (`autoComplete="name"`, `autoComplete="tel"`). Validación adaptativa: solicita **NSS (11 dígitos)** para Infonavit o **CURP (18 car.)** para derechohabientes de FOVISSSTE con alternativa de orientación previa.
  - **Paso 3: Cita para Visitar la Casa Muestra:** Selección directa de fecha (sin atajos innecesarios) y **hora exacta de visita** (10:00 AM a 6:00 PM) con atención simultánea sin límites de cupo.
- **Encuadre visual inteligente:** Se configuró el punto focal de fotografías arquitectónicas en `object-[center_20%]` para que fotos tomadas en vertical desde el celular muestren la fachada completa, segundo piso y techo sin cortes.
- Compatibilidad total con modo oscuro y modo claro.

### 3. Autenticación, Seguridad y Blindaje del Panel del Asesor (`/login`, `proxy.ts`, `auth.ts`)
- **Proxy de Seguridad (Next.js 16):** Archivo `src/proxy.ts` actúa como gateway centralizado que intercepta todas las peticiones antes de llegar a las rutas:
  - `/panel/*` → Redirige a `/login` si no hay sesión válida.
  - APIs administrativas (`GET /api/leads`, `PATCH /api/leads/[id]`, `POST /api/config`, `POST /api/properties`, `PUT/DELETE /api/properties/[id]`, `/api/telegram/test`, `/api/telegram/setup-webhook`, `/api/db/status`) → Retorna `401 JSON` sin sesión.
  - Rutas públicas preservadas: `POST /api/leads` (registro de prospectos), `GET /api/config`, `GET /api/properties`, `POST /api/telegram/webhook`.
- **Cookies Firmadas con HMAC-SHA256:** Módulo centralizado `src/lib/auth.ts` que firma y verifica todas las cookies de sesión con criptografía HMAC. Comparación en tiempo constante (`timingSafeEqual`) contra ataques de temporización. Soporte de compatibilidad retroactiva con cookies legacy JSON.
- **Login Blindado:** Eliminado el bypass que aceptaba cualquier contraseña cuando Supabase no respondía. Ahora **siempre** requiere credenciales válidas:
  - Modo Supabase Auth (producción): `supabase.auth.signInWithPassword()`.
  - Modo local (desarrollo): Valida contra `ADMIN_EMAIL` + `ADMIN_PASSWORD` de variables de entorno.
- **Tokens HMAC para URLs de Acción de Telegram:** Las URLs de "Confirmar Cita" y "Cancelar Cita" incluyen un token criptográfico firmado con HMAC que expira en 48 horas. Sin token válido → `403 Forbidden`.
- **Prevención de XSS:** Todos los datos de usuario (nombre, teléfono, fechas) se escapan con `escapeHtml()` antes de interpolarse en HTML.
- **Content-Security-Policy (CSP):** Header completo en `next.config.ts` que restringe scripts, estilos, fuentes, imágenes, iframes y conexiones a dominios autorizados.
- **Rate Limiting:** Protección contra fuerza bruta y spam con ventana deslizante en memoria (`src/lib/rateLimit.ts`):
  - Login: 5 intentos/minuto por IP.
  - Registro de leads: 10/minuto por IP.
  - Telegram test: 3/minuto por IP.
- **Sanitización de Upload:** `propertyId` sanitizado con regex para prevenir path traversal (`[^a-zA-Z0-9_-]` → eliminado).
- Pantalla de inicio de sesión moderna y responsiva en `/login` configurada para el usuario principal (`master2130.isx@gmail.com`).
- Redirección automática post-login con cookies firmadas `httpOnly` + `secure`.

### 4. Panel de Productividad del Asesor Comercial (`/panel`)
- **Conmutador de Modo Oscuro:** Botón integrado en la barra de acciones para alternar temas sin recargar.
- **Tira Ejecutiva de Métricas:** Visitas de hoy, Visitas por confirmar, NSS pendientes de registrar en inmobiliaria, Exclusividades de 15 días activas y Total de cartera.
- **Botón "Agendar Cita":** Rediseñado con estética limpia y minimalista (eliminando el doble signo `++`).
- **Agenda de Citas:** Tarjetas compactas con filtros (*Todas, Hoy, Por Confirmar, Confirmadas, Canceladas, Archivadas*). Gestión 100% interna de operaciones (confirmar, reprogramar, cancelar y archivar sin redirecciones automáticas a WhatsApp; contacto por WhatsApp exclusivamente bajo selección manual explícita del asesor).
- **Cartera de Prospectos:** Tabla completa con buscador en tiempo real, filtros por estado comercial y prioridad de atribución.
- **Expediente del Prospecto (`LeadDetailModal`):** Resumen de contacto, estado de atribución de 15 días, detalles de visita, notas internas y bitácora de auditoría con protocolo seguro de revelado de NSS.
- **Generador de Mensajes de WhatsApp (`WhatsAppDraftModal`):** 6 plantillas de alta conversión (confirmación de cita, ubicación GPS, recordatorio, ficha técnica con fotos, asesoría Infonavit y mensaje libre).
- **Zona de Seguridad del Desarrollador / Purgado de Citas (`DeveloperPurgeModal`):**
  - **Oculto de la vista del agente:** Retirado de la barra principal de la agenda para evitar confusiones al equipo de ventas; accesible discretamente desde la pestaña de Base de Datos en Configuración Comercial.
  - **Doble candado de seguridad:**
    1. Verificación en tiempo real de la **Contraseña de Administrador** (autenticada contra Supabase Auth con la cuenta `master2130.isx@gmail.com`).
    2. Frase de seguridad obligatoria (`BORRAR-CITAS-TEST`) para desbloquear la ejecución crítica.
  - Purgado simultáneo en Supabase PostgreSQL (`DELETE FROM leads`) y almacenamiento local/memoria.
  - Opción dual: Vaciar a 0 registros (tabla limpia) o restablecer los 7 prospectos iniciales de demostración con la clave `RESTABLECER-DEMO`.
  - **Inmunidad de inventario:** Los modelos de viviendas creados en el catálogo (`properties`) quedan totalmente blindados y nunca se ven afectados.

### 5. Configuración Comercial y Directorio Multi-Destinatario de Telegram (`CommercialSettingsModal`)
- **Interfaz Perfeccionada y Adaptativa:**
  - Estructura con cabecera fija, cuerpo con scroll interno y pie de página fijo (`rounded-3xl overflow-hidden`), eliminando el recorte de esquinas y garantizando un radio simétrico perfecto en todos los ángulos.
  - Pestañas optimizadas: *Asesor, Redes, Inmobiliaria, Telegram, Base de Datos*.
- **Directorio de Destinatarios de Telegram con Alias y Alternancia a Voluntad:**
  - Permite registrar múltiples Chat IDs asociados a un alias descriptivo (ej. *"Mi Celular (Developer)"*, *"Carlos Cantú (Asesor)"*).
  - **Alternancia con 1 solo clic:** Selecciona qué destinatario recibe las alertas en vivo de citas y nuevos prospectos, ideal para alternar entre desarrollo/pruebas y asesores en producción sin tocar variables de entorno.
  - **Pruebas de envío individuales:** Cada destinatario registrado cuenta con su propio botón de prueba para verificar que el bot `@RED192142_bot` pueda entregarle mensajes antes de activarlo.
  - **Gestión completa:** Agregar nuevos destinatarios, eliminarlos (con protección para no dejar la lista vacía) y marcar como activo de inmediato.
  - **Persistencia bidireccional:** Se guarda permanentemente en Supabase PostgreSQL (`commercial_config`), respaldado en `localStorage` y en archivo local.
- **Botones Interactivos de Telegram y Webhook Automático en Producción:**
  - Blindaje con `allowed_updates: ['message', 'callback_query']` para asegurar la respuesta inmediata de los botones *Confirmar Cita* y *Cancelar Cita*.
  - Eliminación de campos manuales de URL y "Modo Local" en la interfaz: el sistema conecta y mantiene el webhook 100% en automático en segundo plano.
  - Sincronización dinámica de los modelos de casas seleccionados (`lead.selectedPropertyTitle`) en todas las plantillas y notificaciones.

### 6. Base de Datos Definitiva en la Nube (Supabase PostgreSQL)
- Mapeo nativo de tablas `leads`, `commercial_config`, `properties` y `funnel_events`.
- **Arquitectura de Resiliencia con Fallback Híbrido:** Si Supabase no está configurado o pierde conectividad temporalmente, el sistema opera automáticamente con almacenamiento local en `/tmp` y JSON sin interrumpir al usuario.
- **Auto-sembrado inteligente:** Si la tabla `leads` o `properties` está vacía, el servidor precarga los datos base para que el panel esté operativo desde el primer segundo.
- Herramientas incluidas:
  - `supabase/schema.sql`: Script DDL listo para ejecutar en Supabase con 1 clic (incluye tabla `properties` y políticas RLS).
  - `/api/db/status`: Endpoint de diagnóstico en tiempo real de salud, latencia y conteo de prospectos.
  - Pestaña **"Base de Datos"** con semáforo de conexión en vivo y botón para copiar el script SQL.

### 7. Gestor Dinámico de Modelos de Casas y Catálogo Multi-Modelo (`PropertyManagerView` & `PropertyEditorModal`)
- **Panel Administrativo de Propiedades:** Vista dedicada en `/panel` con pestañas para alternar entre *Prospectos* y *Modelos de Casas*.
- **Editor Integral de Modelos (`PropertyEditorModal`):**
  - **Flujo Guiado por Pestañas (Wizard Secuencial 1 → 4):**
    - Paso 1: *Datos & Ubicación* (Nombre de modelo, Fraccionamiento, Precio, Código, Dirección). Botón *"Siguiente: Medidas →"*.
    - Paso 2: *Medidas & Distribución* (Recámaras, Baños, m² de Construcción y Terreno, Estancia). Botones *"← Anterior"* y *"Siguiente: Fotos →"*.
    - Paso 3: *Galería de Fotos* (Carga optimizada de fotos en WebP, selector de foto de portada). Requiere al menos 1 foto antes de avanzar. Botones *"← Anterior"* y *"Siguiente: Amenidades →"*.
    - Paso 4: *Amenidades & Ficha* (Descripción comercial, amenidades del fraccionamiento y ficha técnica). Único paso con el botón final *"✓ Registrar y Publicar Modelo"*.
  - **Diseño Responsivo Limpio:** Reemplazo de barras horizontales nativas por un grid responsive (`grid grid-cols-2 sm:grid-cols-4`) con indicadores visuales de completado en cada pestaña.
  - Marcador de **Modelo Destacado** y botón de 1 solo clic para definirlo como Portada Principal en el Hero.
- **Carga y Optimización de Fotografías:**
  - Selector de imágenes con compresión automática a formato **WebP** en el navegador para máxima velocidad de carga.
  - Soporte de subida a backend vía `/api/properties/upload` con almacenamiento persistente en **Supabase Storage** (bucket `property-images`) y fallback seguro.
  - Selección visual interactiva de la fotografía de portada principal.
- **Sincronización en Tiempo Real:**
  - APIs REST dedicadas: `/api/properties`, `/api/properties/[id]`, `/api/properties/upload`.
  - Integración inmediata con la sección pública de propiedades en la Landing (`PropertiesSection`) y con el selector de modelos del formulario de precalificación.

### 8. Landing Flash Express para Redes Sociales (`/registro`)
- **Página Dedicada Flash:** Diseñada específicamente para enlaces en anuncios de **Facebook Ads**, videos de **TikTok** o biografía de Instagram.
- **Formulario de 1 Solo Paso:** Ultra ligero y sin distracciones (Nombre, WhatsApp, Esquema de crédito, NSS/CURP opcional y Día/Hora tentativa).
- **Autocompletado Nativo del Navegador:** Configurado con atributos semánticos estándar (`name="name"`, `name="tel"`, `autoComplete="name"`, `autoComplete="tel"`, `inputMode="tel"`) para rellenado automático con 1 solo toque en navegadores móviles (Chrome, Safari, Edge).
- **Ajuste Móvil Responsive (WebKit/iOS):** Inputs de fecha y hora protegidos contra desbordamiento de caja (`max-w-full`, `min-w-0`, `box-sizing: border-box`, `appearance: none`, `min-height: 44px`) en Safari y Chrome iOS.
- **Notificación y Conversión:** Dispara inmediatamente la alerta a Telegram del asesor y muestra botón de WhatsApp con mensaje pre-armado y folio único.
- **Sincronización Dinámica de Identidad:** Todos los textos de la inmobiliaria y desarrollo se sincronizan en vivo desde la configuración del panel comercial.

---

## 🛡️ Protocolo de Seguridad y Blindaje Integral

### Seguridad del Bot de Telegram
- **Aislamiento Total de Credenciales:** `TELEGRAM_BOT_TOKEN` se gestiona **única y exclusivamente** desde variables de entorno del servidor (`process.env.TELEGRAM_BOT_TOKEN`). Nunca se serializa ni se envía al navegador en respuestas JSON (`/api/config` ni `commercial_config`).
- **Sanitización de APIs:** La ruta pública `GET /api/config` purga automáticamente cualquier campo sensible antes de emitir JSON.
- **Validación de Webhook:** Soporte para validación de cabecera `X-Telegram-Bot-Api-Secret-Token` vía `TELEGRAM_WEBHOOK_SECRET`.
- **URLs de Acción Firmadas:** Los botones web de "Confirmar/Cancelar Cita" usan tokens HMAC-SHA256 con expiración de 48 horas para impedir manipulación no autorizada.
- **Rotación de Token Comprometido:** Instrucciones en `@BotFather` para revocar tokens expuestos de forma instantánea.

### Seguridad de Sesiones y Autenticación
- **Cookies HMAC-SHA256:** Las sesiones se firman criptográficamente en `src/lib/auth.ts`, imposibilitando la fabricación de cookies falsas.
- **Proxy Gateway:** `src/proxy.ts` protege todas las rutas administrativas (panel + APIs) a nivel de infraestructura, antes de que lleguen al código de la aplicación.
- **Login sin Bypass:** El fallback local **siempre** requiere `ADMIN_EMAIL` + `ADMIN_PASSWORD`; nunca acepta credenciales arbitrarias.
- **Rate Limiting:** Protección contra fuerza bruta (login 5/min, leads 10/min, Telegram test 3/min) en `src/lib/rateLimit.ts`.

### Seguridad de Base de Datos (Supabase RLS)
- **Políticas RLS estrictas:** Tabla `leads` solo permite `INSERT` anónimo (registro); `SELECT/UPDATE/DELETE` requieren `authenticated` o `service_role`.
- **Vista pública segura:** `public_commercial_config` excluye la columna `telegram_config` para accesos directos con `anon_key` desde el cliente.
- **Cabeceras HTTP de seguridad:** HSTS (preload), X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), Referrer-Policy, Cross-Origin-Opener-Policy y **Content-Security-Policy** completo.

### Archivos Clave de Seguridad
| Archivo | Responsabilidad |
| :--- | :--- |
| `src/proxy.ts` | Gateway de autenticación (protección de rutas y APIs) |
| `src/lib/auth.ts` | Firma HMAC-SHA256 de cookies, validación de sesiones, tokens de acción |
| `src/lib/rateLimit.ts` | Rate limiting en memoria con ventana deslizante |
| `next.config.ts` | Headers HTTP de seguridad incluyendo CSP |
| `supabase/schema.sql` | Políticas RLS y vista pública segura |

---

## 🔐 Variables de Entorno (Producción en Vercel y Local)

| Variable | Descripción | Entornos |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Token del bot HTTP de Telegram (`@RED192142_bot`) | Vercel & `.env.local` |
| `TELEGRAM_ADVISOR_CHAT_ID` | ID de Chat de Telegram (`948786976`) | Vercel & `.env.local` |
| `TELEGRAM_WEBHOOK_SECRET` | Token secreto para validar requests del webhook de Telegram (Opcional) | Vercel & `.env.local` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (`https://...supabase.co`) | Vercel & `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave secreta service_role de Supabase para backend | Vercel & `.env.local` |
| `ADMIN_EMAIL` | Correo del administrador (`master2130.isx@gmail.com`) | Vercel & `.env.local` |
| `ADMIN_PASSWORD` | Contraseña administrativa de respaldo para `/login` | Vercel & `.env.local` |
| `CRON_SECRET` | Protege la tarea diaria `/api/cron/daily` (vencimientos y resumen por Telegram). Sin ella la tarea queda deshabilitada | Vercel |
| `HMAC_SESSION_SECRET` | Clave de 32+ chars para firmar cookies (Opcional: se deriva de `SUPABASE_SERVICE_ROLE_KEY` si no se define) | Vercel & `.env.local` |

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

Cuando decidas continuar el desarrollo, estos son los puntos clave recomendados:

1. **Fraccionamiento como entidad propia con landing por URL** (`/d/[slug]`): agrupar modelos, dirección, conectividad y textos por desarrollo para promover varios a la vez sin perder las campañas anteriores. Hoy la landing es una sola y se edita desde Configuración → Landing.
2. **NSS fuera del listado del panel:** `GET /api/leads` todavía envía el NSS completo al navegador; revelarlo debería pedirse al servidor (acción `nss_reveal`) en lugar de ocultarlo solo en pantalla.
3. **Tipar los `any` restantes** para que `npm run lint` pase sin errores (son heredados; ESLint ya vuelve a funcionar).
4. **Notificaciones por Correo Electrónico (Email Transaccional):**
   - Integrar Resend o Nodemailer para enviar automáticamente un correo formal al cliente con su confirmación de cita y una copia inmediata al correo del asesor (`master2130.isx@gmail.com`).
5. **Métricas y Píxeles de Conversión:**
   - Agregar Meta Pixel (Facebook Ads) y Google Tag Manager para trackear eventos de conversión (`Lead`, `ScheduleAppointment`, `NSSCaptured`).
6. **Calculadora Financiera Dinámica por Modelo:**
   - Conectar las mensualidades y enganches estimados automáticamente según el precio del modelo seleccionado en el catálogo.
7. **Migración de Rate Limiting a Redis (Upstash):**
   - El rate limiter actual opera en memoria (por instancia serverless). Para producción de alto tráfico, migrar a `@upstash/ratelimit` con Redis compartido entre instancias.
8. **Ejecutar Migración de RLS en Supabase:**
   - Ejecutar en SQL Editor de Supabase las instrucciones de `supabase/schema.sql` para crear la vista `public_commercial_config` y las nuevas políticas.

---

## 📝 Historial de Cambios (Changelog)

> **Instrucciones para futuros agentes:** Al realizar cambios significativos en el proyecto, agregar una entrada nueva **al inicio** de esta lista con la fecha, un resumen del cambio y los archivos afectados. Mantener las entradas existentes sin modificar.

### 2026-10-05 — Revisión integral: persistencia, landing personalizable y seguridad
**Rama:** `fix/revision-integral` · **Requiere ejecutar** `supabase/migrations/2026-10-05_curp_origen_configuracion.sql` en Supabase.

**Seguridad**
- ✅ **Bypass de login corregido:** `proxy.ts` y `getSessionFromRequest` aceptaban cookies "legacy" en JSON sin firmar (`advisor_session={"email":"..."}`), lo que daba acceso total al panel. Ahora solo se aceptan cookies firmadas con HMAC.
- ✅ `POST /api/leads` ya no guarda el objeto que manda el navegador: valida una lista blanca de campos (`parseLeadInput`) y el servidor genera `id`, folio, estados y bitácora (`src/lib/leadFactory.ts`). Las citas "confirmadas" desde el panel requieren sesión.
- ✅ El directorio de Telegram (Chat IDs) ya no se incrusta en el HTML público del layout.
- ✅ Webhook de Telegram: se registra `secret_token` (`TELEGRAM_WEBHOOK_SECRET`) y solo los chats del directorio pueden confirmar/cancelar citas. Datos del cliente escapados en Markdown (un `_` en el nombre hacía que Telegram rechazara la alerta).

**Datos que se perdían**
- ✅ Notas, cambios de estado, confirmación/conflicto de atribución y auditoría de NSS ahora se guardan en el servidor con `PATCH /api/leads/[id]` (acciones en `src/lib/leadActions.ts`). Antes solo vivían en el navegador y la sincronización de 10 s las borraba.
- ✅ Desarchivar persiste y restaura el estado previo de la cita (`statusBeforeArchive`).
- ✅ CURP (FOVISSSTE) y origen del prospecto (canal + UTM) se guardan en Supabase (columnas nuevas, con reintento si la migración no se ha ejecutado).
- ✅ Folios únicos `LEAD-AAMMDD-XXXX` con reintento ante colisión (antes 3 dígitos al azar con año fijo).
- ✅ `/registro` enviaba el prospecto dos veces (doble alerta de Telegram).
- ✅ "Hoy" se calcula en hora de Monterrey (`src/lib/dateUtils.ts`); antes, después de las 6 pm mostraba las visitas de mañana.
- ✅ Los modales del panel muestran siempre la versión vigente del prospecto y ya no arrastran el NSS revelado de un prospecto a otro.

**Personalización (sin tocar código)**
- ✅ Configuración completa guardada como JSON (`commercial_config.settings`): portada elegida, textos de la landing, horarios de visita, días de atribución y zona horaria.
- ✅ Nuevas pestañas en Configuración: **Landing** (portada, intro de modelos, mensaje de WhatsApp, conectividad, pie de página, SEO) y **Agenda** (horarios, días de atribución). En **Inmobiliaria**: dirección para mapas, punto de reunión y distintivo de acceso.
- ✅ Se eliminaron ~100 referencias fijas a Valle de los Encinos / Águila Premier / 15 días. La tarjeta de cada modelo muestra su disponibilidad y créditos reales; el formulario solo ofrece los créditos que acepta el modelo.
- ✅ Landing con ISR (`revalidate = 300`) + `revalidatePath` al guardar configuración o modelos; los modelos llegan desde el servidor en el primer render.
- ✅ Modelos nuevos parten de los datos del fraccionamiento del modelo de portada (no de los del Águila).

**Seguimiento**
- ✅ Tarea diaria `/api/cron/daily` (Vercel Cron, 8:00 am Monterrey, `vercel.json`): marca atribuciones vencidas y envía por Telegram las visitas del día y las atribuciones por vencer. Requiere `CRON_SECRET`.
- ✅ Origen del prospecto visible en el expediente y en la alerta de Telegram (`?utm_source=`, `?src=`).

**Herramientas:** ESLint 9 (la versión 10 no era compatible con `eslint-config-next`).

### 2026-09-27 — Contrauditoría y Hardening Definitivo de Seguridad
**Revisión y Refuerzo Posterior a la Auditoría de Ciberseguridad**
- ✅ **Corrección crítica de bypass en subida de imágenes (`POST /api/properties/upload`):** Se corrigió la regla de emparejamiento y orden de rutas en `src/proxy.ts`. Anteriormente, la regla comodín `/api/properties/` abortaba la comprobación con `return false` y permitía uploads anónimos. Ahora está 100% blindada.
- ✅ **Defensa en profundidad (Defense in Depth):** Se incorporó `requireAuth(req)` directamente dentro de los route handlers de `upload`, `properties` (POST), `properties/[id]` (PUT/DELETE) y `leads/[id]` (GET/PATCH), eliminando puntos únicos de falla.
- ✅ **Resiliencia en Login con Contraseña Maestra de Respaldo:** En `src/app/api/auth/login/route.ts`, si Supabase Auth no reconoce la contraseña o no responde, el sistema valida contra `ADMIN_EMAIL` + `ADMIN_PASSWORD` de respaldo, garantizando acceso al asesor sin riesgo de bloqueo.
- ✅ **Blindaje contra Open Redirect en `/login`:** Sanitización estricta del parámetro `redirect` para admitir exclusivamente rutas relativas locales seguras (`/panel`).
- ✅ **Privacidad de Configuración en `GET /api/config`:** Se omitió el objeto `telegramConfig` (destinatarios, alias y Chat IDs) para visitantes anónimos de la landing page; solo se expone a asesores con sesión activa.
- ✅ **Hardening de CSP en `next.config.ts`:** Se reemplazó la directiva experimental `navigate-to` (que bloqueaba enlaces externos a redes sociales y Waze) por directivas estándar de hardening OWASP: `object-src 'none'` y `base-uri 'self'`.

### 2026-09-27 — Auditoría de Ciberseguridad Completa (Fase 1 + Fase 2)
**Commit:** `13bb77c` | **13 archivos modificados, 702 líneas añadidas, 114 eliminadas**

**Fase 1 — Vulnerabilidades Críticas Corregidas:**
- ✅ Restaurado `src/proxy.ts` como gateway de seguridad (protege `/panel` y 9 API routes administrativas).
- ✅ Creado `src/lib/auth.ts` — módulo centralizado de autenticación con cookies HMAC-SHA256.
- ✅ Eliminado bypass de login sin contraseña cuando Supabase no responde (`src/app/api/auth/login/route.ts`).
- ✅ Tokens HMAC firmados de 48h para URLs de acción de Telegram (`src/app/api/telegram/action/route.ts`).
- ✅ Corrección de XSS: `escapeHtml()` en todos los datos interpolados en HTML.
- ✅ Agregado header `Content-Security-Policy` en `next.config.ts`.
- ✅ Sanitización de `propertyId` en upload para prevenir path traversal.

**Fase 2 — Protecciones Adicionales:**
- ✅ Creado `src/lib/rateLimit.ts` — rate limiting en memoria con ventana deslizante.
- ✅ Rate limiting aplicado a: login (5/min), registro de leads (10/min), Telegram test (3/min).
- ✅ RLS actualizado en `supabase/schema.sql`: vista pública `public_commercial_config` sin `telegram_config`.
- ✅ Actualizado `src/app/api/auth/me/route.ts` para soportar cookies firmadas.
- ✅ Actualizado `src/app/api/leads/route.ts` para usar `isDeveloperSession()` centralizado.
- ✅ Actualizado `.env.example` con nuevas variables de seguridad.

**Archivos creados:**
- `src/lib/auth.ts` (firma HMAC, validación de sesiones, tokens de acción)
- `src/lib/rateLimit.ts` (rate limiting en memoria)

**Archivos modificados:**
- `src/proxy.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/me/route.ts`
- `src/app/api/leads/route.ts`, `src/app/api/telegram/action/route.ts`, `src/app/api/telegram/test/route.ts`
- `src/app/api/properties/upload/route.ts`, `src/lib/telegramService.ts`
- `next.config.ts`, `supabase/schema.sql`, `.env.example`
