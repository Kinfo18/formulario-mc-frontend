import { test, expect, type Page } from '@playwright/test';

function f(page: Page) {
  return {
    rutaSelect: page.locator('select[name="rutaId"]'),
    motivoInput: page.locator('[name="motivoDesplazamiento"]'),
    tipoVehiculoSelect: page.locator('select[name="tipoVehiculo"]'),
    tiempoAntelacion: page.locator('[name="tiempoAntelacion"]'),
    rutaPrincipal: page.locator('[name="rutaPrincipalNombre"]'),
    tiempoTraslado: page.locator('[name="tiempoTraslado"]'),
    recorridoKms: page.locator('[name="recorridoKms"]'),
    horaSalida: page.locator('[name="horaSalida"]'),
    horaLlegada: page.locator('[name="horaLlegada"]'),
    preoperacional: page.locator('[name="preoperacionalRealizado"]'),
    documentacion: page.locator('[name="documentacionVerificada"]'),
    transportaProducto: page.locator('[name="transportaProducto"]'),
    cualProducto: page.locator('[name="cualProducto"]'),
    submitBtn: page.getByRole('button', { name: /Guardar desplazamiento/i }),
  };
}

test.describe('Formulario de nuevo desplazamiento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/desplazamientos/nuevo');
    await expect(page.getByRole('heading', { name: 'Nuevo desplazamiento' })).toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────
  // 1. Renderizado inicial
  // ──────────────────────────────────────────────────────────────

  test('muestra el selector de ruta y los campos de la sección 1', async ({ page }) => {
    const { rutaSelect, motivoInput, tipoVehiculoSelect, horaSalida, horaLlegada } = f(page);
    await expect(rutaSelect).toBeVisible();
    await expect(motivoInput).toBeVisible();
    await expect(tipoVehiculoSelect).toBeVisible();
    await expect(horaSalida).toBeVisible();
    await expect(horaLlegada).toBeVisible();
  });

  test('no muestra las secciones de plantilla antes de seleccionar ruta', async ({ page }) => {
    await expect(page.getByText('2. Ruta principal')).not.toBeVisible();
    await expect(page.getByText('5. Límites de velocidad')).not.toBeVisible();
    await expect(page.getByText('Datos de plantilla')).not.toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────
  // 2. Selección de ruta — preview de plantilla
  // ──────────────────────────────────────────────────────────────

  test('al seleccionar una ruta aparecen las secciones de plantilla', async ({ page }) => {
    const { rutaSelect } = f(page);
    await rutaSelect.selectOption({ label: 'Yopal – Aguazul' });

    await expect(page.getByText('2. Ruta principal')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText('Datos de plantilla').first()).toBeVisible();
  });

  test('pre-llena el campo "Ruta principal" con el nombre de la plantilla seleccionada', async ({ page }) => {
    const { rutaSelect, rutaPrincipal } = f(page);
    await rutaSelect.selectOption({ label: 'Yopal – Aguazul' });

    await expect(rutaPrincipal).toHaveValue('Yopal – Aguazul', { timeout: 8_000 });
  });

  test('al cambiar de ruta actualiza la vista previa', async ({ page }) => {
    const { rutaSelect, rutaPrincipal } = f(page);
    await rutaSelect.selectOption({ label: 'Yopal – Aguazul' });
    await expect(rutaPrincipal).toHaveValue('Yopal – Aguazul', { timeout: 8_000 });

    await rutaSelect.selectOption({ label: 'Yopal – Tauramena' });
    await expect(rutaPrincipal).toHaveValue('Yopal – Tauramena', { timeout: 8_000 });
  });

  test('al deseleccionar ruta (opción vacía) oculta las secciones de plantilla', async ({ page }) => {
    const { rutaSelect } = f(page);
    await rutaSelect.selectOption({ label: 'Yopal – Aguazul' });
    await expect(page.getByText('2. Ruta principal')).toBeVisible({ timeout: 8_000 });

    await rutaSelect.selectOption({ value: '' });
    await expect(page.getByText('2. Ruta principal')).not.toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────
  // 3. Campos condicionales
  // ──────────────────────────────────────────────────────────────

  test('el campo "¿Cuál producto?" no aparece hasta marcar "Transporta producto"', async ({ page }) => {
    const { transportaProducto, cualProducto } = f(page);
    await expect(cualProducto).not.toBeVisible();

    await transportaProducto.check();

    await expect(cualProducto).toBeVisible();
  });

  test('el campo "¿Cuál producto?" desaparece al desmarcar "Transporta producto"', async ({ page }) => {
    const { transportaProducto, cualProducto } = f(page);
    await transportaProducto.check();
    await expect(cualProducto).toBeVisible();

    await transportaProducto.uncheck();
    await expect(cualProducto).not.toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────
  // 4. Validación de campos requeridos
  // ──────────────────────────────────────────────────────────────

  test('bloquea el envío si no se seleccionó ruta (validación nativa HTML5)', async ({ page }) => {
    const { submitBtn, rutaSelect } = f(page);
    await submitBtn.click();
    await expect(page).toHaveURL('/desplazamientos/nuevo');
    const isInvalid = await rutaSelect.evaluate((el: HTMLSelectElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('los campos de hora aceptan formato HH:mm', async ({ page }) => {
    const { horaSalida, horaLlegada } = f(page);
    await horaSalida.fill('08:30');
    await expect(horaSalida).toHaveValue('08:30');

    await horaLlegada.fill('17:15');
    await expect(horaLlegada).toHaveValue('17:15');
  });

  // ──────────────────────────────────────────────────────────────
  // 5. Flujo completo de creación
  // ──────────────────────────────────────────────────────────────

  test('crea un desplazamiento exitosamente y redirige al detalle', async ({ page }) => {
    const fields = f(page);

    await fields.rutaSelect.selectOption({ label: 'Yopal – Aguazul' });
    await expect(fields.rutaPrincipal).toHaveValue('Yopal – Aguazul', { timeout: 8_000 });

    await fields.motivoInput.fill('Visita a campo para inspección de equipos y mantenimiento preventivo.');
    await fields.tiempoAntelacion.fill('2 horas');
    await fields.tipoVehiculoSelect.selectOption({ value: 'TRANSPORTE_PERSONAL' });
    await fields.tiempoTraslado.fill('1h 45min');
    await fields.recorridoKms.fill('85');
    await fields.horaSalida.fill('07:00');
    await fields.horaLlegada.fill('08:45');
    await fields.preoperacional.check();
    await fields.documentacion.check();

    await fields.submitBtn.click();

    await expect(page).toHaveURL(/\/desplazamientos\/[a-z0-9]+$/, { timeout: 15_000 });
    await expect(page.getByText(/DES-/)).toBeVisible({ timeout: 5_000 });
  });

  test('crea desplazamiento con "Transporta producto" y persiste el valor', async ({ page }) => {
    const fields = f(page);

    await fields.rutaSelect.selectOption({ label: 'Yopal – Aguazul' });
    await expect(fields.rutaPrincipal).toHaveValue('Yopal – Aguazul', { timeout: 8_000 });

    await fields.motivoInput.fill('Transporte de materiales para mantenimiento de infraestructura en campo.');
    await fields.tiempoAntelacion.fill('3 horas');
    await fields.tipoVehiculoSelect.selectOption({ value: 'CARGA_PESADA' });
    await fields.tiempoTraslado.fill('2h 30min');
    await fields.recorridoKms.fill('85');
    await fields.horaSalida.fill('06:00');
    await fields.horaLlegada.fill('08:30');

    await fields.transportaProducto.check();
    await fields.cualProducto.fill('Tubería de acero inoxidable');

    await fields.submitBtn.click();

    await expect(page).toHaveURL(/\/desplazamientos\/[a-z0-9]+$/, { timeout: 15_000 });
    await expect(page.getByText('Tubería de acero inoxidable')).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Tabla de límites de velocidad', () => {
  test('muestra la sección "Límites de velocidad" al seleccionar ruta Yopal–Aguazul', async ({ page }) => {
    await page.goto('/desplazamientos/nuevo');
    await page.locator('select[name="rutaId"]').selectOption({ label: 'Yopal – Aguazul' });

    await expect(page.getByText('5. Límites de velocidad')).toBeVisible({ timeout: 8_000 });
  });
});
