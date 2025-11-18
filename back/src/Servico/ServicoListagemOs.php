<?php


namespace App\Servico;
use App\Repositorio\RepositorioOs;
use App\Repositorio\RepositorioCliente;
use App\Repositorio\RepositorioVeiculo;
use App\Repositorio\RepositorioUsuario;
use App\Excecao\DominioException;
use App\Dto\OsDto;
use App\Dto\ClienteDto;
use App\Dto\VeiculoDto;
use App\Dto\UsuarioDto;


class ServicoListagemOs {

    private RepositorioOs $repositorioOs;
    private RepositorioCliente $repositorioCliente;
    private RepositorioVeiculo $repositorioVeiculo;
    private RepositorioUsuario $repositorioUsuario;

    public function __construct(
        RepositorioOs $repositorioOs,
        RepositorioCliente $repositorioCliente,
        RepositorioVeiculo $repositorioVeiculo,
        RepositorioUsuario $repositorioUsuario
    ) {
        $this->repositorioOs = $repositorioOs;
        $this->repositorioCliente = $repositorioCliente;
        $this->repositorioVeiculo = $repositorioVeiculo;
        $this->repositorioUsuario = $repositorioUsuario;
    }

    public function listar(): array {
        $oss = $this->repositorioOs->listarTodas();
        $resultado = [];
        foreach ($oss as $os) {
            $cliente = $this->repositorioCliente->buscarPorId($os['cliente_id']);
            $veiculo = $this->repositorioVeiculo->buscarPorId($os['veiculo_id']);
            $usuarioCriacao = $this->repositorioUsuario->buscarPorId($os['usuario_criacao'] ?? 0);
            $usuarioResp = $this->repositorioUsuario->buscarPorId($os['usuario_responsavel'] ?? 0);
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
                $usuarioCriacao['ativo'] ?? null
            );
            $usuarioResponsavelDto = new UsuarioDto(
                $usuarioResp['id'],
                $usuarioResp['cpf'],
                $usuarioResp['nome'],
                $usuarioResp['email'],
                $usuarioResp['cargo'],
                $usuarioResp['ativo'] ?? null
            );
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
                [],
                null,
                [],
                null,
                null
            );
            $resultado[] = $osDto->arrayDados();
        }
        return $resultado;
    }

}


?>