import { API_URL } from './rota-api.ts';
import { ErroGestor } from '../infra/erro-gestor.ts';
import { GestorAutenticacao } from './gestor-autenticacao.ts';
import { GestorSessao } from '../gestor/gestor-sessao.ts';


export class GestorExibicaoOs {

    private gestorAutenticacao = new GestorAutenticacao();
    private gestorSessao = new GestorSessao();

    async logout(): Promise<void> {
        await this.gestorAutenticacao.logout();
    }

    async verificarPermissao(): Promise<void> {
        await this.gestorSessao.verificarPermissao();
    }

    async obterDadosUsuario(): Promise<any> {
        return await this.gestorSessao.obterDadosUsuario();
    }

    async obterOs(idOs: string): Promise<any> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();
    }

    async buscarServicos(termo: string): Promise<any[]> {
        const response = await fetch( `${API_URL}/servicos-edicao/${termo}`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();
    }

    async adicionarServico(idOs: string, servico: any): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/servicos`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(servico)
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas( dadosResposta.mensagens );
        }
    }

    async removerServico(idOs: string, servicoId: string): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/servicos/${servicoId}`, {
            method: 'DELETE',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async adicionarTarefaManual(idOs: string, servicoId: string, descricao: string): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/servicos/${servicoId}/tarefas`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { descricao } )
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async reordenarTarefa(idOs: string, servicoId: string, origemTarefaId: string, destinoTarefaId: string): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/reordenar-tarefa`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { servicoId, origemTarefaId, destinoTarefaId } )
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async removerTarefa(idOs: string, servicoId: string, tarefaId: string): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/servicos/${servicoId}/tarefas/${tarefaId}`, {
            method: 'DELETE',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async obterProdutoPorCodigo(busca: string): Promise<any> {
        const response = await fetch( `${API_URL}/itens-cod/${busca}`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();
    }

    async adicionarProduto(idOs: string, produtoId: string | number, servicoId: string, tarefaId: string, quantidade: number): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/produtos`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { produtoId, servicoId, tarefaId, quantidade } )
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async removerProduto(idOs: string, produtoId: string, servicoId: string, tarefaId: string): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/produtos`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { produtoId, servicoId, tarefaId } )
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async adicionarExtra(idOs: string, descricao: string, valor: number, quantidade: number): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/extras`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { descricao, valor, quantidade } )
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async removerExtra(idOs: string, extraId: string): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/extras/${extraId}`, {
            method: 'DELETE',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }
    
    async atualizarMaoObra(idOs: string, valor: number): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/mao-obra`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { valorMaoObra: valor } )
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async atualizarDataEntrega(idOs: string, data: string): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/data-entrega`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { previsaoEntrega: data } )
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async atualizarObservacoes(idOs: string, observacoes: string): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/observacoes`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { observacoes } )
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async atualizarStatus(idOs: string, status: string): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/status`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { status } )
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async concluirOsComLaudo(idOs: string, resumo: string, recomendacoes: string): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/concluir`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { resumo, recomendacoes } )
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async cadastrarPagamento(idOs: string, dados: any): Promise<void> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/pagamento`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
    }

    async obterLaudo(idOs: string): Promise<any> {
        const response = await fetch( `${API_URL}/ordens-servico/${idOs}/laudo`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            const dadosResposta = await response.json();
            throw ErroGestor.comProblemas(dadosResposta.mensagens);
        }
        return await response.json();
    }

}