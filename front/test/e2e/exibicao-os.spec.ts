import { test, expect } from '@playwright/test';
import { iniciaSessaoAtendente, iniciaSessaoMecanico, iniciaSessaoGerente } from './login/inicia-sessao.ts';
import { redefinir } from './utils/recomposicao-bd.ts';


const URL_EXIBICAO = 'http://localhost:5173/exibicao-os.html';
const URL_CADASTRO = 'http://localhost:5173/cadastro-os.html';


test.describe( 'Exibição de OS com Atendente', () => {
        
        test.beforeEach( async ({ context }) => {
            await iniciaSessaoAtendente(context);
        } );

        test.afterEach( async () => {
            await redefinir();
        } );

        test( 'Deve exibir os dados de usuário', async ({ page }) => {
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
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('ATENDENTE');
        } );

        test( 'Deve exibir dados básicos da OS', async ({ page }) => {
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
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('Ana Lima');
            expect(conteudoPagina).toContain('ABC1D23');
            expect(conteudoPagina).toContain('Troca do óleo');
        } );

        test( 'Deve permitir efetivar OS provisória', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.fill('#buscaCliente', '94102171112');
            await page.click('#botaoBuscaCliente');
            await page.waitForTimeout(1000);
            await page.selectOption('#veiculos', { index: 1 });
            await page.selectOption('#responsaveis', { index: 1 });
            await page.fill('#buscaServico', 'freio');
            await page.waitForTimeout(500);
            const primeiroServico = page.locator('#listaTarefasServico div').first();
            await primeiroServico.click();
            await page.waitForTimeout(500);
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            await page.click('#botaoEfetivar');
            await page.waitForTimeout(1000);
            const statusOs = await page.textContent('#statusOs');
            expect(statusOs).toContain('ANDAMENTO');
        } );

        test( 'Deve redirecionar para login após logout', async ({ page }) => {
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
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            await page.click('#botaoLogout');
            await page.waitForURL('**/login.html');
            expect(page.url()).toContain('login.html');
        } );

        test( 'Deve adicionar serviço na OS provisória', async ({ page }) => {
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
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            await page.click('#botaoAdicionarServico');
            await page.waitForTimeout(500);
            await page.fill('#buscaServicoModal', 'filtro');
            await page.waitForTimeout(500);
            const servicoModal = page.locator('#listaServicosModal div').first();
            await servicoModal.click();
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('filtro');
        } );

        test( 'Deve remover serviço da OS provisória', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.fill('#buscaCliente', '94102171112');
            await page.click('#botaoBuscaCliente');
            await page.waitForTimeout(1000);
            await page.selectOption('#veiculos', { index: 1 });
            await page.selectOption('#responsaveis', { index: 1 });
            await page.fill('#buscaServico', 'óleo');
            await page.waitForTimeout(500);
            let primeiroServico = page.locator('#listaTarefasServico div').first();
            await primeiroServico.click();
            await page.waitForTimeout(500);
            await page.fill('#buscaServico', 'filtro');
            await page.waitForTimeout(500);
            primeiroServico = page.locator('#listaTarefasServico div').first();
            await primeiroServico.click();
            await page.waitForTimeout(500);
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            const botaoRemover = page.locator('.botao-remover-servico').first();
            await botaoRemover.click();
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).not.toContain('Troca do filtro');
        } );

        test( 'Deve adicionar tarefa manual em serviço da OS provisória', async ({ page }) => {
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
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            const botaoAdicionar = page.locator('.botao-adicionar-tarefa').first();
            await botaoAdicionar.click();
            await page.waitForTimeout(500);
            const inputTarefa = page.locator('.input-nova-tarefa').first();
            await inputTarefa.fill('Verificar nível');
            await inputTarefa.press('Enter');
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('Verificar nível');
        } );

        test( 'Deve adicionar produto em tarefa da OS provisória', async ({ page }) => {
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
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            const botaoAdicionar = page.locator('.botao-adicionar-produto').first();
            await botaoAdicionar.click();
            await page.waitForTimeout(500);
            await page.fill('#buscaProdutoModal', 'óleo');
            await page.waitForTimeout(500);
            const produtoModal = page.locator('#listaProdutosModal div').first();
            await produtoModal.click();
            await page.waitForTimeout(500);
            await page.fill('#quantidadeProduto', '2');
            await page.click('#modalProdutoConfirmar');
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('Quantidade: 2');
        } );

        test( 'Deve adicionar custo extra na OS provisória', async ({ page }) => {
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
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            await page.click('#botaoAdicionarExtra');
            await page.waitForTimeout(500);
            await page.fill('#descricaoExtra', 'Reboque');
            await page.fill('#valorExtra', '150');
            await page.fill('#quantidadeExtra', '1');
            await page.click('#modalExtraConfirmar');
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('Reboque');
        } );

        test( 'Deve editar valor da mão de obra na OS provisória', async ({ page }) => {
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
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            await page.click('#botaoEditarMaoObra');
            await page.waitForTimeout(500);
            await page.fill('#novoValorMaoObra', '250');
            await page.click('#modalMaoObraConfirmar');
            await page.waitForTimeout(1000);
            const valorMaoObra = await page.textContent('#valorMaoObra');
            expect(valorMaoObra).toContain('250');
        } );

        test( 'Deve exibir valores sugeridos na OS provisória', async ({ page }) => {
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
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            await page.click('#botaoValoresSugeridos');
            await page.waitForTimeout(500);
            const modalConteudo = await page.textContent('#modalValoresSugeridos');
            expect(modalConteudo).toContain('Previsão de entrega sugerida');
            expect(modalConteudo).toContain('Valor da mão de obra sugerido');
        } );

} );


