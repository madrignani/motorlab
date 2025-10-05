<?php


namespace App\Repositorio;
use App\Excecao\RepositorioException;
use PDO;
use PDOException;


class RepositorioUsuarioBDR implements RepositorioUsuario {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function buscarPorId(int $id): ?array {
        try {
            $sql = <<<SQL
                SELECT id, cpf, nome, email, cargo, ativo
                FROM usuario
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['id' => $id] );
            $dados = $stmt->fetch();
            if ( empty($dados) ) {
                return null;
            }
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarPorCpfOuEmail(string $valor): ?array {
        try {
            $sql = <<<SQL
                SELECT id, cpf, nome, email, sal, cargo, ativo
                FROM usuario
                WHERE cpf = :valor OR email = :valor
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['valor' => $valor] );
            $dados = $stmt->fetch();
            if ( empty($dados) ) {
                return null;
            }
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function verificarHash(int $id, string $hash): bool {
        try{
            $sql = <<<SQL
                SELECT COUNT(*) FROM usuario WHERE id = :id AND senha = :hash
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['id' => $id, 'hash' => $hash] );
            $existe = ( $stmt->fetchColumn()>0 );
            return $existe;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function listarMecanicos(): array {
        try {
            $sql = <<<SQL
                SELECT id, cpf, nome, email, cargo FROM usuario
                WHERE cargo='MECANICO' AND ativo=TRUE
                ORDER BY nome ASC, id ASC
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $dados = $stmt->fetchAll();
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

}


?>