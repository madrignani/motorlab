<?php


namespace App\Servico;
use App\Excecao\DominioException;
use App\Excecao\AutenticacaoException;
use App\Repositorio\RepositorioCliente;
use App\Modelo\Cliente;


class ServicoCadastroCliente {

    private RepositorioCliente $repositorio;

    public function __construct(RepositorioCliente $repositorio) {
        $this->repositorio = $repositorio;
    }

    public function cadastrarCliente(array $dados, string $cargoUsuarioLogado): void {
        if ($cargoUsuarioLogado !== 'ATENDENTE' && $cargoUsuarioLogado !== 'GERENTE') {
            throw new AutenticacaoException('Permissão negada.');
        }
        $cpf = $dados['cpf'];
        $nome = $dados['nome'];
        $telefone = $dados['telefone'];
        $email = $dados['email'];
        $cliente = $this->mapearCliente($cpf, $nome, $telefone, $email);
        $problemas = $cliente->validar();
        if ( !empty($problemas) ) {
            throw DominioException::comProblemas($problemas);
        }
        $this->repositorio->salvar($cpf, $nome, $telefone, $email);
    }

    private function mapearCliente(string $cpf, string $nome, string $telefone, string $email): Cliente {
        return new Cliente(0, $cpf, $nome, $telefone, $email);
    }

}


?>