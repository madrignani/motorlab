<?php


namespace App\Servico;
use App\Excecao\DominioException;
use App\Modelo\Usuario;
use App\Repositorio\RepositorioUsuario;


class ServicoAutenticacao {
    
    private RepositorioUsuario $repositorioUsuario;

    public function __construct(RepositorioUsuario $repositorioUsuario) {
        $this->repositorioUsuario = $repositorioUsuario;
    }

    public function buscarUsuarioPorCpfOuEmail(string $valor): ?array {
        $dados = $this->repositorioUsuario->buscarPorCpfOuEmail($valor);
        return $dados;
    }

    public function verificarHashUsuario(int $idUsuario, string $hash): bool {
        $existe = $this->repositorioUsuario->verificarHash($idUsuario, $hash);
        return $existe;
    }

    public function mapearUsuario(array $dados): Usuario {
        $usuario = new Usuario(
            ( (int)$dados['id'] ),
            $dados['cpf'],
            $dados['nome'],
            $dados['email'],
            $dados['cargo'],
            ( (bool)$dados['ativo'] )
        );
        return $usuario;
    }

}


?>