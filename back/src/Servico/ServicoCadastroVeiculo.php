<?php


namespace App\Servico;
use App\Excecao\DominioException;
use App\Excecao\AutenticacaoException;
use App\Repositorio\RepositorioCliente;
use App\Repositorio\RepositorioVeiculo;
use App\Modelo\Cliente;
use App\Modelo\Veiculo;
use App\Dto\ClienteDto;


class ServicoCadastroVeiculo {

    private RepositorioCliente $repositorioCliente;
    private RepositorioVeiculo $repositorioVeiculo;

    public function __construct(RepositorioCliente $repositorioCliente, RepositorioVeiculo $repositorioVeiculo) {
        $this->repositorioCliente = $repositorioCliente;
        $this->repositorioVeiculo = $repositorioVeiculo;
    }

    public function buscarCliente(string $valor, string $cargoUsuarioLogado): array {
        if ($cargoUsuarioLogado !== 'ATENDENTE' && $cargoUsuarioLogado !== 'GERENTE') {
            throw new AutenticacaoException('Permissão negada.');
        }
        $valor = trim($valor);
        $dados = $this->repositorioCliente->buscarPorCpfOuNome($valor);
        if (empty($dados)) {
            return [];
        }
        if (count($dados) > 1) {
            throw DominioException::comProblemas( ['Existe mais de um cliente com esse nome, procurar pelo CPF.'] );
        }
        $cliente = $dados[0];
        $clientedto = new ClienteDto(
            ( (int)$cliente['id'] ),
            $cliente['cpf'],
            $cliente['nome'],
            $cliente['telefone'],
            $cliente['email']
        );
        return $clientedto->arrayDados();
    }

    public function cadastrarVeiculo(array $dados, string $cargoUsuarioLogado): void {
        if ($cargoUsuarioLogado !== 'ATENDENTE' && $cargoUsuarioLogado !== 'GERENTE') {
            throw new AutenticacaoException('Permissão negada.');
        }
        $clienteId = ( (int)$dados['cliente_id'] );
        $placa = $dados['placa'];
        $chassi = $dados['chassi'];
        $fabricante = $dados['fabricante'];
        $modelo = $dados['modelo'];
        $ano = ( (int)$dados['ano'] );
        $quilometragem = ( (int) $dados['quilometragem'] );
        $dadosCliente = $this->repositorioCliente->buscarPorId($clienteId);
        if (empty($dadosCliente)) {
            throw DominioException::comProblemas( ['Informe um cliente válido para o cadastro de veículo.'] );
        }
        $cliente = $this->mapearCliente( $dadosCliente['cpf'], $dadosCliente['nome'], $dadosCliente['telefone'], $dadosCliente['email'] );
        $veiculo = $this->mapearVeiculo( $cliente, $placa, $chassi, $fabricante, $modelo, $ano, $quilometragem );
        $problemas = $veiculo->validar();
        if ( !empty($problemas) ) {
            throw DominioException::comProblemas($problemas);
        }
        $this->repositorioVeiculo->salvar($clienteId, $placa, $chassi, $fabricante, $modelo, $ano, $quilometragem);
    }

    private function mapearCliente(string $cpf, string $nome, string $telefone, string $email): Cliente {
        return new Cliente(0, $cpf, $nome, $telefone, $email);
    }

    private function mapearVeiculo(Cliente $cliente, string $placa, string $chassi, string $fabricante, string $modelo, int $ano, int $quilometragem): Veiculo {
        return new Veiculo(0, $cliente, $placa, $chassi, $fabricante, $modelo, $ano, $quilometragem);
    }

}


?>