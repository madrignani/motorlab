import { describe, it, expect } from 'vitest';
import { GestorExibicaoOs } from '../../src/gestor/gestor-exibicao-os';


describe( 'GestorExibicaoOs', () => {

    it( 'Deve criar uma instância', () => {
        const gestor = new GestorExibicaoOs();
        expect(gestor).toBeInstanceOf(GestorExibicaoOs);
    } );

    it( 'Deve rejeitar obter OS sem autorização', async () => {
        const gestor = new GestorExibicaoOs();
        await expect( gestor.obterOs('1') ).rejects.toBeInstanceOf(Error);
    }, 20000 );

    it( 'Deve rejeitar buscar servicos para edição sem autorização', async () => {
        const gestor = new GestorExibicaoOs();
        await expect( gestor.buscarServicos('tra') ).rejects.toBeInstanceOf(Error);
    }, 20000 );

    it( 'Deve rejeitar adicionar servico sem autorização', async () => {
        const gestor = new GestorExibicaoOs();
        await expect( gestor.adicionarServico('1', { id: 1 }) ).rejects.toBeInstanceOf(Error);
    }, 20000 );

    it( 'Deve rejeitar buscar produtos sem autorização', async () => {
        const gestor = new GestorExibicaoOs();
        await expect( gestor.buscarProdutos('óleo') ).rejects.toBeInstanceOf(Error);
    }, 20000) ;

    it( 'Deve rejeitar adicionar produto sem autorização', async () => {
        const gestor = new GestorExibicaoOs();
        await expect( gestor.adicionarProduto('1', 'M15W30', '1', '1', 1) ).rejects.toBeInstanceOf(Error);
    }, 20000 );

    it( 'Deve rejeitar atualizar status sem autorização', async () => {
        const gestor = new GestorExibicaoOs();
        await expect( gestor.atualizarStatus('1', 'CONCLUIDA') ).rejects.toBeInstanceOf(Error);
    }, 20000 );

    it( 'Deve rejeitar obter laudo sem autorização', async () => {
        const gestor = new GestorExibicaoOs();
        await expect( gestor.obterLaudo('1') ).rejects.toBeInstanceOf(Error);
    }, 20000 );

    it( 'Deve rejeitar concluir OS com laudo sem autorização', async () => {
        const gestor = new GestorExibicaoOs();
        await expect( gestor.concluirOsComLaudo('1', 'resumo', 'recomendações') ).rejects.toBeInstanceOf(Error);
    }, 20000 );

    it( 'Deve rejeitar cadastrar pagamento sem autorização', async () => {
        const gestor = new GestorExibicaoOs();
        await expect( gestor.cadastrarPagamento('1', { forma: 'DINHEIRO', valor: 100 }) ).rejects.toBeInstanceOf(Error);
    }, 20000 );

} );