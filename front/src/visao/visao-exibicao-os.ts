export interface VisaoExibicaoOs {

    iniciar(): void;
    exibirDadosUsuario( dados: any ): void;
    redirecionarParaLogin(): void;
    retornarNavegacao(): void;
    exibirMensagem( mensagens: string[] ): void;
    exibirPagina(): void;
    preencherCampos(dados: any): void;
    atualizarValorTotal(total: any): void;
}