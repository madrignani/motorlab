<?php


namespace App\Servico;
use App\Transacao\Transacao;
use App\Excecao\DominioException;
use App\Excecao\AutenticacaoException;
use App\Repositorio\RepositorioCliente;
use App\Repositorio\RepositorioItem;
use App\Repositorio\RepositorioOs;
use App\Repositorio\RepositorioOsCusto;
use App\Repositorio\RepositorioServico;
use App\Repositorio\RepositorioUsuario;
use App\Repositorio\RepositorioVeiculo;
use App\Dto\ItemDto;
use App\Dto\ServicoDto;
use App\Dto\TarefaDto;
use App\Dto\UsuarioDto;
use App\Dto\VeiculoDto;
use App\Modelo\Cliente;
use App\Modelo\Os;
use App\Modelo\Usuario;
use App\Modelo\Veiculo;
use Throwable;
use DateTime;


class ServicoCadastroOs {
    
    private Transacao $transacao;
    private RepositorioCliente $repositorioCliente;
    private RepositorioItem $repositorioItem;
    private RepositorioOs $repositorioOs;
    private RepositorioOsCusto $repositorioOsCusto;
    private RepositorioServico $repositorioServico;
    private RepositorioUsuario $repositorioUsuario;
    private RepositorioVeiculo $repositorioVeiculo;

    public function __construct (
        Transacao $transacao,
        RepositorioCliente $repositorioCliente,
        RepositorioItem $repositorioItem,
        RepositorioOs $repositorioOs,
        RepositorioOsCusto $repositorioOsCusto,
        RepositorioServico $repositorioServico,
        RepositorioUsuario $repositorioUsuario,
        RepositorioVeiculo $repositorioVeiculo
    ) {
        $this->transacao = $transacao;
        $this->repositorioCliente = $repositorioCliente;
        $this->repositorioItem = $repositorioItem;
        $this->repositorioOs = $repositorioOs;
        $this->repositorioOsCusto = $repositorioOsCusto;
        $this->repositorioServico = $repositorioServico;
        $this->repositorioUsuario = $repositorioUsuario;
        $this->repositorioVeiculo = $repositorioVeiculo;
    }

    public function buscarVeiculosPorCliente(int $idCliente, string $cargoUsuarioLogado): array {
        if ($cargoUsuarioLogado !== 'ATENDENTE' && $cargoUsuarioLogado !== 'GERENTE') {
            throw new AutenticacaoException('Permissão negada.');
        }
        $veiculos = $this->repositorioVeiculo->buscarPorCliente($idCliente);
        if ( empty($veiculos) ) {
            return [];
        }
        $dto = [];
        foreach ($veiculos as $veiculo) {
            $i = new VeiculoDTO( $veiculo['id'], $veiculo['cliente_id'], $veiculo['placa'], $veiculo['chassi'], $veiculo['fabricante'], $veiculo['modelo'], $veiculo['ano'], $veiculo['quilometragem'] );
            $dto[] = $i->arrayDados();
        }
        return $dto;
    }

    public function listarResponsaveis(string $cargoUsuarioLogado): array {
        if ($cargoUsuarioLogado !== 'ATENDENTE' && $cargoUsuarioLogado !== 'GERENTE') {
            throw new AutenticacaoException('Permissão negada.');
        }
        $mecanicos = $this->repositorioUsuario->listarMecanicos();
        $usuariosDTO = [];
        foreach ($mecanicos as $mecanico) {
            $disponivel = true;
            if ($this->repositorioOs->existeAtivaPorResponsavel( (int)$mecanico['id']) ) {
                $disponivel = false;
            }
            $dto = new UsuarioDto(
                ( (int)$mecanico['id'] ),
                $mecanico['cpf'],
                $mecanico['nome'],
                $mecanico['email'],
                $mecanico['cargo'],
                $disponivel
            );
            $usuariosDTO[] = $dto->arrayDados();
        }
        return $usuariosDTO;
    }

