import type { VisaoExibicaoOs } from './visao-exibicao-os.ts';
import { ControladoraExibicaoOs } from '../controladora/controladora-exibicao-os.ts';


export class VisaoExibicaoOsHTML implements VisaoExibicaoOs {

    private controladora: ControladoraExibicaoOs;
    private permissaoHeader = false;
    private modalProdutoAberto = false;
    private eventosObservacoesConfigurados = false;
    private botoesAcaoConfigurados = false;
    private servicosEventosConfigurados = false;
    private extrasModalConfigurado = false;
    private pagamentoModalConfigurado = false;
    private maoObraModalConfigurado = false;
    private dataEntregaModalConfigurado = false;
    private observacoesModalConfigurado = false;
    private valoresSugeridosModalConfigurado = false;
    private laudoModalConfigurado = false;
    private dadosOs: any = null;
    private servicosAdicionados: string[] = [];
    private produtoAtual: any = null;
    private intervaloPrazoId: number | null = null;

    constructor() {
        this.controladora = new ControladoraExibicaoOs(this);
    }
    
    iniciar(): void {
        const params = new URLSearchParams(window.location.search);
        const idOs = params.get("id");
        if (idOs) {
            this.controladora.iniciarSessao(idOs);
        } else {
            this.exibirMensagem( ['ID da OS não encontrado.'] );
            this.retornarNavegacao();
        }
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
        this.permissaoHeader = (dados.cargo === 'ATENDENTE' || dados.cargo === 'GERENTE'); 
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
        botaoOk.addEventListener( "click", () => dialog.close(), { once: true } );
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
        if (!this.permissaoHeader) {
            for (const link of linksCadastroCVO) {
                link.removeAttribute('href');
                link.style.opacity = '0.5';
                link.style.cursor = 'default';
                link.title = 'Acesso não permitido';
            }
        }
    }

    exibirOs(dados: any): void {
        this.dadosOs = dados;
        this.exibirIdOs(dados.id);
        this.exibirStatus(dados.status);
        this.exibirDataHoraCriacao(dados.dataHoraCriacao);
        if (dados.dataHoraFinalizacao && (dados.status === 'CANCELADA' || dados.status === 'FINALIZADA')) {
            this.atualizarDataHoraFinalizacao(dados.dataHoraFinalizacao);
        } else {
            this.atualizarDataHoraFinalizacao(null);
        }
        this.exibirDadosCliente(dados.cliente);
        this.exibirDadosVeiculo(dados.veiculo);
        this.exibirDadosUsuarioCriacao(dados.usuarioCriacao);
        this.exibirDadosUsuarioResponsavel(dados.usuarioResponsavel);
        this.exibirServicos(dados.servicos);
        this.exibirExtras(dados.custos);
        this.atualizarPrevisaoEntrega(dados.previsaoEntrega);
        this.exibirObservacoes(dados.observacoes);
        this.configurarBotoesAcao(dados.status);
        this.iniciarEventos();
        this.controladora.calcularValores(dados);
        this.controladora.avaliarPrazoENotificar(dados);
    }

    private exibirIdOs(id: string): void {
        document.getElementById('idOs')!.textContent = id;
    }

    private exibirStatus(status: string): void {
        const elemento = document.getElementById('statusOs') as HTMLSpanElement;
        if (status === 'PROVISORIA') {
            elemento.textContent = 'PROVISÓRIA';
        } else if (status === 'CONCLUIDA') {
            elemento.textContent = 'CONCLUÍDA';
        } else {
            elemento.textContent = status;
        }
        elemento.className = `status-${status.toLowerCase()}`;
    }

