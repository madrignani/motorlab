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
            this.visao.exibirItens(this.itensArmazenados);
            return;
        }
        const filtrados = this.itensArmazenados.filter( (item) => {
            const codigo = (item.codigo ?? '').toString().toLowerCase();
            const titulo = (item.titulo ?? '').toString().toLowerCase();
            return codigo.includes(valorFormatado) || titulo.includes(valorFormatado);
        } );
        this.visao.exibirItens(filtrados);
    }

    private async carregarItens(): Promise<void> {
        try {
            const itens = await this.gestor.obterItens();
            this.itensArmazenados = itens;
            this.visao.exibirItens(this.itensArmazenados);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem(erro.getProblemas());
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar os itens: ${erro.message}`] );
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

    async carregarItemParaGerenciamento(id: string): Promise<void> {
        try {
            const item = await this.gestor.obterItem(Number(id));
            this.visao.exibirModalGerenciamento(item);
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem(erro.getProblemas());
            } else {
                this.visao.exibirMensagem( [`Não foi possível carregar o item: ${erro.message}`] );
            }
        }
    }

    async atualizarItem(id: string, precoVenda: string, estoque: string, estoqueMinimo: string): Promise<void> {
        const envio = {
            precoVenda: parseFloat(precoVenda),
            estoque: parseInt(estoque),
            estoqueMinimo: parseInt(estoqueMinimo),
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

}