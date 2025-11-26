import { test, expect } from '@playwright/test';
import { iniciaSessaoAtendente, iniciaSessaoMecanico, iniciaSessaoGerente } from './login/inicia-sessao.ts';
import { redefinir } from './utils/recomposicao-bd.ts';


const URL_CADASTRO = 'http://localhost:5173/cadastro-os.html';


test.describe( 'Cadastro de Reservas com Atendente', () => {
        
        test.beforeEach( async ({ context }) => {
            await iniciaSessaoAtendente(context);
        } );

        test.afterAll( async () => {
            await redefinir();
        } );

        test( 'Deve exibir os dados de usuário', async ({page}) => {
            await page.goto(URL_CADASTRO);
            await page.waitForTimeout(1000);
            const conteudoPagina = await page.textContent('body');
            expect(conteudoPagina).toContain('ATENDENTE');
        } );

} );