import type { VisaoListagemItem } from './visao-listagem-item.ts';
import { ControladoraListagemItem } from '../controladora/controladora-listagem-item.ts';


export class VisaoListagemItemHTML implements VisaoListagemItem {

    private controladora: ControladoraListagemItem;
    
    constructor() {
        this.controladora = new ControladoraListagemItem(this);
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
        const div = document.getElementById("dropdownConteudoUsuario") as HTMLDivElement;
        const nome = document.createElement("p");
        nome.textContent = dados.nome;
        const cargo = document.createElement("p");
        cargo.textContent = dados.cargo;
        div.appendChild(nome);
        div.appendChild(cargo);
    }

    redirecionarParaLogin(): void {
        window.location.href = "./login.html";
    }

    exibirMensagem( mensagens: string[] ): void {
        alert( mensagens.join("\n") );
    }

    exibirPagina(): void {
        document.body.style.visibility = "visible";
    }

}