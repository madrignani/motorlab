import { ErroGestor } from '../infra/erro-gestor.ts';
import type { VisaoCadastroOs } from '../visao/visao-cadastro-os.ts';
import { GestorCadastroOs } from '../gestor/gestor-cadastro-os.ts';


export class ControladoraCadastroOs {

    private gestor = new GestorCadastroOs();
    private visao: VisaoCadastroOs;
    private idClienteSelecionado = null;

    constructor(visao: VisaoCadastroOs) {
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
        await this.carregarResponsaveis();
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

    async buscarCliente(busca: string): Promise<void> {
        if (!busca || !busca.trim()) {
            this.visao.exibirMensagem( ["Informe o nome ou CPF para buscar o cliente."] );
            return;
        }
        try {
            const dadosCliente = await this.gestor.obterCliente(busca.trim());
            if (!dadosCliente.id) {
                this.visao.exibirMensagem( ["Cliente não encontrado."] );
                this.idClienteSelecionado = null;
                this.visao.limparDivCliente();
                return;
            }
            this.idClienteSelecionado = dadosCliente.id;
            this.visao.exibirCliente(dadosCliente);
            this.carregarVeiculosPorCliente(dadosCliente.id);
        } catch (erro: any) {
            this.idClienteSelecionado = null;
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível buscar o cliente: ${erro.message}`] );
            }
        }
    }

    async carregarResponsaveis(): Promise<void> {
        try {
            const responsaveis = await this.gestor.obterResponsaveis();
            this.visao.listarResponsaveis(responsaveis);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível buscar o cliente: ${erro.message}`] );
            }
        }
    }

    async carregarVeiculosPorCliente(idCliente: string): Promise<void> {
        try {
            const veiculos = await this.gestor.obterVeiculosPorCliente( parseInt(idCliente) );
            this.visao.listarVeiculos(veiculos);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar os veículos: ${erro.message}`] ); 
            }
        }
    }

}