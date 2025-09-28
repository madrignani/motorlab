import type { VisaoCadastroVeiculo } from './visao-cadastro-veiculo.ts';
import { ControladoraCadastroVeiculo } from '../controladora/controladora-cadastro-veiculo.ts';


export class VisaoCadastroVeiculoHTML implements VisaoCadastroVeiculo {

    private controladora: ControladoraCadastroVeiculo;

    constructor() {
        this.controladora = new ControladoraCadastroVeiculo(this);
    }

    iniciar(): void {
        this.controladora.iniciarSessao();
        this.iniciarLogout();
        this.buscaCliente();
    }

    private iniciarLogout(): void {
        const botaoLogout = document.getElementById("botaoLogout") as HTMLButtonElement;
        botaoLogout.addEventListener('click', () => {
            this.controladora.logout();
        });
    }

    exibirDadosUsuario(dados: any): void {
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

    exibirMensagem(mensagens: string[]): void {
        alert(mensagens.join("\n"));
    }

    redirecionarParaIndex(): void {
        window.location.href = "./index.html";
    }

    exibirPagina(): void {
        document.body.style.visibility = "visible";
    }

    private buscaCliente(): void {
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

    iniciarFormulario(): void {
        const form = document.querySelector("form") as HTMLFormElement;
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const dados = {
                placa: (document.getElementById("placa") as HTMLInputElement).value.trim(),
                chassi: (document.getElementById("chassi") as HTMLInputElement).value.trim(),
                fabricante: (document.getElementById("fabricante") as HTMLInputElement).value.trim(),
                modelo: (document.getElementById("modelo") as HTMLInputElement).value.trim(),
                ano: (document.getElementById("ano") as HTMLInputElement).value.trim(),
                quilometragem: (document.getElementById("quilometragem") as HTMLInputElement).value.trim()
            };
            this.controladora.enviarVeiculo(dados);
        });
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