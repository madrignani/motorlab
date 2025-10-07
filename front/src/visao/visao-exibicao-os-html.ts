import type { VisaoExibicaoOs } from './visao-exibicao-os.ts';
import { ControladoraExibicaoOs } from '../controladora/controladora-exibicao-os.ts';


export class VisaoExibicaoOsHTML implements VisaoExibicaoOs {

    private controladora: ControladoraExibicaoOs;
    private permissao = false;
    
    constructor() {
        this.controladora = new ControladoraExibicaoOs(this);
    }
    
    iniciar(): void {
        this.controladora.iniciarSessao();
        this.iniciarLogout();
        const params = new URLSearchParams(window.location.search);
        const idOs = params.get("id");
        if(idOs){ this.controladora.buscarDadosOs(idOs); }
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

    preencherCampos(dados: any): void {
        const idOs = document.getElementById("idOs") as HTMLSpanElement;
        idOs.textContent = `${dados.id}`;
    }

    atualizarValorTotal(total: any): void {
        const valorTotal = document.getElementById("valorTotalOs") as HTMLSpanElement;
        const formatado = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        valorTotal.textContent = `Total: ${formatado}`;
    }
    
}