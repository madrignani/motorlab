export interface VisaoCadastroOs {
    
    iniciar(): void;
    exibirDadosUsuario( dados: any ): void;
    redirecionarParaLogin(): void;
    retornarNavegacao(): void;
    exibirMensagem( mensagens: string[] ): void;
    exibirMensagemComAcao( mensagens: string[], id: string ): void;
    exibirPagina(): void;
    buscarCliente(): void;
    exibirCliente(cliente: any): void;
    limparDivCliente(): void;
    listarVeiculos(veiculos: any): void;
    listarResponsaveis(responsaveis: any[], mostrarIndisponiveis: boolean): void;
    iniciarBuscaServicos(): void;
    adicionarServicoNaLista(servico: any): void;
    removerServicoNaLista(servicoId: string): void;
    adicionarTarefaManual(servicoId: string, tarefa?: any): void;
    removerTarefaNaLista(servicoId: string, tarefaId: string): void;
    atualizarTarefasServico(servico: any): void;
    exibirTarefasServicos(servicos: any[]): void;
    adicionarProdutoLista(produto: any, quantidade: number, servicoId: string, tarefaId: string): void;
    obterProdutoAtual(): any;
    limparProdutoAtual(): void;
    removerProdutoLista(produtoId: string, servicoId: string, tarefaId: string): void;
    adicionarExtraLista(extra: any): void;
    exibirExtras(extras: any[]): void;
    removerExtraNaLista(extraId: string): void;
    iniciarModais(): void;
    abrirModalProduto(servicoId: string, tarefaId: string): void;
    fecharModalProduto(): void;
    exibirProdutosModal(produtos: any[]): void;
    exibirProdutoSelecionadoModal(produto: any): void;
    abrirModalExtra(): void;
    fecharModalExtra(): void;
    atualizarValorMaoObra(valor: number): void;
    atualizarValorProdutos(valor: number): void;
    atualizarValorExtras(valor: number): void;
    atualizarDataEntrega(data: string): void;
    obterDataEntregaAtual(): string;
    atualizarValorTotal(total: number): void;
    obterDadosFormulario(): any;
    enviarFormulario(): void;
    limparFormulario(): void;
    redirecionarParaOsCriada(id: string): void;

}