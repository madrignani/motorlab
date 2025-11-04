import { ErroGestor } from '../infra/erro-gestor.ts';
import type { VisaoCadastroOs } from '../visao/visao-cadastro-os.ts';
import { GestorCadastroOs } from '../gestor/gestor-cadastro-os.ts';


export class ControladoraCadastroOs {

    private gestor = new GestorCadastroOs();
    private visao: VisaoCadastroOs;
    private clienteSelecionado: any = null;
    private servicosSelecionados: any[] = [];
    private produtosSelecionados: any[] = [];
    private extrasSelecionados: any[] = [];
    private maoObraManual: number | null = null;

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
        this.visao.buscarCliente();
        this.visao.iniciarBuscaServicos();
        this.visao.iniciarModais();
        this.visao.enviarFormulario();
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

    async carregarCliente(busca: string): Promise<void> {
        try {
            const cliente = await this.gestor.obterCliente(busca);
            if (cliente.id) {
                this.clienteSelecionado = cliente;
                this.visao.exibirCliente(cliente);
                await this.carregarVeiculosCliente(cliente.id);
            } else {
                this.visao.exibirMensagem( ['Cliente não encontrado.'] );
                this.visao.limparDivCliente();
            }
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem(erro.getProblemas());
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar os dados do cliente: ${erro.message}`] );
            }
        }
    }

    async carregarVeiculosCliente(clienteId: any): Promise<void> {
        try {
            const veiculos = await this.gestor.obterVeiculosPorCliente(clienteId);
            this.visao.listarVeiculos(veiculos);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem(erro.getProblemas());
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar os veículos: ${erro.message}`] );
            }
        }
    }

    async carregarResponsaveis(mostrarIndisponiveis: boolean = false): Promise<void> {
        try {
            const responsaveis = await this.gestor.obterResponsaveis();
            this.visao.listarResponsaveis(responsaveis, mostrarIndisponiveis);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao carregar responsáveis: ${erro.message}`] );
            }
        }
    }

    async buscarServicos(termo: string): Promise<void> {
        try {
            const servicos = await this.gestor.obterServicosPorTermo(termo);
            this.visao.exibirTarefasServicos(servicos);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao buscar serviços: ${erro.message}`] );
            }
        }
    }

    adicionarServico(servico: any): void {
        this.maoObraManual = null;
        const novoServico = {
            id: servico.id,
            descricao: servico.descricao,
            valorMaoObra: servico.valorMaoObra,
            execucaoMinutos: servico.execucaoMinutos,
            tarefas: [] as any[]
        };
        if (servico.tarefas && servico.tarefas.length > 0) {
            for (const tarefa of servico.tarefas) {
                const novaTarefa = {
                    id: tarefa.id,
                    descricao: tarefa.descricao,
                    produtos: []
                };
                novoServico.tarefas.push(novaTarefa);
            }
        }
        this.servicosSelecionados.push(novoServico);
        this.visao.adicionarServicoNaLista(servico);
        this.atualizarCalculos();
    }

    removerServico(servicoId: string): void {
        const servico = this.servicosSelecionados.find( (servico) => servico.id === servicoId ) ;
        for (const tarefa of servico.tarefas) {
            if (tarefa.produtos) {
                for (const produto of tarefa.produtos) {
                    this.produtosSelecionados = this.produtosSelecionados.filter( (prod) => {
                        const mesmoId = ( String(prod.id) === String(produto.id) );
                        const mesmoServico = ( String(prod.servicoId) === String(servicoId) );
                        const mesmaTarefa = ( String(prod.tarefaId) === String(tarefa.id) );
                        const remocao = ( mesmoId && mesmoServico && mesmaTarefa );
                        return !remocao;
                    } );
                }
            }
        }
        this.servicosSelecionados = this.servicosSelecionados.filter( (servico) => servico.id !== servicoId );
        this.visao.removerServicoNaLista(servicoId);
        this.atualizarCalculos();
    }

    adicionarTarefaManual(servicoId: string, descricao?: string): void {
        const servico = this.servicosSelecionados.find( (servico) => servico.id === servicoId );
        const novaTarefa = {
            id: Date.now(),
            descricao: descricao,
            produtos: []
        };
        servico.tarefas.push(novaTarefa);
        this.visao.adicionarTarefaManual(servicoId, novaTarefa);
        this.atualizarCalculos();
    }

    reordenarTarefa(origemServicoId: string, origemTarefaId: string, destinoServicoId: string, destinoTarefaId: string): void {
        const origemServico = this.servicosSelecionados.find( (servico) => servico.id === origemServicoId );
        const destinoServico = this.servicosSelecionados.find( (servico) => servico.id === destinoServicoId );
        const tarefaIndex = origemServico.tarefas.findIndex( (tarefa: any) => tarefa.id === origemTarefaId );
        const [tarefa] = origemServico.tarefas.splice(tarefaIndex, 1);
        const destinoIndex = destinoServico.tarefas.findIndex( (tarefa: any) => tarefa.id === destinoTarefaId ) ;
        if (destinoIndex !== -1) {
            destinoServico.tarefas.splice(destinoIndex, 0, tarefa);
        } else {
            destinoServico.tarefas.push(tarefa);
        }
        this.visao.atualizarTarefasServico(origemServico);
        this.visao.atualizarTarefasServico(destinoServico);
        this.atualizarCalculos();
    }

    removerTarefa(servicoId: string, tarefaId: string): void {
        const servico = this.servicosSelecionados.find( (servico) => servico.id === servicoId );
        const tarefa = servico.tarefas.find( (tarefa: any) => tarefa.id === tarefaId );
            if (tarefa && tarefa.produtos) {
                for (const produto of tarefa.produtos) {
                    this.produtosSelecionados = this.produtosSelecionados.filter( (prod) => {
                        const mesmoId = ( String(prod.id) === String(produto.id) );
                        const mesmoServico = ( String(prod.servicoId) === String(servicoId) );
                        const mesmaTarefa = ( String(prod.tarefaId) === String(tarefa.id) );
                        const remocao = ( mesmoId && mesmoServico && mesmaTarefa );
                        return !remocao;
                    } );
                }
            }
        servico.tarefas = servico.tarefas.filter( (tarefa: any) => tarefa.id !== tarefaId );
        this.visao.removerTarefaNaLista(servicoId, tarefaId);
        this.visao.atualizarTarefasServico(servico);
        this.atualizarCalculos();
    }

    async buscarProduto(codigoProduto: string): Promise<void> {
        if (!codigoProduto) {
            this.visao.exibirMensagem( ['Informe o código do produto.'] );
            return;
        }
        try {
            const produto = await this.gestor.obterItemPorCodigo(codigoProduto);
            this.visao.exibirProdutoEncontradoModal(produto);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao buscar o produto: ${erro.message}`] );
            }
        }
    }

    confirmarProduto(modal: HTMLDialogElement, quantidade: string): void {
        const quantidadeFormat = parseInt(quantidade);
        const produto = this.visao.obterProdutoAtual();
        const servicoId = modal.dataset.servicoIdDoProduto!;
        const tarefaId = modal.dataset.tarefaIdDoProduto!;
        if (!produto) {
            this.visao.exibirMensagem( ['Busque e selecione um produto primeiro.'] );
            return;
        }
        if (isNaN(quantidadeFormat) || quantidadeFormat <= 0) {
            this.visao.exibirMensagem( ['Informe uma quantidade válida.'] );
            return;
        }
        if (quantidadeFormat > produto.estoque) {
            this.visao.exibirMensagem( ['Quantidade solicitada indisponível em estoque.'] );
            return;
        }
        const existe = this.produtosSelecionados.some( (prod) =>
            String(prod.id) === String(produto.id) &&
            String(prod.servicoId) === String(servicoId) &&
            String(prod.tarefaId) === String(tarefaId)
        );
        if (existe) {
            this.visao.exibirMensagem( ['Produto já adicionado a esta tarefa.'] );
            return;
        }
        this.visao.adicionarProdutoLista(produto, quantidadeFormat, servicoId, tarefaId);
        this.adicionarProduto(produto, quantidadeFormat, servicoId, tarefaId);
    }

    adicionarProduto(produto: any, quantidade: number, servicoId: string, tarefaId: string): void {
        const existe = this.produtosSelecionados.some( (prod) =>
            String(prod.id) === String(produto.id) &&
            String(prod.servicoId) === String(servicoId) &&
            String(prod.tarefaId) === String(tarefaId)
        );
        if (existe) {
            this.visao.exibirMensagem( ['Produto já adicionado a esta tarefa.'] );
            return;
        }
        const servico = this.servicosSelecionados.find( (servico) => String(servico.id) === String(servicoId) );
        if (!servico) {
            this.visao.exibirMensagem( ['Serviço não encontrado ao adicionar produto.'] );
            return;
        }
        const tarefa = servico.tarefas.find((t: any) => String(t.id) === String(tarefaId));
        if (!tarefa) {
            this.visao.exibirMensagem( ['Tarefa não encontrada ao adicionar produto.'] );
            return;
        }
        const produtoComQuantidade = {
            ...produto,
            quantidade: Number(quantidade),
            subtotal: Number(produto.precoVenda) * Number(quantidade),
            servicoId: String(servicoId),
            tarefaId: String(tarefaId)
        };
        tarefa.produtos = tarefa.produtos || [];
        tarefa.produtos = tarefa.produtos.filter( (prod: any) => {
            const mesmoId = (String(prod.id) === String(produto.id));
            const mesmoServico = (String(prod.servicoId) === String(servicoId));
            const mesmaTarefa = (String(prod.tarefaId) === String(tarefaId));
            const remocao = (mesmoId && mesmoServico && mesmaTarefa);
            return !remocao;
        } );
        tarefa.produtos.push(produtoComQuantidade);
        this.produtosSelecionados = this.produtosSelecionados.filter( (prod) => {
            const mesmoId = (String(prod.id) === String(produto.id));
            const mesmoServico = (String(prod.servicoId) === String(servicoId));
            const mesmaTarefa = (String(prod.tarefaId) === String(tarefaId));
            const remocao = (mesmoId && mesmoServico && mesmaTarefa);
            return !remocao;
        } );
        this.produtosSelecionados.push(produtoComQuantidade);
        this.visao.atualizarTarefasServico(servico);
        this.atualizarCalculos();
    }

    removerProduto(produtoId: string, servicoId: string, tarefaId: string): void {
        const servico = this.servicosSelecionados.find( (servico: any) => String(servico.id) === String(servicoId) );
        const tarefa = (servico.tarefas || []).find( (tarefa: any) => String(tarefa.id) === String(tarefaId) );
        tarefa.produtos = (tarefa.produtos || []).filter( (prod: any) => {
            const mesmoId = (String(prod.id) === String(produtoId));
            const mesmoServico = (String(prod.servicoId) === String(servicoId));
            const mesmaTarefa = (String(prod.tarefaId) === String(tarefaId));
            const remocao = (mesmoId && mesmoServico && mesmaTarefa);
            return !remocao;
        } );
        this.produtosSelecionados = this.produtosSelecionados.filter( (prod: any) => {
            const mesmoId = (String(prod.id) === String(produtoId));
            const mesmoServico = (String(prod.servicoId) === String(servicoId));
            const mesmaTarefa = (String(prod.tarefaId) === String(tarefaId));
            const remocao = (mesmoId && mesmoServico && mesmaTarefa);
            return !remocao;
        } );
        this.visao.atualizarTarefasServico(servico);
        this.atualizarCalculos();
    }

    confirmarExtra(descricao: string, valor: string, quantidade: string): void {
        const valorFormat = parseFloat(valor);
        const quantidadeFormat = parseInt(quantidade);
        if (!descricao) {
            this.visao.exibirMensagem( ['Informe a descrição do custo extra.'] );
            return;
        }
        if (isNaN(valorFormat) || valorFormat <= 0) {
            this.visao.exibirMensagem( ['Informe um valor válido para o custo extra.'] );
            return;
        }
        if (isNaN(quantidadeFormat) || quantidadeFormat <= 0) {
            this.visao.exibirMensagem( ['Informe uma quantidade válida para o custo extra.'] );
            return;
        }
        const extra = {
            id: Date.now(),
            descricao: descricao,
            valor: valorFormat,
            quantidade: quantidadeFormat,
            subtotal: ( valorFormat * quantidadeFormat )
        };
        this.visao.adicionarExtraLista(extra);
    }

    adicionarExtra(extra: any): void {
        this.extrasSelecionados.push(extra);
        this.visao.exibirExtras(this.extrasSelecionados);
        this.atualizarCalculos();
    }

    removerExtra(extraId: string): void {
        this.extrasSelecionados = this.extrasSelecionados.filter( 
            (extra) => extra.id !== Number(extraId) 
        );
        this.visao.exibirExtras(this.extrasSelecionados);
        this.atualizarCalculos();
    }

    private calcularMaoObra(): void {
        if (this.maoObraManual !== null) {
            this.visao.atualizarValorMaoObra(this.maoObraManual);
            return;
        }
        let maoObraTotal = 0;
        for (const servico of this.servicosSelecionados) {
            maoObraTotal += servico.valorMaoObra;
        }
        this.visao.atualizarValorMaoObra(maoObraTotal);
    }

    private calcularMaoObraAtual(): number {
        return this.servicosSelecionados.reduce( (total, servico) => 
            total + Number(servico.valorMaoObra), 0 
        );
    }

    gerenciarValorMaoObra(): number {
        const valorAtual = this.servicosSelecionados.reduce( (total, servico) => 
            total + Number(servico.valorMaoObra), 0 
        );
        let valorParaExibir = valorAtual;
        if (this.maoObraManual !== null) {
            valorParaExibir = this.maoObraManual;
        }
        return valorParaExibir;
    }

    confirmarMaoObra(novoValor: string): void {
        const valorFormat = parseFloat(novoValor);
        if (!isNaN(valorFormat) && valorFormat >= 0) {
            this.maoObraManual = valorFormat;
            this.visao.atualizarValorMaoObra(valorFormat);
            this.calcularValorTotal();
        }
    }

    private calcularDataEntrega(): void {
        let minutosTotais = 0;
        for (const servico of this.servicosSelecionados) {
            minutosTotais += servico.execucaoMinutos;
        }
        const data = new Date();
        data.setMinutes(data.getMinutes() + minutosTotais);
        const dataISO = data.toISOString();
        this.visao.atualizarDataEntrega(dataISO);
    }

    confirmarDataEntrega(novaData: string): void {
        if (novaData) {
            const data = new Date(novaData);
            if ( data<(new Date()) ){
                this.visao.exibirMensagem( ['Previsão de entrega não pode ser no passado.'] );
                return;
            }
            const dataISO = data.toISOString();
            this.visao.atualizarDataEntrega(dataISO);
        }
    }

    atualizarDataEntregaAutomatica(): void {
        let minutosTotais = 0;
        for (const servico of this.servicosSelecionados) {
            minutosTotais += servico.execucaoMinutos;
        }
        const dataAtual = new Date();
        const dataPrevisao = new Date(dataAtual.getTime() + minutosTotais * 60000);
        const dataISO = dataPrevisao.toISOString();
        this.visao.atualizarDataEntrega(dataISO);
    }

    atualizarCalculos(): void {
        this.calcularMaoObra();
        this.calcularDataEntrega();
        this.calcularValorTotal();
    }

    private calcularValorTotal(): void {
        let totalMaoObra = 0;
        let totalProdutos = 0;
        let totalExtras = 0;
        for (const servico of this.servicosSelecionados) {
            totalMaoObra += servico.valorMaoObra;
        }
        for (const produto of this.produtosSelecionados) {
            totalProdutos += produto.subtotal;
        }
        for (const extra of this.extrasSelecionados) {
            totalExtras += extra.subtotal;
        }
        let maoObraAUsar = totalMaoObra;
        if (this.maoObraManual !== null) {
            maoObraAUsar = this.maoObraManual;
        }
        const total = ( maoObraAUsar + totalProdutos + totalExtras );
        this.visao.atualizarValorMaoObra(maoObraAUsar);
        this.visao.atualizarValorExtras(totalExtras);
        this.visao.atualizarValorProdutos(totalProdutos);
        this.visao.atualizarValorTotal(total);
    }

    async enviarOs(): Promise<void> {
        const dadosForm = this.visao.obterDadosFormulario();
        const dataEntrega = new Date(this.visao.obterDataEntregaAtual());
        const dataEntregaString = dataEntrega.toLocaleString( 'sv', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        } );
        const dataEntregaBrasilIso = dataEntregaString.replace(' ', 'T') + '-03:00';
        if (!this.clienteSelecionado) {
            this.visao.exibirMensagem( ['Selecione um cliente.'] );
            return;
        }
        if (!dadosForm.veiculoId) {
            this.visao.exibirMensagem( ['Selecione um veículo.'] );
            return;
        }
        if (!dadosForm.responsavelId) {
            this.visao.exibirMensagem( ['Selecione um responsável.'] );
            return;
        }
        if (this.servicosSelecionados.length === 0) {
            this.visao.exibirMensagem( ['Adicione pelo menos um serviço.'] );
            return;
        }
        try {
            let valorMaoObra = this.calcularMaoObraAtual();
            if (this.maoObraManual !== null) {
                valorMaoObra = this.maoObraManual;
            }
            const osData = {
                clienteId: this.clienteSelecionado.id,
                veiculoId: dadosForm.veiculoId,
                responsavelId: dadosForm.responsavelId,
                servicos: this.servicosSelecionados,
                produtos: this.produtosSelecionados,
                extras: this.extrasSelecionados,
                observacoes: dadosForm.observacoes,
                valorMaoObra,
                dataEntrega: dataEntregaBrasilIso
            };
            const osId = await this.gestor.cadastrarOs(osData);
            this.visao.exibirMensagemComAcao( ['Ordem de Serviço cadastrada com sucesso.'], osId );
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao cadastrar Ordem de Serviço: ${erro.message}`] );
            }
        }
    }

}