    private exibirDataHoraCriacao(data: string): void {
        const elemento = document.getElementById('dataHoraCriacao') as HTMLSpanElement;
        const dataObj = new Date(data);
        elemento.textContent = dataObj.toLocaleString( 'pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        } );
    }

    private exibirDadosCliente(cliente: any): void {
        const elemento = document.getElementById('dadosCliente') as HTMLDivElement;
        elemento.innerHTML = `
            <h3>${cliente.nome}</h3>
            <p><strong>CPF:</strong> ${cliente.cpf}</p>
            <p><strong>Telefone:</strong> ${cliente.telefone}</p>
            <p><strong>Email:</strong> ${cliente.email}</p>
        `;
    }

    private exibirDadosVeiculo(veiculo: any): void {
        const elemento = document.getElementById('dadosVeiculo') as HTMLDivElement;
        elemento.innerHTML = `
            <h3>${veiculo.fabricante} ${veiculo.modelo} ${veiculo.ano}</h3>
            <p><strong>Quilometragem:</strong> ${( Number(veiculo.quilometragem).toLocaleString('pt-BR') )} km</p>
            <p><strong>Placa:</strong> ${veiculo.placa}</p>
            <p><strong>Chassi:</strong> ${veiculo.chassi}</p>
        `;
    }

    private exibirDadosUsuarioCriacao(usuario: any): void {
        const elemento = document.getElementById('dadosUsuarioCriacao') as HTMLDivElement;
        elemento.innerHTML = `
            <h3>Usuário de criação</h3>
            <p>${usuario.nome}</p>
        `;
    }

    private exibirDadosUsuarioResponsavel(usuario: any): void {
        const elemento = document.getElementById('dadosUsuarioResponsavel') as HTMLDivElement;
        elemento.innerHTML = `
            <h3>Mecânico responsável</h3>
            <p>${usuario.nome}</p>
        `;
    }

    private exibirServicos(servicos: any[]): void {
        const campo = document.getElementById('campoServicos') as HTMLDivElement;
        campo.innerHTML = '';
        this.servicosAdicionados = [];
        for (const servico of servicos) {
            this.servicosAdicionados.push(servico.id);
            const servicoDiv = document.createElement('div');
            servicoDiv.className = 'servico-item';
            servicoDiv.dataset.servicoId = servico.id;
            servicoDiv.innerHTML = `
                <div class="servico-cabecalho">
                    <h4>${servico.descricao}</h4>
                    <div class="acoes-servico" style="display: none;">
                        <button type="button" class="botao-adicionar-tarefa" data-servico-id="${servico.id}">+ Tarefa</button>
                        <button type="button" class="botao-remover-servico" data-servico-id="${servico.id}">Remover</button>
                    </div>
                </div>
                <div class="servico-info">
                    <span>Mão de obra: ${( Number(servico.valorMaoObra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</span>
                    <span>Duração: ${servico.execucaoMinutos} min</span>
                </div>
                <div class="tarefas-lista">
                    <h5>Tarefas:</h5>
                    <div class="tarefas-campo" data-servico-id="${servico.id}"></div>
                </div>
            `;
            campo.appendChild(servicoDiv);
            this.exibirTarefasServico(servico);
        }
    }

    private exibirTarefasServico(servico: any): void {
        const campo = document.querySelector(`.tarefas-campo[data-servico-id="${servico.id}"]`) as HTMLDivElement;
        campo.innerHTML = '';
        for (const tarefa of servico.tarefas) {
            const tarefaDiv = document.createElement('div');
            tarefaDiv.className = 'tarefa-item';
            tarefaDiv.dataset.tarefaId = tarefa.id;
            tarefaDiv.dataset.servicoId = servico.id;
            tarefaDiv.innerHTML = `
                <span class="tarefa-descricao">${tarefa.descricao}</span>
                <div class="acoes-mover" style="display: none;">
                    <button type="button" class="botao-mover-cima" title="Mover para cima">▲</button>
                    <button type="button" class="botao-mover-baixo" title="Mover para baixo">▼</button>
                </div>
                <div class="acoes-tarefa" style="display: none;">
                    <button type="button" class="botao-adicionar-produto" data-servico-id="${servico.id}" data-tarefa-id="${tarefa.id}">+ Produto</button>
                    <button type="button" class="botao-remover-tarefa" data-servico-id="${servico.id}" data-tarefa-id="${tarefa.id}">Remover</button>
                </div>
                <div class="produtos-tarefa"></div>
            `;
            campo.appendChild(tarefaDiv);
            this.exibirProdutosTarefa(servico.id, tarefa);
            const botaoCima = tarefaDiv.querySelector('.botao-mover-cima')! as HTMLButtonElement;
            const botaoBaixo = tarefaDiv.querySelector('.botao-mover-baixo')! as HTMLButtonElement;
            const statusAtual = this.dadosOs.status;
            const usuario = this.controladora.obterDadosUsuario();
            let edicaoPermitidaParaMover = false;
            if (statusAtual === 'ANDAMENTO' || statusAtual === 'ALERTA') {
                if (usuario && (usuario.cargo === 'GERENTE' || usuario.cargo === 'MECANICO')) {
                    edicaoPermitidaParaMover = true;
                }
            } else if (statusAtual === 'PROVISORIA') {
                if (usuario && (usuario.cargo === 'ATENDENTE' || usuario.cargo === 'GERENTE')) {
                    edicaoPermitidaParaMover = true;
                }
            }
            const acoesMover = tarefaDiv.querySelector('.acoes-mover')! as HTMLElement;
            if (!edicaoPermitidaParaMover) {
                acoesMover.style.display = 'none';
            } else {
                acoesMover.style.display = 'block';
                botaoCima.addEventListener( 'click', () => {
                    const atual = tarefaDiv as HTMLElement;
                    let anterior = atual.previousElementSibling as HTMLElement | null;
                    while (anterior && !anterior.dataset.tarefaId) {
                        anterior = anterior.previousElementSibling as HTMLElement | null;
                    }
                    if (!anterior) {
                        return;
                    }
                    const servicoId = servico.id;
                    const origemTarefaId = tarefa.id;
                    const destinoTarefaId = anterior.dataset.tarefaId || '';
                    this.controladora.reordenarTarefa(servicoId, origemTarefaId, destinoTarefaId);
                } );   
                botaoBaixo.addEventListener( 'click', () => {
                    const atual = tarefaDiv as HTMLElement;
                    let proximo = atual.nextElementSibling as HTMLElement | null;
                    while (proximo && !proximo.dataset.tarefaId) {
                        proximo = proximo.nextElementSibling as HTMLElement | null;
                    }
                    let destino = null;
                    if (proximo) {
                        destino = proximo.nextElementSibling as HTMLElement | null;
                    }
                    while (destino && !destino.dataset.tarefaId) {
                        destino = destino.nextElementSibling as HTMLElement | null;
                    }
                    const servicoId = servico.id;
                    const origemTarefaId = tarefa.id;
                    let destinoTarefaId = '';
                    if (destino) {
                        destinoTarefaId = destino.dataset.tarefaId!;
                    }
                    this.controladora.reordenarTarefa(servicoId, origemTarefaId, destinoTarefaId);
                } );
            }
        }
    }

    private adicionarTarefaManual(servicoId: string): void {
        const campo = document.querySelector(`.tarefas-campo[data-servico-id="${servicoId}"]`) as HTMLDivElement | null;
        if (!campo) {
            return;
        }
        const div = document.createElement('div');
        div.className = 'adicionar-tarefa-inline';
        div.innerHTML = `
            <input type="text" class="input-nova-tarefa" placeholder="Descrição da nova tarefa" />
            <button type="button" class="botao-confirmar-nova-tarefa botao-principal">Adicionar</button>
            <button type="button" class="botao-cancelar-nova-tarefa botao-secundario">Cancelar</button>
        `;
        const input = div.querySelector('.input-nova-tarefa')! as HTMLInputElement;
        const confirmar = div.querySelector('.botao-confirmar-nova-tarefa')! as HTMLButtonElement;
        const cancelar = div.querySelector('.botao-cancelar-nova-tarefa')! as HTMLButtonElement;
        confirmar.addEventListener( 'click', () => {
            const descricao = input.value.trim();
            if (!descricao) {
                this.exibirMensagem( ['Informe a descrição da tarefa.'] );
                return;
            }
            this.controladora.adicionarTarefaManual(servicoId, descricao);
            if (div.parentNode) {
                div.parentNode.removeChild(div);
            }
        } );
        cancelar.addEventListener( 'click', () => {
            if (div.parentNode) {
                div.parentNode.removeChild(div);
            }
        } );
        campo.appendChild(div);
        input.focus();
    }

    private exibirProdutosTarefa(servicoId: string, tarefa: any): void {
        const produtosDiv = document.querySelector(`[data-servico-id="${servicoId}"][data-tarefa-id="${tarefa.id}"] .produtos-tarefa`)! as HTMLDivElement;
        produtosDiv.innerHTML = '';
        if (tarefa.produtos && tarefa.produtos.length > 0) {
            for (const produto of tarefa.produtos) {
                const produtoDiv = document.createElement('div');
                produtoDiv.className = 'produto-item';
                produtoDiv.innerHTML = `
                    <div class="produto-info">
                        <strong>${produto.titulo}</strong>
                        <span>Quantidade: ${produto.quantidade}</span>
                        <span>Preço: ${( Number(produto.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</span>
                        <span>Subtotal: ${( Number(produto.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</span>
                    </div>
                    <div class="acoes-produto" style="display: none;">
                        <button type="button" class="botao-remover-produto" 
                            data-produto-id="${produto.id}" 
                            data-servico-id="${servicoId}" 
                            data-tarefa-id="${tarefa.id}">
                            Remover
                        </button>
                    </div>
                `;
                produtosDiv.appendChild(produtoDiv);
            }
        }
    }

    private exibirExtras(custos: any[]): void {
        const extras = (custos || []).filter( (custo) => custo.tipo === 'EXTRA' );
        const campo = document.getElementById('listaExtras') as HTMLDivElement;
        campo.innerHTML = '';
        if (!extras || extras.length === 0) {
            campo.innerHTML = `<p>Nenhum custo extra registrado.</p>`;
            return;
        }
        for (const extra of extras) {
            const extraDiv = document.createElement('div');
            extraDiv.className = 'extra-item';
            extraDiv.dataset.extraId = extra.id;
            extraDiv.innerHTML = `
                <div>
                    <strong>${extra.descricao}</strong>
                    <div>Quantidade: ${extra.quantidade}</div>
                </div>
                <div>
                    <span>Subtotal: ${( Number(extra.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</span>
                    <div class="acoes-extra" style="display: none;">
                        <button type="button" class="botao-remover-extra" data-extra-id="${extra.id}">Remover</button>
                    </div>
                </div>
            `;
            campo.appendChild(extraDiv);
            const botaoRemover = extraDiv.querySelector('.botao-remover-extra')! as HTMLButtonElement;
            botaoRemover.addEventListener( 'click', () => {
                const extraId = botaoRemover.dataset.extraId!;
                this.controladora.removerExtra(extraId);
            } );
        }
    }

    atualizarValoresApresentacao(totais: any): void {
        this.atualizarValorMaoObra();
        this.atualizarValorProdutos(totais.totalProdutos);
        this.atualizarValorExtras(totais.totalExtras);
        this.atualizarValorTotal();
    }

    private atualizarValorMaoObra(): void {
        const elemento = document.getElementById('valorMaoObra') as HTMLSpanElement;
        const textoBase = ( Number(this.dadosOs.valorMaoObra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) );
        if (this.dadosOs.valorMaoObra !== this.dadosOs.valorMaoObraSugerido) {
            elemento.textContent = `${textoBase} (alterado)`;
        } else {
            elemento.textContent = textoBase;
        }
    }

    private atualizarValorProdutos(valor: number): void {
        const elemento = document.getElementById('valorProdutos') as HTMLSpanElement;
        elemento.textContent = ( Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) );
    }

