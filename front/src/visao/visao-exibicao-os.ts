export interface VisaoExibicaoOs {

    iniciar(): void;
    exibirDadosUsuario( dados: any ): void;
    redirecionarParaLogin(): void;
    retornarNavegacao(): void;
    exibirMensagem( mensagens: string[] ): void;
    exibirPagina(): void;
    exibirOs(dados: any): void;
    atualizarValoresApresentacao(totais: any): void;
    mostrarAlertaPrazo(): void;
    ocultarAlertaPrazo(): void;
    exibirServicosModal(servicos: any[]): void;
    abrirModalProduto(servicoId: string, tarefaId: string): void;
    exibirProdutoEncontradoModal(produto: any): void;
    exibirValoresSugeridos(dados: any): void;
    obterProdutoAtual(): any;
    exibirLaudo(laudo: any): void;
    obterDadosOs(): any;

}