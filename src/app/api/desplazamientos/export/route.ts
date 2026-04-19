import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

const ALLOWED_PARAMS = ['estado', 'fechaDesde', 'fechaHasta', 'tipoVehiculo', 'conductorId', 'rutaId', 'q'];

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const incoming = req.nextUrl.searchParams;
  const qs = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    const val = incoming.get(key);
    if (val) qs.set(key, val);
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${API_URL}/api/desplazamientos/export${qs.toString() ? `?${qs.toString()}` : ''}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(30000),
      },
    );
  } catch {
    return NextResponse.json({ error: 'Error al conectar con el servidor' }, { status: 502 });
  }

  if (!upstream.ok) {
    const body = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { error: (body as Record<string, unknown>).error ?? 'No se pudo exportar' },
      { status: upstream.status },
    );
  }

  const csv = await upstream.text();
  const fecha = new Date().toISOString().split('T')[0];

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="desplazamientos-${fecha}.csv"`,
    },
  });
}
