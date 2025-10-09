<?php


namespace App\Servico;
use App\Excecao\DominioException;
use App\Excecao\AutenticacaoException;
use App\Repositorio\RepositorioCliente;
use App\Repositorio\RepositorioItem;
use App\Repositorio\RepositorioLaudo;
use App\Repositorio\RepositorioOs;
use App\Repositorio\RepositorioOsCusto;
use App\Repositorio\RepositorioPagamento;
use App\Repositorio\RepositorioUsuario;
use App\Repositorio\RepositorioVeiculo;
use App\Dto\ClienteDto;
use App\Dto\ItemDto;
use App\Dto\OsDto;
use App\Dto\UsuarioDto;
use App\Dto\VeiculoDto;
use Throwable;
use DateTime;


class ServicoExibicaoEdicaoOs {
    
    private RepositorioCliente $repositorioCliente;
    private RepositorioItem $repositorioItem;
    private RepositorioLaudo $repositorioLaudo;
    private RepositorioOs $repositorioOs;
    private RepositorioOsCusto $repositorioOsCusto;
    private RepositorioPagamento $repositorioPagamento;
    private RepositorioUsuario $repositorioUsuario;
    private RepositorioVeiculo $repositorioVeiculo;

    public function __construct (
        RepositorioCliente $repositorioCliente,
        RepositorioItem $repositorioItem,
        RepositorioLaudo $repositorioLaudo,
        RepositorioOs $repositorioOs,
        RepositorioOsCusto $repositorioOsCusto,
        RepositorioPagamento $repositorioPagamento,
        RepositorioUsuario $repositorioUsuario,
        RepositorioVeiculo $repositorioVeiculo
    ) {
        $this->repositorioCliente = $repositorioCliente;
        $this->repositorioItem = $repositorioItem;
        $this->repositorioLaudo = $repositorioLaudo;
        $this->repositorioOs = $repositorioOs;
        $this->repositorioOsCusto = $repositorioOsCusto;
        $this->repositorioPagamento = $repositorioPagamento;
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
        $custos = $this->repositorioOsCusto->buscarPorOsId($os['id']);
        $itens = [];
        $custosOutros = [];
        foreach ($custos as $custo) {
            if ($custo['tipo'] === 'ITEM' && $custo['item_id']) {
                $item = $this->repositorioItem->buscarPorId($custo['item_id']);
                if ($item) {
                    $itens[] = [
                        'id' => $custo['id'],
                        'codigo' => $item['codigo'],
                        'titulo' => $item['titulo'],
                        'fabricante' => $item['fabricante'],
                        'precoVenda' => $item['preco_venda'],
                        'quantidade' => $custo['quantidade'],
                        'subtotal' => $custo['subtotal']
                    ];
                }
            } else {
                $custosOutros[] = [
                    'id' => $custo['id'],
                    'tipo' => $custo['tipo'],
                    'descricao' => $custo['descricao'],
                    'quantidade' => $custo['quantidade'],
                    'subtotal' => $custo['subtotal']
                ];
            }
        }
        $laudo = $this->repositorioLaudo->buscarPorOsId($os['id']);
        $pagamento = $this->repositorioPagamento->buscarPorOsId($os['id']);
        $clienteDto = new ClienteDto(
            (int)$cliente['id'],
            $cliente['cpf'],
            $cliente['nome'],
            $cliente['telefone'],
            $cliente['email']
        );
        $veiculoDto = new VeiculoDto(
            (int)$veiculo['id'],
            (int)$veiculo['cliente_id'],
            $veiculo['placa'],
            $veiculo['chassi'],
            $veiculo['fabricante'],
            $veiculo['modelo'],
            (int)$veiculo['ano'],
            (int)$veiculo['quilometragem']
        );
        $usuarioCriacaoDto = new UsuarioDto(
            (int)$usuarioCriacao['id'],
            $usuarioCriacao['cpf'],
            $usuarioCriacao['nome'],
            $usuarioCriacao['email'],
            $usuarioCriacao['cargo'],
            (bool)$usuarioCriacao['ativo']
        );
        $usuarioResponsavelDto = new UsuarioDto(
            (int)$usuarioResponsavel['id'],
            $usuarioResponsavel['cpf'],
            $usuarioResponsavel['nome'],
            $usuarioResponsavel['email'],
            $usuarioResponsavel['cargo'],
            (bool)$usuarioResponsavel['ativo']
        );
        $osDto = new OsDto(
            (int)$os['id'],
            $os['status'],
            $os['data_hora_criacao'],
            $os['previsao_entrega'],
            (float)$os['valor_estimado'],
            (float)$os['valor_final'],
            $os['observacoes'],
            $clienteDto->arrayDados(),
            $veiculoDto->arrayDados(),
            $usuarioCriacaoDto->arrayDados(),
            $usuarioResponsavelDto->arrayDados(),
            !empty($itens) ? $itens : null,
            !empty($custosOutros) ? $custosOutros : null,
            $laudo,
            $pagamento
        );
        return $osDto->arrayDados();
    }

}


?>