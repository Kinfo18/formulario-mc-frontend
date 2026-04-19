import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/session';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';
const ID_RE = /^[a-z0-9]{20,30}$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  if (!ID_RE.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/api/desplazamientos/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    return NextResponse.json({ error: 'Error al conectar con el servidor' }, { status: 502 });
  }

  if (!upstream.ok) {
    const body = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { error: (body as Record<string, unknown>).error ?? 'No se pudo generar el PDF' },
      { status: upstream.status },
    );
  }

  const buffer = await upstream.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="FOR-SSTA-218-${id}.pdf"`,
    },
  });
}
