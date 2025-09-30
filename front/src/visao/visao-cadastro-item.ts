export interface VisaoCadastroItem {

    exibirDadosUsuario( dados: any ): void;
    redirecionarParaLogin(): void;
    exibirMensagem( mensagens: string[] ): void;
    redirecionarParaIndex(): void;
    exibirPagina(): void;
    iniciarFormulario(): void;
    limparFormulario(): void;
       
}