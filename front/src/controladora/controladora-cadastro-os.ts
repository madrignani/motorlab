import { ErroGestor } from '../infra/erro-gestor.ts';
import type { VisaoCadastroOs } from '../visao/visao-cadastro-os.ts';
import { GestorCadastroOs } from '../gestor/gestor-cadastro-os.ts';


export class ControladoraCadastroOs {

    private gestor = new GestorCadastroOs();
    private visao: VisaoCadastroOs;
    private clienteSelecionadoId = null;
    private itensSelecionados: any[] = [];
    private custosSelecionados: any[] = [];

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
        this.visao.iniciarBuscaItem();
        this.visao.iniciarCustos();
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

    async buscarCliente(busca: string): Promise<void> {
        if (!busca || !busca.trim()) {
            this.visao.exibirMensagem( ["Informe o nome ou CPF para buscar o cliente."] );
            return;
        }
        try {
            const dadosCliente = await this.gestor.obterCliente(busca.trim());
            if (!dadosCliente.id) {
                this.visao.exibirMensagem( ["Cliente não encontrado."] );
                this.clienteSelecionadoId = null;
                this.visao.limparDivCliente();
                return;
            }
            this.clienteSelecionadoId = dadosCliente.id;
            this.visao.exibirCliente(dadosCliente);
            this.carregarVeiculosPorCliente(dadosCliente.id);
        } catch (erro: any) {
            this.clienteSelecionadoId = null;
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

    async buscarItem(busca: string, quantidade: string): Promise<void> {
        if (!busca || !quantidade) {
            this.visao.exibirMensagem( ["Preencha os campos para buscar o item."] );
            return;
        }
        const quantidadeFormat = Number(quantidade);
        if (isNaN(quantidadeFormat) || quantidadeFormat <= 0) {
            this.visao.exibirMensagem( ["Quantidade deve ser um número inteiro positivo."] );
            return;
        }
        try {
            const dadosItem = await this.gestor.obterItem( busca.trim() );
            if (!dadosItem.id) {
                this.visao.exibirMensagem( ["Item não encontrado."] );
                return;
            }
            const existe = this.itensSelecionados.some(item => item.id === dadosItem.id);
            if (existe) {
                this.visao.exibirMensagem( ["Este item já foi adicionado à tabela."] );
                return;
            }
            if (Number(dadosItem.estoque) < quantidadeFormat){
                this.visao.exibirMensagem( ["Quantidade solicitada indisponível em estoque."] );
                return;
            }
            const itemComQuantidade = {
                id: dadosItem.id,
                codigo: dadosItem.codigo,
                titulo: dadosItem.titulo,
                fabricante: dadosItem.fabricante,
                precoVenda: dadosItem.precoVenda,
                quantidade: quantidadeFormat
            };
            this.itensSelecionados.push(itemComQuantidade);
            const subtotal = ( quantidadeFormat * Number(dadosItem['precoVenda']) );
            this.visao.adicionarItemTabela(dadosItem, quantidadeFormat, subtotal);
            this.atualizarValorTotalVisao();
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem(erro.getProblemas());
            } else {
                this.visao.exibirMensagem( [`Não foi possível buscar o item: ${erro.message}`] );
            }
        }
    }

    removerItem(id: string): void {
        const indice = this.itensSelecionados.findIndex(item => item.id === id);
        if (indice !== -1) {
            this.itensSelecionados.splice(indice, 1);
        }
        this.atualizarValorTotalVisao();
    }

    adicionarCusto(tipo: string, descricao: string, valor: string, quantidade: string): void {
        const valorFormat = Number(valor);
        const quantidadeFormat = Number(quantidade);
        if ( !tipo || !descricao || isNaN(valorFormat) || isNaN(quantidadeFormat) ) {
            this.visao.exibirMensagem( ['Preencha todos os campos do custo corretamente.'] );
            return;
        }
        if ( valorFormat <= 0 || quantidadeFormat <= 0 ) {
            this.visao.exibirMensagem( ['Quantidade e valor devem ser números positivos.'] );
            return;
        }
        const custo = {
            tipo,
            descricao,
            valor: valorFormat,
            quantidade: quantidadeFormat,
            subtotal: (valorFormat * quantidadeFormat)
        };
        this.custosSelecionados.push(custo);
        this.visao.adicionarCustoTabela(custo);
        this.atualizarValorTotalVisao();
    }

    removerCusto(id: string): void {
        const indice = this.custosSelecionados.findIndex(c => c.id === id);
        if (indice !== -1) {
            this.custosSelecionados.splice(indice, 1);
        }
        this.atualizarValorTotalVisao();
    }

    private atualizarValorTotalVisao(): void {
        const total = this.calcularValorTotal();
        this.visao.atualizarValorTotal(total);
    }

    private calcularValorTotal(): number {
        let total = 0;
        for (const item of this.itensSelecionados) {
            const preco = Number(item.precoVenda);
            const qtd = Number(item.quantidade);
            total += ( preco * qtd );
        }
        for (const custo of this.custosSelecionados) {
            const subtotal = Number(custo.subtotal);
            total += subtotal;
        }
        return total;
    }

    async enviarOs(): Promise<void> {
        const veiculoSelecionadoId = this.visao.obterVeiculoSelecionadoId();
        const responsavelSelecionadoId = this.visao.obterResponsavelSelecionadoId();
        const observacoes = this.visao.obterObservacoes();
        const previsaoEntrega = this.visao.obterPrevisaoEntrega();
        if (!this.clienteSelecionadoId) {
            this.visao.exibirMensagem( ["Selecione um cliente."] );
            return;
        }
        if (!veiculoSelecionadoId) {
            this.visao.exibirMensagem( ["Selecione um veículo."] );
            return;
        }
        if (!responsavelSelecionadoId) {
            this.visao.exibirMensagem( ["Selecione um responsável."] );
            return;
        }
        if (this.itensSelecionados.length === 0 && this.custosSelecionados.length === 0) {
            this.visao.exibirMensagem( ["Adicione pelo menos um item ou custo."] );
            return;
        }
        if (!previsaoEntrega) {
            this.visao.exibirMensagem( ["Informe a previsão de entrega."] );
            return;
        }
        try {
            const osId = await this.gestor.cadastrarOs( {
                clienteId: this.clienteSelecionadoId,
                veiculoId: veiculoSelecionadoId,
                responsavelId: responsavelSelecionadoId,
                itens: this.itensSelecionados,
                custos: this.custosSelecionados,
                previsaoEntrega: previsaoEntrega,
                observacoes: observacoes
            } );
            this.limparFormulario();
            this.visao.exibirMensagemComAcao( ["Ordem de Servico cadastrada com sucesso."], osId! );
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível cadastrar a ordem de serviço: ${erro.message}`] );
            }
        }
    }

    private limparFormulario(): void {
        this.clienteSelecionadoId = null;
        this.itensSelecionados = [];
        this.custosSelecionados = [];
        this.visao.limparFormulario();
        this.visao.limparDivCliente();
        this.visao.limparTabelaItens();
        this.visao.limparTabelaCustos();
        this.visao.limparValorTotal();
    }

}