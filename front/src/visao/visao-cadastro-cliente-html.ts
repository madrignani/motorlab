import type { VisaoCadastroCliente } from './visao-cadastro-cliente.ts';
import { ControladoraCadastroCliente } from '../controladora/controladora-cadastro-cliente.ts';


export class VisaoCadastroClienteHTML implements VisaoCadastroCliente {

    private controladora: ControladoraCadastroCliente;
    
    constructor() {
        this.controladora = new ControladoraCadastroCliente(this);
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

    redirecionarParaIndex(): void {
        window.location.href = "./index.html";
    }

    exibirPagina(): void {
        document.body.style.visibility = "visible";
    }

    iniciarFormulario(): void {
        const form = document.querySelector("form") as HTMLFormElement;
        form.addEventListener( "submit", (event) => {
            event.preventDefault();
            const dados = {
                cpf: (document.getElementById("cpf") as HTMLInputElement).value.trim(),
                nome: (document.getElementById("nome") as HTMLInputElement).value.trim(),
                telefone: (document.getElementById("telefone") as HTMLInputElement).value.trim(),
                email: (document.getElementById("email") as HTMLInputElement).value.trim()
            };
            this.controladora.enviarCliente(dados);
        } );
    }

    limparFormulario(): void {
        const form = document.querySelector("form") as HTMLFormElement;
        form.reset();
    }

}