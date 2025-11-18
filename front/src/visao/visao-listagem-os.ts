export interface VisaoListagemOs {

    iniciar(): void;
    exibirDadosUsuario( dados: any ): void;
    redirecionarParaLogin(): void;
    exibirMensagem( mensagens: string[] ): void;
    exibirPagina(): void;
    exibirListaOs(dados: any[]): void
       
}