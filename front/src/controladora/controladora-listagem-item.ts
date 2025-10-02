import { ErroGestor } from '../infra/erro-gestor.ts';
import type { VisaoListagemItem } from '../visao/visao-listagem-item.ts';
import { GestorListagemItem } from '../gestor/gestor-listagem-item.ts';


export class ControladoraListagemItem {

    private gestor = new GestorListagemItem();
    private visao: VisaoListagemItem;
    private itensArmazenados: any[] = [];

    constructor(visao: VisaoListagemItem) {
        this.visao = visao;
    }

    async logout(): Promise<void> {
        try {
            await this.gestor.logout();
            this.visao.redirecionarParaLogin();
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível completar o logout: ${erro.message}`] ); 
            }
        }
    }

    async iniciarSessao(): Promise<void> {
        try {
            await this.gestor.verificarPermissao();
        } catch (erro: any) {
            this.visao.redirecionarParaLogin();
            return;
        }
        await this.carregarDadosUsuario();
        this.visao.exibirPagina();
        await this.carregarItens();
        this.visao.iniciarFiltros();
    }

    private async carregarDadosUsuario(): Promise<void> {
        try {
            const dadosUsuario = await this.gestor.obterDadosUsuario();
            this.visao.exibirDadosUsuario(dadosUsuario);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar os dados do usuário: ${erro.message}`] ); 
            }
        }
    }

    aplicarFiltros(valor: string): void {
        const valorFormatado = ( (valor).trim().toLowerCase() );
        if (!valorFormatado) {
            const itensComClasse = this.aplicarClasseItens(this.itensArmazenados)
            this.visao.exibirItens(itensComClasse);
            return;
        }
        const filtrados = this.itensArmazenados.filter( (item) => {
            const codigo = (item.codigo).toString().toLowerCase();
            const titulo = (item.titulo).toString().toLowerCase();
            return codigo.includes(valorFormatado) || titulo.includes(valorFormatado);
        } );
        const filtradosComClasse = this.aplicarClasseItens(filtrados)
        this.visao.exibirItens(filtradosComClasse);
    }

    private async carregarItens(): Promise<void> {
        try {
            const itens = await this.gestor.obterItens();
            this.itensArmazenados = itens;
            const itensComClasse = this.aplicarClasseItens(itens);
            const itensAlerta = [];
            for (const item of itensComClasse) {
                const classeEstoque = this.determinarRiscoEstoque(item.estoque, item.estoqueMinimo);
                if (classeEstoque === 'linha-vermelha' || classeEstoque === 'linha-amarela') {
                    itensAlerta.push(item.codigo);
                }
            }
            this.visao.exibirItens(itensComClasse);
            this.visao.exibirAlertaEstoque(itensAlerta);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar os itens: ${erro.message}`] );
            }
        }
    }

    private aplicarClasseItens(itens: any[]): any[] {
        const itensClassificados: any[] = [];
        for (const item of itens) {
            const classeEstoque = this.determinarRiscoEstoque(item.estoque, item.estoqueMinimo);
            itensClassificados.push({
                id: item.id,
                codigo: item.codigo,
                titulo: item.titulo,
                fabricante: item.fabricante,
                descricao: item.descricao,
                precoVenda: item.precoVenda,
                estoque: item.estoque,
                estoqueMinimo: item.estoqueMinimo,
                localizacao: item.localizacao,
                classeEstoque: classeEstoque
            });
        }
        return itensClassificados;
    }

    private determinarRiscoEstoque(estoque: number, estoqueMinimo: number): string {
        if (estoque <= estoqueMinimo) {
            return 'linha-vermelha';
        } else if (estoque <= estoqueMinimo * 1.2) {
            return 'linha-amarela';
        } else {
            return 'linha-verde';
        }
    }

    async carregarItemParaGerenciamento(id: string): Promise<void> {
        try {
            const dadosItem = await this.gestor.obterItem(Number(id));
            if (!dadosItem.id) {
                this.visao.exibirMensagem( ["Item não encontrado."] );
                return;
            }
            this.visao.exibirModalGerenciamento(dadosItem);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem(erro.getProblemas());
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar o item: ${erro.message}`] );
            }
        }
    }

    async atualizarItem(id: string, precoVenda: string, estoque: string, estoqueMinimo: string, localizacao: string): Promise<void> {
        const envio = {
            precoVenda: parseFloat(precoVenda),
            estoque: parseInt(estoque),
            estoqueMinimo: parseInt(estoqueMinimo),
            localizacao: localizacao.trim()
        };
        try {
            await this.gestor.atualizarItem( Number(id), envio );
            this.visao.exibirMensagem( ['Item atualizado com sucesso.'] );
            await this.carregarItens();
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível atualizar o item: ${erro.message}`] );
            }
        }
    }

    async removerItem(id: string): Promise<void> {
        try{
            await this.gestor.removerItem(Number(id));
            this.visao.exibirMensagem( ['Item removido com sucesso.'] );
            await this.carregarItens();
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar os itens: ${erro.message}`] ); 
            }
        }
    }

}