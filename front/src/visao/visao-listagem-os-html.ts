import type { VisaoListagemOs } from './visao-listagem-os.ts';
import { ControladoraListagemOs } from '../controladora/controladora-listagem-os.ts';


export class VisaoListagemOsHTML implements VisaoListagemOs {

    private controladora: ControladoraListagemOs;
    private permissao = false;
    private listaOs: any[] = [];
    private filtroAtual: string = 'ativas';
    
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

    exibirListaOs(dados: any[]): void {
        this.listaOs = dados;
        this.iniciarFiltragem();
        this.renderizarLista();
    }

    private iniciarFiltragem(): void {
        this.filtroAtual = (document.querySelector('.filtro-radio:checked') as HTMLInputElement)!.value;
        const inputBusca = document.getElementById('buscaOs') as HTMLInputElement;
        inputBusca.addEventListener( 'input', () => {
            this.renderizarLista();
        } );
        const radios = document.querySelectorAll('.filtro-radio') as NodeListOf<HTMLInputElement>;
        for (const radio of radios) {
            radio.addEventListener( 'change', () => {
                if (radio.checked) {
                    for (const rad of radios) {
                        if (rad !== radio) {
                            rad.checked = false;
                        }
                    }
                    const selecionado = radio.value;
                    this.filtroAtual = selecionado;
                    this.renderizarLista();
                }
            } );
        }
    }

    private renderizarLista(): void {
        this.limparAreas();
        const termo = ( (document.getElementById('buscaOs') as HTMLInputElement).value.trim().toLowerCase() );
        const statusSelecionado = this.obterStatusSelecionado();
        const osFiltradas = this.filtrarOs(termo, statusSelecionado);
        const osAgrupadas = this.agruparPorStatus(osFiltradas, statusSelecionado);
        this.renderizarOsAgrupadas(osAgrupadas);
        this.controlarExibicaoAreas(statusSelecionado);
    }

    private limparAreas(): void {
        const areas = ['PROVISORIA', 'ANDAMENTO', 'ALERTA', 'CONCLUIDA', 'FINALIZADA', 'CANCELADA'];
        for (const status of areas) {
            const area = document.getElementById(`area-${status}`) as HTMLDivElement;
            if (area) {
                area.innerHTML = '';
            }
        }
    }

    private obterStatusSelecionado(): string[] {
        if (this.filtroAtual === 'canceladas') {
            return ['CANCELADA'];
        } else if (this.filtroAtual === 'finalizadas') {
            return ['FINALIZADA'];
        } else {
            return ['PROVISORIA', 'ANDAMENTO', 'ALERTA', 'CONCLUIDA'];
        }
    }

    private filtrarOs(termo: string, statusSelecionado: string[]): any[] {
        return this.listaOs.filter( (os) => {
            if (!os) {
                return false;
            }
            if (!statusSelecionado.includes(os.status)) {
                return false;
            }
            if (!termo) {
                return true;
            }
            const idCorresponde = ( String(os.id).toLowerCase().includes(termo) );
            const clienteCorresponde = ( String(os.cliente.nome).toLowerCase().includes(termo) );
            const funcionarioCorresponde = ( String(os.usuarioResponsavel.nome).toLowerCase().includes(termo) );
            const modeloCorresponde = ( String(os.veiculo.modelo).toLowerCase().includes(termo) );
            return ( idCorresponde || clienteCorresponde || funcionarioCorresponde || modeloCorresponde );
        } );
    }

    private agruparPorStatus(osFiltradas: any[], statusSelecionado: string[]): any {
        const osAgrupadas = [] as any;
        for (const status of statusSelecionado) {
            const osDesteStatus = [];
            for (const os of osFiltradas) {
                if (os.status === status) {
                    osDesteStatus.push(os);
                }
            }
            osAgrupadas[status] = osDesteStatus;
        }
        return osAgrupadas;
    }

    private renderizarOsAgrupadas(osAgrupadas: any): void {
        for (const status in osAgrupadas) {
            const lista = osAgrupadas[status];
            const area = document.getElementById(`area-${status}`) as HTMLDivElement;
            if (!area) {
                continue;
            }
            for (const os of lista) {
                const cartao = this.criarCartaoOs(os, status);
                area.appendChild(cartao);
            }
        }
    }

    private criarCartaoOs(os: any, status: string): HTMLDivElement {
        const cartao = document.createElement('div');
        cartao.className = `os-cartao status-${status.toLowerCase()}`;
        cartao.dataset.osId = ( String(os.id) );
        const dataCriacao = this.formatarData(os.dataHoraCriacao);
        const previsao = this.formatarData(os.previsaoEntrega);
        const fabricante = os.veiculo.fabricante;
        const modelo = os.veiculo.modelo;
        const ano = os.veiculo.ano;
        const clienteNome = os.cliente.nome;
        cartao.innerHTML = `
            <div class="linha"><strong>OS #${os.id}</strong></div>
            <div class="linha"><span>${clienteNome}</span><span>Criação: ${dataCriacao}</span></div>
            <div class="linha"><span>${fabricante} ${modelo} ${ano}</span><span>Entrega: ${previsao}</span></div>
        `;
        cartao.addEventListener( 'click', () => {
            const id = cartao.dataset.osId!;
            window.location.href = `./exibicao-os.html?id=${id}`;
        } );
        return cartao;
    }

    private formatarData(data: string): string {
        const dataObj = new Date(data);
        return dataObj.toLocaleString( 'pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        } );
    }

    private controlarExibicaoAreas(statusVisiveis: string[]): void {
        const areas = [
            { elemento: document.getElementById('area-PROVISORIA'), status: 'PROVISORIA' },
            { elemento: document.getElementById('area-ANDAMENTO'), status: 'ANDAMENTO' },
            { elemento: document.getElementById('area-ALERTA'), status: 'ALERTA' },
            { elemento: document.getElementById('area-CONCLUIDA'), status: 'CONCLUIDA' },
            { elemento: document.getElementById('area-FINALIZADA'), status: 'FINALIZADA' },
            { elemento: document.getElementById('area-CANCELADA'), status: 'CANCELADA' }
        ];  
        for (const { elemento, status } of areas) {
            if (elemento && statusVisiveis.includes(status)) {
                elemento.parentElement!.style.display = 'block';
            } else if (elemento) {
                elemento.parentElement!.style.display = 'none';
            }
        }
    }

}