<?php


namespace App\Servico;
use App\Transacao\Transacao;
use App\Excecao\DominioException;
use App\Excecao\AutenticacaoException;
use App\Repositorio\RepositorioUsuario;
use App\Repositorio\RepositorioVeiculo;
use App\Dto\UsuarioDto;
use App\Dto\VeiculoDto;


class ServicoCadastroOs {
    
    private Transacao $transacao;
    private RepositorioUsuario $repositorioUsuario;
    private RepositorioVeiculo $repositorioVeiculo;

    public function __construct (
        Transacao $transacao,
        RepositorioUsuario $repositorioUsuario,
        RepositorioVeiculo $repositorioVeiculo
    ) {
        $this->transacao = $transacao;
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

}


?>