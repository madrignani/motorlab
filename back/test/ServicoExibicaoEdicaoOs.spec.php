<?php


use App\Utils\RecomposicaoBD;
use App\Config\Conexao;
use App\Excecao\AutenticacaoException;
use App\Excecao\DominioException;
use App\Repositorio\RepositorioClienteBdr;
use App\Repositorio\RepositorioItemBdr;
use App\Repositorio\RepositorioLaudoBdr;
use App\Repositorio\RepositorioOsBdr;
use App\Repositorio\RepositorioOsCustoBdr;
use App\Repositorio\RepositorioPagamentoBdr;
use App\Repositorio\RepositorioServicoBdr;
use App\Repositorio\RepositorioUsuarioBdr;
use App\Repositorio\RepositorioVeiculoBdr;
use App\Transacao\TransacaoPdo;
use App\Servico\ServicoCadastroOs;
use App\Servico\ServicoExibicaoEdicaoOs;


describe( 'ServicoExibicaoEdicaoOs', function () {

    beforeAll( function() {
        $this->pdo = Conexao::conectar();
        $this->recomposicaoBD = new RecomposicaoBD($this->pdo);
        $this->transacao = new TransacaoPdo($this->pdo);
        $this->repositorioCliente = new RepositorioClienteBdr($this->pdo);
        $this->repositorioItem = new RepositorioItemBdr($this->pdo);
        $this->repositorioLaudo = new RepositorioLaudoBdr($this->pdo);
        $this->repositorioOs = new RepositorioOsBdr($this->pdo);
        $this->repositorioOsCusto = new RepositorioOsCustoBdr($this->pdo);
        $this->repositorioPagamento = new RepositorioPagamentoBdr($this->pdo);
        $this->repositorioServico = new RepositorioServicoBdr($this->pdo);
        $this->repositorioUsuario = new RepositorioUsuarioBdr($this->pdo);
        $this->repositorioVeiculo = new RepositorioVeiculoBdr($this->pdo);
        $this->servicoCadastro = new ServicoCadastroOs (
            $this->transacao, $this->repositorioCliente, $this->repositorioItem,
            $this->repositorioOs, $this->repositorioOsCusto, $this->repositorioServico,
            $this->repositorioUsuario, $this->repositorioVeiculo
        );
        $this->servico = new ServicoExibicaoEdicaoOs (
            $this->transacao, $this->repositorioCliente, $this->repositorioItem,
            $this->repositorioLaudo, $this->repositorioOs, $this->repositorioOsCusto,
            $this->repositorioPagamento, $this->repositorioServico, $this->repositorioUsuario,
            $this->repositorioVeiculo
        );
        $this->atendente = 1;
        $this->gerente = 5;
        $this->mecanico = 3;
        $this->clienteId = 1;
        $this->veiculoId = 1;
        $this->responsavelId = 3;
        $dados = [
            'clienteId' => $this->clienteId,
            'veiculoId' => $this->veiculoId,
            'responsavelId' => $this->responsavelId,
            'dataEntrega' => '2026-12-15 18:00:00',
            'valorMaoObra' => 90.00,
            'servicos' => [
                [
                    'id' => 1,
                    'tarefas' => [
                        ['id' => 1, 'descricao' => 'Drenar o óleo do cárter']
                    ]
                ]
            ],
            'produtos' => [],
            'extras' => [],
            'observacoes' => 'OS de teste'
        ];
        $this->osId = $this->servicoCadastro->cadastrarOs($dados, $this->atendente, 'ATENDENTE');
    } );

    AfterAll( function() {
        $this->recomposicaoBD->redefinir();
    } );

    it( "Deve permitir buscar dados de uma OS existente", function () {
        $os = $this->servico->buscarDadosOs($this->osId);
        expect($os)->toBeAn('array');
        expect($os['id'])->toBe($this->osId);
    } );

    it( "Deve bloquear busca de OS inexistente", function () {
        $executar = function() {
            $this->servico->buscarDadosOs(999999);
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve permitir buscar serviços para edição", function () {
        $servicos = $this->servico->buscarServicos('óleo', 'ATENDENTE');
        expect($servicos)->toBeAn('array');
    } );

    it( "Deve permitir atendente adicionar serviço à OS", function () {
        $executar = function() {
            $dados = ['id' => 2];
            $this->servico->adicionarServico($this->osId, $dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve permitir gerente adicionar serviço à OS", function () {
        $executar = function() {
            $dados = ['id' => 3];
            $this->servico->adicionarServico($this->osId, $dados, $this->gerente, 'GERENTE');
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve bloquear adição de serviço inexistente", function () {
        $executar = function() {
            $dados = ['id' => 999999];
            $this->servico->adicionarServico($this->osId, $dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve permitir adicionar tarefa a um serviço", function () {
        $executar = function() {
            $this->servico->adicionarTarefa($this->osId, 1, 'Nova tarefa de teste', $this->atendente, 'ATENDENTE');
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve bloquear adição de tarefa com descrição vazia", function () {
        $executar = function() {
            $this->servico->adicionarTarefa($this->osId, 1, '', $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve permitir adicionar produto à OS", function () {
        $executar = function() {
            $dados = [
                'produtoId' => 1,
                'servicoId' => 1,
                'tarefaId' => 1,
                'quantidade' => 2
            ];
            $this->servico->adicionarProduto($this->osId, $dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve bloquear adição de produto com quantidade inválida", function () {
        $executar = function() {
            $dados = [
                'produtoId' => 1,
                'servicoId' => 1,
                'tarefaId' => 1,
                'quantidade' => 0
            ];
            $this->servico->adicionarProduto($this->osId, $dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve bloquear adição de produto inexistente", function () {
        $executar = function() {
            $dados = [
                'produtoId' => 999999,
                'servicoId' => 1,
                'tarefaId' => 1,
                'quantidade' => 1
            ];
            $this->servico->adicionarProduto($this->osId, $dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve bloquear adição de custo extra com valor inválido", function () {
        $executar = function() {
            $dados = [
                'descricao' => 'Custo adicional',
                'valor' => 0,
                'quantidade' => 1
            ];
            $this->servico->adicionarExtra($this->osId, $dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve permitir atualizar valor de mão de obra", function () {
        $executar = function() {
            $this->servico->atualizarMaoObra($this->osId, 150.00, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve bloquear atualização de mão de obra com valor negativo", function () {
        $executar = function() {
            $this->servico->atualizarMaoObra($this->osId, -50.00, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve bloquear mecânico de atualizar mão de obra", function () {
        $executar = function() {
            $this->servico->atualizarMaoObra($this->osId, 100.00, $this->mecanico, 'MECANICO');
        };
        expect($executar)->toThrow(new AutenticacaoException());
    } );

    it( "Deve permitir atualizar data de entrega", function () {
        $executar = function() {
            $this->servico->atualizarDataEntrega($this->osId, '2027-01-15 18:00:00', $this->atendente, 'ATENDENTE');
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve bloquear atualização de data de entrega no passado", function () {
        $executar = function() {
            $this->servico->atualizarDataEntrega($this->osId, '2020-01-15 18:00:00', $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve permitir atualizar observações", function () {
        $executar = function() {
            $this->servico->atualizarObservacoes($this->osId, 'Observações atualizadas', $this->atendente, 'ATENDENTE');
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve bloquear observações com mais de 2000 caracteres", function () {
        $executar = function() {
            $observacoes = str_repeat('a', 2001);
            $this->servico->atualizarObservacoes($this->osId, $observacoes, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve permitir atualizar status da OS", function () {
        $executar = function() {
            $this->servico->atualizarStatus($this->osId, 'ANDAMENTO', $this->atendente, 'ATENDENTE');
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve bloquear mecânico de adicionar pagamento", function () {
        $executar = function() {
            $dados = ['metodo' => 'DINHEIRO'];
            $this->servico->adicionarPagamento($this->osId, $dados, $this->mecanico, 'MECANICO');
        };
        expect($executar)->toThrow(new AutenticacaoException());
    } );

} );


?>