    public function buscarServicos(string $termo, string $cargoUsuarioLogado): array {
        if ($cargoUsuarioLogado !== 'ATENDENTE' && $cargoUsuarioLogado !== 'GERENTE') {
            throw new AutenticacaoException('Permissão negada.');
        }
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

    public function buscarItemPorCodigo(string $codigo): array {
        $dados = $this->repositorioItem->buscarPorCodigo($codigo);
        if ( empty($dados) ) {
            return [];
        }
        $itemDto = new ItemDto(
            ( (int)$dados['id'] ),
            $dados['codigo'],
            $dados['titulo'],
            $dados['fabricante'],
            $dados['descricao'],
            ( (float)$dados['preco_venda'] ),
            ( (int)$dados['estoque'] ),
            ( (int)$dados['estoque_minimo'] ),
            $dados['localizacao']
        );
        return $itemDto->arrayDados();
    }

    public function cadastrarOs(array $dados, int $idUsuarioLogado, string $cargoUsuarioLogado) {
        if ($cargoUsuarioLogado !== 'ATENDENTE' && $cargoUsuarioLogado !== 'GERENTE') {
            throw new AutenticacaoException( 'Permissão negada.' );
        }
        if (empty($dados['clienteId']) || empty($dados['veiculoId']) || empty($dados['responsavelId']) || empty($dados['servicos'])) {
            throw DominioException::comProblemas( ['Dados obrigatórios não informados.'] );
        }
        $entidades = $this->validarEntidades($dados, $idUsuarioLogado);
        $cliente = $entidades['cliente'];
        $veiculo = $entidades['veiculo'];
        $usuResp = $entidades['usuResp'];
        $usuCriacao = $entidades['usuCriacao'];
        $previsaoEntrega = $this->validarDataEntrega($dados['dataEntrega']);
        if ($this->repositorioOs->existeAtivaPeriodo($dados['veiculoId'], $previsaoEntrega->format('Y-m-d H:i:s'))) {
            throw DominioException::comProblemas( ['Já existe uma OS ativa para este veículo no período informado.'] );
        }
        $valores = $this->validarCustosEServicos($dados);
        $produtosValidados = $valores['produtosValidados'];
        $extrasValidados = $valores['extrasValidados'];
        $valorMaoObraSugerido = $valores['valorMaoObraSugerido'];
        $minutosTotais = $valores['minutosTotais'];
        $valorProdutosExtras = $valores['valorProdutosExtras'];
        $valorEstimadoSugerido = $valores['valorTotalEstimado'];
        $clienteObj = $this->mapearCliente($cliente['cpf'], $cliente['nome'], $cliente['telefone'], $cliente['email']);
        $usuCriacaoObj = $this->mapearUsuario($usuCriacao['cpf'], $usuCriacao['nome'], $usuCriacao['email'], $usuCriacao['cargo'], $usuCriacao['ativo']);
        $usuResponsavelObj = $this->mapearUsuario($usuResp['cpf'], $usuResp['nome'], $usuResp['email'], $usuResp['cargo'], $usuResp['ativo']);
        $veiculoObj = $this->mapearVeiculo($clienteObj, $veiculo['placa'], $veiculo['chassi'], $veiculo['fabricante'], $veiculo['modelo'], ( (int)$veiculo['ano'] ), ( (int)$veiculo['quilometragem'] ));
        $previsaoSugerida = new DateTime();
        if ($minutosTotais > 0) {
            $previsaoSugerida->modify("+{$minutosTotais} minutes");
        }
        $osObj = new Os(
            0,
            $clienteObj,
            $veiculoObj,
            $usuCriacaoObj,
            $usuResponsavelObj,
            'PROVISORIA',
            new DateTime(),
            $previsaoSugerida,
            $previsaoEntrega,
            $valorMaoObraSugerido,
            $dados['valorMaoObra'],
            $valorEstimadoSugerido,
            ( floatval($dados['valorMaoObra'] + $valorProdutosExtras) ),
            0.0,
            null,
            $dados['observacoes'] ?? null
        );
        $problemas = $osObj->validar();
        if (!empty($problemas)) {
            throw DominioException::comProblemas( $problemas );
        }
        return $this->persistirOsComDetalhes($dados, $idUsuarioLogado, $produtosValidados, $extrasValidados, $valorProdutosExtras, $valorMaoObraSugerido, $valorEstimadoSugerido, $previsaoSugerida, $previsaoEntrega);
    }

    private function validarEntidades(array $dados, int $idUsuarioLogado) {
        $cliente = $this->repositorioCliente->buscarPorId($dados['clienteId']);
        if (!$cliente) {
            throw DominioException::comProblemas( ['Cliente não encontrado.'] );
        }
        $veiculo = $this->repositorioVeiculo->buscarPorId($dados['veiculoId']);
        if (!$veiculo || $veiculo['cliente_id'] != $dados['clienteId']) {
            throw DominioException::comProblemas( ['Veículo não encontrado ou inválido.'] );
        }
        $usuResp = $this->repositorioUsuario->buscarPorId($dados['responsavelId']);
        if (!$usuResp || $usuResp['cargo'] !== 'MECANICO' || !$usuResp['ativo']) {
            throw DominioException::comProblemas( ['Responsável não encontrado ou inválido.'] );
        }
        $usuCriacao = $this->repositorioUsuario->buscarPorId($idUsuarioLogado);
        if (!$usuCriacao) {
            throw DominioException::comProblemas( ['Usuário de criação da OS não encontrado.'] );
        }
        return [
            'cliente' => $cliente,
            'veiculo' => $veiculo,
            'usuResp' => $usuResp,
            'usuCriacao' => $usuCriacao
        ];
    }

    private function validarDataEntrega(?string $dataStr): ?DateTime {
        if (empty($dataStr)) {
            throw DominioException::comProblemas( ['Previsão de entrega não informada.'] );
        }
        try {
            return new DateTime($dataStr);
        } catch (Exception $e) {
            throw DominioException::comProblemas( ['Erro ao formatar data previsão de entrega.'] );
        }
    }

    private function validarCustosEServicos(array $dados) {
        $produtosValidados = [];
        $extrasValidados = [];
        $valorMaoObraSugerido = 0.0;
        $minutosTotais = 0;
        $valorProdutosExtras = 0.0;
        $valorTotalEstimado = 0.0;
        $quantidadesPorItem = [];
        foreach ($dados['servicos'] as $servico) {
            $servico = ( (array)$servico );
            $servicoExistente = $this->repositorioServico->buscarPorId( (int)$servico['id'] );
            if (!$servicoExistente) {
                throw DominioException::comProblemas( ["Serviço ID {$servico['id']} não encontrado."] );
            }
            if (empty($servico['tarefas'])) {
                throw DominioException::comProblemas( ["Não é permitido haver serviço sem tarefas."] );
            }
            $valorMaoObraSugerido += $servicoExistente['valor_mao_obra'];
            $minutosTotais += $servicoExistente['execucao_minutos'];
            $valorTotalEstimado += $servicoExistente['valor_mao_obra'];
        }
        foreach ($dados['produtos'] as $produto) {
            $produto = ( (array)$produto );
            $itemExistente = $this->repositorioItem->buscarPorId( (int)$produto['id'] );
            if (!$itemExistente) {
                throw DominioException::comProblemas( ["Produto ID {$produto['id']} não encontrado."] );
            }
            if ($produto['quantidade'] <= 0) {
                throw DominioException::comProblemas( ["Quantidade inválida para o produto {$itemExistente['codigo']}."] );
            }
            $itemId = ( (int)$itemExistente['id'] );
            if (!isset($quantidadesPorItem[$itemId])) {
                $quantidadesPorItem[$itemId] = 0;
            }
            $quantidadesPorItem[$itemId] += $produto['quantidade'];
            if ($quantidadesPorItem[$itemId] > (int)$itemExistente['estoque']) {
                throw DominioException::comProblemas( ["Quantidade solicitada para o produto {$itemExistente['codigo']} excede o estoque disponível."] );
            }
            $subtotal = ( $itemExistente['preco_venda'] * $produto['quantidade'] );
            $valorProdutosExtras += $subtotal;
            $valorTotalEstimado += $subtotal;
            $produtosValidados[] = [
                'id' => $itemExistente['id'],
                'codigo' => $itemExistente['codigo'],
                'titulo' => $itemExistente['titulo'],
                'precoVenda' => $itemExistente['preco_venda'],
                'estoque' => $itemExistente['estoque'],
                'quantidade' => $produto['quantidade'],
                'subtotal' => $subtotal,
                'servicoId' => $produto['servicoId'] ?? null,
                'tarefaId' => $produto['tarefaId'] ?? null
            ];
        }
        $descricoesExtras = [];
        foreach ($dados['extras'] as $extra) {
            $extra = ( (array)$extra );
            if ($extra['quantidade'] <= 0 || $extra['valor'] < 0) {
                throw DominioException::comProblemas( ["Custo extra inválido."] );
            }
            if (in_array($extra['descricao'], $descricoesExtras)) {
                throw DominioException::comProblemas( ["Não é permitido haver custos extras com a mesma descrição."] );
            }
            $descricoesExtras[] = $extra['descricao'];
            $subtotal = ( $extra['valor'] * $extra['quantidade'] );
            $valorProdutosExtras += $subtotal;
            $valorTotalEstimado += $subtotal;
            $extrasValidados[] = [
                'descricao' => $extra['descricao'],
                'quantidade' => $extra['quantidade'],
                'valor' => $extra['valor'],
                'subtotal' => $subtotal,
                'tipo' => 'EXTRA'
            ];
        }
        return [
            'produtosValidados' => $produtosValidados,
            'extrasValidados' => $extrasValidados,
            'valorMaoObraSugerido' => $valorMaoObraSugerido,
            'minutosTotais' => $minutosTotais,
            'valorProdutosExtras' => $valorProdutosExtras,
            'valorTotalEstimado' => $valorTotalEstimado
        ];
    }

    private function mapearCliente(string $cpf, string $nome, string $telefone, string $email): Cliente {
        return new Cliente(0, $cpf, $nome, $telefone, $email);
    }

    private function mapearVeiculo(Cliente $cli, string $placa, string $chassi, string $fabricante, string $modelo, int $ano, int $quilometragem): Veiculo {
        return new Veiculo(0, $cli, $placa, $chassi, $fabricante, $modelo, $ano, $quilometragem);
    }

    private function mapearUsuario(string $cpf, string $nome, string $email, string $cargo, bool $ativo): Usuario {
        return new Usuario(0, $cpf, $nome, $email, $cargo, $ativo);
    }

    private function persistirOsComDetalhes(array $dados, int $idUsuarioLogado, array $produtosValidados, array $extrasValidados, float $valorProdutosExtras, float $valorMaoObraSugerido, float $valorEstimadoSugerido, DateTime $previsaoSugerida, DateTime $previsaoEntrega) {
        $this->transacao->iniciar();
        try {
            $osId = $this->repositorioOs->salvar( [
                'cliente_id' => $dados['clienteId'],
                'veiculo_id' => $dados['veiculoId'],
                'usuario_criacao' => $idUsuarioLogado,
                'usuario_responsavel' => $dados['responsavelId'],
                'status' => 'PROVISORIA',
                'previsao_entrega_sugerida' => $previsaoSugerida->format('Y-m-d H:i:s'),
                'previsao_entrega' => $previsaoEntrega->format('Y-m-d H:i:s'),
                'valor_mao_obra_sugerido' => $valorMaoObraSugerido,
                'valor_mao_obra' => $dados['valorMaoObra'],
                'valor_estimado_sugerido' => $valorEstimadoSugerido,
                'valor_estimado' => ( floatval($dados['valorMaoObra'] + $valorProdutosExtras) ),
                'valor_final' => 0,
                'observacoes' => $dados['observacoes'] ?? null,
            ] );
            $mapeamentoTarefas = [];
            foreach ($dados['servicos'] as $servico) {
                $servico = ( (array)$servico );
                $servId = ( (int)$servico['id'] );
                $osServicoId = $this->repositorioOs->salvarServico($osId, $servId);
                $ordenacao = 1;
                foreach ($servico['tarefas'] as $tarefa) {
                    $tarefa = ( (array)$tarefa );
                    $descricao = $tarefa['descricao'];
                    $osTarefaId = $this->repositorioOs->salvarTarefa($osServicoId, $descricao, $ordenacao);
                    $mapeamentoTarefas[ $tarefa['id'] ] = $osTarefaId;
                    $ordenacao++;
                }
            }
            foreach ($produtosValidados as $produto) {
                $osTarefaId = $mapeamentoTarefas[ $produto['tarefaId'] ] ?? null;
                $this->repositorioOsCusto->salvar( [
                    'os_id' => $osId,
                    'os_tarefa_id' => $osTarefaId,
                    'item_id' => $produto['id'],
                    'tipo' => 'ITEM',
                    'descricao' => $produto['titulo'],
                    'quantidade' => $produto['quantidade'],
                    'subtotal' => $produto['subtotal']
                ] );
                $novoEstoque = ($produto['estoque'] - $produto['quantidade']);
                $this->repositorioItem->atualizarEstoque($produto['id'], $novoEstoque);
            }
            foreach ($extrasValidados as $custo) {
                $this->repositorioOsCusto->salvar( [
                    'os_id' => $osId,
                    'os_tarefa_id' => null,
                    'item_id' => null,
                    'tipo' => 'EXTRA',
                    'descricao' => $custo['descricao'],
                    'quantidade' => $custo['quantidade'],
                    'subtotal' => $custo['subtotal']
                ] );
            }
            $this->transacao->finalizar();
            return $osId;
        } catch (Throwable $erro) {
            $this->transacao->desfazer();
            throw $erro;
        }
    }
    
}


?>