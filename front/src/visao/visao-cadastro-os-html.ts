import type { VisaoCadastroOs } from './visao-cadastro-os.ts';
import { ControladoraCadastroOs } from '../controladora/controladora-cadastro-os.ts';


export class VisaoCadastroOsHTML implements VisaoCadastroOs {

    private controladora: ControladoraCadastroOs;
    private permissao = false;
    
    constructor() {
        this.controladora = new ControladoraCadastroOs(this);
    }
    
    iniciar(): void {
        this.controladora.iniciarSessao();
        this.iniciarLogout();
        this.buscarCliente();
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

    private buscarCliente(): void {
        const inputBuscaCliente = document.getElementById("buscaCliente") as HTMLInputElement;
        const botaoBuscaCliente = document.getElementById("botaoBuscaCliente") as HTMLButtonElement;
        botaoBuscaCliente.addEventListener( "click", () => {
            const busca = inputBuscaCliente.value.trim();
            this.controladora.buscarCliente(busca);
        } );
    }

    exibirCliente(cliente: any): void {
        const divDetalhesCliente = document.getElementById("detalhesCliente") as HTMLDivElement;
        divDetalhesCliente.innerHTML = `
            <p>Nome: ${cliente.nome}</p>
            <p>CPF: ${cliente.cpf}</p>
            <p>Telefone: ${cliente.telefone}</p>
            <p>Email: ${cliente.email}</p>
        `;
    }

    listarVeiculos(veiculos: any): void {
        const select = document.getElementById("veiculos") as HTMLSelectElement;
        select.innerHTML = '<option value="">Selecione</option>';
        for (const veiculo of veiculos) {
            const option = document.createElement("option");
            option.value = veiculo.id;
            option.textContent = `${veiculo.fabricante} ${veiculo.modelo} ${veiculo.ano} (${veiculo.placa})`;
            select.appendChild(option);
        }
    }

    listarResponsaveis(responsaveis: any): void {
        const select = document.getElementById("responsaveis") as HTMLSelectElement;
        select.innerHTML = '<option value="">Selecione</option>';
        for (const responsavel of responsaveis) {
            const option = document.createElement("option");
            option.value = responsavel.id;
            option.textContent = `${responsavel.nome}`;
            select.appendChild(option);
        }
    }

    iniciarFormulario(): void {
        const form = document.querySelector("form") as HTMLFormElement;
        form.addEventListener( "submit", (event) => {
            event.preventDefault();
        } );
    }

    limparFormulario(): void {
        const form = document.querySelector("form") as HTMLFormElement;
        form.reset();
    }

    limparDivCliente(): void {
        const divDetalhesCliente = document.getElementById("detalhesCliente") as HTMLDivElement;
        divDetalhesCliente.innerHTML = '';
    }

}