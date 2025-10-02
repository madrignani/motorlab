export interface VisaoCadastroVeiculo {

    exibirDadosUsuario( dados: any ): void;
    redirecionarParaLogin(): void;
    retornarNavegacao(): void;
    exibirMensagem( mensagens: string[] ): void;
    exibirPagina(): void;
    exibirCliente(cliente: any[]): void;
    iniciarFormulario(): void;
    limparFormulario(): void;
    limparDivCliente(): void;
    
}