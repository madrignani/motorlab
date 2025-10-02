export interface VisaoCadastroCliente {

    exibirDadosUsuario( dados: any ): void;
    redirecionarParaLogin(): void;
    retornarNavegacao(): void;
    exibirMensagem( mensagens: string[] ): void;
    exibirPagina(): void;
    iniciarFormulario(): void;
    limparFormulario(): void;
       
}