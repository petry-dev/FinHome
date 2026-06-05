import { test, expect } from '@playwright/test';
import { mockAllEndpoints, mockEmptyEndpoints } from './fixtures/setup';

test.describe('Relatórios', () => {
  test('exibe os três cards de KPI', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/reports');
    await expect(page.getByText('Saldo total')).toBeVisible();
    await expect(page.getByText('Total de receitas')).toBeVisible();
    await expect(page.getByText('Total de despesas')).toBeVisible();
  });

  test('exibe os valores em formato BRL', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/reports');
    // R$ 4.850,00 (grandBalance) — pode aparecer múltiplas vezes (card + tabela)
    await expect(page.getByText(/R\$\s*4\.850/).first()).toBeVisible();
    // R$ 5.000,00 (income)
    await expect(page.getByText(/R\$\s*5\.000/).first()).toBeVisible();
  });

  test('exibe o nome da pessoa na tabela', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/reports');
    await expect(page.getByText('Alice Silva')).toBeVisible();
  });

  test('exibe linha de Total geral', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/reports');
    await expect(page.getByText('Total geral')).toBeVisible();
  });

  test('exibe estado vazio quando sem dados', async ({ page }) => {
    await mockEmptyEndpoints(page);
    await page.goto('/reports');
    await expect(page.getByText('Sem dados ainda')).toBeVisible();
  });

  test('valores positivos de receita ficam em verde', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/reports');
    // receitas na tabela
    const incomeCell = page.locator('td span.fh-num').filter({ hasText: /5\.000/ }).first();
    await expect(incomeCell).toBeVisible();
    const color = await incomeCell.evaluate(el => getComputedStyle(el).color);
    // var(--pos) = rgb(47, 158, 68)
    expect(color).toBe('rgb(47, 158, 68)');
  });
});
