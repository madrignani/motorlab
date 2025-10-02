import { ErroGestor } from '../infra/erro-gestor.ts';
import type { VisaoCadastroCliente } from '../visao/visao-cadastro-cliente.ts';
import { GestorCadastroCliente } from '../gestor/gestor-cadastro-cliente.ts';


export class ControladoraCadastroCliente {

    private gestor = new GestorCadastroCliente();
    private visao: VisaoCadastroCliente;

    constructor(visao: VisaoCadastroCliente) {
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

    async enviarCliente(dados: any): Promise<void> {
        if (!dados.cpf || !dados.nome || !dados.telefone || !dados.email) {
            this.visao.exibirMensagem( ["Todos os campos do fomulário devem ser preenchidos."] );
        }
        try {
            await this.gestor.cadastrarCliente(dados);
            this.visao.exibirMensagem( ["Cliente cadastrado com sucesso."] );
            this.visao.limparFormulario();
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível cadastrar o cliente: ${erro.message}`] );
            }
        } 
    }

}