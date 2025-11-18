import { ErroGestor } from '../infra/erro-gestor.ts';
import type { VisaoListagemOs } from '../visao/visao-listagem-os.ts';
import { GestorListagemOs } from '../gestor/gestor-listagem-os.ts';


export class ControladoraListagemOs {

    private gestor = new GestorListagemOs();
    private visao: VisaoListagemOs;
    private listaOs: any[] = [];

    constructor(visao: VisaoListagemOs) {
        this.visao = visao;
    }

    async logout(): Promise<void> {
        try {
            await this.gestor.logout();
            this.visao.redirecionarParaLogin();
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível completar o logout: ${erro.message}`] ); 
            }
        }
    }

    async iniciarSessao(): Promise<void> {
        try {
            await this.gestor.verificarPermissao();
        } catch (erro: any) {
            this.visao.redirecionarParaLogin();
            return;
        }
        await this.carregarDadosUsuario();
        await this.carregarListaOs();
        this.visao.exibirPagina();
    }

    private async carregarDadosUsuario(): Promise<void> {
        try {
            const dadosUsuario = await this.gestor.obterDadosUsuario();
            this.visao.exibirDadosUsuario(dadosUsuario);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar os dados do usuário: ${erro.message}`] ); 
            }
        }
    }

    async carregarListaOs(): Promise<void> {
        try {
            this.listaOs = await this.gestor.obterListaOs();
            this.visao.exibirListaOs(this.listaOs);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar a lista de OS: ${erro.message}`] ); 
            }
        }
    }

}