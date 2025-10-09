export interface VisaoCadastroOs {

    exibirDadosUsuario( dados: any ): void;
    redirecionarParaLogin(): void;
    retornarNavegacao(): void;
    exibirMensagem( mensagens: string[] ): void;
    exibirMensagemComAcao( mensagens: string[], id: string ): void;
    exibirPagina(): void;
    buscarCliente(): void;
    exibirCliente(cliente: any[]): void;
    listarVeiculos(veiculos: any[]): void;
    listarResponsaveis(responsaveis: any): void;
    iniciarFormulario(): void;
    limparFormulario(): void;
    limparDivCliente(): void;
    iniciarBuscaItem(): void;
    adicionarItemTabela(item: any, quantidade: number, subtotal: number): void;
    iniciarCustos(): void;
    adicionarCustoTabela(custo: any): void;
    obterVeiculoSelecionadoId(): string | null;
    obterResponsavelSelecionadoId(): string | null;
    obterObservacoes(): string;
    obterPrevisaoEntrega(): string | null;
    limparTabelaItens(): void;
    limparTabelaCustos(): void;
    atualizarValorTotal(total: number): void;
    limparValorTotal(): void;
    iniciarFormulario(): void;
    redirecionarParaOsCriada(id: string): void;

}