# Registro de Decisiones de Arquitectura y Diseño (DECISIONS.md)

## Decisión 01: Separación Estricta entre Calificación y Recopilación de NSS
- **Contexto:** En formularios tradicionales se expone el campo NSS indiscriminadamente o se asume erróneamente que recibir un NSS garantiza comisión.
- **Decisión:** 
  1. El paso de NSS es **condicional**: solo se presenta si la regla comercial del trámite lo exige (por ahora Infonavit).
  2. A compradores con crédito bancario, de contado o que aún no lo saben, no se les solicita el NSS.
  3. Aún en el flujo Infonavit, se ofrece la opción explícita de continuar sin proporcionar el NSS para recibir orientación previa sin ser catalogado negativamente.
  4. El NSS se valida como texto de 11 dígitos conservando ceros iniciales (`inputMode="numeric"`, `type="text"`).
  5. En el panel, el NSS se muestra oculto con máscara (`•••••••••••`) y requiere confirmación de motivo registrada en auditoría para su revelado.

## Decisión 02: Transparencia Previa a la Captación (Sin "Muros de Datos")
- **Contexto:** Muchos sitios ocultan los precios o especificaciones para obligar al usuario a dejar su teléfono.
- **Decisión:** La sección de opciones disponibles y el modal de ficha técnica detallada permiten consultar precios referenciales, recámaras, baños, m², créditos admitidos y gastos notariales estimados **sin solicitar datos personales**. El visitante solicita una visita porque ya conoce la oferta y desea validarla, no por falta de información.

## Decisión 03: Tratamiento de Solicitudes de Visita (Sin Falsas Confirmaciones)
- **Contexto:** El MVP no cuenta con integración en tiempo real a agendas externas (Google Calendar o CRM).
- **Decisión:** El sistema registra y comunica explícitamente una **solicitud de visita**. No muestra leyendas de "Cita confirmada" al usuario final. La confirmación es responsabilidad del asesor tras verificar disponibilidad de la casa muestra y acordar por WhatsApp con el cliente.

## Decisión 04: Stack Tecnológico Modular
- **Contexto:** Especificación del MVP: Next.js (App Router), TypeScript, Tailwind CSS, React Hook Form, Zod.
- **Decisión:** Se inicializó Next.js 16 (App Router) con Turbopack y Tailwind CSS. Se evitó el uso de microservicios y dependencias pesadas innecesarias. Para la Fase 1 / 1.1, la sincronización entre el formulario público y el panel del agente se gestiona a través de un `AppContext` reactivo con persistencia local demostrativa, facilitando la validación del flujo completo sin requerir base de datos remota antes de tiempo.

## Decisión 05: Telemetría sin Datos Personales (PII)
- **Contexto:** Requisito de registrar métricas de embudo sin vulnerar privacidad.
- **Decisión:** El método `logFunnelEvent` filtra activamente cualquier campo sensible (NSS, teléfonos, nombres, correos). Solo se registran metadatos de comportamiento (zona consultada, forma de pago elegida, si omitió o completó el paso de NSS).

---

## Decisión 06: Separación de Dominios de Operación (Iteración 1.1)
- **Contexto:** La distinción fundamental de negocio es: **NSS recibido en la web ≠ bloqueo confirmado en la inmobiliaria**.
- **Decisión:**
  Se separan nítidamente cinco momentos operativos:
  1. **Captura del prospecto:** Búsqueda, presupuesto y datos de contacto indispensables.
  2. **Recepción del NSS:** Únicamente como insumo para solicitar el registro de atribución comercial interna, sin implicar consulta crediticia.
  3. **Confirmación del registro comercial (15 días):** El plazo de 15 días **inicia únicamente a partir de la confirmación efectiva en el sistema de la inmobiliaria**, nunca desde la llegada a la web. En la web el prospecto avanza como máximo a `pendiente_inmobiliaria`.
  4. **Solicitud y confirmación de visita:** La visita pasa a confirmada solo cuando el asesor registra el acuerdo manual tras contactar al cliente por WhatsApp.
  5. **Autorización crediticia:** Trámite formal posterior e independiente, que requerirá documentación oficial y consentimiento específico previo a producción.

## Decisión 07: Modelo de Seguridad y Protección de Datos Futuro (Fase 2 / Fase 3)
- **Contexto:** En el prototipo (Fase 1/1.1), el frontend opera en modo demostración. Antes del pase a producción deben cumplirse los requisitos obligatorios de seguridad.
- **Decisión:**
  1. **Autenticación robusta de servidor:** El panel del asesor requerirá autenticación con Supabase Auth y MFA antes del despliegue productivo.
  2. **Cifrado autenticado de servidor:** El NSS se cifrará en el backend mediante clave KMS externa a la base de datos.
  3. **Ofuscación en cliente por defecto:** El cliente recibirá únicamente `nssLastFour` o el valor enmascarado. El dato descifrado solo se transmitirá por petición explícita autorizada con registro en `access_audit`.
  4. **Independencia entre políticas:** El vencimiento de los 15 días de atribución comercial no debe confundirse con la política de conservación y purgado legal del NSS (90 días o lo aprobado por el responsable del tratamiento).

## Decisión 08: Integración de Modelo Real Confirmado (Modelo Águila Premier)
- **Contexto:** Se proveyó el expediente comercial y fotográfico de la primera propiedad confirmada: **Modelo Águila Premier** en el fraccionamiento **Valle de los Encinos**, ubicado en Calzada del Sol, Salinas Victoria, N.L.
- **Decisión:**
  1. **Transición a inventario verificado:** Se sustituyó el modelo principal del Hero por la fotografía real de la fachada del Modelo Águila Premier.
  2. **Galería interactiva con miniaturas:** En el modal de detalle se incorporó un visor de fotografías reales que permite navegar entre las áreas de la casa muestra (fachada, sala-comedor, cocina, estancia en planta alta, recámaras, baños, patio con vitropiso y amenidades del desarrollo) sin pedir datos personales al visitante.
  3. **Ficha técnica transparente:** Se detallan los 98 m² de terreno, 74.39 m² de construcción, cochera para 2 autos, 2 recámaras + estancia, 1.5 baños, vitropiso y preparación para minisplit, así como amenidades comunitarias (Pet park, canchas de pasto sintético, palapa y acceso controlado).
  4. **Alineación del embudo:** El formulario público y la configuración comercial ahora tienen como zona principal y preseleccionada a Salinas Victoria, N.L. (Valle de los Encinos).