    private atualizarValorExtras(valor: number): void {
        const elemento = document.getElementById('valorExtras') as HTMLSpanElement;
        elemento.textContent = ( Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) );
    }

    private atualizarValorTotal(): void {
        const elemento = document.getElementById('valorTotal') as HTMLSpanElement;
        elemento.textContent = ( Number(this.dadosOs.valorEstimado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) );
    }

    private atualizarPrevisaoEntrega(data: string): void {
        const elemento = document.getElementById('dataPrevisaoEntrega') as HTMLSpanElement;
        const dataObjeto = new Date(data);
        elemento.textContent = dataObjeto.toLocaleString( 'pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        } );
        elemento.dataset.iso = data;
        const atual = ( new Date(data) );
        const sugerida = ( new Date(this.dadosOs.previsaoEntregaSugerida) );
        atual.setSeconds(0, 0);
        sugerida.setSeconds(0, 0);
        if (atual.getTime() !== sugerida.getTime()) {
            elemento.textContent = ( elemento.textContent + ' (alterada)' );
        }
    }

    private exibirObservacoes(observacoes: string): void {
        const campo = document.getElementById('campoObservacoes')! as HTMLDivElement;
        if (observacoes) {
            campo.innerHTML = `
                <p>${observacoes}</p>
                <button type="button" id="botaoEditarObservacoes" style="display: none;" class="botao-secundario">Editar</button>
            `;
        } else {
            campo.innerHTML = `
                <p>Nenhuma observação registrada.</p>
                <button type="button" id="botaoAdicionarObservacoes" style="display: none;" class="botao-secundario">Adicionar</button>
            `;
        }
    }

    private atualizarDataHoraFinalizacao(data: string | null): void {
        const elemento = document.getElementById('dataHoraFinalizacao')! as HTMLSpanElement;
        const label = document.getElementById('labelDataHoraFinalizacao')! as HTMLLabelElement;
        const statusAtual = this.dadosOs.status;
        if (!data) {
            elemento.textContent = '';
            label.style.display = 'none';
            return;
        }
        if (statusAtual === 'CANCELADA') {
            label.textContent = 'Cancelada em:';
        } else {
            label.textContent = 'Finalizada em:';
        }
        label.style.display = 'inline';
        const dataObjeto = ( new Date(data) );
        elemento.textContent = dataObjeto.toLocaleString( 'pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        } );
    }

    mostrarAlertaPrazo(): void {
        const alertasDiv = document.getElementById('alertas') as HTMLDivElement;
        alertasDiv.innerHTML = `
            <div class="alerta atencao">
                ATENÇÃO: O PRAZO ESTIMADO PARA ENTREGA DO VEÍCULO FOI EXCEDIDO
            </div>
        `;
    }

    ocultarAlertaPrazo(): void {
        const alertasDiv = document.getElementById('alertas') as HTMLDivElement;
        alertasDiv.innerHTML = '';
    }

    private exibirDadosPagamento(): void {
        if (this.dadosOs.pagamento) {
            const container = document.getElementById('pagamento') as HTMLElement;
            container.style.display = 'block';
            const dadosDiv = document.getElementById('dadosPagamento') as HTMLDivElement;
            dadosDiv.innerHTML = `
                <p><strong>Data/Hora:</strong> ${( new Date(this.dadosOs.pagamento.dataHora).toLocaleString('pt-BR') )}</p>
                <p><strong>Valor:</strong> ${( Number(this.dadosOs.pagamento.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</p>
                <p><strong>Método:</strong> ${this.dadosOs.pagamento.metodo}</p>
                <p><strong>Responsável:</strong> ${this.dadosOs.pagamento.usuarioResponsavel.nome}</p>
            `;
        }
    }

    private iniciarEventos(): void {
        this.iniciarBotoesAcao();
        this.iniciarModais();
        this.iniciarEventosEdicao();
        if (this.intervaloPrazoId === null) {
            this.intervaloPrazoId = window.setInterval( () => {
                this.controladora.avaliarPrazoENotificar(this.dadosOs);
            }, 30000);
        }
    }

    private iniciarBotoesAcao(): void {
        if (this.botoesAcaoConfigurados){ 
            return;
        }
        this.botoesAcaoConfigurados = true;
        const botaoValores = document.getElementById('botaoValoresSugeridos')! as HTMLButtonElement;
        const botaoEfetivar = document.getElementById('botaoEfetivar')! as HTMLButtonElement;
        const botaoCancelar = document.getElementById('botaoCancelar')! as HTMLButtonElement;
        const botaoAlerta = document.getElementById('botaoAlerta')! as HTMLButtonElement;
        const botaoConcluir = document.getElementById('botaoConcluir')! as HTMLButtonElement;
        const botaoVerLaudo = document.getElementById('botaoVerLaudo')! as HTMLButtonElement;
        const botaoPagamento = document.getElementById('botaoPagamento')! as HTMLButtonElement;
        const botaoRemoverAlerta = document.getElementById('botaoRemoverAlerta')! as HTMLButtonElement;
        botaoValores.addEventListener( 'click', () => { this.exibirValoresSugeridos() } );
        botaoEfetivar.addEventListener( 'click', () => { this.controladora.efetivarOs() } );
        botaoCancelar.addEventListener( 'click', () => { 
            this.abrirModalCancelarOs() 
        } );
        botaoAlerta.addEventListener( 'click', () => { this.controladora.colocarOsEmAlerta() } );
        botaoConcluir.addEventListener( 'click', () => { this.abrirModalLaudo() } );
        botaoVerLaudo.addEventListener( 'click', () => { this.controladora.exibirLaudo() } );
        botaoPagamento.addEventListener( 'click', () => { 
            this.abrirModalPagamento();
         } );
        botaoRemoverAlerta.addEventListener( 'click', () => { this.controladora.removerAlertaOs() } );
    }

    private configurarBotoesAcao(status: string): void {
        this.ocultarTodosBotoes();
        document.getElementById('botaoValoresSugeridos')!.style.display = 'block';
        switch (status) {
            case 'PROVISORIA':
                this.configurarBotoesProvisoria();
                break;
            case 'ANDAMENTO':
                this.configurarBotoesAndamento();
                break;
            case 'ALERTA':
                this.configurarBotoesAlerta();
                break;
            case 'CONCLUIDA':
                this.configurarBotoesConcluida();
                break;
            case 'FINALIZADA':
                this.configurarBotoesFinalizada();
                break;
            case 'CANCELADA':
                this.configurarBotoesCancelada();
                break;
        }
    }

    private ocultarTodosBotoes(): void {
        const botoes = [
            'botaoEfetivar', 
            'botaoCancelar', 
            'botaoAlerta', 
            'botaoConcluir', 
            'botaoRemoverAlerta', 
            'botaoVerLaudo', 
            'botaoPagamento'
        ];
        for (const id of botoes) {
            document.getElementById(id)!.style.display = 'none';
        }
    }

    private configurarBotoesProvisoria(): void {
        const usuario = this.controladora.obterDadosUsuario();
        if (usuario.cargo === 'ATENDENTE' || usuario.cargo === 'GERENTE') {
            document.getElementById('botaoEfetivar')!.style.display = 'block';
            document.getElementById('botaoCancelar')!.style.display = 'block';
            document.getElementById('botaoEditarMaoObra')!.style.display = 'block';
            document.getElementById('botaoEditarPrevisao')!.style.display = 'block';
            this.ativarModoEdicao();
        }
    }

    private configurarBotoesAndamento(): void {
        const usuario = this.controladora.obterDadosUsuario();
        if (usuario.cargo === 'GERENTE' || usuario.cargo === 'MECANICO') {
            document.getElementById('botaoAlerta')!.style.display = 'block';
            document.getElementById('botaoConcluir')!.style.display = 'block';
            this.ativarModoEdicao();
        }
        if (usuario.cargo === 'GERENTE') {
            document.getElementById('botaoEditarMaoObra')!.style.display = 'block';
            document.getElementById('botaoEditarPrevisao')!.style.display = 'block';
            document.getElementById('botaoCancelar')!.style.display = 'block';
        }
    }

    private configurarBotoesAlerta(): void {
        const usuario = this.controladora.obterDadosUsuario();
        if (usuario.cargo === 'GERENTE' || usuario.cargo === 'MECANICO') {
            this.ativarModoEdicao();
        }
        if (usuario.cargo === 'GERENTE') {
            document.getElementById('botaoEditarMaoObra')!.style.display = 'block';
            document.getElementById('botaoEditarPrevisao')!.style.display = 'block';
            document.getElementById('botaoRemoverAlerta')!.style.display = 'block';
        }
    }

    private configurarBotoesConcluida(): void {
        const usuario = this.controladora.obterDadosUsuario();
        document.getElementById('botaoVerLaudo')!.style.display = 'block';
        if (usuario.cargo === 'ATENDENTE' || usuario.cargo === 'GERENTE') {
            document.getElementById('botaoPagamento')!.style.display = 'block';
        } else {
            document.getElementById('botaoPagamento')!.style.display = 'none';
        }
        this.desativarModoEdicao();
    }

    private configurarBotoesFinalizada(): void {
        this.exibirDadosPagamento();
        this.desativarModoEdicao();
    }

    private configurarBotoesCancelada(): void {
        this.desativarModoEdicao();
    }

    private ativarModoEdicao(): void {
        document.getElementById('acoesServicos')!.style.display = 'block';
        document.getElementById('acoesExtras')!.style.display = 'block';
        const botaoObservacoes = ( document.getElementById('botaoEditarObservacoes') || document.getElementById('botaoAdicionarObservacoes') )!;
        botaoObservacoes.style.display = 'block';
        for ( const elemento of (document.querySelectorAll('.acoes-servico')) ) {
            (elemento as HTMLElement).style.display = 'block';
        }
        for ( const elemento of (document.querySelectorAll('.acoes-mover')) ) {
            (elemento as HTMLElement).style.display = 'block';
        }
        for ( const elemento of (document.querySelectorAll('.acoes-tarefa')) ) {
            (elemento as HTMLElement).style.display = 'block';
        }
        for ( const elemento of (document.querySelectorAll('.acoes-produto')) ) {
            (elemento as HTMLElement).style.display = 'block';
        }
        for ( const elemento of (document.querySelectorAll('.acoes-extra')) ) {
            (elemento as HTMLElement).style.display = 'block';
        }
    }

    private desativarModoEdicao(): void {
        const acoesServicos = document.getElementById('acoesServicos')! as HTMLDivElement;
        const acoesExtras = document.getElementById('acoesExtras')! as HTMLDivElement;
        const botaoEditarMao = document.getElementById('botaoEditarMaoObra')! as HTMLButtonElement;
        const botaoEditarPrevisao = document.getElementById('botaoEditarPrevisao')! as HTMLButtonElement;
        acoesServicos.style.display = 'none';
        acoesExtras.style.display = 'none';
        botaoEditarMao.style.display = 'none';
        botaoEditarPrevisao.style.display = 'none';
        for ( const elemento of (document.querySelectorAll('.acoes-servico')) ) {
            (elemento as HTMLElement).style.display = 'none';
        }
        for ( const elemento of (document.querySelectorAll('.acoes-tarefa')) ) {
            (elemento as HTMLElement).style.display = 'none';
        }
        for ( const elemento of (document.querySelectorAll('.acoes-produto')) ) {
            (elemento as HTMLElement).style.display = 'none';
        }
        for ( const elemento of (document.querySelectorAll('.acoes-extra')) ) {
            (elemento as HTMLElement).style.display = 'none';
        }
        for ( const elemento of (document.querySelectorAll('.acoes-mover')) ) {
            (elemento as HTMLElement).style.display = 'none';
        }
    }

    private iniciarEventosEdicao(): void {
        if (this.eventosObservacoesConfigurados) {
            return;
        }
        this.eventosObservacoesConfigurados = true;
        document.addEventListener( 'click', (evento) => {
            const target = evento.target as HTMLElement;
            if (target.id === 'botaoEditarObservacoes' || target.id === 'botaoAdicionarObservacoes') {
                evento.stopPropagation();
                this.editarObservacoes();
            }
            if (target.classList.contains('botao-adicionar-produto')) {
                evento.stopPropagation();
                const servicoId = target.dataset.servicoId!;
                const tarefaId = target.dataset.tarefaId!;
                this.abrirModalProduto(servicoId, tarefaId);
            }
            if (target.classList.contains('botao-remover-produto')) {
                evento.stopPropagation();
                const produtoId = target.dataset.produtoId!;
                const servicoId = target.dataset.servicoId!;
                const tarefaId = target.dataset.tarefaId!;
                this.controladora.removerProduto(produtoId, servicoId, tarefaId);
            }
        } );
    }

    private iniciarModais(): void {
        this.iniciarModalServicos();
        this.iniciarModalExtras();
        this.iniciarModalValoresSugeridos();
        this.iniciarModalMaoObra();
        this.iniciarModalDataEntrega();
        this.iniciarModalLaudo();
        this.iniciarModalPagamento();
        this.iniciarModalObservacoes();
        this.iniciarModalProduto();
        this.iniciarModalCancelarOs();
    }

    private iniciarModalServicos(): void {
        if (this.servicosEventosConfigurados) {
            return;
        }
        this.servicosEventosConfigurados = true;
        const botaoAdicionarServico = document.getElementById('botaoAdicionarServico')! as HTMLButtonElement;
        const modalServicoCancelar = document.getElementById('modalServicoCancelar')! as HTMLButtonElement;
        botaoAdicionarServico.addEventListener( 'click', () => { this.abrirModalAdicionarServico() } );
        modalServicoCancelar.addEventListener( 'click', () => { ( document.getElementById('modalAdicionarServico') as HTMLDialogElement ).close() } );
        const inputBusca = document.getElementById('buscaServicoModal')! as HTMLInputElement;
        inputBusca.addEventListener( 'input', () => {
            const termo = ( inputBusca.value.trim() );
            if (termo.length >= 2) {
                this.controladora.buscarServicos(termo);
            }
        } );
        document.addEventListener( 'click', (evento) => {
            const target = evento.target as HTMLElement;
            if (target.classList.contains('botao-remover-servico')) {
                const servicoId = target.dataset.servicoId!;
                this.controladora.removerServico(servicoId);
            }
            if (target.classList.contains('botao-adicionar-tarefa')) {
                const servicoId = target.dataset.servicoId!;
                this.adicionarTarefaManual(servicoId);
            }
            if (target.classList.contains('botao-remover-tarefa')) {
                const servicoId = target.dataset.servicoId!;
                const tarefaId = target.dataset.tarefaId!;
                this.controladora.removerTarefa(servicoId, tarefaId);
            }
        } );
    }

    private abrirModalAdicionarServico(): void {
        const modal = document.getElementById('modalAdicionarServico')! as HTMLDialogElement;
        const inputBusca = document.getElementById('buscaServicoModal')! as HTMLInputElement;
        inputBusca.value = '';
        document.getElementById('listaServicosModal')!.innerHTML = '';
        modal.showModal();
    }

    exibirServicosModal(servicos: any[]): void {
        const lista = document.getElementById('listaServicosModal') as HTMLDivElement;
        lista.innerHTML = '';
        for (const servico of servicos) {
            if (!this.servicosAdicionados.includes(servico.id)) {
                const div = document.createElement('div');
                div.className = 'servico-modal-item';
                div.innerHTML = `
                    <strong>${servico.descricao}</strong>
                    <p>Mão de obra: ${( Number(servico.valorMaoObra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</p>
                    <p>Duração: ${servico.execucaoMinutos} min</p>
                `;
                div.addEventListener( 'click', () => {
                    this.controladora.adicionarServico(servico);
                    ( document.getElementById('modalAdicionarServico') as HTMLDialogElement ).close();
                } );
                lista.appendChild(div);
            }
        }
    }

    private iniciarModalProduto(): void {
        if (this.modalProdutoAberto) {
            return;
        }
        this.modalProdutoAberto = true;
        const modal = document.getElementById('modalAdicionarProduto')! as HTMLDialogElement;
        const botaoBuscar = document.getElementById('botaoBuscarProduto')! as HTMLButtonElement;
        const botaoCancelar = document.getElementById('modalProdutoCancelar')! as HTMLButtonElement;
        const botaoConfirmar = document.getElementById('modalProdutoConfirmar')! as HTMLButtonElement;
        botaoConfirmar.disabled = true;
        botaoCancelar.addEventListener( 'click', () => {
            modal.close();
        } );
        botaoConfirmar.addEventListener( 'click', () => {
            const quantidade = (document.getElementById('quantidadeProduto') as HTMLInputElement).value;
            this.controladora.confirmarProduto(modal, quantidade);
            this.produtoAtual = null;
            modal.close();
        } );
        botaoBuscar.addEventListener( 'click', () => {
            const codigoProduto = ( (document.getElementById('codigoProduto') as HTMLInputElement).value.trim() );
            this.controladora.buscarProduto(codigoProduto);
        } );
        modal.addEventListener( 'close', () => {
            this.produtoAtual = null;
            const detalhes = document.getElementById('detalhesProduto') as HTMLDivElement;
            if (detalhes) {
                detalhes.innerHTML = '';
            }
            botaoConfirmar.disabled = true;
        } );
    }

    abrirModalProduto(servicoId: string, tarefaId: string): void {
        const modal = document.getElementById('modalAdicionarProduto') as HTMLDialogElement;
        modal.showModal();
        ( document.getElementById('codigoProduto') as HTMLInputElement ).value = '';
        ( document.getElementById('quantidadeProduto') as HTMLInputElement ).value = '1';
        document.getElementById('detalhesProduto')!.innerHTML = '';
        const botaoConfirmar = document.getElementById('modalProdutoConfirmar')! as HTMLButtonElement;
        botaoConfirmar.disabled = true;
        modal.dataset.servicoIdDoProduto = servicoId;
        modal.dataset.tarefaIdDoProduto = tarefaId;
    }

    exibirProdutoEncontradoModal(produto: any): void {
        this.produtoAtual = produto;
        const detalhes = document.getElementById('detalhesProduto') as HTMLDivElement;
        detalhes.innerHTML = `
            <strong>${produto.titulo}</strong>
            <div>Fabricante: ${produto.fabricante}</div>
            <div>Descrição: ${produto.descricao}</div>
            <div>Preço: ${( Number(produto.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</div>
            <div>Estoque: ${produto.estoque}</div>
        `;
        const botaoConfirmar = document.getElementById('modalProdutoConfirmar')! as HTMLButtonElement;
        botaoConfirmar.disabled = false;
    }

    obterProdutoAtual(): any {
        return this.produtoAtual;
    }

    private iniciarModalExtras(): void {
        if (this.extrasModalConfigurado) {
            return;
        }
        this.extrasModalConfigurado = true;
        const modal = document.getElementById('modalAdicionarExtra') as HTMLDialogElement;
        const botaoAdicionarExtra = document.getElementById('botaoAdicionarExtra')! as HTMLButtonElement;
        const modalExtraConfirmar = document.getElementById('modalExtraConfirmar')! as HTMLButtonElement;
        const modalExtraCancelar = document.getElementById('modalExtraCancelar')! as HTMLButtonElement;
        botaoAdicionarExtra.addEventListener( 'click', () => {
            this.abrirModalAdicionarExtra();
        } );
        modalExtraCancelar.addEventListener( 'click', () => {
            modal.close();
        } );      
        modalExtraConfirmar.addEventListener( 'click', () => {
            const descricao = ( document.getElementById('descricaoExtra') as HTMLInputElement ).value;
            const valor = ( document.getElementById('valorExtra') as HTMLInputElement ).value;
            const quantidade = ( document.getElementById('quantidadeExtra') as HTMLInputElement) .value;
            if (!descricao || !valor || !quantidade) {
                this.exibirMensagem( ['Preencha todos os campos do custo extra.'] );
                return;
            }
            this.controladora.adicionarExtra( descricao, parseFloat(valor), parseInt(quantidade) );
            modal.close();
        } );
    }

    private abrirModalAdicionarExtra(): void {
        const modal = document.getElementById('modalAdicionarExtra') as HTMLDialogElement;
        ( document.getElementById('descricaoExtra') as HTMLInputElement ).value = '';
        ( document.getElementById('valorExtra') as HTMLInputElement ).value = '';
        ( document.getElementById('quantidadeExtra') as HTMLInputElement ).value = '1';
        modal.showModal();
    }

    private iniciarModalMaoObra(): void {
        if (this.maoObraModalConfigurado) {
            return;
        }
        this.maoObraModalConfigurado = true;
        const botaoEditarMaoObra = document.getElementById('botaoEditarMaoObra')! as HTMLButtonElement;
        const modalMaoObraCancelar = document.getElementById('modalMaoObraCancelar')! as HTMLButtonElement;
        const modalMaoObraConfirmar = document.getElementById('modalMaoObraConfirmar')! as HTMLButtonElement;
        botaoEditarMaoObra.addEventListener( 'click', () => {
            const modal = document.getElementById('modalEdicaoMaoObra') as HTMLDialogElement;
            const valorAtual = parseFloat(document.getElementById('valorMaoObra')!.textContent!.replace('R$', '').replace('.', '').replace(',', '.').trim());
            ( document.getElementById('novoValorMaoObra') as HTMLInputElement ).value = ( valorAtual.toFixed(2) );
            modal.showModal();
        } );
        modalMaoObraCancelar.addEventListener( 'click', () => {
            ( document.getElementById('modalEdicaoMaoObra') as HTMLDialogElement ).close();
        } );
        modalMaoObraConfirmar.addEventListener( 'click', () => {
            const novoValor = ( document.getElementById('novoValorMaoObra') as HTMLInputElement ).value;
            this.controladora.atualizarMaoObra( parseFloat(novoValor) );
            ( document.getElementById('modalEdicaoMaoObra') as HTMLDialogElement ).close();
        } );
    }

    private iniciarModalDataEntrega(): void {
        if (this.dataEntregaModalConfigurado) {
            return;
        }
        this.dataEntregaModalConfigurado = true;
        const botaoEditarPrevisao = document.getElementById('botaoEditarPrevisao')! as HTMLButtonElement;
        const modalPrevisaoCancelar = document.getElementById('modalDataCancelar')! as HTMLButtonElement;
        const modalPrevisaoConfirmar = document.getElementById('modalDataConfirmar')! as HTMLButtonElement;
        botaoEditarPrevisao.addEventListener( 'click', () => {
            const modal = document.getElementById('modalEdicaoDataEntrega') as HTMLDialogElement;
            const dataAtual = document.getElementById('dataPrevisaoEntrega')!.dataset.iso;
            const dataBrasil = new Date(new Date(dataAtual!).getTime() - 10800000);
            ( document.getElementById('novaDataEntrega') as HTMLInputElement ).value = dataBrasil.toISOString().slice(0, 16);
            modal.showModal();
        } );
        modalPrevisaoCancelar.addEventListener( 'click', () => {
            ( document.getElementById('modalEdicaoDataEntrega') as HTMLDialogElement ).close();
        } );
        modalPrevisaoConfirmar.addEventListener( 'click', () => {
            const novaData = (document.getElementById('novaDataEntrega') as HTMLInputElement).value;
            this.controladora.atualizarDataEntrega(novaData);
            ( document.getElementById('modalEdicaoDataEntrega') as HTMLDialogElement ).close();
        } );
    }

    private iniciarModalObservacoes(): void {
        if (this.observacoesModalConfigurado) {
            return;
        }
        this.observacoesModalConfigurado = true;
        const modalCancelar = document.getElementById('modalObservacoesCancelar')! as HTMLButtonElement;
        const modalConfirmar = document.getElementById('modalObservacoesConfirmar')! as HTMLButtonElement;
        modalCancelar.addEventListener( 'click', () => {
            ( document.getElementById('modalEdicaoObservacoes') as HTMLDialogElement ).close();
        } );
        modalConfirmar.addEventListener( 'click', () => {
            const nova = ( document.getElementById('novaObservacoes') as HTMLTextAreaElement ).value;
            this.controladora.atualizarObservacoes(nova);
            ( document.getElementById('modalEdicaoObservacoes') as HTMLDialogElement ).close();
        } );
    }

    private editarObservacoes(): void {
        const observacoesAtuais = this.dadosOs.observacoes || '';
        const modal = document.getElementById('modalEdicaoObservacoes')! as HTMLDialogElement;
        (document.getElementById('novaObservacoes') as HTMLTextAreaElement).value = observacoesAtuais;
        modal.showModal();
    }

    private iniciarModalValoresSugeridos(): void {
        if (this.valoresSugeridosModalConfigurado) {
            return;
        }
        this.valoresSugeridosModalConfigurado = true;
        const botaoFechar = document.getElementById('modalValoresSugeridosFechar')! as HTMLButtonElement;
        botaoFechar.addEventListener( 'click', () => {
            ( document.getElementById('modalValoresSugeridos') as HTMLDialogElement ).close();
        } );
    }

    private iniciarModalLaudo(): void {
        if (this.laudoModalConfigurado) {
            return;
        }
        this.laudoModalConfigurado = true;
        const modalEdicaoLaudo = document.getElementById('modalEdicaoLaudo')! as HTMLDialogElement;
        const modalVisualizacaoLaudo = document.getElementById('modalVisualizarLaudo')! as HTMLDialogElement;
        const botaoCancelarEdicaoLaudo = document.getElementById('modalEdicaoLaudoCancelar')! as HTMLButtonElement;
        const botaoConfirmarEdicaoLaudo = document.getElementById('modalEdicaoLaudoConfirmar')! as HTMLButtonElement;
        const botaoFecharVisualizacaoLaudo = document.getElementById('modalVisualizarLaudoFechar')! as HTMLButtonElement;
        if (botaoCancelarEdicaoLaudo) {
            botaoCancelarEdicaoLaudo.addEventListener( 'click', () => {
                modalEdicaoLaudo.close();
            } );
        }
        if (botaoConfirmarEdicaoLaudo) {
            botaoConfirmarEdicaoLaudo.addEventListener( 'click', () => {
                const resumo = ( document.getElementById('resumoLaudo') as HTMLTextAreaElement ).value;
                const recomendacoes = ( document.getElementById('recomendacoesLaudo') as HTMLTextAreaElement ).value;
                this.controladora.concluirOsComLaudo(resumo, recomendacoes);
                modalEdicaoLaudo.close();
            } );
        }
        botaoFecharVisualizacaoLaudo.addEventListener( 'click', () => {
            modalVisualizacaoLaudo.close();
        } );
    }

    private abrirModalLaudo(): void {
        const modal = document.getElementById('modalEdicaoLaudo')! as HTMLDialogElement;
        ( document.getElementById('resumoLaudo') as HTMLTextAreaElement ).value = '';
        ( document.getElementById('recomendacoesLaudo') as HTMLTextAreaElement ).value = '';
        modal.showModal();
    }

    exibirLaudo(laudo: any): void {
        const modal = document.getElementById('modalVisualizarLaudo')! as HTMLDialogElement;
        const conteudo = document.getElementById('conteudoLaudo')! as HTMLDivElement;
        conteudo.innerHTML = `
            <div><strong>Resumo:</strong></div>
            <p>${laudo.resumo}</p>
            <div><strong>Recomendações:</strong></div>
            <p>${laudo.recomendacoes}</p>
        `;
        modal.showModal();
    }

    private iniciarModalPagamento(): void {
        if (this.pagamentoModalConfigurado) {
            return;
        }
        this.pagamentoModalConfigurado = true;
        const modal = document.getElementById('modalPagamento') as HTMLDialogElement;
        const spanValorSugerido = document.getElementById('pagamentoValorSugerido') as HTMLSpanElement;
        const selectMetodo = document.getElementById('pagamentoMetodo') as HTMLSelectElement;
        const selectDesconto = document.getElementById('pagamentoDesconto') as HTMLSelectElement;
        const spanValorFinal = document.getElementById('pagamentoValorFinal') as HTMLSpanElement;
        const botaoCancelar = document.getElementById('modalPagamentoCancelar') as HTMLButtonElement;
        const botaoConfirmar = document.getElementById('modalPagamentoConfirmar') as HTMLButtonElement;
        botaoCancelar.addEventListener( 'click', () => { 
            modal.close(); 
        } );
        const atualizarValores = () => {
            const valorTotal = ( Number(this.dadosOs.valorEstimado) );
            spanValorSugerido.textContent = ( valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) );
            const desconto = ( Number(selectDesconto.value) );
            let valor = valorTotal;
            if (desconto > 0) {
                valor = ( Number((valorTotal * (1 - (desconto / 100))).toFixed(2)) );
            }
            spanValorFinal.textContent = ( valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) );
        };
        selectMetodo.addEventListener( 'change', () => {
            const usuario = this.controladora.obterDadosUsuario();
            const metodo = selectMetodo.value;
            if (usuario.cargo === 'ATENDENTE') {
                if (metodo === 'PIX' || metodo === 'DINHEIRO') {
                    for (const option of selectDesconto.options) {
                        if (option.value === '0' || option.value === '5') {
                            option.hidden = false;
                        }
                    }
                    selectDesconto.value = '0';
                } else {
                    for (const option of selectDesconto.options) {
                        if(option.value !== '0') {
                            option.hidden = true;
                        }
                    }
                    selectDesconto.value = '0';
                }
            } else {
                for (const option of selectDesconto.options) {
                    option.hidden = false;
                }
            }
            atualizarValores();
        } );
        selectDesconto.addEventListener( 'change', () => { 
            atualizarValores(); 
        } );
        botaoConfirmar.addEventListener( 'click', () => {
            const metodo = selectMetodo.value;
            const desconto = ( Number(selectDesconto.value) );
            this.controladora.cadastrarPagamento(metodo, desconto);
            modal.close();
        } );
    }

    private abrirModalPagamento(): void {
        const modal = document.getElementById('modalPagamento') as HTMLDialogElement;
        const spanValorSugerido = document.getElementById('pagamentoValorSugerido') as HTMLSpanElement;
        const selectMetodo = document.getElementById('pagamentoMetodo') as HTMLSelectElement;
        const selectDesconto = document.getElementById('pagamentoDesconto') as HTMLSelectElement;
        const spanValorFinal = document.getElementById('pagamentoValorFinal') as HTMLSpanElement;
        selectMetodo.value = 'DEBITO';
        selectDesconto.value = '0';
        const usuario = this.controladora.obterDadosUsuario();
        if (usuario && usuario.cargo === 'ATENDENTE') {
            for (const option of selectDesconto.options) {
                if (option.value !== '0') {
                    option.hidden = true;
                }
            }
            selectDesconto.value = '0';
        } else {
            for (const option of selectDesconto.options) {
                option.hidden = false;
            }
        }
        spanValorSugerido.textContent = ( Number(this.dadosOs.valorEstimado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) );
        spanValorFinal.textContent = ( Number(this.dadosOs.valorEstimado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) );
        modal.showModal();
    }

    exibirValoresSugeridos(): void {
        const modal = document.getElementById('modalValoresSugeridos')! as HTMLDialogElement;
        document.getElementById('modalPrevisaoSugerida')!.textContent = ( new Date(this.dadosOs.previsaoEntregaSugerida).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) );
        document.getElementById('modalMaoObraSugerida')!.textContent = ( Number(this.dadosOs.valorMaoObraSugerido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) );
        modal.showModal();
    }

    obterDadosOs(): any {
        return this.dadosOs;
    }

    private abrirModalCancelarOs(): void {
        const modal = document.getElementById('modalCancelarOs') as HTMLDialogElement;
        modal.showModal();
    }

    private iniciarModalCancelarOs(): void {
        const modal = document.getElementById('modalCancelarOs') as HTMLDialogElement;
        const botaoConfirmar = document.getElementById('modalCancelarOsConfirmar') as HTMLButtonElement;
        const botaoCancelar = document.getElementById('modalCancelarOsCancelar') as HTMLButtonElement;
        botaoConfirmar.addEventListener( 'click', () => {
            this.controladora.cancelarOs();
            modal.close();
        } );
        botaoCancelar.addEventListener( 'click', () => {
            modal.close();
        } );
    }

}