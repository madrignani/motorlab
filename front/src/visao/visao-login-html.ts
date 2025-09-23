import type { VisaoLogin } from './visao-login.ts';
import { ControladoraAutenticacao } from '../controladora/controladora-autenticacao.ts';


export class VisaoLoginHTML implements VisaoLogin {

    private controladora: ControladoraAutenticacao;
    private inputLogin = document.getElementById("login") as HTMLInputElement;
    private inputSenha = document.getElementById("senha") as HTMLInputElement;
    private botaoLogin = document.getElementById("botaoLogin") as HTMLButtonElement;

    constructor() {
        this.controladora = new ControladoraAutenticacao(this);
    }

    iniciar(): void {
        this.botaoLogin.addEventListener( "click", () => {
            const login = this.inputLogin.value.trim();
            const senha = this.inputSenha.value;
            this.controladora.login(login, senha);
        } );
    }

    redirecionarParaIndex(): void {
        window.location.href = './index.html';
    }

    exibirMensagem( mensagens: string[] ): void {
        alert( mensagens.join("\n") );
    }

}