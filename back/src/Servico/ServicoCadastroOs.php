<?php


namespace App\Servico;
use App\Transacao\Transacao;
use App\Excecao\DominioException;
use App\Excecao\AutenticacaoException;
use App\Repositorio\RepositorioCliente;
use App\Repositorio\RepositorioItem;
use App\Repositorio\RepositorioOs;
use App\Repositorio\RepositorioOsCusto;
use App\Repositorio\RepositorioUsuario;
use App\Repositorio\RepositorioVeiculo;
use App\Dto\ItemDto;
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
    private RepositorioUsuario $repositorioUsuario;
    private RepositorioVeiculo $repositorioVeiculo;

    public function __construct (
        Transacao $transacao,
        RepositorioCliente $repositorioCliente,
        RepositorioItem $repositorioItem,
        RepositorioOs $repositorioOs,
        RepositorioOsCusto $repositorioOsCusto,
        RepositorioUsuario $repositorioUsuario,
        RepositorioVeiculo $repositorioVeiculo
    ) {
        $this->transacao = $transacao;
        $this->repositorioCliente = $repositorioCliente;
        $this->repositorioItem = $repositorioItem;
        $this->repositorioOs = $repositorioOs;
        $this->repositorioOsCusto = $repositorioOsCusto;
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
            $dto = new UsuarioDto(
                ( (int)$mecanico['id'] ),
                $mecanico['cpf'],
                $mecanico['nome'],
                $mecanico['email'],
                $mecanico['cargo']
            );
            $usuariosDTO[] = $dto->arrayDados();
        }
        return $usuariosDTO;
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
        if (empty($dados['clienteId']) || empty($dados['veiculoId']) || empty($dados['responsavelId']) || empty($dados['previsaoEntrega'])) {
            throw DominioException::comProblemas( ['Dados obrigatórios não informados.'] );
        }
        $entidades = $this->validarEntidades($dados, $idUsuarioLogado);
        $cliente = $entidades['cliente'];
        $veiculo = $entidades['veiculo'];
        $usuResp = $entidades['usuResp'];
        $usuCriacao = $entidades['usuCriacao'];
        $previsaoEntrega = new DateTime($dados['previsaoEntrega']);
        if ($this->repositorioOs->existeAtivaPeriodo($dados['veiculoId'], $previsaoEntrega->format('Y-m-d H:i:s'))) {
            throw DominioException::comProblemas( ['Já existe uma OS ativa para este veículo no período informado.'] );
        }
        $valores = $this->validarCustos($dados);
        $itensValidados = $valores['itensValidados'];
        $valorEstimado = $valores['valorEstimado'];
        $clienteObj = $this->mapearCliente($cliente['cpf'], $cliente['nome'], $cliente['telefone'], $cliente['email']);
        $usuCriacaoObj = $this->mapearUsuario($usuCriacao['cpf'], $usuCriacao['nome'], $usuCriacao['email'], $usuCriacao['cargo'], $usuCriacao['ativo']);
        $usuarioResponsavelObj = $this->mapearUsuario($usuResp['cpf'], $usuResp['nome'], $usuResp['email'], $usuResp['cargo'], $usuResp['ativo']);
        $veiculoObj = $this->mapearVeiculo($clienteObj, $veiculo['placa'], $veiculo['chassi'], $veiculo['fabricante'], $veiculo['modelo'], ( (int)$veiculo['ano'] ), ( (int)$veiculo['quilometragem'] ));
        $osObj = $this->mapearOs($clienteObj, $veiculoObj, $usuCriacaoObj, $usuarioResponsavelObj, 'PROVISORIA', $previsaoEntrega, $valorEstimado, $dados['observacoes'] ?? null);
        $problemas = $osObj->validar();
        if (!empty($problemas)) {
            throw DominioException::comProblemas( $problemas );
        }
        return $this->persistirOs($dados, $idUsuarioLogado, $itensValidados, $valorEstimado);
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

    private function validarCustos(array $dados) {
        if (empty($dados['itens']) && empty($dados['custos'])) {
            throw DominioException::comProblemas( ['Nenhum item ou custo encontrado.'] );
        }
        $itensValidados = [];
        $valorEstimado = 0;
        foreach ($dados['itens'] as $item) {
            $item = ( (array)$item );
            $itemExistente = $this->repositorioItem->buscarPorId($item['id']);
            if (!$itemExistente) {
                throw new DominioException( ["Item {$item['codigo']} não encontrado."] );
            }
            if ($item['quantidade'] > $itemExistente['estoque']) {
                throw new DominioException( ["Quantidade solicitada para {$item['codigo']} excede o estoque disponível."] );
            }
            $valorEstimado += ( $itemExistente['preco_venda'] * $item['quantidade'] );
            $itensValidados[] = [
                'id' => $itemExistente['id'],
                'titulo' => $itemExistente['titulo'],
                'precoVenda' => $itemExistente['preco_venda'],
                'estoque' => $itemExistente['estoque'],
                'quantidade' => $item['quantidade']
            ];
        }
        foreach ($dados['custos'] as $custo) {
            $custo = ( (array)$custo );
            $valorEstimado += $custo['subtotal'];
        }
        return [
            'itensValidados' => $itensValidados,
            'valorEstimado' => $valorEstimado
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

    private function mapearOs(Cliente $cli, Veiculo $vei, Usuario $usuarioC, Usuario $usuarioR, string $status, DateTime $previsaoEntrega, float $valorE, ?string $obs): Os {
        return new Os(0, $cli, $vei, $usuarioC, $usuarioR, $status, new DateTime(), $previsaoEntrega, $valorE, 0, $obs);
    }

    private function persistirOs(array $dados, int $idUsuarioLogado, array $itensValidados, float $valorEstimado) {
        $this->transacao->iniciar();
        try {
            $osId = $this->repositorioOs->salvar( [
                'cliente_id' => $dados['clienteId'],
                'veiculo_id' => $dados['veiculoId'],
                'usuario_criacao' => $idUsuarioLogado,
                'usuario_responsavel' => $dados['responsavelId'],
                'status' => 'PROVISORIA',
                'previsao_entrega' => ( new DateTime($dados['previsaoEntrega']) )->format('Y-m-d H:i:s'),
                'valor_estimado' => $valorEstimado,
                'valor_final' => 0,
                'observacoes' => $dados['observacoes'] ?? null
            ] );
            foreach ($itensValidados as $itemValidado) {
                $this->repositorioOsCusto->salvar( [
                    'os_id' => $osId,
                    'item_id' => $itemValidado['id'],
                    'tipo' => 'ITEM',
                    'descricao' => $itemValidado['titulo'],
                    'quantidade' => $itemValidado['quantidade'],
                    'subtotal' => ($itemValidado['precoVenda'] * $itemValidado['quantidade'])
                ] );
                $novoEstoque = ($itemValidado['estoque'] - $itemValidado['quantidade']);
                $this->repositorioItem->atualizarEstoque($itemValidado['id'], $novoEstoque);
            }
            foreach ($dados['custos'] as $custo) {
                $custo = ( (array)$custo );
                $this->repositorioOsCusto->salvar( [
                    'os_id' => $osId,
                    'item_id' => null,
                    'tipo' => $custo['tipo'],
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