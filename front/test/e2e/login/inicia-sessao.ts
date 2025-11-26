import { BrowserContext } from '@playwright/test';
import dotenv from 'dotenv';


dotenv.config( );


const LOGIN_URL = 'http://localhost:5173/login.html';


export async function iniciaSessaoAtendente(contexto: BrowserContext) {
    const pagina = await contexto.newPage();
    await pagina.goto(LOGIN_URL);
    const cpf = process.env.CPF_ATENDENTE;
    const senha = process.env.SENHA_ATENDENTE;
    await pagina.fill('#login', cpf!);
    await pagina.fill('#senha', senha!);
    await pagina.click('#botaoLogin');
    await pagina.waitForURL('**/index.html');
    await contexto.storageState( { path: 'test/e2e/.auth/sessao_atendente.json' } );
    await pagina.close();
}


export async function iniciaSessaoMecanico(contexto: BrowserContext) {
    const pagina = await contexto.newPage();
    await pagina.goto(LOGIN_URL);
    const cpf = process.env.CPF_MECANICO;
    const senha = process.env.SENHA_MECANICO;
    await pagina.fill('#login', cpf!);
    await pagina.fill('#senha', senha!);
    await pagina.click('#botaoLogin');
    await pagina.waitForURL('**/index.html');
    await contexto.storageState( { path: 'test/e2e/.auth/sessao_mecanico.json' } );
    await pagina.close();
}


export async function iniciaSessaoGerente(contexto: BrowserContext) {
    const pagina = await contexto.newPage();
    await pagina.goto(LOGIN_URL);
    const cpf = process.env.CPF_GERENTE;
    const senha = process.env.SENHA_GERENTE;
    await pagina.fill('#login', cpf!);
    await pagina.fill('#senha', senha!);
    await pagina.click('#botaoLogin');
    await pagina.waitForURL('**/index.html');
    await contexto.storageState( { path: 'test/e2e/.auth/sessao_gerente.json' } );
    await pagina.close();
}