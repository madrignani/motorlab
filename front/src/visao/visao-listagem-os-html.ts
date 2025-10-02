import type { VisaoListagemOs } from './visao-listagem-os.ts';
import { ControladoraListagemOs } from '../controladora/controladora-listagem-os.ts';


export class VisaoListagemOsHTML implements VisaoListagemOs {

    private controladora: ControladoraListagemOs;
    private permissao = false;
    
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

}