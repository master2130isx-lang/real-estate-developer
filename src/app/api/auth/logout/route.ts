import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true, message: 'Sesión cerrada exitosamente.' });
  response.cookies.delete('advisor_session');
  return response;
}
