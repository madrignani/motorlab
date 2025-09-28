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

}