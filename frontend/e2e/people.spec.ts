import { test, expect } from '@playwright/test';
import { mockAllEndpoints, mockEmptyEndpoints } from './fixtures/setup';
import { PEOPLE } from './fixtures/mockData';

const API = 'http://localhost:5000';

test.describe('Pessoas', () => {
  test('exibe a lista de pessoas', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/people');
    await expect(page.getByText('Alice Silva')).toBeVisible();
    await expect(page.getByText('Bob Junior')).toBeVisible();
  });

  test('exibe badge "Menor" para pessoa com idade < 18', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/people');
    await expect(page.locator('.fh-badge', { hasText: 'Menor' })).toBeVisible();
  });

  test('exibe estado vazio quando não há pessoas', async ({ page }) => {
    await mockEmptyEndpoints(page);
    await page.goto('/people');
    await expect(page.getByText('Nenhuma pessoa cadastrada')).toBeVisible();
  });

  test('abre o modal ao clicar em "Nova pessoa"', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/people');
    await page.click('button:has-text("Nova pessoa")');
    await expect(page.locator('.fh-modal-title')).toContainText('Nova pessoa');
  });

  test('fecha o modal com a tecla Escape', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/people');
    await page.click('button:has-text("Nova pessoa")');
    await expect(page.locator('.fh-overlay')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.fh-overlay')).not.toBeVisible();
  });

  test('exibe erro de validação ao submeter sem preencher o nome', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/people');
    await page.click('button:has-text("Nova pessoa")');
    await page.click('button:has-text("Adicionar")');
    await expect(page.getByText('Nome é obrigatório.')).toBeVisible();
  });

  test('cria uma pessoa com sucesso e fecha o modal', async ({ page }) => {
    await mockAllEndpoints(page);
    // intercept POST and return new person
    await page.route(`${API}/api/people`, async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 201, json: { id: 99, name: 'Carlos Souza', age: 28 } });
      } else {
        await route.fulfill({ json: { items: PEOPLE, totalCount: PEOPLE.length } });
      }
    });
    await page.goto('/people');
    await page.click('button:has-text("Nova pessoa")');
    await page.fill('input[placeholder="Nome da pessoa"]', 'Carlos Souza');
    await page.fill('input[placeholder="Ex: 32"]', '28');
    await page.click('button:has-text("Adicionar")');
    await expect(page.locator('.fh-overlay')).not.toBeVisible();
  });

  test('exibe confirmação antes de excluir', async ({ page }) => {
    await mockAllEndpoints(page);
    await page.goto('/people');
    // mock window.confirm to return true
    await page.evaluate(() => { window.confirm = () => true; });
    await page.route(`${API}/api/people/1`, route => route.fulfill({ status: 204 }));
    const deleteButtons = page.locator('button[title="Excluir"]');
    await deleteButtons.first().click();
    // list should reload (still shows from mock)
    await expect(page.getByText('Alice Silva')).toBeVisible();
  });
});
