import { test, expect } from '@playwright/test';

test.describe('E2E-03: Proteção de Rotas e Controle de Acesso por Papel (RBAC)', () => {
  const timestamp = Date.now();
  const buyerEmail = `comprador_rbac_${timestamp}@teste.com`;

  test('comprador (buyer) não deve ver botão de gerenciar produtos e é bloqueado se acessar URL direta', async ({ page }) => {
    // 1. Cadastra conta como Comprador
    await page.goto('/register');
    await page.getByLabel('Nome Completo').fill('Cliente Comum');
    await page.getByLabel('E-mail').fill(buyerEmail);
    await page.getByLabel(/Senha/i).fill('Password123');
    await page.getByText('Quero Comprar').click();
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await page.waitForURL('/');
    await expect(page.getByText('Comprador')).toBeVisible();

    // 2. Garante que no cabeçalho NÃO existe o link "Meus Produtos (Vendedor)"
    await expect(page.getByRole('link', { name: 'Meus Produtos (Vendedor)' })).not.toBeVisible();

    // 3. Tenta forçar a URL direta digitando no navegador: /dashboard/products
    const response = await page.goto('/dashboard/products');

    // 4. Deve receber erro de permissão insuficiente (403 Forbidden)
    expect(response?.status()).toBe(403);
    await expect(page.getByText(/Acesso negado/i)).toBeVisible();
  });
});

