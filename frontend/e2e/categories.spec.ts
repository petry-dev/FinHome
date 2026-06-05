import { test, expect } from '@playwright/test';
import { mockAllEndpoints, mockEmptyEndpoints } from './fixtures/setup';

const API = 'http://localhost:5000';

test.describe('Categorias', () => {
  test('exibe a lista de categorias', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/categories');
    await expect(page.getByText('Mercado')).toBeVisible();
    await expect(page.getByText('Salário')).toBeVisible();
    await expect(page.getByText('Transferência')).toBeVisible();
  });

  test('badge "Despesa" para purpose=0', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/categories');
    const badge = page.locator('.fh-badge-red', { hasText: 'Despesa' });
    await expect(badge).toBeVisible();
  });

  test('badge "Receita" para purpose=1', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/categories');
    const badge = page.locator('.fh-badge-green', { hasText: 'Receita' });
    await expect(badge).toBeVisible();
  });

  test('badge "Ambas" para purpose=2', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/categories');
    const badge = page.locator('.fh-badge-blue', { hasText: 'Ambas' });
    await expect(badge).toBeVisible();
  });

  test('estado vazio quando não há categorias', async ({ page }) => {
    await mockEmptyEndpoints(page);
    await page.goto('/categories');
    await expect(page.getByText('Nenhuma categoria cadastrada')).toBeVisible();
  });

  test('abre o modal de nova categoria', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/categories');
    await page.click('button:has-text("Nova categoria")');
    await expect(page.locator('.fh-modal-title')).toContainText('Nova categoria');
  });

  test('exibe as três opções de finalidade no select', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/categories');
    await page.click('button:has-text("Nova categoria")');
    const select = page.locator('select');
    await expect(select.locator('option', { hasText: 'Despesa' })).toHaveCount(1);
    await expect(select.locator('option', { hasText: 'Receita' })).toHaveCount(1);
    await expect(select.locator('option', { hasText: 'Ambas' })).toHaveCount(1);
  });

  test('cria categoria e fecha modal', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.route(`${API}/api/categories`, async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 201, json: { id: 99, name: 'Educação', purpose: 0 } });
      } else {
        await route.continue();
      }
    });
    await page.goto('/categories');
    await page.click('button:has-text("Nova categoria")');
    await page.fill('input[placeholder*="Mercado"]', 'Educação');
    await page.click('button:has-text("Criar")');
    await expect(page.locator('.fh-overlay')).not.toBeVisible();
  });
});
