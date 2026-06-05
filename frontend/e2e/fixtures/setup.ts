import { Page } from '@playwright/test';
import { PEOPLE, CATEGORIES, TRANSACTIONS, REPORT } from './mockData';

const API = 'http://localhost:5000';

export async function mockAllEndpoints(page: Page) {
  await page.route(`${API}/api/people**`, route =>
    route.fulfill({ json: { items: PEOPLE, totalCount: PEOPLE.length } }),
  );
  await page.route(`${API}/api/categories**`, route =>
    route.fulfill({ json: { items: CATEGORIES, totalCount: CATEGORIES.length } }),
  );
  await page.route(`${API}/api/transactions**`, route =>
    route.fulfill({ json: { items: TRANSACTIONS, totalCount: TRANSACTIONS.length } }),
  );
  await page.route(`${API}/api/reports/by-person`, route =>
    route.fulfill({ json: REPORT }),
  );
}

export async function mockEmptyEndpoints(page: Page) {
  const empty = { items: [], totalCount: 0 };
  await page.route(`${API}/api/people**`,       route => route.fulfill({ json: empty }));
  await page.route(`${API}/api/categories**`,   route => route.fulfill({ json: empty }));
  await page.route(`${API}/api/transactions**`, route => route.fulfill({ json: empty }));
  await page.route(`${API}/api/reports/by-person`, route =>
    route.fulfill({ json: { details: [], grandTotalIncome: 0, grandTotalExpense: 0, grandBalance: 0 } }),
  );
}
