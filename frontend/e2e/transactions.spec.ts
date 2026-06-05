import { test, expect } from '@playwright/test';
import { mockAllEndpoints, mockEmptyEndpoints } from './fixtures/setup';

const API = 'http://localhost:5000';

test.describe('Transações', () => {
  test('exibe a lista de transações', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/transactions');
    await expect(page.getByText('Feira semanal')).toBeVisible();
    await expect(page.getByText('Salário junho')).toBeVisible();
  });

  test('despesa exibe prefixo "−" e cor vermelha', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/transactions');
    const expenseAmount = page.locator('span', { hasText: '− R$' }).first();
    await expect(expenseAmount).toBeVisible();
    const color = await expenseAmount.evaluate(el => getComputedStyle(el).color);
    // var(--neg) = #d1492f = rgb(209, 73, 47)
    expect(color).toBe('rgb(209, 73, 47)');
  });

  test('receita exibe prefixo "+" e cor verde', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/transactions');
    const incomeAmount = page.locator('span', { hasText: '+ R$' }).first();
    await expect(incomeAmount).toBeVisible();
    const color = await incomeAmount.evaluate(el => getComputedStyle(el).color);
    // var(--pos) = #2f9e44 = rgb(47, 158, 68)
    expect(color).toBe('rgb(47, 158, 68)');
  });

  test('exibe estado vazio quando não há transações', async ({ page }) => {
    await mockEmptyEndpoints(page);
    await page.goto('/transactions');
    await expect(page.getByText('Nenhuma transação ainda')).toBeVisible();
  });

  test('abre o modal de nova transação ao clicar no botão', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/transactions');
    await page.click('button:has-text("Nova transação")');
    await expect(page.locator('.fh-modal-title')).toContainText('Nova transação');
  });

  test('o modal de nova transação tem os campos obrigatórios', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/transactions');
    await page.click('button:has-text("Nova transação")');
    await expect(page.locator('.fh-modal')).toBeVisible();
    await expect(page.locator('label', { hasText: 'Pessoa' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Categoria' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Descrição' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Valor' })).toBeVisible();
  });

  test('exibe erro ao submeter sem preencher os campos', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/transactions');
    await page.click('button:has-text("Nova transação")');
    await page.click('button:has-text("Lançar")');
    await expect(page.getByText('Preencha todos os campos.')).toBeVisible();
  });

  test('abre modal de confirmação de exclusão', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/transactions');
    const deleteButtons = page.locator('button[title="Excluir"]');
    await deleteButtons.first().click();
    await expect(page.locator('.fh-modal-title')).toContainText('Excluir transação');
    await expect(page.locator('.fh-modal')).toContainText('Esta ação não pode ser desfeita.');
  });

  test('cancela exclusão e mantém o item na lista', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/transactions');
    const deleteButtons = page.locator('button[title="Excluir"]');
    await deleteButtons.first().click();
    await page.click('button:has-text("Cancelar")');
    await expect(page.locator('.fh-overlay')).not.toBeVisible();
    await expect(page.getByText('Feira semanal')).toBeVisible();
  });

  test('confirma exclusão e chama DELETE na API', async ({ page }) => {
    await mockAllEndpoints(page);
    let deleteCalled = false;
    await page.route(`${API}/api/transactions/1`, route => {
      if (route.request().method() === 'DELETE') {
        deleteCalled = true;
        route.fulfill({ status: 204 });
      } else {
        route.continue();
      }
    });
    await page.goto('/transactions');
    const deleteButtons = page.locator('button[title="Excluir"]');
    await deleteButtons.first().click();
    await page.click('.fh-btn-danger:has-text("Excluir")');
    await expect(page.locator('.fh-overlay')).not.toBeVisible();
    expect(deleteCalled).toBe(true);
  });
});
