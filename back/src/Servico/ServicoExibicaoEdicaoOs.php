<?php


namespace App\Servico;
use App\Transacao\Transacao;
use App\Excecao\DominioException;
use App\Excecao\AutenticacaoException;
use App\Repositorio\RepositorioCliente;
use App\Repositorio\RepositorioItem;
use App\Repositorio\RepositorioLaudo;
use App\Repositorio\RepositorioOs;
use App\Repositorio\RepositorioOsCusto;
use App\Repositorio\RepositorioPagamento;
use App\Repositorio\RepositorioServico;
use App\Repositorio\RepositorioUsuario;
use App\Repositorio\RepositorioVeiculo;
use App\Dto\ClienteDto;
use App\Dto\ItemDto;
use App\Dto\OsDto;
use App\Dto\ServicoDto;
use App\Dto\TarefaDto;
use App\Dto\UsuarioDto;
use App\Dto\VeiculoDto;
use Throwable;
use DateTime;


class ServicoExibicaoEdicaoOs {
    
    private Transacao $transacao;
    private RepositorioCliente $repositorioCliente;
    private RepositorioItem $repositorioItem;
    private RepositorioLaudo $repositorioLaudo;
    private RepositorioOs $repositorioOs;
    private RepositorioOsCusto $repositorioOsCusto;
    private RepositorioPagamento $repositorioPagamento;
    private RepositorioServico $repositorioServico;
    private RepositorioUsuario $repositorioUsuario;
    private RepositorioVeiculo $repositorioVeiculo;

    public function __construct (
        Transacao $transacao,
        RepositorioCliente $repositorioCliente,
        RepositorioItem $repositorioItem,
        RepositorioLaudo $repositorioLaudo,
        RepositorioOs $repositorioOs,
        RepositorioOsCusto $repositorioOsCusto,
        RepositorioPagamento $repositorioPagamento,
        RepositorioServico $repositorioServico,
        RepositorioUsuario $repositorioUsuario,
        RepositorioVeiculo $repositorioVeiculo
    ) {
        $this->transacao = $transacao;
        $this->repositorioCliente = $repositorioCliente;
        $this->repositorioItem = $repositorioItem;
        $this->repositorioLaudo = $repositorioLaudo;
        $this->repositorioOs = $repositorioOs;
        $this->repositorioOsCusto = $repositorioOsCusto;
        $this->repositorioPagamento = $repositorioPagamento;
        $this->repositorioServico = $repositorioServico;
        $this->repositorioUsuario = $repositorioUsuario;
        $this->repositorioVeiculo = $repositorioVeiculo;
    }

