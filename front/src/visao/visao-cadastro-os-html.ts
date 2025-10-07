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

    exibirMensagemComAcao( mensagens: string[], id: string ): void {
        this.exibirMensagem(mensagens);
        const botaoOk = document.getElementById("modalMensagemOk") as HTMLButtonElement;
        botaoOk.addEventListener( "click", () => this.redirecionarParaOsCriada(id) );
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

    limparFormulario(): void {
        const form = document.querySelector("form") as HTMLFormElement;
        form.reset();
    }

    limparDivCliente(): void {
        const divDetalhesCliente = document.getElementById("detalhesCliente") as HTMLDivElement;
        divDetalhesCliente.innerHTML = '';
    }

    iniciarBuscaItem(): void {
        const pesquisa = document.getElementById("pesquisaItem") as HTMLInputElement;
        const quantidade = document.getElementById("quantidadeItem") as HTMLInputElement;
        const botaoAdicionar = document.getElementById("botaoBuscaItem") as HTMLButtonElement;
        botaoAdicionar.addEventListener( "click", () => {
            this.controladora.buscarItem(pesquisa.value, quantidade.value);
            pesquisa.value = '';
            quantidade.value = '';
        } );
    }

    adicionarItemTabela(item: any, quantidade: number, subtotal: number): void {
        const tbody = document.getElementById("corpoTabelaItens") as HTMLTableSectionElement;
        const linha = document.createElement("tr");
        const dadosItem = [
            item.codigo, item.titulo, item.fabricante, `R$ ${item.precoVenda.toFixed(2)}`,
            quantidade.toString(), `R$ ${subtotal.toFixed(2)}`
        ];
        for (const dado of dadosItem) {
            const td = document.createElement("td");
            td.textContent = dado;
            linha.appendChild(td);
        }
        const acao = document.createElement("td");
        const botaoRemover = document.createElement("button");
        botaoRemover.textContent = "REMOVER";
        botaoRemover.addEventListener( "click", () => {
            this.controladora.removerItem(item.id);
            linha.remove();
        } );
        acao.appendChild(botaoRemover);
        linha.appendChild(acao);
        linha.dataset.id = item.id;
        tbody.appendChild(linha);
    }

    iniciarCustos(): void {
        const tipos = [
            { label: "Serviço", value: "SERVICO" },
            { label: "Extra", value: "EXTRA" }
        ];
        const selectCustos = document.getElementById("tipoCusto") as HTMLSelectElement;
        selectCustos.innerHTML = '';
        for (const tipo of tipos) {
            const option = document.createElement('option');
            option.value = tipo.value;
            option.textContent = tipo.label;
            selectCustos.appendChild(option);
        } ;
        const botaoAdicionar = document.getElementById("botaoAdicionarCusto") as HTMLButtonElement;
        botaoAdicionar.addEventListener( 'click', () => {
            const tipo = document.getElementById("tipoCusto") as HTMLSelectElement ;
            const descricao = document.getElementById("descricaoCusto") as HTMLInputElement;
            const valor = document.getElementById("valorCusto") as HTMLInputElement;
            const quantidade = document.getElementById("quantidadeCusto") as HTMLInputElement;
            this.controladora.adicionarCusto(tipo.value, descricao.value, valor.value, quantidade.value);
            descricao.value = '';
            valor.value = '';
            quantidade.value = '';
        } );
    }

    adicionarCustoTabela(custo: any): void {
        const tbody = document.getElementById("corpoTabelaCustos") as HTMLTableSectionElement;
        const linha = document.createElement("tr");
        let tipoFormat;
        if (custo.tipo == "SERVICO") {
            tipoFormat = "Serviço";
        }
        if (custo.tipo == "EXTRA"){
            tipoFormat = "Extra";
        }
        const dadosCusto = [
            tipoFormat, custo.descricao, `R$ ${custo.valor.toFixed(2)}`,
            custo.quantidade.toString(), `R$ ${custo.subtotal.toFixed(2)}`
        ];
        for (const dado of dadosCusto) {
            const td = document.createElement("td");
            td.textContent = dado;
            linha.appendChild(td);
        }
        const acao = document.createElement("td");
        const botaoRemover = document.createElement("button");
        botaoRemover.textContent = "REMOVER";
        botaoRemover.addEventListener( "click", () => {
            this.controladora.removerCusto(custo.id);
            linha.remove();
        } );
        acao.appendChild(botaoRemover);
        linha.appendChild(acao);
        linha.dataset.id = custo.id;
        tbody.appendChild(linha);
    }

    obterVeiculoSelecionadoId(): string | null {
        const select = document.getElementById("veiculos") as HTMLSelectElement;
        return select.value || null;
    }

    obterResponsavelSelecionadoId(): string | null {
        const select = document.getElementById("responsaveis") as HTMLSelectElement;
        return select.value || null;
    }

    obterObservacoes(): string {
        const textarea = document.getElementById("observacoes") as HTMLTextAreaElement;
        return textarea.value.trim();
    }

    obterPrevisaoEntrega(): string | null {
        const input = document.getElementById("previsaoEntrega") as HTMLInputElement;
        return input.value || null;
    }

    limparTabelaItens(): void {
        const tbody = document.getElementById("corpoTabelaItens") as HTMLTableSectionElement;
        tbody.innerHTML = '';
    }

    limparTabelaCustos(): void {
        const tbody = document.getElementById("corpoTabelaCustos") as HTMLTableSectionElement;
        tbody.innerHTML = '';
    }

    atualizarValorTotal(total: any): void {
        const divValorTotal = document.getElementById("valorTotal") as HTMLDivElement;
        divValorTotal.style.display = 'block';
        const formatado = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        divValorTotal.textContent = `Total: ${formatado}`;
    }

    limparValorTotal(): void {
        const divValorTotal = document.getElementById("valorTotal") as HTMLDivElement;
        divValorTotal.style.display = 'none';
    }

    iniciarFormulario(): void {
        const form = document.querySelector("form") as HTMLFormElement;
        form.addEventListener( "submit", (event) => {
            event.preventDefault();
            this.controladora.enviarOs();
        } );
    }

    redirecionarParaOsCriada(id: string): void {
        window.location.href = `./exibicao-os.html?id=${id}`;
    }

}