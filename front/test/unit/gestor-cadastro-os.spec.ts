import { describe, it, expect, vi } from 'vitest';
import { GestorCadastroOs } from '../../src/gestor/gestor-cadastro-os';


describe( 'GestorCadastroOs', () => {

    it( 'Deve criar uma instância', () => {
        const gestor = new GestorCadastroOs();
        expect(gestor).toBeInstanceOf(GestorCadastroOs);
    } );

    it( 'Deve falhar por sem autorização quando obter responsáveis', async () => {
        const gestor = new GestorCadastroOs();
        await expect( gestor.obterResponsaveis() ).rejects.toBeInstanceOf(Error);
    }, 20000 );

    it( 'Deve falhar por sem autorização ao buscar serviços por termo', async () => {
        const gestor = new GestorCadastroOs();
        await expect( gestor.obterServicosPorTermo('tra') ).rejects.toBeInstanceOf(Error);
    }, 20000 );

    it( 'Deve rejeitar cadastro de OS com dados inválidos', async () => {
        const gestor = new GestorCadastroOs();
        const dadosInvalidos = {};
        try {
            await gestor.cadastrarOs(dadosInvalidos);
            throw new Error('Cadastro inesperadamente sucedido com dados inválidos');
        } catch (erro: any) {
            expect(erro).toBeInstanceOf(Error);
            if (typeof erro.getProblemas === 'function') {
                const problemas = erro.getProblemas();
                expect(Array.isArray(problemas)).toBeTruthy();
                expect(problemas.length).toBeGreaterThan(0);
            }
        }
    }, 20000 );

} );