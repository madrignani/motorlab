import { API_URL } from './rota-api.ts';
import { ErroGestor } from '../infra/erro-gestor.ts';


export class GestorSessao {

    async verificarPermissao(): Promise<void> {
        const response = await fetch( `${API_URL}/me`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async obterDadosUsuario(): Promise<any> {
        const response = await fetch( `${API_URL}/dados-usuario`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();
    }

}