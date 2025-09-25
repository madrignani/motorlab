import type { VisaoListagemOs } from './visao-listagem-os.ts';
import { ControladoraListagemOs } from '../controladora/controladora-listagem-os.ts';


export class VisaoListagemOsHTML implements VisaoListagemOs {

    private controladora: ControladoraListagemOs;
    
    constructor() {
        this.controladora = new ControladoraListagemOs(this);
    }
    
    iniciar(): void {
        this.controladora.iniciarSessao();
        this.iniciarLogout();
    }

    private iniciarLogout(): void {
        const botaoLogout = document.getElementById("botaoLogout") as HTMLButtonElement;
        botaoLogout.addEventListener( 'click', () => {
            this.controladora.logout();
        } );
    }

    exibirDadosUsuario( dados: any ): void {
        const div = document.getElementById("identificacaoUsuario") as HTMLDivElement;
        let texto = `Usuário: ${dados.nome} -- ${dados.cargo}`;
        div.textContent = texto;
    }

    redirecionarParaLogin(): void {
        window.location.href = "./login.html";
    }

    exibirMensagem( mensagens: string[] ): void {
        alert( mensagens.join("\n") );
    }

}