test.describe( 'Exibição de OS com Mecânico', () => {

        test.beforeEach( async ({ context }) => {
            await iniciaSessaoMecanico(context);
        } );

        test.afterEach( async () => {
            await redefinir();
        } );

        test( 'Deve exibir os dados de usuário', async ({ page }) => {
            await iniciaSessaoAtendente(page.context());
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
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.click('#botaoLogout');
            await page.waitForTimeout(500);
            await iniciaSessaoMecanico(page.context());
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('MECANICO');
        } );

        test( 'Não deve exibir links de cadastro para mecânico', async ({ page }) => {
            await iniciaSessaoAtendente(page.context());
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
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.click('#botaoLogout');
            await page.waitForTimeout(500);
            await iniciaSessaoMecanico(page.context());
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            const linkCliente = await page.locator('#cadastroCliente');
            const linkVeiculo = await page.locator('#cadastroVeiculo');
            const linkOs = await page.locator('#cadastroOs');
            await expect(linkCliente).not.toBeVisible();
            await expect(linkVeiculo).not.toBeVisible();
            await expect(linkOs).not.toBeVisible();
        } );

        test( 'Mecânico não deve poder efetivar OS', async ({ page }) => {
            await iniciaSessaoAtendente(page.context());
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
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.click('#botaoLogout');
            await page.waitForTimeout(500);
            await iniciaSessaoMecanico(page.context());
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            const botaoEfetivar = await page.locator('#botaoEfetivar');
            await expect(botaoEfetivar).not.toBeVisible();
        } );

} );


