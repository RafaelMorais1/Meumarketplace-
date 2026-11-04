import { test, expect } from '@playwright/test';

test.describe('E2E-01: Fluxo Completo de Autenticação e Sessão', () => {
  const timestamp = Date.now();
  const testEmail = `comprador_${timestamp}@teste.com`;
  const testPassword = 'Password123';

  test('deve cadastrar um novo comprador, manter sessão ativa e efetuar logout com sucesso', async ({ page }) => {
    // 1. Acessa a página inicial como visitante
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Cadastre-se' })).toBeVisible();

    // 2. Navega para o cadastro
    await page.getByRole('link', { name: 'Cadastre-se' }).click();
    await expect(page).toHaveURL('/register');

    // 3. Preenche o formulário de cadastro
    await page.getByLabel('Nome Completo').fill('Comprador E2E');
    await page.getByLabel('E-mail').fill(testEmail);
    await page.getByLabel(/Senha/i).fill(testPassword);
    // Seleciona "Quero Comprar"
    await page.getByText('Quero Comprar').click();

    // 4. Submete o cadastro
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // 5. Deve ser redirecionado para a home logado (com cookie seguro de sessão)
    await page.waitForURL('/');
    await expect(page.getByText('Comprador E2E')).toBeVisible();
    await expect(page.getByText('Comprador')).toBeVisible();

    // 6. Clica em "Sair" (Logout)
    await page.getByRole('button', { name: 'Sair' }).click();

    // 7. Deve ser redirecionado para a página de login com a sessão revogada
    await page.waitForURL('/login');
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cadastre-se' })).toBeVisible();
  });
});

