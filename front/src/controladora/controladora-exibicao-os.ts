import { ErroGestor } from '../infra/erro-gestor.ts';
import type { VisaoExibicaoOs } from '../visao/visao-exibicao-os.ts';
import { GestorExibicaoOs } from '../gestor/gestor-exibicao-os.ts';


export class ControladoraExibicaoOs {

    private gestor = new GestorExibicaoOs();
    private visao: VisaoExibicaoOs;

    constructor(visao: VisaoExibicaoOs) {
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

    async buscarDadosOs(id: string): Promise<void> {
        const idFormat = parseInt(id);
        if ( isNaN(idFormat) ) {
            this.visao.exibirMensagem( [`ID da OS não localizado ou inválido.`] );
            return;
        }
        try {
            const dadosOs = await this.gestor.obterOs(idFormat);
            if (!dadosOs.id) {
                this.visao.exibirMensagem( ["OS não encontrada."] );
                return;
            }
            this.visao.preencherCampos(dadosOs);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar os dados da OS: ${erro.message}`] ); 
            }
        }
    }

}