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

    iniciarFiltros(): void {
        const pesquisa = document.getElementById("filtroPesquisa") as HTMLInputElement;
        pesquisa.addEventListener( "input", () => {
            const valor = ( (pesquisa.value).trim() );
            this.controladora.aplicarFiltros(valor);
        } );
    }

    exibirItens(itens: any[]): void {
        const tbody = document.querySelector("tbody") as HTMLTableSectionElement;
        tbody.innerHTML = '';
        for (const item of itens) {
            const linha = document.createElement("tr");
            const dadosItem = [
                item.codigo, item.titulo, item.fabricante, item.precoVenda,
                item.estoque, item.localizacao
            ];
            for (const dado of dadosItem) {
                const td = document.createElement("td");
                td.textContent = dado;
                linha.appendChild(td);
            }
            const acao = document.createElement("td");
            const botaoGerenciar = document.createElement("button");
            botaoGerenciar.classList.add("botaoGerenciar");
            botaoGerenciar.textContent = "Gerenciar";
            botaoGerenciar.dataset.id = item.id;
            acao.appendChild(botaoGerenciar);
            const botaoRemover = document.createElement("button");
            botaoRemover.classList.add("botaoRemover");
            botaoRemover.textContent = "Remover";
            botaoRemover.dataset.id = item.id;
            acao.appendChild(botaoRemover);
            linha.appendChild(acao);
            linha.dataset.id = item.id;
            tbody.appendChild(linha);
        }
        this.iniciarRemocao();
        this.iniciarGerenciamento();
    }

    private iniciarRemocao(): void {
        const botoes = document.querySelectorAll<HTMLButtonElement>(".botaoRemover");
        for (const botao of botoes) {
            botao.addEventListener( "click", () => {
                const idItem = botao.dataset.id!;
                this.confirmarRemocaoItem("Confirma a remoção deste item?", idItem);
            } );
        }
    }

    private confirmarRemocaoItem(mensagem: string, idItem: string): void {
        const dialog = document.getElementById("modalConfirmacao") as HTMLDialogElement;
        const p = document.getElementById("modalConfirmacaoTexto") as HTMLParagraphElement;
        const botaoSim = document.getElementById("modalConfirmSim") as HTMLButtonElement;
        const botaoCancelar = document.getElementById("modalConfirmCancelar") as HTMLButtonElement;
        p.textContent = mensagem;
        botaoSim.onclick = () => {
            dialog.close();
            this.controladora.removerItem(idItem);
        };
        botaoCancelar.onclick = () => {
            dialog.close();
        };
        dialog.showModal();
    }

    limparTabela(): void {
        const tbody = document.querySelector("tbody") as HTMLTableSectionElement;
        tbody.innerHTML = '';
    }

    private iniciarGerenciamento(): void {
        const botoes = document.querySelectorAll<HTMLButtonElement>(".botaoGerenciar");
        for (const botao of botoes) {
            botao.addEventListener( "click", () => {
                const idItem = botao.dataset.id!;
                this.controladora.carregarItemParaGerenciamento(idItem);
            } );
        }
    }

    exibirModalGerenciamento(item: any): void {
        const dialog = document.getElementById("modalGerenciarItem") as HTMLDialogElement;
        const modalCodigo = document.getElementById("modalCodigo") as HTMLSpanElement;
        const modalTitulo = document.getElementById("modalTitulo") as HTMLSpanElement;
        const modalFabricante = document.getElementById("modalFabricante") as HTMLSpanElement;
        const modalDescricao = document.getElementById("modalDescricao") as HTMLSpanElement;
        const modalLocalizacao = document.getElementById("modalLocalizacao") as HTMLSpanElement;
        const modalPrecoVendaExibicao = document.getElementById("modalPrecoVendaExibicao") as HTMLSpanElement;
        const modalEstoqueExibicao = document.getElementById("modalEstoqueExibicao") as HTMLSpanElement;
        const modalEstoqueMinimoExibicao = document.getElementById("modalEstoqueMinimoExibicao") as HTMLSpanElement;
        modalCodigo.textContent = item.codigo;
        modalTitulo.textContent = item.titulo;
        modalFabricante.textContent = item.fabricante;
        modalDescricao.textContent = item.descricao;
        modalLocalizacao.textContent = item.localizacao;
        modalPrecoVendaExibicao.textContent = item.precoVenda;
        modalEstoqueExibicao.textContent = item.estoque;
        modalEstoqueMinimoExibicao.textContent = item.estoqueMinimo;
        const botaoEditar = document.getElementById("modalEditarItem") as HTMLButtonElement;
        const botaoConfirmar = document.getElementById("modalConfirmarEdicao") as HTMLButtonElement;
        const botaoCancelar = document.getElementById("modalCancelarEdicao") as HTMLButtonElement;
        const botaoFechar = document.getElementById("modalFecharGerenciar") as HTMLButtonElement;
        const camposEditaveis = document.getElementById("camposEditaveis") as HTMLDivElement;
        const inputPrecoVenda = document.getElementById("modalPrecoVenda") as HTMLInputElement;
        const inputEstoque = document.getElementById("modalEstoque") as HTMLInputElement;
        const inputEstoqueMinimo = document.getElementById("modalEstoqueMinimo") as HTMLInputElement;
        inputPrecoVenda.value = item.precoVenda;
        inputEstoque.value = item.estoque;
        inputEstoqueMinimo.value = item.estoqueMinimo;
        camposEditaveis.style.display = 'none';
        botaoEditar.style.display = 'inline';
        botaoConfirmar.style.display = 'none';
        botaoCancelar.style.display = 'none';
        botaoEditar.onclick = () => {
            camposEditaveis.style.display = 'block';
            modalPrecoVendaExibicao.style.display = 'none';
            modalEstoqueExibicao.style.display = 'none';
            modalEstoqueMinimoExibicao.style.display = 'none';
            botaoEditar.style.display = 'none';
            botaoConfirmar.style.display = 'inline';
            botaoCancelar.style.display = 'inline';
        };
        botaoConfirmar.onclick = () => {
            const precoVenda = inputPrecoVenda.value;
            const estoque = inputEstoque.value;
            const estoqueMinimo = inputEstoqueMinimo.value;
            this.controladora.atualizarItem(item.id, precoVenda, estoque, estoqueMinimo);
            dialog.close();
        };
        botaoCancelar.onclick = () => {
            camposEditaveis.style.display = 'none';
            modalPrecoVendaExibicao.style.display = 'inline';
            modalEstoqueExibicao.style.display = 'inline';
            modalEstoqueMinimoExibicao.style.display = 'inline';
            botaoEditar.style.display = 'inline';
            botaoConfirmar.style.display = 'none';
            botaoCancelar.style.display = 'none';
        };
        botaoFechar.onclick = () => {
            dialog.close();
        };
        dialog.showModal();
    }

}