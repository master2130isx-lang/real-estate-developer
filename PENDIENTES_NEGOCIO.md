# Pendientes Comerciales, Legales y Operativos (Iteración 1.1)

Este documento concentra las definiciones y resoluciones obligatorias que el responsable del negocio debe definir antes del lanzamiento a producción (Fase 2 / Fase 3).

---

## 1. Definiciones Obligatorias sobre el NSS y Registro Interno
Conforme a la clarificación de negocio: **NSS recibido en la web ≠ bloqueo confirmado en la inmobiliaria**.

- [ ] **Mecanismo técnico de registro en la inmobiliaria:**
  - ¿Cómo se realiza técnicamente el registro dentro de la inmobiliaria? (¿Portal web de la constructora, correo a mesa de control, sistema ERP propio o mensaje formal al coordinador?).
  - ¿Existe un folio o clave de confirmación que la inmobiliaria entrega al asesor?
- [ ] **Cómputo exacto de los 15 días:**
  - ¿Son 15 días naturales o hábiles? (Regla del prototipo: 15 días naturales calculados a partir de la confirmación efectiva en la inmobiliaria).
  - ¿Qué sucede al vencer los 15 días si la venta sigue activa pero no se ha firmado? (¿Existe prórroga manual o el prospecto se libera en el sistema?).
- [ ] **Manejo de duplicados y conflictos:**
  - Si la inmobiliaria rechaza un registro porque el NSS ya existía registrado por otro asesor, ¿cuál es el protocolo comercial de resolución?
  - *Regla técnica implementada:* El formulario público nunca revela si un NSS ya está registrado para evitar fuga de información. En el panel se registra como estado de conflicto para revisión del asesor.

---

## 2. Responsabilidad de Datos en Uso Interno (LFPDPPP)
> [!IMPORTANT]
> El uso interno del NSS también exige identificar con precisión quién es el responsable del tratamiento y quién tiene acceso a los datos. No puede dejarse como "N/A" antes del lanzamiento.

- [ ] **Identidad jurídica del responsable:**
  - Nombre legal o Razón Social ante el SAT del responsable del tratamiento.
  - Domicilio fiscal en México donde se puedan ejercer formalmente los derechos ARCO.
- [ ] **Matriz de roles y accesos permitidos:**
  - ¿Quiénes tienen autorización para ver el NSS descifrado? (¿Únicamente el asesor asignado? ¿El director comercial? ¿El área administrativa?).
  - Establecer los permisos mínimos necesarios en Supabase antes de la Fase 2.
- [ ] **Separación entre Atribución y Conservación:**
  - Confirmar la política de conservación y purgado definitivo del NSS (independiente de los 15 días de atribución comercial; recomendada: 90 días naturales sin actividad).

---

## 3. Protocolo de Visitas y Confirmación por WhatsApp
- [ ] **SLA de atención manual:**
  - ¿En cuánto tiempo el asesor debe enviar el mensaje de WhatsApp tras recibir una solicitud web? (Recomendado: menos de 2 horas hábiles).
- [ ] **Aprobación de la plantilla de WhatsApp:**
  - Validar el texto propuesto del borrador:
    *"Hola [Nombre], soy [Asesor] de [Inmobiliaria]. Recibimos tu solicitud para conocer [Propiedad/Zona]. ¿Te funciona el [Día] a las [Hora]? Quedo atento para confirmar."*

---

## 4. Validación del Inventario y Oferta Real
- [x] **Modelo 1 Integrado (Modelo Águila Premier - Valle de los Encinos):**
  - Ubicación: Calzada del Sol, Salinas Victoria, N.L.
  - Especificaciones: 98 m² terreno, 74.39 m² construcción, 2 recámaras + estancia, 1.5 baños, 2 estacionamientos, vitropiso, patio y pasillo.
  - Amenidades: Pet park, canchas sintéticas, palapa, acceso controlado.
  - Fotografías: 11 fotografías de alta resolución reales de casa muestra integradas en galería interactiva.
- [ ] **Modelos adicionales de la desarrolladora:**
  - Sustituir los modelos restantes de catálogo conforme se provean sus expedientes técnicos y fotográficos.
  - Confirmar si se integrarán modelos de otros desarrollos o etapas en Salinas Victoria.
