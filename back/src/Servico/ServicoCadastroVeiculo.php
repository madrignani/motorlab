<?php


namespace App\Servico;
use App\Excecao\DominioException;
use App\Excecao\AutenticacaoException;
use App\Repositorio\RepositorioCliente;
use App\Repositorio\RepositorioVeiculo;
use App\Modelo\Cliente;
use App\Modelo\Veiculo;
use App\Dto\ClienteDTO;


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
            throw DominioException::comProblemas( ['Existe mais de um cliente com esse nome, favor procurar pelo CPF.'] );
        }
        $cliente = $dados[0];
        $clienteDTO = new ClienteDTO(
            (int)$cliente['id'],
            $cliente['cpf'],
            $cliente['nome'],
            $cliente['telefone'],
            $cliente['email']
        );
        return [$clienteDTO->arrayDados()];
    }

}


?>