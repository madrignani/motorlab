export interface VisaoListagemItem {

    exibirDadosUsuario( dados: any ): void;
    redirecionarParaLogin(): void;
    exibirMensagem( mensagens: string[] ): void;
    exibirPagina(): void;
       
}