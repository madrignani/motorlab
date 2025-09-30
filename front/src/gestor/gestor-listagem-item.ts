import { API_URL } from './rota-api.ts';
import { ErroGestor } from '../infra/erro-gestor.ts';
import { GestorAutenticacao } from './gestor-autenticacao.ts';
import { GestorSessao } from '../gestor/gestor-sessao.ts';


export class GestorListagemItem {

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

    async obterItens(): Promise<any> {
        const response = await fetch( `${API_URL}/itens`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();
    }

    async removerItem(idItem: number): Promise<void> {
        const response = await fetch( `${API_URL}/itens-remover/${idItem}`, {
            method: 'DELETE',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async obterItem(busca: number): Promise<any> {
        const response = await fetch(`${API_URL}/itens/${busca}`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();
    }

    async atualizarItem(id: number, dados:any): Promise<void> {
        const response = await fetch( `${API_URL}/itens-atualizar/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

}