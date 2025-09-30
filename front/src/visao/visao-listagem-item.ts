export interface VisaoListagemItem {

    exibirDadosUsuario( dados: any ): void;
    redirecionarParaLogin(): void;
    exibirMensagem( mensagens: string[] ): void;
    exibirPagina(): void;
    iniciarFiltros(): void;
    exibirItens(itens: any[]): void;
    limparTabela(): void;
    exibirModalGerenciamento(item: any): void;
       
}