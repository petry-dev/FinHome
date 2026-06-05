import { test, expect } from '@playwright/test';
import { mockAllEndpoints } from './fixtures/setup';

test.describe('Navegação', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllEndpoints(page);
  });

  test('carrega a home e exibe o dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Olá');
    await expect(page.locator('.fh-sidebar')).toBeVisible();
  });

  test('sidebar exibe todos os itens de navegação', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('.fh-nav');
    await expect(nav.getByText('Dashboard')).toBeVisible();
    await expect(nav.getByText('Transações')).toBeVisible();
    await expect(nav.getByText('Pessoas')).toBeVisible();
    await expect(nav.getByText('Categorias')).toBeVisible();
    await expect(nav.getByText('Relatórios')).toBeVisible();
  });

  test('navega para Pessoas sem recarregar a página', async ({ page }) => {
    await page.goto('/');
    await page.click('.fh-nav >> text=Pessoas');
    await expect(page).toHaveURL('/people', { timeout: 10_000 });
    await expect(page.locator('.fh-topbar')).toContainText('Pessoas', { timeout: 10_000 });
  });

  test('navega para Categorias', async ({ page }) => {
    await page.goto('/');
    await page.click('.fh-nav >> text=Categorias');
    await expect(page).toHaveURL('/categories');
    await expect(page.locator('.fh-topbar')).toContainText('Categorias');
  });

  test('navega para Transações', async ({ page }) => {
    await page.goto('/');
    await page.click('.fh-nav >> text=Transações');
    await expect(page).toHaveURL('/transactions');
    await expect(page.locator('.fh-topbar')).toContainText('Transações');
  });

  test('navega para Relatórios', async ({ page }) => {
    await page.goto('/');
    await page.click('.fh-nav >> text=Relatórios');
    await expect(page).toHaveURL('/reports');
    await expect(page.locator('.fh-topbar')).toContainText('Relatórios');
  });

  test('item ativo na sidebar reflete a rota atual', async ({ page }) => {
    await page.goto('/people');
    const activeItem = page.locator('.fh-nav-item.active');
    await expect(activeItem).toContainText('Pessoas');
  });
});
