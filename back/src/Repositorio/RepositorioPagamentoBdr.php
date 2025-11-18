<?php


namespace App\Repositorio;
use App\Excecao\RepositorioException;
use PDO;
use PDOException;


class RepositorioPagamentoBdr implements RepositorioPagamento {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function salvar(int $osId, int $usuarioResponsavel, float $valor, string $metodo): int {
        try {
            $sql = <<<SQL
                INSERT INTO pagamento (os_id, usuario_responsavel, valor, metodo)
                VALUES (:os_id, :usuario_responsavel, :valor, :metodo)
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'os_id' => $osId,
                'usuario_responsavel' => $usuarioResponsavel,
                'valor' => $valor,
                'metodo' => $metodo
            ] );
            return $this->pdo->lastInsertId();
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarPorOs(int $osId): ?array {
        try {
            $sql = <<<SQL
                SELECT * FROM pagamento
                WHERE os_id = :os_id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['os_id' => $osId] );
            $dados = $stmt->fetch();
            if ( empty($dados) ) {
                return null;
            }
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

}


?>