    public function buscarDadosOs(int $id) {
        if (!$id) {
            throw DominioException::comProblemas( ['Dados obrigatórios não informados.'] );
        }
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $cliente = $this->repositorioCliente->buscarPorId($os['cliente_id']);
        if ( empty($cliente) ) {
            throw DominioException::comProblemas( ['Cliente não encontrado.'] );
        }
        $veiculo = $this->repositorioVeiculo->buscarPorId($os['veiculo_id']);
        if ( empty($veiculo) ) {
            throw DominioException::comProblemas( ['Veículo não encontrado.'] );
        }
        $usuarioCriacao = $this->repositorioUsuario->buscarPorId($os['usuario_criacao']);
        if ( empty($usuarioCriacao) ) {
            throw DominioException::comProblemas( ['Usuário de criação não encontrado.'] );
        }
        $usuarioResponsavel = $this->repositorioUsuario->buscarPorId($os['usuario_responsavel']);
        if ( empty($usuarioResponsavel) ) {
            throw DominioException::comProblemas( ['Usuário responsável não encontrado.'] );
        }
        $servicos = $this->repositorioOs->buscarServicosPorOs($id);
        $custos = $this->repositorioOsCusto->buscarPorOs($id);
        $laudo = $this->repositorioLaudo->buscarPorOs($id);
        $pagamento = $this->repositorioPagamento->buscarPorOs($id);
        $clienteDto = new ClienteDto(
            $cliente['id'],
            $cliente['cpf'],
            $cliente['nome'],
            $cliente['telefone'],
            $cliente['email']
        );
        $veiculoDto = new VeiculoDto(
            $veiculo['id'],
            $veiculo['cliente_id'],
            $veiculo['placa'],
            $veiculo['chassi'],
            $veiculo['fabricante'],
            $veiculo['modelo'],
            $veiculo['ano'],
            $veiculo['quilometragem']
        );
        $usuarioCriacaoDto = new UsuarioDto(
            $usuarioCriacao['id'],
            $usuarioCriacao['cpf'],
            $usuarioCriacao['nome'],
            $usuarioCriacao['email'],
            $usuarioCriacao['cargo'],
            $usuarioCriacao['ativo']
        );
        $usuarioResponsavelDto = new UsuarioDto(
            $usuarioResponsavel['id'],
            $usuarioResponsavel['cpf'],
            $usuarioResponsavel['nome'],
            $usuarioResponsavel['email'],
            $usuarioResponsavel['cargo'],
            $usuarioResponsavel['ativo']
        );
        $servicosDto = [];
        foreach ($servicos as $servico) {
            $tarefas = $this->repositorioOs->buscarTarefasPorServico($servico['os_servico_id']);
            $tarefasDto = [];
            foreach ($tarefas as $tarefa) {
                $produtos = $this->repositorioOsCusto->buscarProdutosPorTarefa($tarefa['id']);
                $produtosArray = [];
                foreach ($produtos as $produto) {
                    $produtosArray[] = [
                        'id' => $produto['item_id'],
                        'titulo' => $produto['titulo'],
                        'precoVenda' => $produto['preco_venda'],
                        'quantidade' => $produto['quantidade'],
                        'subtotal' => $produto['subtotal']
                    ];
                }
                $tarefaDto = new TarefaDto(
                    $tarefa['id'],
                    $tarefa['descricao'],
                    $tarefa['ordenacao']
                );
                $tarefaDados = $tarefaDto->arrayDados();
                $tarefaDados['produtos'] = $produtosArray;
                $tarefasDto[] = $tarefaDados;
            }
            $servicoBase = $this->repositorioServico->buscarPorId($servico['servico_id']);
            if (!$servicoBase) {
                throw DominioException::comProblemas( ["Serviço ID {$servico['servico_id']} não encontrado."] );
            }
            $servicoDto = new ServicoDto(
                $servicoBase['id'],
                $servicoBase['descricao'],
                $servicoBase['valor_mao_obra'],
                $servicoBase['execucao_minutos'],
                $tarefasDto
            );
            $servicosDto[] = $servicoDto->arrayDados();
        }
        $custosDto = [];
        foreach ($custos as $custo) {
            $custosDto[] = [
                'id' => $custo['id'],
                'tipo' => $custo['tipo'],
                'descricao' => $custo['descricao'],
                'quantidade' => $custo['quantidade'],
                'subtotal' => $custo['subtotal']
            ];
        }
        $laudoDto = null;
        if ($laudo) {
            $laudoDto = [
                'id' => $laudo['id'],
                'resumo' => $laudo['resumo'],
                'recomendacoes' => $laudo['recomendacoes']
            ];
        }
        $pagamentoDto = null;
        if ($pagamento) {
            $usuarioPagamento = $this->repositorioUsuario->buscarPorId($pagamento['usuario_responsavel']);
            $pagamentoDto = [
                'id' => $pagamento['id'],
                'dataHora' => $pagamento['data_hora'],
                'valor' => $pagamento['valor'],
                'metodo' => $pagamento['metodo'],
                'usuarioResponsavel' => [
                    'id' => $usuarioPagamento['id'],
                    'nome' => $usuarioPagamento['nome'],
                    'cpf' => $usuarioPagamento['cpf'],
                    'email' => $usuarioPagamento['email']
                ]
            ];
        }
        $osDto = new OsDto(
            $os['id'],
            $os['status'],
            $os['data_hora_criacao'],
            $os['data_hora_finalizacao'] ?? null,
            $os['previsao_entrega_sugerida'],
            $os['previsao_entrega'],
            $os['valor_mao_obra_sugerido'],
            $os['valor_mao_obra'],
            $os['valor_estimado_sugerido'],
            $os['valor_estimado'],
            $os['valor_final'],
            $os['observacoes'],
            $clienteDto->arrayDados(),
            $veiculoDto->arrayDados(),
            $usuarioCriacaoDto->arrayDados(),
            $usuarioResponsavelDto->arrayDados(),
            $servicosDto,
            $custosDto,
            [],
            $laudoDto,
            $pagamentoDto
        );
        return $osDto->arrayDados();
    }

