import type { VisaoCadastroItem } from './visao-cadastro-item.ts';
import { ControladoraCadastroItem } from '../controladora/controladora-cadastro-item.ts';


export class VisaoCadastroItemHTML implements VisaoCadastroItem {

    private controladora: ControladoraCadastroItem;
    private permissao = false;
    
    constructor() {
        this.controladora = new ControladoraCadastroItem(this);
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
                codigo: (document.getElementById("codigo") as HTMLInputElement).value.trim(),
                titulo: (document.getElementById("titulo") as HTMLInputElement).value.trim(),
                fabricante: (document.getElementById("fabricante") as HTMLInputElement).value.trim(),
                descricao: (document.getElementById("descricao") as HTMLInputElement).value.trim(),
                precoVenda: (document.getElementById("precoVenda") as HTMLInputElement).value,
                estoque: (document.getElementById("estoque") as HTMLInputElement).value,
                estoqueMinimo: (document.getElementById("estoqueMinimo") as HTMLInputElement).value,
                localizacao: (document.getElementById("localizacao") as HTMLInputElement).value.trim()
            };
            this.controladora.enviarItem(dados);
        } );
    }

    limparFormulario(): void {
        const form = document.querySelector("form") as HTMLFormElement;
        form.reset();
    }

}