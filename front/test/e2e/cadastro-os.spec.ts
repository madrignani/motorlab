import { test, expect } from '@playwright/test';
import { iniciaSessaoAtendente, iniciaSessaoMecanico, iniciaSessaoGerente } from './login/inicia-sessao.ts';
import { redefinir } from './utils/recomposicao-bd.ts';


const URL_CADASTRO = 'http://localhost:5173/cadastro-os.html';


test.describe( 'Cadastro de OS com Atendente', () => {
        
        test.beforeEach( async ({ context }) => {
            await iniciaSessaoAtendente(context);
        } );

        test.afterAll( async () => {
            await redefinir();
        } );

        test( 'Deve exibir os dados de usuário', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('ATENDENTE');
        } );

        test( 'Deve listar veículos após selecionar cliente', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.fill('#buscaCliente', '94102171112');
            await page.click('#botaoBuscaCliente');
            await page.waitForTimeout(1000);
            await page.click('#veiculos');
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('ABC1D23');
            expect(conteudoPagina).toContain('EFG3J23');
        } );

        test( 'Deve listar mecânicos disponíveis', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.click('#responsaveis');
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('João Silva');
            expect(conteudoPagina).toContain('José Carvalho');
        } );

        test( 'Deve buscar e adicionar serviço à lista', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.fill('#buscaServico', 'óleo');
            await page.waitForTimeout(500);
            const listaTarefas = await page.locator('#listaTarefasServico');
            await expect(listaTarefas).toBeVisible();
            const primeiroServico = listaTarefas.locator('div').first();
            await primeiroServico.click();
            await page.waitForTimeout(500);
            const listaServicos = await page.textContent('#listaServicos');
            expect(listaServicos).toContain('Troca do óleo');
        } );

        test( 'Deve concluir cadastro de OS válida', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.fill('#buscaCliente', '94102171112');
            await page.click('#botaoBuscaCliente');
            await page.waitForTimeout(1000);
            await page.selectOption('#veiculos', { index: 1 });
            await page.selectOption('#responsaveis', { index: 1 });
            await page.fill('#buscaServico', 'óleo');
            await page.waitForTimeout(500);
            const primeiroServico = page.locator('#listaTarefasServico div').first();
            await primeiroServico.click();
            await page.waitForTimeout(500);
            await page.click('#botaoEnviar');
            const modal = page.locator('#modalMensagem');
            await expect(modal).toBeVisible();
            const mensagem = await page.textContent('#modalMensagemTexto');
            expect(mensagem).toContain('sucesso');
        } );

        test( 'Deve exibir erro ao tentar cadastrar sem cliente', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.click('#botaoEnviar');
            await page.waitForTimeout(500);
            const modal = page.locator('#modalMensagem');
            await expect(modal).toBeVisible();
        } );

        test( 'Deve atualizar valor da mão de obra automaticamente', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.fill('#buscaServico', 'óleo');
            await page.waitForTimeout(500);
            const primeiroServico = page.locator('#listaTarefasServico div').first();
            await primeiroServico.click();
            await page.waitForTimeout(500);
            const valorMaoObra = await page.textContent('#valorMaoObra');
            expect(valorMaoObra).not.toContain('R$ 0,00');
        } );

        test( 'Deve redirecionar para login após logout', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.click('#botaoLogout');
            await page.waitForURL('**/login.html');
            expect(page.url()).toContain('login.html');
        } );

} );


test.describe( 'Cadastro de OS com Gerente', () => {

        test.beforeEach( async ({ context }) => {
            await iniciaSessaoGerente(context);
        } );

        test.afterAll( async () => {
            await redefinir();
        } );

        test( 'Deve exibir os dados de usuário', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('GERENTE');
        } );

        test( 'Deve concluir cadastro de OS com observações', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.fill('#buscaCliente', 'Bruno Santos');
            await page.click('#botaoBuscaCliente');
            await page.waitForTimeout(1000);
            await page.selectOption('#veiculos', { index: 1 });
            await page.selectOption('#responsaveis', { index: 1 });
            await page.fill('#buscaServico', 'filtro');
            await page.waitForTimeout(500);
            const primeiroServico = page.locator('#listaTarefasServico div').first();
            await primeiroServico.click();
            await page.waitForTimeout(500);
            await page.fill('#textoObservacoes', 'Cliente solicitou urgência no serviço.');
            await page.click('#botaoEnviar');
            const modal = page.locator('#modalMensagem');
            await expect(modal).toBeVisible();
            const mensagem = await page.textContent('#modalMensagemTexto');
            expect(mensagem).toContain('sucesso');
        } );

} );


test.describe( 'Cadastro de OS com Mecânico', () => {

        test.beforeEach( async ({ context }) => {
            await iniciaSessaoMecanico(context);
        } );

        test.afterAll( async () => {
            await redefinir();
        } );

        test( 'Deve exibir os dados de usuário', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('MECANICO');
        } );

        test( 'Não deve exibir links de cadastro para mecânico', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.waitForTimeout(1000);
            const linkCliente = await page.locator('#cadastroCliente');
            const linkVeiculo = await page.locator('#cadastroVeiculo');
            const linkOs = await page.locator('#cadastroOs');
            await expect(linkCliente).not.toBeVisible();
            await expect(linkVeiculo).not.toBeVisible();
            await expect(linkOs).not.toBeVisible();
        } );

        test( 'Deve redirecionar mecânico para index ao tentar acessar', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.waitForTimeout(1500);
            const url = page.url();
            const conteudoPagina = await page.textContent('body');
            const foiRedirecionado = url.includes('index.html');
            const temMensagemErro = conteudoPagina?.includes('negada') || conteudoPagina?.includes('Permissão');
            expect(foiRedirecionado || temMensagemErro).toBeTruthy();
        } );

} );