export interface VisaoCadastroOs {

    exibirDadosUsuario( dados: any ): void;
    redirecionarParaLogin(): void;
    retornarNavegacao(): void;
    exibirMensagem( mensagens: string[] ): void;
    exibirPagina(): void;
    exibirCliente(cliente: any[]): void;
    listarVeiculos(veiculos: any[]): void;
    listarResponsaveis(responsaveis: any): void;
    iniciarFormulario(): void;
    limparFormulario(): void;
    limparDivCliente(): void;
       
}