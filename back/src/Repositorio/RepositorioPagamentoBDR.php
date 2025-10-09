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

    public function buscarPorOsId(int $osId): ?array {
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