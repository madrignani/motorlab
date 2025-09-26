import { ErroGestor } from '../infra/erro-gestor.ts';
import type { VisaoCadastroVeiculo } from '../visao/visao-cadastro-veiculo.ts';
import { GestorCadastroVeiculo } from '../gestor/gestor-cadastro-veiculo.ts';


export class ControladoraCadastroVeiculo {

    private gestor = new GestorCadastroVeiculo();
    private visao: VisaoCadastroVeiculo;
    private idClienteSelecionado: number | null = null;

    constructor(visao: VisaoCadastroVeiculo) {
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
            this.visao.exibirMensagem( ["Permissão negada."] )
            this.visao.redirecionarParaIndex();
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
                return;
            }
            this.idClienteSelecionado = dadosCliente.id;
            this.visao.exibirCliente(dadosCliente);
        } catch (erro: any) {
            this.idClienteSelecionado = null;
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível buscar o cliente: ${erro.message}`] );
            }
        }
    }

    async enviarVeiculo(dados: any): Promise<void> {
        if (!dados.placa || !dados.chassi || !dados.fabricante || !dados.modelo || !dados.ano || !dados.quilometragem) {
            this.visao.exibirMensagem( ["Todos os campos do fomulário devem ser preenchidos."] );
            return;
        }
        if (isNaN(Number(dados.ano)) || Number(dados.ano) <= 0 || isNaN(Number(dados.quilometragem)) || Number(dados.quilometragem) <= 0) {
            this.visao.exibirMensagem( ["Ano e quilometragem devem ser números positivos."] );
            return;
        }
        const envio = {
            cliente_id: this.idClienteSelecionado,
            placa: dados.placa,
            chassi: dados.chassi,
            fabricante: dados.fabricante,
            modelo: dados.modelo,
            ano: Number(dados.ano),
            quilometragem: Number(dados.quilometragem)
        };
        try {
            await this.gestor.cadastrarVeiculo(envio);
            this.visao.exibirMensagem( ["Veículo cadastrado com sucesso."] );
            this.visao.limparFormulario();
            this.idClienteSelecionado = null;
            this.visao.limparDivCliente();
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível cadastrar o veículo: ${erro.message}`] );
            }
        } 
    }

}