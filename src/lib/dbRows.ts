/**
 * Forma de las filas de Supabase (snake_case), según supabase/schema.sql.
 * Los campos pueden venir como null desde la base de datos.
 */
import type {
  AppointmentRequest,
  AttributionStatus,
  AuditEvent,
  BudgetRange,
  CommercialStatus,
  CompatibilityLevel,
  ContactChannel,
  FinancingType,
  LeadNote,
  LeadSource,
  NssStatus,
  PreferredContactTime,
  Property,
  PurchaseTimeline,
} from '@/types';

export interface LeadRow {
  id: string;
  folio: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string | null;
  preferred_channel: ContactChannel | null;
  preferred_contact_time: PreferredContactTime | null;
  interested_zone: string | null;
  selected_property_id: string | null;
  selected_property_title: string | null;
  budget_range: BudgetRange | null;
  purchase_timeline: PurchaseTimeline | null;
  financing_type: FinancingType | null;
  financing_subtype: string | null;
  needs_orientation: boolean | null;
  privacy_consent_accepted: boolean | null;
  marketing_consent_accepted: boolean | null;
  nss_status: NssStatus | null;
  nss_value_encrypted_mock: string | null;
  nss_last_four: string | null;
  curp_value?: string | null;
  curp_last_four?: string | null;
  lead_source?: LeadSource | null;
  attribution_status: AttributionStatus | null;
  attribution_advisor: string | null;
  attribution_confirmed_at: string | null;
  attribution_expires_at: string | null;
  attribution_reference: string | null;
  attribution_confirmed_by: string | null;
  attribution_notes: string | null;
  commercial_status: CommercialStatus | null;
  compatibility: CompatibilityLevel | null;
  next_action: string | null;
  assigned_advisor: string | null;
  appointment_request: AppointmentRequest | null;
  is_archived: boolean | null;
  internal_notes: LeadNote[] | null;
  audit_history: AuditEvent[] | null;
  db_updated_at?: string;
}

export interface PropertyRow {
  id: string;
  code: string;
  name: string;
  model: string;
  development: string | null;
  address: string | null;
  zone: string | null;
  city: string | null;
  price: number | string;
  price_formatted: string | null;
  bedrooms: number | null;
  bathrooms: number | string | null;
  has_stay_area: boolean | null;
  construction_m2: number | string | null;
  land_m2: number | string | null;
  parking_spots: number | null;
  admitted_financing: FinancingType[] | null;
  availability_status: Property['availabilityStatus'] | null;
  last_updated: string | null;
  estimated_closing_costs: string | null;
  image: string | null;
  images: string[] | null;
  tags: string[] | null;
  description: string | null;
  key_features: string[] | null;
  amenities: string[] | null;
  nearby_services: string[] | null;
  is_illustrative_demo: boolean | null;
  is_hero?: boolean | null;
  updated_at?: string;
}
