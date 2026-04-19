import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/conductor.json');

setup('autenticar como conductor', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Correo electrónico').fill('conductor@empresa.com');
  await page.getByLabel('Contraseña').fill('Cond123!');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });

  await page.context().storageState({ path: authFile });
});
