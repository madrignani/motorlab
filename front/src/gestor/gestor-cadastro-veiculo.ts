import { API_URL } from './rota-api.ts';
import { ErroGestor } from '../infra/erro-gestor.ts';
import { GestorAutenticacao } from './gestor-autenticacao.ts';
import { GestorSessao } from '../gestor/gestor-sessao.ts';


export class GestorCadastroVeiculo {

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

    async buscarCliente(busca: string): Promise<any> {
        const response = await fetch( `${API_URL}/cliente?busca=${busca}`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();
    }

    async cadastrarVeiculo(dados: any): Promise<void> {
        const response = await fetch( `${API_URL}/veiculos`, {
            method: 'POST',
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