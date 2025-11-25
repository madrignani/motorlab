import type { VisaoCadastroOs } from './visao-cadastro-os.ts';
import { ControladoraCadastroOs } from '../controladora/controladora-cadastro-os.ts';


export class VisaoCadastroOsHTML implements VisaoCadastroOs {

    private controladora: ControladoraCadastroOs;
    private permissao = false;
    private servicosAdicionados: string[] = [];
    private produtoAtual: any = null;
    private dataEditadaManual = false;
    private intervaloAtualizacao: number | null = null;

    constructor() {
        this.controladora = new ControladoraCadastroOs(this);
    }
    
    iniciar(): void {
        this.controladora.iniciarSessao();
        this.iniciarLogout();
        this.iniciarAtualizacaoData();
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
        botaoOk.addEventListener( "click", () => 
            dialog.close(), { 
                once: true 
            } 
        );
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

    buscarCliente(): void {
        const inputBuscaCliente = document.getElementById("buscaCliente") as HTMLInputElement;
        const botaoBuscaCliente = document.getElementById("botaoBuscaCliente") as HTMLButtonElement;
        botaoBuscaCliente.addEventListener( "click", () => {
            const busca = inputBuscaCliente.value.trim();
            this.controladora.carregarCliente(busca);
        } );
    }

    exibirCliente(cliente: any): void {
        const divVeiculo = document.getElementById("divVeiculo") as HTMLDivElement;
        divVeiculo.style.visibility = "visible";
        const divDetalhesCliente = document.getElementById("detalhesCliente") as HTMLDivElement;
        divDetalhesCliente.innerHTML = `
            <p>${cliente.nome}</p>
            <p>CPF: ${cliente.cpf}</p>
            <p>Telefone: ${cliente.telefone}</p>
            <p>Email: ${cliente.email}</p>
        `;
    }

    limparDivCliente(): void {
        const divDetalhesCliente = document.getElementById("detalhesCliente") as HTMLDivElement;
        divDetalhesCliente.innerHTML = '';
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

    listarResponsaveis(responsaveis: any[], mostrarIndisponiveis: boolean): void {
        const select = document.getElementById('responsaveis') as HTMLSelectElement;
        select.innerHTML = '<option value="">Selecione</option>';
        const checkbox = document.getElementById('mostrarIndisponiveis') as HTMLInputElement;
        checkbox.addEventListener( 'change', () => {
            this.controladora.carregarResponsaveis(checkbox.checked);
        } );
        for (const responsavel of responsaveis) {
            if (responsavel.disponivel || mostrarIndisponiveis) {
                const option = document.createElement('option');
                option.value = responsavel.id;
                if (!responsavel.disponivel) {
                    option.textContent = `${responsavel.nome} (INDISPONÍVEL)`;
                } else {
                    option.textContent = responsavel.nome;
                }
                option.disabled = ( !responsavel.disponivel && !mostrarIndisponiveis );
                select.appendChild(option);
            }
        }
    }

    iniciarBuscaServicos(): void {
        const inputBusca = document.getElementById('buscaServico') as HTMLInputElement;
        const listaTarefas = document.getElementById('listaTarefasServico') as HTMLDivElement;
        inputBusca.addEventListener( 'input', () => {
            const termo = inputBusca.value.trim();
            if (termo.length >= 2) {
                this.controladora.buscarServicos(termo);
            } else {
                listaTarefas.innerHTML = '';
                listaTarefas.style.display = 'none';
            }
        } );
        document.addEventListener( 'click', () => {
                listaTarefas.innerHTML = '';
                listaTarefas.style.display = 'none';
        } );
    }

    adicionarServicoNaLista(servico: any): void {
        this.servicosAdicionados.push(servico.id);
        const listaServicos = document.getElementById('listaServicos') as HTMLDivElement;
        const servicoDiv = document.createElement('div');
        servicoDiv.className = 'servico-item';
        servicoDiv.dataset.servicoId = servico.id;
        servicoDiv.innerHTML = `
            <div class="servico-cabecalho">
                <h4>${servico.descricao}</h4>
                <div>
                    <button type="button" class="botao-adicionar-tarefa-local" data-servico-id="${servico.id}">+ Tarefa</button>
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
        listaServicos.appendChild(servicoDiv);
        const tarefasCampo = servicoDiv.querySelector('.tarefas-campo') as HTMLDivElement;
        for (const tarefa of servico.tarefas) {
            this.adicionarTarefaElemento(tarefasCampo, servico.id, tarefa);
        }
        servicoDiv.querySelector('.botao-remover-servico')!.addEventListener( 'click', () => {
            this.controladora.removerServico(servico.id);
        } );
        const botaoAdicionarTarefaLocal = servicoDiv.querySelector('.botao-adicionar-tarefa-local') as HTMLButtonElement;
        botaoAdicionarTarefaLocal.addEventListener( 'click', () => {
            const inputCampo = document.createElement('div');
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Descrição da nova tarefa';
            const confirmar = document.createElement('button');
            confirmar.type = 'button';
            confirmar.textContent = 'Adicionar';
            confirmar.className = 'botao-secundario';
            const cancelar = document.createElement('button');
            cancelar.type = 'button';
            cancelar.textContent = 'Cancelar';
            cancelar.className = 'botao-secundario';
            inputCampo.appendChild(input);
            inputCampo.appendChild(confirmar);
            inputCampo.appendChild(cancelar);
            const tarefasLista = servicoDiv.querySelector('.tarefas-lista') as HTMLDivElement;
            servicoDiv.insertBefore(inputCampo, tarefasLista);
            input.focus();
            confirmar.addEventListener( 'click', () => {
                const descricao = input.value.trim();
                if (descricao) {
                    this.controladora.adicionarTarefaManual(servico.id, descricao);
                    inputCampo.remove();
                }
            } );
            cancelar.addEventListener('click', () => {
                inputCampo.remove();
            } );
        } );
        this.controladora.atualizarCalculos();
    }

    removerServicoNaLista(servicoId: string): void {
        this.servicosAdicionados = this.servicosAdicionados.filter( (id) => id !== servicoId );
        const servicoDiv = document.querySelector(`[data-servico-id="${servicoId}"]`) as HTMLDivElement;
        if (servicoDiv) {
            servicoDiv.remove();
        }
        this.controladora.atualizarCalculos();
    }

    private adicionarTarefaElemento(campo: HTMLDivElement, servicoId: string, tarefa: any): void {
        const tarefaDiv = document.createElement('div');
        tarefaDiv.className = 'tarefa-item';
        tarefaDiv.dataset.tarefaId = tarefa.id;
        tarefaDiv.dataset.servicoId = servicoId;
        tarefaDiv.innerHTML = `
            <span class="tarefa-descricao">${tarefa.descricao}</span>
            <div class="acoes-mover">
                <button type="button" class="botao-mover-cima" title="Mover para cima">▲</button>
                <button type="button" class="botao-mover-baixo" title="Mover para baixo">▼</button>
            </div>
            <div>
                <button type="button" class="botao-adicionar-produto" 
                    data-servico-id="${servicoId}" data-tarefa-id="${tarefa.id}">+ Produto
                </button>
                <button type="button" class="botao-remover-tarefa" 
                    data-servico-id="${servicoId}" data-tarefa-id="${tarefa.id}">Remover
                </button>
            </div>
        `;
        campo.appendChild(tarefaDiv);
        const botaoCima = tarefaDiv.querySelector('.botao-mover-cima')! as HTMLButtonElement;
        const botaoBaixo = tarefaDiv.querySelector('.botao-mover-baixo')! as HTMLButtonElement;
        botaoCima.addEventListener( 'click', () => {
            const atual = tarefaDiv as HTMLElement;
            let anterior = atual.previousElementSibling as HTMLElement | null;
            while (anterior && !anterior.dataset.tarefaId) {
                anterior = anterior.previousElementSibling as HTMLElement | null;
            }
            if (!anterior) {
                return;
            }
            const origemServicoId = servicoId;
            const origemTarefaId = tarefa.id;
            const destinoServicoId = servicoId;
            const destinoTarefaId = anterior.dataset.tarefaId!;
            this.controladora.reordenarTarefa(origemServicoId, origemTarefaId, destinoServicoId, destinoTarefaId);
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
            const origemServicoId = servicoId;
            const origemTarefaId = tarefa.id;
            const destinoServicoId = servicoId;
            let destinoTarefaId = '';
            if (destino) {
                destinoTarefaId = destino.dataset.tarefaId!;
            }
            this.controladora.reordenarTarefa(origemServicoId, origemTarefaId, destinoServicoId, destinoTarefaId);
        } );
        const botaoProduto = tarefaDiv.querySelector('.botao-adicionar-produto') as HTMLButtonElement;
        const botaoRemover = tarefaDiv.querySelector('.botao-remover-tarefa') as HTMLButtonElement;
        botaoProduto.addEventListener( 'click', () => {
            this.abrirModalProduto(servicoId, tarefa.id);
        } );
        botaoRemover.addEventListener( 'click', () => {
            this.controladora.removerTarefa(servicoId, tarefa.id);
        } );
    }

    adicionarTarefaManual(servicoId: string, tarefa?: any): void {
        if (tarefa) {
            const campo = document.querySelector(`.tarefas-campo[data-servico-id="${servicoId}"]`) as HTMLDivElement;
            this.adicionarTarefaElemento(campo, servicoId, tarefa);
            return;
        }
    }

    removerTarefaNaLista(servicoId: string, tarefaId: string): void {
        const tarefaDiv = document.querySelector(`[data-servico-id="${servicoId}"] [data-tarefa-id="${tarefaId}"]`) as HTMLDivElement;
        tarefaDiv.remove();
    }

    atualizarTarefasServico(servico: any): void {
        const campo = document.querySelector(`.tarefas-campo[data-servico-id="${servico.id}"]`) as HTMLDivElement;
        campo.innerHTML = '';
        for (const tarefa of servico.tarefas) {
            this.adicionarTarefaElemento(campo, servico.id, tarefa);
            const tarefaDiv = campo.querySelector(`[data-tarefa-id="${tarefa.id}"]`) as HTMLDivElement;
            if (tarefa.produtos && tarefa.produtos.length > 0) {
                let listaProdutos = tarefaDiv.querySelector('.lista-produtos-tarefa') as HTMLDivElement;
                if (!listaProdutos) {
                    listaProdutos = document.createElement('div');
                    listaProdutos.className = 'lista-produtos-tarefa';
                    tarefaDiv.appendChild(listaProdutos);
                }
                listaProdutos.innerHTML = '';
                for (const produto of tarefa.produtos) {
                    const produtoDiv = document.createElement('div');
                    produtoDiv.className = 'produto-item';
                    produtoDiv.dataset.produtoId = produto.id;
                    produtoDiv.dataset.servicoId = servico.id;
                    produtoDiv.dataset.tarefaId = tarefa.id;
                    const subtotal = ( produto.precoVenda * produto.quantidade );
                    produtoDiv.innerHTML = `
                        <div class="produto-info">
                            <strong>${produto.titulo}</strong>
                            <span>Quantidade: ${produto.quantidade}</span>
                            <span>Preço Unitário: ${( Number(produto.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</span>
                            <span>Subtotal: ${( Number(subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</span>
                        </div>
                        <button type="button" class="botao-remover-produto" 
                            data-produto-id="${produto.id}" 
                            data-servico-id="${servico.id}" 
                            data-tarefa-id="${tarefa.id}">Remover
                        </button>
                    `;
                    listaProdutos.appendChild(produtoDiv);
                    produtoDiv.querySelector('.botao-remover-produto')!.addEventListener( 'click', (evento) => {
                        const target = evento.target as HTMLButtonElement;
                        const produtoId = target.dataset.produtoId!;
                        const servicoId = target.dataset.servicoId!;
                        const tarefaId = target.dataset.tarefaId!;
                        this.removerProdutoLista(produtoId, servicoId, tarefaId);
                    } );
                }
            }
        }
    }

    exibirTarefasServicos(servicos: any[]): void {
        const listaTarefas = document.getElementById('listaTarefasServico') as HTMLDivElement;
        const buscaServico = document.getElementById('buscaServico') as HTMLInputElement;   
        listaTarefas.innerHTML = '';
        if (servicos.length === 0) {
            listaTarefas.style.display = 'none';
            return;
        }
        for (const servico of servicos) {
            if (!this.servicosAdicionados.includes(servico.id)) {
                const div = document.createElement('div');
                div.className = 'tarefa-servico';
                div.innerHTML = `
                    <strong>${servico.descricao}</strong>
                    <p>Mão de obra: ${( Number(servico.valorMaoObra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</p>
                    <p>Duração: ${servico.execucaoMinutos} min</p>
                `;
                div.addEventListener( 'click', () => {
                    this.controladora.adicionarServico(servico);
                    listaTarefas.style.display = 'none';
                    buscaServico.value = '';
                } );
                listaTarefas.appendChild(div);
            }
        }
        listaTarefas.style.display = 'block';
    }

    adicionarProdutoLista(produto: any, quantidade: number, servicoId: string, tarefaId: string): void {
        const servicoDiv = document.querySelector(`[data-servico-id="${servicoId}"]`) as HTMLDivElement;
        const tarefaDiv = servicoDiv.querySelector(`[data-tarefa-id="${tarefaId}"]`) as HTMLDivElement;
        let listaProdutos = tarefaDiv.querySelector('.lista-produtos-tarefa') as HTMLDivElement;
        if (!listaProdutos) {
            listaProdutos = document.createElement('div');
            listaProdutos.className = 'lista-produtos-tarefa';
            tarefaDiv.appendChild(listaProdutos);
        }
        const produtoDiv = document.createElement('div');
        produtoDiv.className = 'produto-item';
        produtoDiv.dataset.produtoId = produto.id;
        produtoDiv.dataset.servicoId = servicoId;
        produtoDiv.dataset.tarefaId = tarefaId;
        const subtotal = ( produto.precoVenda * quantidade );
        produtoDiv.innerHTML = `
            <div class="produto-info">
                <strong>${produto.titulo}</strong>
                <span>Quantidade: ${quantidade}</span>
                <span>Preço Unitário: ${( Number(produto.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</span>
                <span>Subtotal: ${( Number(subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</span>
            </div>
            <button type="button" class="botao-remover-produto" 
                data-produto-id="${produto.id}" 
                data-servico-id="${servicoId}" 
                data-tarefa-id="${tarefaId}">Remover
            </button>
        `;
        listaProdutos.appendChild(produtoDiv);
        produtoDiv.querySelector('.botao-remover-produto')!.addEventListener( 'click', (evento) => {
            const target = evento.target as HTMLButtonElement;
            const produtoId = target.dataset.produtoId!;
            const servicoId = target.dataset.servicoId!;
            const tarefaId = target.dataset.tarefaId!;
            this.removerProdutoLista(produtoId, servicoId, tarefaId);
        } );
        this.fecharModalProduto();
    }

    obterProdutoAtual(): any {
        return this.produtoAtual;
    }

    limparProdutoAtual(): void {
        this.produtoAtual = null;
    }

    removerProdutoLista(produtoId: string, servicoId: string, tarefaId: string): void {
        const selector = `.produto-item[data-produto-id="${produtoId}"][data-servico-id="${servicoId}"][data-tarefa-id="${tarefaId}"]`;
        const produtoDiv = document.querySelector(selector) as HTMLDivElement;
        produtoDiv.remove();
        this.controladora.removerProduto(produtoId, servicoId, tarefaId);
    }

    adicionarExtraLista(extra: any): void {
        this.controladora.adicionarExtra(extra);
        this.fecharModalExtra();
    }

    exibirExtras(extras: any[]): void {
        const campo = document.getElementById('listaExtras') as HTMLDivElement;
        campo.innerHTML = '';
        const conteudo = document.createElement('div');
        conteudo.className = 'lista-extras';
        for (const extra of extras) {
            const div = document.createElement('div');
            div.className = 'extra-item';
            div.dataset.extraId = extra.id;
            div.innerHTML = `
                <div>
                    <strong>${extra.descricao}</strong>
                    <div>Quantidade: ${extra.quantidade}</div>
                </div>
                <div>
                    <span>Subtotal: ${( Number(extra.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</span>
                    <button type="button" class="botao-remover-extra" data-extra-id="${extra.id}">Remover</button>
                </div>
            `;
            conteudo.appendChild(div);
            div.querySelector('.botao-remover-extra')!.addEventListener( 'click', (evento) => {
                const target = evento.target as HTMLButtonElement;
                const id = target.dataset.extraId!;
                this.removerExtraNaLista(id);
            } );
        }
        campo.appendChild(conteudo);
    }

    removerExtraNaLista(extraId: string): void {
        const extraDiv = document.querySelector(`[data-extra-id="${extraId}"]`) as HTMLDivElement;
        extraDiv.remove();
        this.controladora.removerExtra(extraId);
    }

    iniciarModais(): void {
        document.getElementById('botaoEditarMaoObra')!.addEventListener( 'click', () => {
            const modal = document.getElementById('modalEdicaoMaoObra') as HTMLDialogElement;
            const valor = this.controladora.gerenciarValorMaoObra();
            (document.getElementById('novoValorMaoObra') as HTMLInputElement).value = valor.toFixed(2);
            modal.showModal();
        } );
        document.getElementById('modalMaoObraCancelar')!.addEventListener( 'click', () => {
            const modal = document.getElementById('modalEdicaoMaoObra') as HTMLDialogElement;
            modal.close();
        } );
        document.getElementById('modalMaoObraConfirmar')!.addEventListener( 'click', () => {
            const modal = document.getElementById('modalEdicaoMaoObra') as HTMLDialogElement;
            const novoValor = ( document.getElementById('novoValorMaoObra') as HTMLInputElement ).value;
            if (!isNaN( parseFloat(novoValor) ) && ( parseFloat(novoValor) >= 0 )) {
                modal.close();
            }
            this.controladora.confirmarMaoObra(novoValor);
        });
        document.getElementById('botaoEditarPrevisaoEntrega')!.addEventListener( 'click', () => {
            const modal = document.getElementById('modalEdicaoDataEntrega') as HTMLDialogElement;
            const inputData = document.getElementById('novaDataEntrega') as HTMLInputElement;
            const dataAtualSpan = document.getElementById('dataEntrega') as HTMLSpanElement;
            const dataISO = dataAtualSpan.dataset.iso;
            if (dataISO) {
                const dataBrasil = new Date( new Date(dataISO).getTime() - 10800000 );
                inputData.value = dataBrasil.toISOString().slice(0, 16);
            } else {
                const dataBrasil = new Date( (new Date()).getTime() - 10800000 );
                inputData.value = dataBrasil.toISOString().slice(0, 16);
            }
            modal.showModal();
        } );
        document.getElementById('modalDataConfirmar')!.addEventListener( 'click', () => {
            const novaData = (document.getElementById('novaDataEntrega') as HTMLInputElement).value;
            if (novaData) {
                const modal = document.getElementById('modalEdicaoDataEntrega') as HTMLDialogElement;
                modal.close();
                this.dataEditadaManual = true;
                if (this.intervaloAtualizacao) {
                    clearInterval(this.intervaloAtualizacao);
                }
            }
            this.controladora.confirmarDataEntrega(novaData) 
        } );
        document.getElementById('modalDataCancelar')!.addEventListener( 'click', () => {
            const modal = document.getElementById('modalEdicaoDataEntrega') as HTMLDialogElement;
            modal.close();
        } );
        this.iniciarModalProduto();
        document.getElementById('modalExtraCancelar')!.addEventListener( 'click', () => this.fecharModalExtra() );
        document.getElementById('modalExtraConfirmar')!.addEventListener( 'click', () => {
            const descricao = (document.getElementById('descricaoExtra') as HTMLInputElement).value.trim();
            const valor = (document.getElementById('valorExtra') as HTMLInputElement).value;
            const quantidade = (document.getElementById('quantidadeExtra') as HTMLInputElement).value;
            this.controladora.confirmarExtra(descricao, valor, quantidade) 
        } );
        document.getElementById('botaoAdicionarExtra')!.addEventListener( 'click', () => this.abrirModalExtra() );
    }

    private iniciarModalProduto(): void {
        const modal = document.getElementById('modalAdicionarProduto')! as HTMLDialogElement;
        const inputBusca = document.getElementById('buscaProdutoModal')! as HTMLInputElement;
        const botaoCancelar = document.getElementById('modalProdutoCancelar')! as HTMLButtonElement;
        const botaoConfirmar = document.getElementById('modalProdutoConfirmar')! as HTMLButtonElement;
        botaoConfirmar.disabled = true;
        inputBusca.addEventListener( 'input', () => {
            const termo = inputBusca.value.trim();
            if (termo.length >= 2) {
                this.controladora.buscarProdutos(termo);
            } else {
                document.getElementById('listaProdutosModal')!.innerHTML = '';
            }
        } );
        botaoCancelar.addEventListener( 'click', () => {
            modal.close();
        } );
        botaoConfirmar.addEventListener( 'click', () => {
            const quantidade = (document.getElementById('quantidadeProduto') as HTMLInputElement).value;
            this.controladora.confirmarProduto(modal, quantidade);
        } );
        modal.addEventListener( 'close', () => {
            this.produtoAtual = null;
            const detalhes = document.getElementById('detalhesProduto') as HTMLDivElement;
            if (detalhes) {
                detalhes.innerHTML = '';
            }
            const listaProdutos = document.getElementById('listaProdutosModal') as HTMLDivElement;
            if (listaProdutos) {
                listaProdutos.innerHTML = '';
            }
            inputBusca.value = '';
            botaoConfirmar.disabled = true;
        } );
    }

    abrirModalProduto(servicoId: string, tarefaId: string): void {
        const modal = document.getElementById('modalAdicionarProduto') as HTMLDialogElement;
        modal.showModal();
        ( document.getElementById('buscaProdutoModal') as HTMLInputElement ).value = '';
        ( document.getElementById('quantidadeProduto') as HTMLInputElement ).value = '1';
        document.getElementById('detalhesProduto')!.innerHTML = '';
        document.getElementById('listaProdutosModal')!.innerHTML = '';
        const botaoConfirmar = document.getElementById('modalProdutoConfirmar')! as HTMLButtonElement;
        botaoConfirmar.disabled = true;
        modal.dataset.servicoIdDoProduto = servicoId;
        modal.dataset.tarefaIdDoProduto = tarefaId;
    }

    fecharModalProduto(): void {
        const modal = document.getElementById('modalAdicionarProduto') as HTMLDialogElement;
        modal.close();
    }

    exibirProdutosModal(produtos: any[]): void {
        const listaProdutos = document.getElementById('listaProdutosModal') as HTMLDivElement;
        listaProdutos.innerHTML = '';
        if (produtos.length === 0) {
            listaProdutos.innerHTML = '<p>Nenhum produto encontrado.</p>';
            return;
        }
        produtos.forEach( produto => {
            const div = document.createElement('div');
            div.className = 'item-lista-modal';
            div.innerHTML = `
                <strong>${produto.titulo}</strong>
                <div>Código: ${produto.codigo}</div>
                <div>Fabricante: ${produto.fabricante}</div>
                <div>Preço: ${( Number(produto.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</div>
                <div>Estoque: ${produto.estoque}</div>
            `;
            div.addEventListener( 'click', () => {
                this.controladora.selecionarProduto(produto);
            } );
            listaProdutos.appendChild(div);
        } );
    }

    exibirProdutoSelecionadoModal(produto: any): void {
        this.produtoAtual = produto;
        const detalhes = document.getElementById('detalhesProduto') as HTMLDivElement;
        detalhes.innerHTML = `
            <div><strong>${produto.titulo}</strong></div>
            <div>Código: ${produto.codigo}</div>
            <div>Fabricante: ${produto.fabricante}</div>
            <div>Descrição: ${produto.descricao}</div>
            <div>Preço: ${( Number(produto.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}</div>
            <div>Estoque: ${produto.estoque}</div>
        `;
        const botaoConfirmar = document.getElementById('modalProdutoConfirmar')! as HTMLButtonElement;
        botaoConfirmar.disabled = false;
        const listaProdutos = document.getElementById('listaProdutosModal') as HTMLDivElement;
        listaProdutos.innerHTML = '';
    }

    abrirModalExtra(): void {
        const modal = document.getElementById('modalAdicionarExtra') as HTMLDialogElement;
        modal.showModal();
        ( document.getElementById('descricaoExtra') as HTMLInputElement ).value = '';
        ( document.getElementById('valorExtra') as HTMLInputElement ).value = '';
        ( document.getElementById('quantidadeExtra') as HTMLInputElement ).value = '1';
    }

    fecharModalExtra(): void {
        const modal = document.getElementById('modalAdicionarExtra') as HTMLDialogElement;
        modal.close();
    }

    atualizarValorMaoObra(valor: number): void {
        const elemento = document.getElementById('valorMaoObra') as HTMLSpanElement;
        elemento.textContent = `${( Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}`;
    }

    atualizarValorProdutos(valor: number): void {
        const elemento = document.getElementById('valorProdutos') as HTMLSpanElement;
        elemento.textContent = `${( Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}`;
    }

    atualizarValorExtras(valor: number): void {
        const elemento = document.getElementById('valorExtras') as HTMLSpanElement;
        elemento.textContent = `${( Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}`;
    }

    atualizarDataEntrega(dataISO: string): void {
        const elemento = document.getElementById('dataEntrega') as HTMLSpanElement;
        elemento.dataset.iso = dataISO;
        const data = new Date(dataISO);
        const dataFormatada = data.toLocaleString( 'pt-BR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        } );
        elemento.textContent = dataFormatada;
    }

    obterDataEntregaAtual(): string {
        const elemento = document.getElementById('dataEntrega') as HTMLSpanElement;
        return elemento.dataset.iso!;
    }

    private iniciarAtualizacaoData(): void {
        this.intervaloAtualizacao = setInterval( () => {
            if (!this.dataEditadaManual) {
                this.controladora.atualizarDataEntregaAutomatica();
            }
        }, 10000 );
    }

    atualizarValorTotal(total: number): void {
        const elemento = document.getElementById('valorTotal') as HTMLSpanElement;
        elemento.textContent = `${( Number(total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) )}`;
    }

    obterDadosFormulario(): any {
        const veiculoSelect = document.getElementById('veiculos') as HTMLSelectElement;
        const responsavelSelect = document.getElementById('responsaveis') as HTMLSelectElement;
        const observacoes = document.getElementById('textoObservacoes') as HTMLTextAreaElement;
        return {
            veiculoId: veiculoSelect.value,
            responsavelId: responsavelSelect.value,
            observacoes: observacoes.value.trim()
        };
    }

    enviarFormulario(): void {
        const botaoEnviar = document.getElementById('botaoEnviar') as HTMLButtonElement;
        botaoEnviar.addEventListener( 'click', (evento) => {
            evento.preventDefault();
            this.controladora.enviarOs();
        } );
    }

    limparFormulario(): void {
        const formulario = document.querySelector('form') as HTMLFormElement;
        formulario.reset();
        this.limparDivCliente();
        document.getElementById('listaServicos')!.innerHTML = '';
        const listaExtras = document.getElementById('listaExtras') as HTMLDivElement;
        if (listaExtras) listaExtras.innerHTML = '';
        this.servicosAdicionados = [];
        this.atualizarValorMaoObra(0);
        this.atualizarDataEntrega('--/--/---- --:--');
        this.atualizarValorTotal(0);
    }

    redirecionarParaOsCriada(id: string): void {
        window.location.href = `./exibicao-os.html?id=${id}`;
    }

}