import { test, expect } from '@playwright/test';

test.describe('E2E-02: Fluxo do Vendedor e Catálogo Público', () => {
  const timestamp = Date.now();
  const sellerEmail = `vendedor_${timestamp}@teste.com`;
  const productTitle = `Teclado Gamer Mecânico ${timestamp}`;

  test('vendedor cadastra produto e visitante visualiza no catálogo público e detalhes', async ({ page }) => {
    // 1. Cadastra uma conta como Vendedor (seller)
    await page.goto('/register');
    await page.getByLabel('Nome Completo').fill('Vendedor Master');
    await page.getByLabel('E-mail').fill(sellerEmail);
    await page.getByLabel(/Senha/i).fill('Password123');
    await page.getByText('Quero Vender').click();
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await page.waitForURL('/');
    await expect(page.getByText('Vendedor Master')).toBeVisible();

    // 2. Acessa a área "Meus Produtos"
    await page.getByRole('link', { name: 'Meus Produtos (Vendedor)' }).click();
    await page.waitForURL('/dashboard/products');

    // 3. Clica em cadastrar novo produto
    await page.getByRole('link', { name: /Cadastrar Novo Produto/i }).click();
    await page.waitForURL('/dashboard/products/new');

    // 4. Preenche formulário de produto
    await page.getByLabel('Título do Produto').fill(productTitle);
    await page.getByLabel('Descrição Detalhada').fill('Switch Blue com iluminação RGB personalizável.');
    await page.getByLabel(/Preço de Venda/i).fill('299,90');
    await page.getByLabel('Quantidade em Estoque').fill('15');

    // 5. Publica o anúncio
    await page.getByRole('button', { name: 'Publicar Anúncio' }).click();
    await page.waitForURL('/dashboard/products');
    await expect(page.getByText(productTitle)).toBeVisible();

    // 6. Faz Logout para testar visualização como visitante anônimo
    await page.getByRole('button', { name: 'Sair' }).click();
    await page.waitForURL('/login');

    // 7. Acessa a Home pública e pesquisa pelo produto recém-criado
    await page.goto('/');
    await page.getByPlaceholder(/Buscar produtos por nome/i).fill(productTitle);
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText(productTitle)).toBeVisible();
    await expect(page.getByText('R$ 299,90')).toBeVisible();

    // 8. Clica no produto para ver os detalhes
    await page.getByText(productTitle).click();
    await expect(page.getByRole('heading', { name: productTitle })).toBeVisible();
    await expect(page.getByText('Vendedor Master')).toBeVisible();
    await expect(page.getByText('15 disponíveis em estoque')).toBeVisible();
  });
});

