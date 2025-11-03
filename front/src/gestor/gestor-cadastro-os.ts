import { API_URL } from './rota-api.ts';
import { ErroGestor } from '../infra/erro-gestor.ts';
import { GestorAutenticacao } from './gestor-autenticacao.ts';
import { GestorSessao } from '../gestor/gestor-sessao.ts';


export class GestorCadastroOs {

    private gestorAutenticacao = new GestorAutenticacao();
    private gestorSessao = new GestorSessao();

    async logout(): Promise<void> {
        await this.gestorAutenticacao.logout();
    }

    async verificarPermissao(): Promise<void> {
        await this.gestorSessao.verificarPermissao();
    }

    async obterDadosUsuario(): Promise<any> {
        return await this.gestorSessao.obterDadosUsuario();
    }

    async obterCliente(busca: string): Promise<any> {
        const response = await fetch( `${API_URL}/clientes/${busca}`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();
    }

    async obterVeiculosPorCliente(idCliente: number): Promise<any> {
        const response = await fetch( `${API_URL}/veiculos-por-cliente/${idCliente}`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();    
    }

    async obterResponsaveis(): Promise<any> {
        const response = await fetch( `${API_URL}/responsaveis`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();    
    }

    async obterServicosPorTermo(busca: string): Promise<any[]> {
        const response = await fetch( `${API_URL}/servicos/${busca}`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();    
    }

    async obterItemPorCodigo(busca: string): Promise<any> {
        const response = await fetch( `${API_URL}/itens-cod/${busca}`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();
    }

    async cadastrarOs(dadosOs: any): Promise<string> {
        const response = await fetch( `${API_URL}/ordens-servico`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosOs)
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        const resultado = await response.json();
        return resultado.id;
    }

}