    public function buscarServicos(string $termo, string $cargoUsuarioLogado): array {
        $servicos = $this->repositorioServico->buscarPorTermo($termo);
        $servicosDto = [];
        foreach ($servicos as $servico) {
            $tarefasDto = [];
            foreach ($servico['tarefas'] as $tarefa) {
                $tarefaDto = new TarefaDto(
                    $tarefa['id'], 
                    $tarefa['descricao'], 
                    ( (int)$tarefa['ordenacao'] )
                );
                $tarefasDto[] = $tarefaDto->arrayDados();
            }
            $dto = new ServicoDto(
                ( (int)$servico['id'] ), 
                $servico['descricao'], 
                ( (float)$servico['valor_mao_obra'] ), 
                ( (int)$servico['execucao_minutos'] ), 
                $tarefasDto
            );
            $servicosDto[] = $dto->arrayDados();
        }
        return $servicosDto;
    }

    public function adicionarServico(int $id, array $dados, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);
        if (!$dados['id']) {
            throw DominioException::comProblemas( ['Serviço não informado.'] );
        }
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $servico = $this->repositorioServico->buscarPorId($dados['id']);
        if ( empty($servico) ) {
            throw DominioException::comProblemas( ['Serviço não encontrado.'] );
        }
        $servicosExistentes = $this->repositorioOs->buscarServicosPorOs($id);
        foreach ($servicosExistentes as $servicoExistente) {
            if ($servicoExistente['servico_id'] == $dados['id']) {
                throw DominioException::comProblemas( ['Este serviço já foi adicionado à OS.'] );
            }
        }
        $tarefas = $this->repositorioServico->buscarTarefasPorServico($servico['id']);
        $this->transacao->iniciar();
        try {
            $osServicoId = $this->repositorioOs->salvarServico($id, $servico['id']);
            foreach ($tarefas as $tarefa) {
                $this->repositorioOs->salvarTarefa($osServicoId, $tarefa['descricao'], $tarefa['ordenacao']);
            }
            $novoValorMaoObra = ( (float)$os['valor_mao_obra'] + (float)$servico['valor_mao_obra'] );
            $this->repositorioOs->atualizarMaoObra($id, $novoValorMaoObra);
            $this->atualizarValoresAposServico($id);
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    public function removerServico(int $id, int $servicoId, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $servicosAtuais = $this->repositorioOs->buscarServicosPorOs($id);
        if (count($servicosAtuais) <= 1) {
            throw DominioException::comProblemas( ['A OS deve haver pelo menos um serviço.'] );
        }
        $this->transacao->iniciar();
        try {
            $osServico = $this->repositorioOs->buscarOsServico($id, $servicoId);
            if (!empty($osServico)) {
                $tarefas = $this->repositorioOs->buscarTarefasPorServico($osServico['id']);
                foreach ($tarefas as $tarefa) {
                    $produtosVinculadosServico = $this->repositorioOsCusto->buscarProdutosPorTarefa($tarefa['id']);
                    foreach ($produtosVinculadosServico as $produto) {
                        $item = $this->repositorioItem->buscarPorId($produto['item_id']);
                        if ($item) {
                            $novoEstoque = ($item['estoque'] + $produto['quantidade']);
                            $this->repositorioItem->atualizarEstoque($item['id'], $novoEstoque);
                        }
                        $this->repositorioOsCusto->remover($produto['id']);
                    }
                }
            }
            $this->repositorioOs->removerServico($id, $servicoId);
            $this->atualizarValoresAposServico($id);
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    private function atualizarValoresAposServico(int $idOs) {
        $servicos = $this->repositorioOs->buscarServicosPorOs($idOs);
        $valorMaoObraSugerido = 0;
        $minutosTotais = 0;
        foreach ($servicos as $servico) {
            $servicoBase = $this->repositorioServico->buscarPorId($servico['servico_id']);
            $valorMaoObraSugerido += $servicoBase['valor_mao_obra'];
            $minutosTotais += $servicoBase['execucao_minutos'];
        }
        $this->repositorioOs->atualizarValorMaoObraSugerido($idOs, $valorMaoObraSugerido);
        $this->repositorioOs->atualizarMaoObra($idOs, $valorMaoObraSugerido);
        $dataCriacao = new DateTime();
        $previsaoSugerida = new DateTime();
        $previsaoEntrega = new DateTime();
        $previsaoSugerida->modify("+{$minutosTotais} minutes");
        $previsaoEntrega = clone $previsaoSugerida;
        $this->repositorioOs->atualizarPrevisaoSugerida($idOs, $previsaoSugerida->format('Y-m-d H:i:s'));
        $this->repositorioOs->atualizarDataEntrega($idOs, $previsaoEntrega->format('Y-m-d H:i:s'));
        $this->atualizarValorEstimado($idOs);
    }

    public function adicionarTarefa(int $id, int $servicoId, string $descricao, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);
        if ( empty($descricao) ) {
            throw DominioException::comProblemas( ['Descrição da tarefa não informada.'] );
        }
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $this->transacao->iniciar();
        try {
            $osServico = $this->repositorioOs->buscarOsServico($id, $servicoId);
            if ( empty($osServico) ) {
                throw DominioException::comProblemas( ['Serviço não encontrado na OS.'] );
            }
            $tarefasExistentes = $this->repositorioOs->buscarTarefasPorServico($osServico['id']);
            foreach ($tarefasExistentes as $tarefaExistente) {
                if ($tarefaExistente['descricao'] === $descricao) {
                    throw DominioException::comProblemas( ['Já existe uma tarefa com esta descrição no serviço.'] );
                }
            }
            $ultimaOrdenacao = $this->repositorioOs->buscarUltimaOrdenacaoTarefa($osServico['id']);
            $ordenacao = ($ultimaOrdenacao + 1);
            $this->repositorioOs->salvarTarefa($osServico['id'], $descricao, $ordenacao);
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    public function reordenarTarefa(int $id, array $dados, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);
        if ( empty($dados['servicoId']) || empty($dados['origemTarefaId']) ) {
            throw DominioException::comProblemas( ['Dados de reordenação incompletos.'] );
        }
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $osServico = $this->repositorioOs->buscarOsServico($id, $dados['servicoId']);
        if ( empty($osServico) ) {
            throw DominioException::comProblemas( ['Serviço não encontrado na OS.'] );
        }
        $this->transacao->iniciar();
        try {
            $tarefas = $this->repositorioOs->buscarTarefasPorServico($osServico['id']);
            $tarefaOrigem = null;
            foreach ($tarefas as $indice => $tarefa) {
                if ($tarefa['id'] == $dados['origemTarefaId']) {
                    $tarefaOrigem = $tarefa;
                    unset($tarefas[$indice]);
                    break;
                }
            }
            if ($tarefaOrigem === null) {
                throw DominioException::comProblemas( ['Tarefa origem não encontrada.'] );
            }
            $tarefas = array_values($tarefas);
            if (!empty($dados['destinoTarefaId'])) {
                $novaPosicao = 0;
                foreach ($tarefas as $indice => $tarefa) {
                    if ($tarefa['id'] == $dados['destinoTarefaId']) {
                        $novaPosicao = $indice;
                        break;
                    }
                }
                array_splice($tarefas, $novaPosicao, 0, [$tarefaOrigem]);
            } else {
                $tarefas[] = $tarefaOrigem;
            }
            for ($ordem = 0; $ordem < count($tarefas); $ordem++) {
                $this->repositorioOs->atualizarOrdenacaoTarefa($tarefas[$ordem]['id'], $ordem + 1);
            }
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    public function removerTarefa(int $id, int $servicoId, int $tarefaId, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $this->transacao->iniciar();
        try {
            $osServico = $this->repositorioOs->buscarOsServico($id, $servicoId);
            if ( empty($osServico) ) {
                throw DominioException::comProblemas( ['Serviço não encontrado na OS.'] );
            }
            $tarefas = $this->repositorioOs->buscarTarefasPorServico($osServico['id']);
            if (count($tarefas) <= 1) {
                throw DominioException::comProblemas( ['O serviço deve haver pelo menos uma tarefa..'] );
            }
            $produtosVinculadosTarefa = $this->repositorioOsCusto->buscarProdutosPorTarefa($tarefaId);
            foreach ($produtosVinculadosTarefa as $produto) {
                $item = $this->repositorioItem->buscarPorId($produto['item_id']);
                if ($item) {
                    $novoEstoque = ( $item['estoque'] + $produto['quantidade'] );
                    $this->repositorioItem->atualizarEstoque($item['id'], $novoEstoque);
                }
                $this->repositorioOsCusto->remover($produto['id']);
            }
            $this->repositorioOs->removerTarefa($id, $servicoId, $tarefaId);
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    public function adicionarProduto(int $id, array $dados, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);
        if (empty($dados['produtoId']) || empty($dados['servicoId']) || empty($dados['tarefaId']) || empty($dados['quantidade'])) {
            throw DominioException::comProblemas( ['Dados do produto incompletos.'] );
        }
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $item = $this->repositorioItem->buscarPorId($dados['produtoId']);
        if ( empty($item) ) {
            throw DominioException::comProblemas( ['Produto não encontrado.'] );
        }
        $quantidadeSolicitada = ( (int)$dados['quantidade'] );
        if ($quantidadeSolicitada <= 0) {
            throw DominioException::comProblemas( ['Quantidade inválida.'] );
        }
        if ($item['estoque'] < $quantidadeSolicitada) {
            throw DominioException::comProblemas( ['Estoque insuficiente para o produto solicitado.'] );
        }
        $osServico = $this->repositorioOs->buscarOsServico($id, $dados['servicoId']);
        if ( empty($osServico) ) {
            throw DominioException::comProblemas( ['Serviço não encontrado na OS.'] );
        }
        $subtotal = ( $item['preco_venda'] * $quantidadeSolicitada );
        $this->transacao->iniciar();
        try {
            $novoEstoque = ( $item['estoque'] - $quantidadeSolicitada );
            $this->repositorioItem->atualizarEstoque($dados['produtoId'], $novoEstoque);
            $this->repositorioOsCusto->salvar( [
                'os_id' => $id,
                'os_tarefa_id' => $dados['tarefaId'],
                'item_id' => $dados['produtoId'],
                'tipo' => 'ITEM',
                'descricao' => $item['titulo'],
                'quantidade' => $quantidadeSolicitada,
                'subtotal' => $subtotal
            ] );
            $this->atualizarValorEstimado($id);
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    public function removerProduto(int $id, array $dados, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);
        if (empty($dados['produtoId']) || empty($dados['servicoId']) || empty($dados['tarefaId'])) {
            throw DominioException::comProblemas( ['Dados do produto incompletos.'] );
        }
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $this->transacao->iniciar();
        try {
            $custo = $this->repositorioOsCusto->buscarProduto($dados['produtoId'], $dados['tarefaId']);
            if ($custo) {
                $item = $this->repositorioItem->buscarPorId($dados['produtoId']);
                $novoEstoque = ( $item['estoque'] + $custo['quantidade'] );
                $this->repositorioItem->atualizarEstoque($dados['produtoId'], $novoEstoque);
                $this->repositorioOsCusto->remover($custo['id']);
                $this->atualizarValorEstimado($id);
            }
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    public function adicionarExtra(int $id, array $dados, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);
        if (empty($dados['descricao']) || empty($dados['valor']) || empty($dados['quantidade'])) {
            throw DominioException::comProblemas( ['Dados do custo extra incompletos.'] );
        }
        if ($dados['valor'] <= 0 || $dados['quantidade'] <= 0) {
            throw DominioException::comProblemas( ['Valor e quantidade devem ser maiores que zero.'] );
        }
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $subtotal = ( $dados['valor'] * $dados['quantidade'] );
        $this->transacao->iniciar();
        try {
            $this->repositorioOsCusto->salvar( [
                'os_id' => $id,
                'tipo' => 'EXTRA',
                'descricao' => $dados['descricao'],
                'quantidade' => $dados['quantidade'],
                'subtotal' => $subtotal
            ] );
            $this->atualizarValorEstimado($id);
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    public function removerExtra(int $id, int $extraId, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $this->transacao->iniciar();
        try {
            $this->repositorioOsCusto->remover($extraId);
            $this->atualizarValorEstimado($id);
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    public function atualizarStatus(int $id, string $status, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);   
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $this->validarTransicaoStatus($os['status'], $status, $cargoUsuarioLogado);
        $this->transacao->iniciar();
        try {
            $this->repositorioOs->atualizarStatus($id, $status);
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    private function validarTransicaoStatus(string $statusAtual, string $novoStatus, string $cargoUsuarioLogado) {
        $transicoesPermitidas = [
            'PROVISORIA' => ['ANDAMENTO', 'CANCELADA'],
            'ANDAMENTO' => ['ALERTA', 'CONCLUIDA', 'CANCELADA'],
            'ALERTA' => ['ANDAMENTO'],
            'CONCLUIDA' => ['FINALIZADA'],
            'FINALIZADA' => [],
            'CANCELADA' => []
        ];
        if ( !in_array($novoStatus, $transicoesPermitidas[$statusAtual]) ) {
            throw DominioException::comProblemas( ["Transição de status {$statusAtual} para {$novoStatus} não é permitida."] );
        }
        if ($statusAtual === 'PROVISORIA' && $novoStatus === 'ANDAMENTO') {
            if ($cargoUsuarioLogado !== 'ATENDENTE' && $cargoUsuarioLogado !== 'GERENTE') {
                throw new AutenticacaoException('Permissão negada.');
            }
        }
        if ($statusAtual === 'ANDAMENTO' && $novoStatus === 'ALERTA') {
            if ($cargoUsuarioLogado !== 'MECANICO' && $cargoUsuarioLogado !== 'GERENTE') {
                throw new AutenticacaoException('Permissão negada.');
            }
        }
        if ($statusAtual === 'ALERTA' && $novoStatus === 'ANDAMENTO') {
            if ($cargoUsuarioLogado !== 'GERENTE') {
                throw new AutenticacaoException('Permissão negada.');
            }
        }
    }

    public function atualizarMaoObra(int $id, float $valor, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);        
        if ($valor < 0) {
            throw DominioException::comProblemas( ['Valor da mão de obra não pode ser negativo.'] );
        }
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $this->transacao->iniciar();
        try {
            $this->repositorioOs->atualizarMaoObra($id, $valor);
            $this->atualizarValorEstimado($id);
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    public function atualizarDataEntrega(int $id, string $data, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);
        try {
            $dataObj = new DateTime($data);
        } catch (Exception $e) {
            throw DominioException::comProblemas( ['Data de entrega inválida.'] );
        }
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $dataCriacao = new DateTime($os['data_hora_criacao']);
        if ($dataObj <= $dataCriacao) {
            throw DominioException::comProblemas( ['Data de entrega deve ser posterior à data de criação.'] );
        }
        if( $dataObj < new DateTime() ) {
            throw DominioException::comProblemas( ['Data de entrega não pode ser no passado.'] );
        }
        $this->transacao->iniciar();
        try {
            $this->repositorioOs->atualizarDataEntrega($id, $dataObj->format('Y-m-d H:i:s'));
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    public function atualizarObservacoes(int $id, string $observacoes, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);
        if (strlen($observacoes) > 2000) {
            throw DominioException::comProblemas( ['Observações não podem exceder 2000 caracteres.'] );
        }
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $this->transacao->iniciar();
        try {
            $this->repositorioOs->atualizarObservacoes($id, $observacoes);
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    public function concluirOsComLaudo(int $id, array $dados, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $this->validarPermissaoEdicao($id, $idUsuarioLogado, $cargoUsuarioLogado);
        if ( empty($dados['resumo']) || empty($dados['recomendacoes']) ) {
            throw DominioException::comProblemas( ['É obrigatório preencher o resumo e recomendações para o laudo.'] );
        }
        if (strlen($observacoes) > 2000 || strlen($dados['resumo']) > 2000) {
            throw DominioException::comProblemas( ['Resumo ou observações do laudo não podem exceder 2000 caracteres.'] );
        }
        $os = $this->repositorioOs->buscarPorId($id);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        if ($os['status'] !== 'ANDAMENTO' && $os['status'] !== 'ALERTA') {
            throw DominioException::comProblemas( ['OS deve estar em ANDAMENTO ou ALERTA para ser concluída.'] );
        }
        $this->transacao->iniciar();
        try {
            $this->repositorioLaudo->salvar( [
                'os_id' => $id,
                'resumo' => $dados['resumo'],
                'recomendacoes' => $dados['recomendacoes']
            ] );
            $this->repositorioOs->atualizarStatus($id, 'CONCLUIDA');
            $this->transacao->finalizar();
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }

    public function obterLaudo(int $id) {
        $laudo = $this->repositorioLaudo->buscarPorOs($id);
        if ( empty($laudo) ) {
            throw DominioException::comProblemas( ['Laudo não encontrado.'] );
        }
        return [
            'id' => $laudo['id'],
            'resumo' => $laudo['resumo'],
            'recomendacoes' => $laudo['recomendacoes']
        ];
    }

    private function validarPermissaoEdicao(int $idOs, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        $os = $this->repositorioOs->buscarPorId($idOs);
        if ( empty($os) ) {
            throw DominioException::comProblemas( ['OS não encontrada.'] );
        }
        $status = $os['status'];
        if ($status === 'CONCLUIDA' || $status === 'FINALIZADA' || $status === 'CANCELADA') {
            throw DominioException::comProblemas( ['OS não pode ser editada neste status.'] );
        }
        if ($cargoUsuarioLogado === 'GERENTE') {
            return;
        }
        if ($cargoUsuarioLogado === 'MECANICO') {
            if ( intval($os['usuario_responsavel']) !== intval($idUsuarioLogado) ) {
                throw new AutenticacaoException('Permissão negada.');
            }
            return;
        }
        if($cargoUsuarioLogado === 'ATENDENTE') {
            if ($status === 'PROVISORIA') {
                return;
            } else {
                throw new AutenticacaoException('Permissão negada.');
            }
        }
        throw new AutenticacaoException('Permissão negada.');
    }

    private function atualizarValorEstimado(int $idOs) {
        $os = $this->repositorioOs->buscarPorId($idOs);
        $servicos = $this->repositorioOs->buscarServicosPorOs($idOs);
        $custos = $this->repositorioOsCusto->buscarPorOs($idOs);
        $valorMaoObra = $os['valor_mao_obra'];
        $valorProdutosExtras = 0;
        foreach ($custos as $custo) {
            $valorProdutosExtras += $custo['subtotal'];
        }
        $valorEstimado = $valorMaoObra + $valorProdutosExtras;
        $this->repositorioOs->atualizarValorEstimado($idOs, $valorEstimado);
    }
    
}


?>