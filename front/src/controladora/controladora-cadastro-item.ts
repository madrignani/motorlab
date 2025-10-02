import { ErroGestor } from '../infra/erro-gestor.ts';
import type { VisaoCadastroItem } from '../visao/visao-cadastro-item.ts';
import { GestorCadastroItem } from '../gestor/gestor-cadastro-item.ts';


export class ControladoraCadastroItem {

    private gestor = new GestorCadastroItem();
    private visao: VisaoCadastroItem;

    constructor(visao: VisaoCadastroItem) {
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
        this.visao.iniciarFormulario();
    }

    private async carregarDadosUsuario(): Promise<void> {
        try {
            const dadosUsuario = await this.gestor.obterDadosUsuario();
            this.validarCargoUsuario(dadosUsuario);
            this.visao.exibirDadosUsuario(dadosUsuario);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar os dados do usuário: ${erro.message}`] ); 
            }
        }
    }

    private validarCargoUsuario( dadosUsuario: any ): void {
        const permitido = (dadosUsuario.cargo === 'ATENDENTE' || dadosUsuario.cargo === 'GERENTE');
        if (!permitido) {
            this.visao.retornarNavegacao();
            return;
        }
    }

    async enviarItem(dados: any): Promise<void> {
        if (!dados.codigo || !dados.titulo || !dados.fabricante || !dados.descricao
            || !dados.precoVenda || !dados.estoque || !dados.estoqueMinimo || !dados.localizacao ) {
            this.visao.exibirMensagem( ["Todos os campos do fomulário devem ser preenchidos."] );
        }
        try {
            await this.gestor.cadastrarItem(dados);
            this.visao.exibirMensagem( ["Item cadastrado com sucesso."] );
            this.visao.limparFormulario();
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível cadastrar o item: ${erro.message}`] );
            }
        } 
    }

}