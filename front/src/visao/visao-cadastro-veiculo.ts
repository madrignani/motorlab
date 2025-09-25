export interface VisaoCadastroVeiculo {

    exibirDadosUsuario( dados: any ): void;
    redirecionarParaLogin(): void;
    exibirMensagem( mensagens: string[] ): void;
    redirecionarParaIndex(): void;
    exibirPagina(): void;
    exibirCliente(cliente: any[]): void;
    iniciarFormulario(): void;
    limparFormulario(): void;
    limparDivCliente(): void;
    
}