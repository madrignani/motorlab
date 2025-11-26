import { describe, it, expect, vi } from 'vitest';
import { GestorCadastroOs } from '../../src/gestor/gestor-cadastro-os';


describe('GestorCadastroOs', () => {

    it( 'Deve criar uma instância', () => {
        const gestor = new GestorCadastroOs();
        
        expect(gestor).toBeInstanceOf(GestorCadastroOs);
    } );

} );