test.describe( 'Exibição de OS com Gerente', () => {

        test.beforeEach( async ({ context }) => {
            await iniciaSessaoGerente(context);
        } );

        test.afterEach( async () => {
            await redefinir();
        } );

        test( 'Deve exibir os dados de usuário', async ({ page }) => {
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
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('GERENTE');
        } );

        test( 'Deve permitir cancelar OS', async ({ page }) => {
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
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            await page.click('#botaoCancelar');
            await page.waitForTimeout(500);
            await page.click('#modalCancelarOsConfirmar');
            await page.waitForTimeout(1000);
            const statusOs = await page.textContent('#statusOs');
            expect(statusOs).toContain('CANCELADA');
        } );

        test( 'Deve visualizar dados da OS', async ({ page }) => {
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
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('Bruno Santos');
            expect(conteudoPagina).toContain('filtro');
        } );

        test( 'Deve ter acesso a links de cadastro', async ({ page }) => {
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
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            await page.click('#dropdownBotaoCadastro');
            const linkCliente = await page.locator('#cadastroCliente');
            const linkVeiculo = await page.locator('#cadastroVeiculo');
            const linkOs = await page.locator('#cadastroOs');
            await expect(linkCliente).toBeVisible();
            await expect(linkVeiculo).toBeVisible();
            await expect(linkOs).toBeVisible();
        } );

        test( 'Deve efetivar OS provisória', async ({ page }) => {
            await page.goto(URL_CADASTRO);
            await page.fill('#buscaCliente', '94102171112');
            await page.click('#botaoBuscaCliente');
            await page.waitForTimeout(1000);
            await page.selectOption('#veiculos', { index: 1 });
            await page.selectOption('#responsaveis', { index: 1 });
            await page.fill('#buscaServico', 'freio');
            await page.waitForTimeout(500);
            const primeiroServico = page.locator('#listaTarefasServico div').first();
            await primeiroServico.click();
            await page.waitForTimeout(500);
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            await page.click('#botaoEfetivar');
            await page.waitForTimeout(1000);
            const statusOs = await page.textContent('#statusOs');
            expect(statusOs).toContain('ANDAMENTO');
        } );

        test( 'Deve adicionar serviços na OS', async ({ page }) => {
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
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            await page.click('#botaoEfetivar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(200);
            await page.click('#botaoAdicionarServico');
            await page.waitForTimeout(500);
            await page.fill('#buscaServicoModal', 'transmissão');
            await page.waitForTimeout(500);
            const servicoModal = page.locator('#listaServicosModal div').first();
            await servicoModal.click();
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('transmissão');
        } );

        test( 'Deve registrar pagamento', async ({ page }) => {
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
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForSelector('#botaoEfetivar', { state: 'visible' });
            await page.click('#botaoEfetivar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForSelector('#botaoConcluir', { state: 'visible' });
            await page.click('#botaoConcluir');
            await page.waitForTimeout(500);
            await page.fill('#resumoLaudo', 'Serviço finalizado');
            await page.fill('#recomendacoesLaudo', 'Sem recomendações');
            await page.click('#modalEdicaoLaudoConfirmar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(200);
            await page.click('#botaoPagamento');
            await page.waitForTimeout(500);
            await page.selectOption('#pagamentoMetodo', { index: 2 });
            await page.selectOption('#pagamentoDesconto', { index: 1 });
            await page.click('#modalPagamentoConfirmar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(200);
            const statusOs = await page.textContent('#statusOs');
            expect(statusOs).toContain('FINALIZADA');
        } );

        test( 'Deve editar valor da mão de obra', async ({ page }) => {
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
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForTimeout(1000);
            await page.click('#botaoEfetivar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(200);
            await page.click('#botaoEditarMaoObra');
            await page.waitForTimeout(500);
            await page.fill('#novoValorMaoObra', '350');
            await page.click('#modalMaoObraConfirmar');
            await page.waitForTimeout(1000);
            const valorMaoObra = await page.textContent('#valorMaoObra');
            expect(valorMaoObra).toContain('350');
        } );

        test( 'Deve colocar OS em alerta', async ({ page }) => {
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
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForSelector('#botaoEfetivar', { state: 'visible' });
            await page.click('#botaoEfetivar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForSelector('#botaoAlerta', { state: 'visible' });
            await page.click('#botaoAlerta');
            await page.waitForTimeout(200);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            const statusOs = await page.textContent('#statusOs');
            expect(statusOs).toContain('ALERTA');
        } );

        test( 'Deve remover alerta da OS', async ({ page }) => {
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
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForSelector('#botaoEfetivar', { state: 'visible' });
            await page.click('#botaoEfetivar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForSelector('#botaoAlerta', { state: 'visible' });
            await page.click('#botaoAlerta');
            await page.waitForTimeout(200);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(1000);
            await page.waitForSelector('#botaoRemoverAlerta', { state: 'visible' });
            await page.click('#botaoRemoverAlerta');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(200);
            const statusOs = await page.textContent('#statusOs');
            expect(statusOs).toContain('ANDAMENTO');
        } );

        test( 'Deve visualizar laudo da OS', async ({ page }) => {
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
            await page.click('#botaoEnviar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(500);
            await page.goto(URL_EXIBICAO + '?id=1');
            await page.waitForSelector('#botaoEfetivar', { state: 'visible' });
            await page.click('#botaoEfetivar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForSelector('#botaoConcluir', { state: 'visible' });
            await page.click('#botaoConcluir');
            await page.waitForTimeout(500);
            await page.fill('#resumoLaudo', 'Serviço finalizado');
            await page.fill('#recomendacoesLaudo', 'Sem recomendações');
            await page.click('#modalEdicaoLaudoConfirmar');
            await page.waitForTimeout(1000);
            await page.click('#modalMensagemOk');
            await page.waitForTimeout(200);
            await page.waitForSelector('#botaoVerLaudo', { state: 'visible' });
            await page.click('#botaoVerLaudo');
            await page.waitForTimeout(500);
            const conteudoLaudo = await page.textContent('#conteudoLaudo');
            expect(conteudoLaudo).toContain('Serviço finalizado');
            expect(conteudoLaudo).toContain('Sem recomendações');
        } );


} );