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
        const dataHoraCriacao = document.getElementById("dataHoraCriacaoOs") as HTMLSpanElement;
        const nomeCliente = document.getElementById("nomeCliente") as HTMLSpanElement;
        const fabricanteVeiculo = document.getElementById("fabricanteVeiculo") as HTMLSpanElement;
        const modeloVeiculo = document.getElementById("modeloVeiculo") as HTMLSpanElement;
        const anoVeiculo = document.getElementById("anoVeiculo") as HTMLSpanElement;
        const placaVeiculo = document.getElementById("placaVeiculo") as HTMLSpanElement;
        const nomeResponsavel = document.getElementById("nomeResponsavel") as HTMLSpanElement;
        const statusOs = document.getElementById("statusOs") as HTMLInputElement;
        const previsaoEntrega = document.getElementById("previsaoEntrega") as HTMLInputElement;
        const observacoes = document.getElementById("observacoes") as HTMLTextAreaElement;
        const valorTotal = document.getElementById("valorTotalOs") as HTMLSpanElement;
        idOs.textContent = dados.id;
        dataHoraCriacao.textContent = ( new Date(dados.dataHoraCriacao).toLocaleString('pt-BR') );
        nomeCliente.textContent = dados.cliente.nome;
        fabricanteVeiculo.textContent = dados.veiculo.fabricante;
        modeloVeiculo.textContent = dados.veiculo.modelo;
        anoVeiculo.textContent = dados.veiculo.ano;
        placaVeiculo.textContent = dados.veiculo.placa;
        nomeResponsavel.textContent = dados.usuarioResponsavel.nome;
        statusOs.innerHTML = `<option value="${dados.status}">${dados.status}</option>`;
        previsaoEntrega.value = new Date(Date.parse(dados.previsaoEntrega) - 10800000).toISOString().slice(0,16);
        if (dados.itens && dados.itens.length > 0) {
            this.preencherTabelaItens(dados.itens);
        }
        if (dados.custos && dados.custos.length > 0) {
            this.preencherTabelaCustos(dados.custos);
        }
        if (dados.observacoes) {
            observacoes.value = dados.observacoes;
        }
        if (dados.valorFinal) {
            valorTotal.textContent = ( Number(dados.valorFinal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) );
        } else if (dados.valorEstimado) {
            valorTotal.textContent = ( Number(dados.valorEstimado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) );
        }
        if (dados.laudo) {
            this.exibirLaudo(dados.laudo);
        }
        if (dados.pagamento) {
            this.exibirPagamento(dados.pagamento);
        }
    }

    private preencherTabelaItens(itens: any[]): void {
        const corpoTabelaItens = document.getElementById("corpoTabelaItens") as HTMLTableSectionElement;
        corpoTabelaItens.innerHTML = '';
        for (const item of itens) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.codigo}</td>
                <td>${item.titulo}</td>
                <td>${item.fabricante}</td>
                <td>${ Number(item.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }</td>
                <td>${item.quantidade}</td>
                <td>${ Number(item.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }</td>
            `;
            corpoTabelaItens.appendChild(tr);
        }
    }

    private preencherTabelaCustos(custos: any[]): void {
        const corpoTabelaCustos = document.getElementById("corpoTabelaCustos") as HTMLTableSectionElement;
        corpoTabelaCustos.innerHTML = '';
        for (const custo of custos) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${custo.tipo}</td>
                <td>${custo.descricao}</td>
                <td>${ Number(custo.subtotal / custo.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }</td>
                <td>${custo.quantidade}</td>
                <td>${ Number(custo.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }</td>
            `;
            corpoTabelaCustos.appendChild(tr);
        }
    }

    private exibirLaudo(laudo: any): void {
        const informacoesOsNaoEditaveis = document.getElementById("informacoesOsNaoEditaveis") as HTMLDivElement;
        const laudoDiv = document.createElement('div');
        laudoDiv.innerHTML = `
            <h3>Laudo Técnico</h3>
            <p>Resumo: ${laudo.resumo}</p>
            <p>Recomendações: ${laudo.recomendacoes}</p>
        `;
        informacoesOsNaoEditaveis.appendChild(laudoDiv);
    }

    private exibirPagamento(pagamento: any): void {
        const informacoesOsProcessadas = document.getElementById("informacoesOsProcessadas") as HTMLDivElement;
        const pagamentoDiv = document.createElement('div');
        pagamentoDiv.innerHTML = `
            <h3>Pagamento</h3>
            <p>Data: ${new Date(pagamento.data_hora).toLocaleString('pt-BR')}</p>
            <p>Valor: ${Number(pagamento.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p> 
            <p>Método: ${pagamento.metodo}</p> 
            <p>Responsável: ${pagamento.usuario_responsavel}</p>
        `;
        informacoesOsProcessadas.appendChild(pagamentoDiv);
    }
    
}