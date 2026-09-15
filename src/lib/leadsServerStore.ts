import fs from 'fs';
import path from 'path';
import { Lead } from '@/types';
import { INITIAL_LEADS } from '@/data/mockData';

// Ruta del archivo local para persistencia de datos en servidor
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'leadsStore.json');

// Memoria caché para entornos donde el sistema de archivos sea de solo lectura
let inMemoryLeads: Lead[] = [...INITIAL_LEADS];

function readFromStorage(): Lead[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryLeads = parsed;
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Advertencia al leer leadsStore.json, usando memoria:', error);
  }
  return inMemoryLeads;
}

function writeToStorage(leads: Lead[]): void {
  inMemoryLeads = leads;
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (error) {
    console.warn('Advertencia al escribir en leadsStore.json, persistiendo en memoria:', error);
  }
}

export async function getServerLeads(): Promise<Lead[]> {
  return readFromStorage();
}

export async function getServerLeadById(id: string): Promise<Lead | null> {
  const leads = readFromStorage();
  return leads.find((l) => l.id === id) || null;
}

export async function saveServerLead(lead: Lead): Promise<Lead> {
  const leads = readFromStorage();
  const existingIdx = leads.findIndex((l) => l.id === lead.id);

  if (existingIdx >= 0) {
    leads[existingIdx] = lead;
  } else {
    leads.unshift(lead);
  }

  writeToStorage(leads);
  return lead;
}

export async function updateServerLeadAppointment(
  leadId: string,
  appointmentStatus: 'confirmada' | 'cancelada' | 'reprogramada',
  confirmedDate?: string,
  confirmedTime?: string
): Promise<Lead | null> {
  const leads = readFromStorage();
  const lead = leads.find((l) => l.id === leadId);

  if (!lead) return null;

  const existingReq = lead.appointmentRequest;
  const newDate = confirmedDate || existingReq?.confirmedDate || existingReq?.preferredDate || new Date().toISOString().split('T')[0];
  const newTime = confirmedTime || existingReq?.confirmedTime || existingReq?.timeSlot || '11:00 AM';

  lead.appointmentRequest = {
    modality: existingReq?.modality || 'presencial',
    preferredDate: newDate,
    timeSlot: newTime,
    status: appointmentStatus,
    confirmedDate: newDate,
    confirmedTime: newTime,
    notes: existingReq?.notes || 'Actualizado vía Bot de Telegram o Panel Web',
  };

  if (appointmentStatus === 'confirmada') {
    lead.commercialStatus = 'cita_confirmada';
  } else if (appointmentStatus === 'cancelada') {
    lead.commercialStatus = 'en_seguimiento';
  }

  lead.internalNotes = [
    {
      id: `note-${Date.now()}`,
      author: 'Bot de Telegram / Sistema',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      content: `Visita ${appointmentStatus.toUpperCase()} para el ${newDate} (${newTime}) desde interacción móvil.`,
    },
    ...lead.internalNotes,
  ];

  writeToStorage(leads);
  return lead;
}
