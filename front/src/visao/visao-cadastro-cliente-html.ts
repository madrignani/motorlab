import type { VisaoCadastroCliente } from './visao-cadastro-cliente.ts';
import { ControladoraCadastroCliente } from '../controladora/controladora-cadastro-cliente.ts';


export class VisaoCadastroClienteHTML implements VisaoCadastroCliente {

    private controladora: ControladoraCadastroCliente;
    private permissao = false;
    
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
        this.permissao = (dados.cargo === 'ATENDENTE' || dados.cargo === 'GERENTE');  
        this.exibirElementos();
    }

    redirecionarParaLogin(): void {
        window.location.href = "./login.html";
    }

    retornarNavegacao(): void {
        window.location.href = "./index.html";
    }

    exibirMensagem( mensagens: string[] ): void {
        const texto = mensagens.join("\n");
        const dialog = document.getElementById("modalMensagem") as HTMLDialogElement;
        const p = document.getElementById("modalMensagemTexto") as HTMLParagraphElement;
        const botaoOk = document.getElementById("modalMensagemOk") as HTMLButtonElement;
        p.textContent = texto;
        botaoOk.addEventListener( "click", () => dialog.close() );
        dialog.showModal();
    }

    exibirPagina(): void {
        document.body.style.visibility = "visible";
    }

    private exibirElementos(): void {
        const linkCadastroCliente = document.getElementById("cadastroCliente") as HTMLAnchorElement;
        const linkCadastroVeiculo = document.getElementById("cadastroVeiculo") as HTMLAnchorElement;
        const linkCadastroOs = document.getElementById("cadastroOs") as HTMLAnchorElement;
        const linksCadastroCVO = [linkCadastroCliente, linkCadastroVeiculo, linkCadastroOs];
        if (!this.permissao) {
            for (const link of linksCadastroCVO) {
                link.removeAttribute('href');
                link.style.opacity = '0.5';
                link.style.cursor = 'default';
                link.title = 'Acesso não permitido';
            }
        }
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