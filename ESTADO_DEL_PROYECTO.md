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
  - **Paso 1: Modelo y Forma de Compra:** Selección directa de la vivienda en inventario y esquema de crédito (Infonavit, ISSSTE, Bancario, Contado). Se eliminaron campos innecesarios (ubicación fija en Valle de los Encinos, rango de presupuesto y plazo de compra).
  - **Paso 2: Datos de Contacto y Validación Crediticia:** Nombre completo y WhatsApp con atributos semánticos de autocompletado nativo del navegador (`autoComplete="name"`, `autoComplete="tel"`). Validación adaptativa: solicita **NSS (11 dígitos)** para Infonavit o **CURP (18 car.)** para derechohabientes del ISSSTE con alternativa de orientación previa.
  - **Paso 3: Cita para Visitar la Casa Muestra:** Selección directa de fecha (sin atajos innecesarios) y **hora exacta de visita** (10:00 AM a 6:00 PM) con atención simultánea sin límites de cupo.
- **Encuadre visual inteligente:** Se configuró el punto focal de fotografías arquitectónicas en `object-[center_20%]` para que fotos tomadas en vertical desde el celular muestren la fachada completa, segundo piso y techo sin cortes.
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

## 🛡️ Protocolo de Seguridad y Blindaje del Bot de Telegram

- **Aislamiento Total de Credenciales:** `TELEGRAM_BOT_TOKEN` se gestiona **única y exclusivamente** desde variables de entorno del servidor (`process.env.TELEGRAM_BOT_TOKEN`). Nunca se serializa ni se envía al navegador en respuestas JSON (`/api/config` ni `commercial_config`).
- **Sanitización de APIs:** La ruta pública `GET /api/config` purga automáticamente cualquier campo sensible antes de emitir JSON.
- **Validación de Webhook:** Soporte para validación de cabecera `X-Telegram-Bot-Api-Secret-Token` vía `TELEGRAM_WEBHOOK_SECRET`.
- **Rotación de Token Comprometido:** Instrucciones en `@BotFather` para revocar tokens expuestos de forma instantánea.

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

1. **Notificaciones por Correo Electrónico (Email Transaccional):**
   - Integrar Resend o Nodemailer para enviar automáticamente un correo formal al cliente con su confirmación de cita y una copia inmediata al correo del asesor (`master2130.isx@gmail.com`).
2. **Métricas y Píxeles de Conversión:**
   - Agregar Meta Pixel (Facebook Ads) y Google Tag Manager para trackear eventos de conversión (`Lead`, `ScheduleAppointment`, `NSSCaptured`).
3. **Validación del Flujo de Login en Producción (Vercel):**
   - Iniciar sesión en el dominio público de Vercel con `master2130.isx@gmail.com` para confirmar la autenticación de usuarios.
4. **Calculadora Financiera Dinámica por Modelo:**
   - Conectar las mensualidades y enganches estimados automáticamente según el precio del modelo seleccionado en el catálogo.
