<?php


use App\Utils\RecomposicaoBD;
use App\Config\Conexao;
use App\Excecao\AutenticacaoException;
use App\Excecao\DominioException;
use App\Repositorio\RepositorioClienteBdr;
use App\Repositorio\RepositorioItemBdr;
use App\Repositorio\RepositorioOsBdr;
use App\Repositorio\RepositorioOsCustoBdr;
use App\Repositorio\RepositorioServicoBdr;
use App\Repositorio\RepositorioUsuarioBdr;
use App\Repositorio\RepositorioVeiculoBdr;
use App\Transacao\TransacaoPdo;
use App\Servico\ServicoCadastroOs;


describe( 'ServicoCadastroOs', function () {

    beforeAll( function() {
        $this->pdo = Conexao::conectar();
        $this->pdo = Conexao::conectar();
        $this->recomposicaoBD = new RecomposicaoBD($this->pdo);
        $this->transacao = new TransacaoPdo($this->pdo);
        $this->repositorioCliente = new RepositorioClienteBdr($this->pdo);
        $this->repositorioItem = new RepositorioItemBdr($this->pdo);
        $this->repositorioOs = new RepositorioOsBdr($this->pdo);
        $this->repositorioOsCusto = new RepositorioOsCustoBdr($this->pdo);
        $this->repositorioServico = new RepositorioServicoBdr($this->pdo);
        $this->repositorioUsuario = new RepositorioUsuarioBdr($this->pdo);
        $this->repositorioVeiculo = new RepositorioVeiculoBdr($this->pdo);
        $this->servico = new ServicoCadastroOs (
            $this->transacao, $this->repositorioCliente, $this->repositorioItem,
            $this->repositorioOs, $this->repositorioOsCusto, $this->repositorioServico,
            $this->repositorioUsuario, $this->repositorioVeiculo
        );
        $this->atendente = 1;
        $this->gerente = 5;
        $this->mecanico = 3;
        $this->clienteId = 1;
        $this->veiculoId = 1;
        $this->responsavelId = 3;
    } );

    AfterAll( function() {
        $this->recomposicaoBD->redefinir();
    } );

    it( "Deve permitir atendente buscar veículos por cliente", function () {
        $veiculos = $this->servico->buscarVeiculosPorCliente($this->clienteId, 'ATENDENTE');
        expect($veiculos)->toBeAn('array');
        expect(count($veiculos))->toBeGreaterThan(0);
    } );

    it( "Deve permitir gerente buscar veículos por cliente", function () {
        $veiculos = $this->servico->buscarVeiculosPorCliente($this->clienteId, 'GERENTE');
        expect($veiculos)->toBeAn('array');
    } );

    it( "Deve bloquear mecânico de buscar veículos por cliente", function () {
        $executar = function() {
            $this->servico->buscarVeiculosPorCliente($this->clienteId, 'MECANICO');
        };
        expect($executar)->toThrow(new AutenticacaoException());
    } );

    it( "Deve permitir atendente listar responsáveis", function () {
        $responsaveis = $this->servico->listarResponsaveis('ATENDENTE');
        expect($responsaveis)->toBeAn('array');
        expect(count($responsaveis))->toBeGreaterThan(0);
    } );

    it( "Deve bloquear mecânico de listar responsáveis", function () {
        $executar = function() {
            $this->servico->listarResponsaveis('MECANICO');
        };
        expect($executar)->toThrow(new AutenticacaoException());
    } );

    it( "Deve permitir atendente buscar serviços", function () {
        $servicos = $this->servico->buscarServicos('óleo', 'ATENDENTE');
        expect($servicos)->toBeAn('array');
    } );

    it( "Deve bloquear mecânico de buscar serviços", function () {
        $executar = function() {
            $this->servico->buscarServicos('óleo', 'MECANICO');
        };
        expect($executar)->toThrow(new AutenticacaoException());
    } );

    it( "Deve permitir atendente cadastrar OS com dados válidos", function () {
        $executar = function() {
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
            $this->servico->cadastrarOs($dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve permitir gerente cadastrar OS", function () {
        $executar = function() {
            $dados = [
                'clienteId' => 2,
                'veiculoId' => 3,
                'responsavelId' => 4,
                'dataEntrega' => '2026-12-20 17:00:00',
                'valorMaoObra' => 120.00,
                'servicos' => [
                    [
                        'id' => 2,
                        'tarefas' => [
                            ['id' => 7, 'descricao' => 'Abrir caixa do filtro de ar']
                        ]
                    ]
                ],
                'produtos' => [],
                'extras' => []
            ];
            $this->servico->cadastrarOs($dados, $this->gerente, 'GERENTE');
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve bloquear mecânico de cadastrar OS", function () {
        $executar = function() {
            $dados = [
                'clienteId' => $this->clienteId,
                'veiculoId' => $this->veiculoId,
                'responsavelId' => $this->responsavelId,
                'dataEntrega' => '2026-12-25 18:00:00',
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
                'extras' => []
            ];
            $this->servico->cadastrarOs($dados, $this->mecanico, 'MECANICO');
        };
        expect($executar)->toThrow(new AutenticacaoException());
    } );

    it( "Deve bloquear cadastro de OS sem dados obrigatórios", function () {
        $executar = function() {
            $dados = [
                'clienteId' => $this->clienteId,
                'veiculoId' => $this->veiculoId
            ];
            $this->servico->cadastrarOs($dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve bloquear cadastro de OS com cliente inexistente", function () {
        $executar = function() {
            $dados = [
                'clienteId' => 999999,
                'veiculoId' => $this->veiculoId,
                'responsavelId' => $this->responsavelId,
                'dataEntrega' => '2026-12-30 18:00:00',
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
                'extras' => []
            ];
            $this->servico->cadastrarOs($dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve bloquear cadastro de OS com veículo inexistente", function () {
        $executar = function() {
            $dados = [
                'clienteId' => $this->clienteId,
                'veiculoId' => 999999,
                'responsavelId' => $this->responsavelId,
                'dataEntrega' => '2027-01-05 18:00:00',
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
                'extras' => []
            ];
            $this->servico->cadastrarOs($dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve bloquear cadastro de OS com serviço inexistente", function () {
        $executar = function() {
            $dados = [
                'clienteId' => $this->clienteId,
                'veiculoId' => $this->veiculoId,
                'responsavelId' => $this->responsavelId,
                'dataEntrega' => '2027-01-10 18:00:00',
                'valorMaoObra' => 90.00,
                'servicos' => [
                    [
                        'id' => 999999,
                        'tarefas' => [
                            ['id' => 1, 'descricao' => 'Tarefa inválida']
                        ]
                    ]
                ],
                'produtos' => [],
                'extras' => []
            ];
            $this->servico->cadastrarOs($dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve bloquear cadastro de OS com serviço sem tarefas", function () {
        $executar = function() {
            $dados = [
                'clienteId' => $this->clienteId,
                'veiculoId' => $this->veiculoId,
                'responsavelId' => $this->responsavelId,
                'dataEntrega' => '2027-01-15 18:00:00',
                'valorMaoObra' => 90.00,
                'servicos' => [
                    [
                        'id' => 1,
                        'tarefas' => []
                    ]
                ],
                'produtos' => [],
                'extras' => []
            ];
            $this->servico->cadastrarOs($dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve bloquear cadastro de OS com produto inexistente", function () {
        $executar = function() {
            $dados = [
                'clienteId' => $this->clienteId,
                'veiculoId' => $this->veiculoId,
                'responsavelId' => $this->responsavelId,
                'dataEntrega' => '2027-01-20 18:00:00',
                'valorMaoObra' => 90.00,
                'servicos' => [
                    [
                        'id' => 1,
                        'tarefas' => [
                            ['id' => 1, 'descricao' => 'Drenar o óleo do cárter']
                        ]
                    ]
                ],
                'produtos' => [
                    [
                        'id' => 999999,
                        'quantidade' => 1,
                        'tarefaId' => 1
                    ]
                ],
                'extras' => []
            ];
            $this->servico->cadastrarOs($dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve bloquear cadastro de OS com quantidade de produto inválida", function () {
        $executar = function() {
            $dados = [
                'clienteId' => $this->clienteId,
                'veiculoId' => $this->veiculoId,
                'responsavelId' => $this->responsavelId,
                'dataEntrega' => '2027-01-25 18:00:00',
                'valorMaoObra' => 90.00,
                'servicos' => [
                    [
                        'id' => 1,
                        'tarefas' => [
                            ['id' => 1, 'descricao' => 'Drenar o óleo do cárter']
                        ]
                    ]
                ],
                'produtos' => [
                    [
                        'id' => 1,
                        'quantidade' => 0,
                        'tarefaId' => 1
                    ]
                ],
                'extras' => []
            ];
            $this->servico->cadastrarOs($dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve bloquear cadastro de OS com custo extra inválido", function () {
        $executar = function() {
            $dados = [
                'clienteId' => $this->clienteId,
                'veiculoId' => $this->veiculoId,
                'responsavelId' => $this->responsavelId,
                'dataEntrega' => '2027-02-01 18:00:00',
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
                'extras' => [
                    [
                        'descricao' => 'Custo adicional',
                        'quantidade' => 0,
                        'valor' => 50.00
                    ]
                ]
            ];
            $this->servico->cadastrarOs($dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

    it( "Deve bloquear cadastro de OS com custos extras duplicados", function () {
        $executar = function() {
            $dados = [
                'clienteId' => $this->clienteId,
                'veiculoId' => $this->veiculoId,
                'responsavelId' => $this->responsavelId,
                'dataEntrega' => '2027-02-05 18:00:00',
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
                'extras' => [
                    [
                        'descricao' => 'Custo adicional',
                        'quantidade' => 1,
                        'valor' => 50.00
                    ],
                    [
                        'descricao' => 'Custo adicional',
                        'quantidade' => 1,
                        'valor' => 30.00
                    ]
                ]
            ];
            $this->servico->cadastrarOs($dados, $this->atendente, 'ATENDENTE');
        };
        expect($executar)->toThrow(new DominioException());
    } );

} );


?>