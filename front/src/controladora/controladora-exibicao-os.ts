import { ErroGestor } from '../infra/erro-gestor.ts';
import type { VisaoExibicaoOs } from '../visao/visao-exibicao-os.ts';
import { GestorExibicaoOs } from '../gestor/gestor-exibicao-os.ts';


export class ControladoraExibicaoOs {

    private gestor = new GestorExibicaoOs();
    private visao: VisaoExibicaoOs;
    private dadosUsuario: any = null;

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

    async iniciarSessao(idOs: string): Promise<void> {
        try {
            await this.gestor.verificarPermissao();
        } catch (erro: any) {
            this.visao.redirecionarParaLogin();
            return;
        }
        await this.carregarDadosUsuario();
        await this.carregarOs(idOs);
        this.visao.exibirPagina();
    }

    private async carregarDadosUsuario(): Promise<void> {
        try {
            this.dadosUsuario = await this.gestor.obterDadosUsuario();
            this.visao.exibirDadosUsuario(this.dadosUsuario);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar os dados do usuário: ${erro.message}`] ); 
            }
        }
    }

    obterDadosUsuario(): any {
        return this.dadosUsuario;
    }

    async carregarOs(idOs: string): Promise<void> {
        try {
            const os = await this.gestor.obterOs(idOs);
            this.visao.exibirOs(os);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar os dados da OS: ${erro.message}`] );
            }
        }
    }

    async buscarServicos(termo: string): Promise<void> {
        try {
            const servicos = await this.gestor.buscarServicos(termo);
            this.visao.exibirServicosModal(servicos);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao buscar serviços: ${erro.message}`] );
            }
        }
    }

    async adicionarServico(servico: any): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.adicionarServico(osData.id, servico);
            await this.carregarOs(osData.id);
            let mensagem = '';
            if ( Number(osData.valorMaoObra) != Number(osData.valorMaoObraSugerido) ) {
                mensagem += 'Serviço adicionado: valor da mão de obra restaurado ao padrão';
            }
            const previsaoEntregaFormat = new Date(osData.previsaoEntrega);
            const previsaoSugeridaFormat = new Date(osData.previsaoEntregaSugerida);
            previsaoEntregaFormat.setSeconds(0,0);
            previsaoSugeridaFormat.setSeconds(0,0);
            if (previsaoEntregaFormat.getTime() !== previsaoSugeridaFormat.getTime()) {
                if(mensagem.length > 0) {
                    mensagem += ' e o tempo de execução do serviço aplicado à previsão de entrega.';
                } else {
                    mensagem += 'Serviço adicionado: o tempo de execução do serviço foi aplicado à previsão de entrega.';
                }
            }
            if (mensagem.length > 0) {
                setTimeout( () => {
                    this.visao.exibirMensagem( [mensagem] );
                }, 700 );
            }
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao adicionar serviço: ${erro.message}`] );
            }
        }
    }

    async removerServico(servicoId: string): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.removerServico(osData.id, servicoId);
            await this.carregarOs(osData.id);
            let mensagem = '';
            if ( Number(osData.valorMaoObra) != Number(osData.valorMaoObraSugerido) ) {
                mensagem += 'Serviço adicionado: valor da mão de obra restaurado ao padrão';
            }
            const previsaoEntregaFormat = new Date(osData.previsaoEntrega);
            const previsaoSugeridaFormat = new Date(osData.previsaoEntregaSugerida);
            previsaoEntregaFormat.setSeconds(0,0);
            previsaoSugeridaFormat.setSeconds(0,0);
            if (previsaoEntregaFormat.getTime() !== previsaoSugeridaFormat.getTime()) {
                if(mensagem.length > 0) {
                    mensagem += ' e o tempo de execução do serviço aplicado à previsão de entrega.';
                } else {
                    mensagem += 'Serviço adicionado: o tempo de execução do serviço foi aplicado à previsão de entrega.';
                }
            }
            if (mensagem.length > 0) {
                setTimeout( () => {
                    this.visao.exibirMensagem( [mensagem] );
                }, 400 );
            }
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao remover serviço: ${erro.message}`] );
            }
        }
    }

    async adicionarTarefaManual(servicoId: string, descricao: string): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.adicionarTarefaManual(osData.id, servicoId, descricao);
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao adicionar tarefa: ${erro.message}`] );
            }
        }
    }

    async reordenarTarefa(servicoId: string, origemTarefaId: string, destinoTarefaId: string): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.reordenarTarefa(osData.id, servicoId, origemTarefaId, destinoTarefaId);
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao reordenar tarefa: ${erro.message}`] );
            }
        }
    }

    async removerTarefa(servicoId: string, tarefaId: string): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.removerTarefa(osData.id, servicoId, tarefaId);
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao remover tarefa: ${erro.message}`] );
            }
        }
    }

    async buscarProduto(codigoProduto: string): Promise<void> {
        if (!codigoProduto) {
            this.visao.exibirMensagem( ['Informe o código do produto.'] );
            return;
        }
        try {
            const produto = await this.gestor.obterProdutoPorCodigo(codigoProduto);
            if (!produto.id) {
                this.visao.exibirMensagem( ['Não há produto correspondente ao código informado.'] );
                return;
            }
            this.visao.exibirProdutoEncontradoModal(produto);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao buscar o produto: ${erro.message}`] );
            }
        }
    }

    async confirmarProduto(modal: HTMLDialogElement, quantidade: string): Promise<void> {
        try {
            const quantidadeFormat = ( parseInt(quantidade) );
            const produto = this.visao.obterProdutoAtual();
            const osData = this.visao.obterDadosOs();
            const servicoId = modal.dataset.servicoIdDoProduto!;
            const tarefaId = modal.dataset.tarefaIdDoProduto!;
            if (!produto) {
                this.visao.exibirMensagem( ['Busque e selecione um produto primeiro.'] );
                return;
            }
            const servico = osData.servicos.find( (servico: any) => String(servico.id) === String(servicoId) );
            const tarefa = servico.tarefas.find( (tarefa: any) => String(tarefa.id) === String(tarefaId) );
            if (tarefa.produtos && tarefa.produtos.length > 0) {
                const existe = tarefa.produtos.some( (prod: any) => String(prod.id) === String(produto.id) );
                if (existe) {
                    this.visao.exibirMensagem( [`Produto já adicionado a esta tarefa.`] );
                    return;
                }
            }
            if (isNaN(quantidadeFormat) || quantidadeFormat <= 0) {
                this.visao.exibirMensagem( ['Informe uma quantidade válida.'] );
                return;
            }
            if (quantidadeFormat > produto.estoque) {
                this.visao.exibirMensagem( ['Quantidade solicitada indisponível em estoque.'] );
                return;
            }
            await this.gestor.adicionarProduto(osData.id, produto.id, servicoId, tarefaId, quantidadeFormat);
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao adicionar produto: ${erro.message}`] );
            }
        }
    }

    async removerProduto(produtoId: string, servicoId: string, tarefaId: string): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.removerProduto(osData.id, produtoId, servicoId, tarefaId);
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao remover produto: ${erro.message}`] );
            }
        }
    }

    async adicionarExtra(descricao: string, valor: number, quantidade: number): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.adicionarExtra(osData.id, descricao, valor, quantidade);
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao adicionar custo extra: ${erro.message}`] );
            }
        }
    }

    async removerExtra(extraId: string): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.removerExtra(osData.id, extraId);
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao remover custo extra: ${erro.message}`] );
            }
        }
    }

    async colocarOsEmAlerta(): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.atualizarStatus(osData.id, 'ALERTA');
            this.visao.exibirMensagem( ['OS colocada em alerta.'] );
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao colocar OS em alerta: ${erro.message}`] );
            }
        }
    }

    async removerAlertaOs(): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.atualizarStatus(osData.id, 'ANDAMENTO');
            this.visao.exibirMensagem( ['Alerta removido da OS.'] );
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao remover alerta: ${erro.message}`] );
            }
        }
    }

    async cancelarOs(): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.atualizarStatus(osData.id, 'CANCELADA');
            this.visao.exibirMensagem( ['OS cancelada.'] );
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao cancelar OS: ${erro.message}`] );
            }
        }
    }

    async efetivarOs(): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.atualizarStatus(osData.id, 'ANDAMENTO');
            this.visao.exibirMensagem( ['OS efetivada.'] );
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao efetivar OS: ${erro.message}`] );
            }
        }
    }

    async concluirOsComLaudo(resumo: string, recomendacoes: string): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.concluirOsComLaudo(osData.id, resumo, recomendacoes);
            this.visao.exibirMensagem( ['OS concluída.'] );
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao concluir OS: ${erro.message}`] );
            }
        }
    }

    async cadastrarPagamento(metodo: string, descontoPorcentagem: number): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.cadastrarPagamento(osData.id, { metodo, descontoPorcentagem });
            this.visao.exibirMensagem( ['Pagamento registrado. OS finalizada.'] );
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao registrar pagamento: ${erro.message}`] );
            }
        }
    }

    async atualizarMaoObra(valor: number): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.atualizarMaoObra(osData.id, valor);
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao atualizar mão de obra: ${erro.message}`] );
            }
        }
    }

    async atualizarDataEntrega(data: string): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.atualizarDataEntrega(osData.id, data);
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao atualizar data de entrega: ${erro.message}`] );
            }
        }
    }

    private calcularTotalProdutos(servicos: any[]): number {
        let total = 0;
        for (const servico of servicos) {
            for (const tarefa of servico.tarefas) {
                if (tarefa.produtos) {
                    for (const produto of tarefa.produtos) {
                        const valor = ( Number(produto.subtotal) );
                        total += valor;
                    }
                }
            }
        }
        return total;
    }

    private calcularTotalExtras(custos: any[]): number {
        let total = 0;
        if (!custos) {
            return total;
        }
        for (const custo of custos) {
            if (custo.tipo === 'EXTRA') {
                const valor = ( Number(custo.subtotal) );
                total += valor;
            }
        }
        return total;
    }

    async atualizarObservacoes(observacoes: string): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            await this.gestor.atualizarObservacoes(osData.id, observacoes);
            await this.carregarOs(osData.id);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao atualizar observações: ${erro.message}`] );
            }
        }
    }

    public calcularValores(dados: any): void {
        const valorMaoObra = ( Number(dados.valorMaoObra) );
        const totalProdutos = this.calcularTotalProdutos(dados.servicos);
        const totalExtras = this.calcularTotalExtras(dados.custos || []);
        this.visao.atualizarValoresApresentacao( {
            valorMaoObra,
            totalProdutos,
            totalExtras
        } );
    }

    public async avaliarPrazoENotificar(dados: any): Promise<void> {
        if (dados.status === 'CANCELADA' || dados.status === 'FINALIZADA') { 
            return;
        }
        const agora = ( new Date() );
        const previsao = ( new Date(dados.previsaoEntrega) );
        if (agora > previsao) {
            this.visao.mostrarAlertaPrazo();
        } else {
            this.visao.ocultarAlertaPrazo();
        }
    }

    async exibirLaudo(): Promise<void> {
        try {
            const osData = this.visao.obterDadosOs();
            const laudo = await this.gestor.obterLaudo(osData.id);
            this.visao.exibirLaudo(laudo);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Erro ao carregar laudo: ${erro.message}`] );
            }
        }
    }

}