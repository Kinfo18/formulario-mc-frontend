import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';
const MAX_IDS = 50;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const { ids } = body as { ids?: unknown };
  if (!Array.isArray(ids) || ids.length === 0 || ids.some((id) => typeof id !== 'string')) {
    return NextResponse.json({ error: 'ids debe ser un array de strings' }, { status: 422 });
  }
  if (ids.length > MAX_IDS) {
    return NextResponse.json({ error: `Máximo ${MAX_IDS} desplazamientos por descarga` }, { status: 422 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/api/desplazamientos/pdf/bulk`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    return NextResponse.json({ error: 'Error al conectar con el servidor' }, { status: 502 });
  }

  if (!upstream.ok) {
    const errBody = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { error: (errBody as Record<string, unknown>).error ?? 'No se pudo generar el ZIP' },
      { status: upstream.status },
    );
  }

  const fecha = new Date().toISOString().split('T')[0];
  const buffer = await upstream.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="desplazamientos-${fecha}.zip"`,
    },
  });
}
