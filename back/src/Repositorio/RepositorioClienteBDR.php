<?php


namespace App\Repositorio;
use App\Excecao\RepositorioException;
use PDO;
use PDOException;


class RepositorioClienteBDR implements RepositorioCliente {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function salvar(string $cpf, string $nome, string $telefone, string $email): void {
        try {
            $sql = <<<SQL
                INSERT INTO cliente ( cpf, nome, telefone, email ) 
                VALUES ( :cpf, :nome, :telefone, :email )
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'cpf' => $cpf,
                'nome' => $nome,
                'telefone' => $telefone,
                'email' => $email
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarPorCpfOuNome(string $valor): ?array {
        try {
            $sql = <<<SQL
                SELECT id, cpf, nome, telefone, email
                FROM cliente
                WHERE cpf = :valor OR nome = :valor
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['valor' => $valor] );
            $dados = $stmt->fetchAll();
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

}


?>