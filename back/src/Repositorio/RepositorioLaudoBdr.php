<?php


namespace App\Repositorio;
use App\Excecao\RepositorioException;
use PDO;
use PDOException;


class RepositorioLaudoBdr implements RepositorioLaudo {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function salvar(array $dados): int {
        try {
            $sql = <<<SQL
                INSERT INTO laudo (os_id, resumo, recomendacoes)
                VALUES (:os_id, :resumo, :recomendacoes)
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'os_id' => $dados['os_id'],
                'resumo' => $dados['resumo'],
                'recomendacoes' => $dados['recomendacoes']
            ] );
            return $this->pdo->lastInsertId();
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarPorOs(int $osId): ?array {
        try {
            $sql = <<<SQL
                SELECT * FROM laudo 
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