import type { VisaoListagemItem } from './visao-listagem-item.ts';
import { ControladoraListagemItem } from '../controladora/controladora-listagem-item.ts';


export class VisaoListagemItemHTML implements VisaoListagemItem {

    private controladora: ControladoraListagemItem;
    private permissao = false;
    
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
        const linkCadastroItem = document.getElementById("cadastroItem") as HTMLAnchorElement;
        const linkCadastroCliente = document.getElementById("cadastroCliente") as HTMLAnchorElement;
        const linkCadastroVeiculo = document.getElementById("cadastroVeiculo") as HTMLAnchorElement;
        const linkCadastroOs = document.getElementById("cadastroOs") as HTMLAnchorElement;
        const linksCadastroCVO = [linkCadastroCliente, linkCadastroVeiculo, linkCadastroOs];
        if (!this.permissao) {
            linkCadastroItem.style.display = 'none';
            for (const link of linksCadastroCVO) {
                link.removeAttribute('href');
                link.style.opacity = '0.5';
                link.style.cursor = 'default';
                link.title = 'Acesso não permitido';
            }
        }
    }

    iniciarFiltros(): void {
        const pesquisa = document.getElementById("filtroPesquisa") as HTMLInputElement;
        pesquisa.addEventListener( "input", () => {
            this.controladora.aplicarFiltros(pesquisa.value);
        } );
    }

    exibirItens(itens: any[]): void {
        const tbody = document.querySelector("tbody") as HTMLTableSectionElement;
        tbody.innerHTML = '';
        for (const item of itens) {
            const linha = document.createElement("tr");
            linha.classList.add(item.classeEstoque);
            const dadosItem = [
                item.codigo, item.titulo, item.fabricante, ( Number(item.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ),
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

    exibirAlertaEstoque(codigoItensAlerta: string[]): void {
        const alertaDiv = document.getElementById("alertaEstoqueBaixo") as HTMLDivElement;
        let mensagem = '';
        if (codigoItensAlerta.length === 0) {
            alertaDiv.style.display = "none";
            alertaDiv.textContent = "";
            return;
        }
        if (codigoItensAlerta.length === 1) {
            mensagem = `ATENÇÃO: O ESTOQUE DO ITEM <strong>#${codigoItensAlerta[0]}</strong> ESTÁ BAIXO.`;
        } 
        if (codigoItensAlerta.length > 1) {
            const itensTexto = codigoItensAlerta.map(codigo => `#${codigo}`).join(", ");
            mensagem = `ATENÇÃO: O ESTOQUE DOS ITENS <strong>${itensTexto}</strong> ESTÁ BAIXO.`;
        }
        alertaDiv.innerHTML = `<p>${mensagem}</p>`;
        alertaDiv.style.display = 'block';
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
        const modalPrecoVendaExibicao = document.getElementById("modalPrecoVendaExibicao") as HTMLSpanElement;
        const modalEstoqueExibicao = document.getElementById("modalEstoqueExibicao") as HTMLSpanElement;
        const modalEstoqueMinimoExibicao = document.getElementById("modalEstoqueMinimoExibicao") as HTMLSpanElement;
        const modalLocalizacaoExibicao = document.getElementById("modalLocalizacaoExibicao") as HTMLSpanElement;
        modalCodigo.textContent = item.codigo;
        modalTitulo.textContent = item.titulo;
        modalFabricante.textContent = item.fabricante;
        modalDescricao.textContent = item.descricao;
        modalPrecoVendaExibicao.textContent = ( Number(item.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) );
        modalEstoqueExibicao.textContent = item.estoque;
        modalEstoqueMinimoExibicao.textContent = item.estoqueMinimo;
        modalLocalizacaoExibicao.textContent = item.localizacao;    
        const botaoEditar = document.getElementById("modalEditarItem") as HTMLButtonElement;
        const botaoConfirmar = document.getElementById("modalConfirmarEdicao") as HTMLButtonElement;
        const botaoCancelar = document.getElementById("modalCancelarEdicao") as HTMLButtonElement;
        const botaoFechar = document.getElementById("modalFecharGerenciar") as HTMLButtonElement;
        const camposEditaveis = document.getElementById("camposEditaveis") as HTMLDivElement;
        const camposEditaveisExibicao = document.getElementById("camposEditaveisExibicao") as HTMLDivElement;
        const inputPrecoVenda = document.getElementById("modalPrecoVenda") as HTMLInputElement;
        const inputEstoque = document.getElementById("modalEstoque") as HTMLInputElement;
        const inputEstoqueMinimo = document.getElementById("modalEstoqueMinimo") as HTMLInputElement;
        const inputLocalizacao = document.getElementById("modalLocalizacao") as HTMLInputElement;
        inputPrecoVenda.value = item.precoVenda;
        inputEstoque.value = item.estoque;
        inputEstoqueMinimo.value = item.estoqueMinimo;
        inputLocalizacao.value = item.localizacao;
        camposEditaveis.style.display = 'none';
        botaoEditar.style.display = 'inline';
        botaoConfirmar.style.display = 'none';
        botaoCancelar.style.display = 'none';
        if (!this.permissao) {
            botaoEditar.style.display = 'none';
        } 
        botaoEditar.onclick = () => {
            camposEditaveis.style.display = 'block';
            camposEditaveisExibicao.style.display = 'none';
            botaoEditar.style.display = 'none';
            botaoConfirmar.style.display = 'inline';
            botaoCancelar.style.display = 'inline';
        };
        botaoConfirmar.onclick = () => {
            const precoVenda = inputPrecoVenda.value;
            const estoque = inputEstoque.value;
            const estoqueMinimo = inputEstoqueMinimo.value;
            const localizacao = inputLocalizacao.value;
            if ( precoVenda == item.precoVenda && estoque == item.estoque && estoqueMinimo == item.estoqueMinimo && localizacao == item.localizacao ) {
                this.exibirMensagem( ["Nenhum campo foi editado."] );
                return;
            }
            this.controladora.atualizarItem(item.id, precoVenda, estoque, estoqueMinimo, localizacao);
            camposEditaveisExibicao.style.display = 'inline';
            dialog.close();
        };
        botaoCancelar.onclick = () => {
            camposEditaveis.style.display = 'none';
            camposEditaveisExibicao.style.display = 'inline';
            botaoEditar.style.display = 'inline';
            botaoConfirmar.style.display = 'none';
            botaoCancelar.style.display = 'none';
            modalCodigo.textContent = item.codigo;
            inputPrecoVenda.value = item.precoVenda;
            inputEstoque.value = item.estoque;
            inputEstoqueMinimo.value = item.estoqueMinimo;
            inputLocalizacao.value = item.localizacao;
        };
        botaoFechar.onclick = () => {
            dialog.close();
        };
        dialog.showModal();
    }

    private iniciarRemocao(): void {
        const botoes = document.querySelectorAll<HTMLButtonElement>(".botaoRemover");
        for (const botao of botoes) {
            if (!this.permissao) {
                botao.style.display = 'none';
            } 
            botao.addEventListener( "click", () => {
                const idItem = botao.dataset.id!;
                this.confirmarRemocao("Confirma a remoção deste item?", idItem);
            } );
        }
    }

    private confirmarRemocao(mensagem: string, idItem: string): void {
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

}