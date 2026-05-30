# API Reference

Base URL: `http://localhost:5000`  
Interactive docs: `http://localhost:5000/swagger`

All error responses follow [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807).

---

## People

### `GET /api/people`

Returns a paginated list of people.

**Query params:** `page` (default 1), `pageSize` (default 20)

**Response 200:**
```json
{
  "data": [
    { "id": 1, "name": "Alice", "age": 30 }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

---

### `GET /api/people/{id}`

**Response 200:**
```json
{ "id": 1, "name": "Alice", "age": 30 }
```

**Response 404:**
```json
{ "title": "Not found", "status": 404, "detail": "Person 99 not found." }
```

---

### `POST /api/people`

**Request:**
```json
{ "name": "Alice", "age": 30 }
```

**Response 201** — returns created resource at `Location` header.

**Response 400** (validation):
```json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name": ["'Name' must not be empty."],
    "Age":  ["'Age' must be greater than 0."]
  }
}
```

---

### `PUT /api/people/{id}`

**Request:**
```json
{ "name": "Alice Souza", "age": 31 }
```

**Response 204** — no body.

**Response 404** — person not found.

---

### `DELETE /api/people/{id}`

**Response 204** — no body. Cascades to all transactions of that person.

**Response 404** — person not found.

---

## Categories

### `GET /api/categories`

**Query params:** `page`, `pageSize`

**Response 200:**
```json
{
  "data": [
    { "id": 1, "name": "Groceries", "purpose": 0 },
    { "id": 2, "name": "Salary",    "purpose": 1 },
    { "id": 3, "name": "Transfers", "purpose": 2 }
  ],
  "totalCount": 3,
  "page": 1,
  "pageSize": 20
}
```

`purpose` values: `0` = Expense, `1` = Income, `2` = Both.

---

### `POST /api/categories`

**Request:**
```json
{ "name": "Groceries", "purpose": 0 }
```

**Response 201.**

---

### `PUT /api/categories/{id}`

**Request:**
```json
{ "name": "Supermarket", "purpose": 0 }
```

**Response 204.**

---

### `DELETE /api/categories/{id}`

**Response 204.** Cascades to all transactions in that category.

---

## Transactions

### `GET /api/transactions`

**Query params:** `page`, `pageSize`

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "description": "Weekly groceries",
      "amount": 150.00,
      "date": "2025-05-10T00:00:00",
      "type": 0,
      "personId": 1,
      "personName": "Alice",
      "categoryId": 1,
      "categoryName": "Groceries"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 20
}
```

---

### `GET /api/transactions/{id}`

**Response 200** — single `TransactionDto` as above.  
**Response 404** — transaction not found.

---

### `POST /api/transactions`

**Request:**
```json
{
  "description": "Weekly groceries",
  "amount": 150.00,
  "date": "2025-05-10T00:00:00",
  "type": 0,
  "personId": 1,
  "categoryId": 1
}
```

**Response 201** — returns created `TransactionDto`.

**Response 422** — business rule violated:
```json
{
  "title": "Business rule violation",
  "status": 422,
  "detail": "People under 18 years old cannot register income transactions."
}
```

Other 422 cases:
- `"Cannot register an expense in an income-only category."`
- `"Cannot register an income in an expense-only category."`

---

### `PUT /api/transactions/{id}`

**Request:** same shape as POST.  
**Response 204.**  
**Response 404** — transaction not found.  
**Response 422** — business rule violated.

---

### `DELETE /api/transactions/{id}`

**Response 204.**  
**Response 404** — transaction not found.

---

## Reports

### `GET /api/reports/by-person`

**Response 200:**
```json
{
  "details": [
    {
      "name": "Alice",
      "totalIncome": 3000.00,
      "totalExpense": 1200.00,
      "balance": 1800.00
    }
  ],
  "grandTotalIncome": 3000.00,
  "grandTotalExpense": 1200.00,
  "grandBalance": 1800.00
}
```

---

### `GET /api/reports/by-category`

**Response 200:** same envelope shape, `details` contains `CategoryReportDto`:
```json
{
  "details": [
    {
      "name": "Groceries",
      "totalIncome": 0.00,
      "totalExpense": 1200.00,
      "balance": -1200.00
    }
  ],
  "grandTotalIncome": 3000.00,
  "grandTotalExpense": 1200.00,
  "grandBalance": 1800.00
}
```

---

## Business rules enforced by the API

| Rule | Trigger | HTTP status |
|---|---|---|
| People under 18 cannot register income | POST/PUT /transactions | 422 |
| Transaction type must match category purpose | POST/PUT /transactions | 422 |
| Cascade delete on person | DELETE /people/{id} | 204 (silent) |
| Cascade delete on category | DELETE /categories/{id} | 204 (silent) |
| Amount must be > 0 | POST/PUT /transactions | 400 |
| Name/description max length | Any POST/PUT | 400 |
