import { API_URL } from './rota-api.ts';
import { ErroGestor } from '../infra/erro-gestor.ts';


export class GestorAutenticacao {

    async autenticar(login: string, senha: string): Promise<void> {
        const response = await fetch( `${API_URL}/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { login, senha } )
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async logout(): Promise<void> {
        const response = await fetch( `${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

}