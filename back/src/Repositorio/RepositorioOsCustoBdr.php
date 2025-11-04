<?php


namespace App\Repositorio;
use App\Excecao\RepositorioException;
use PDO;
use PDOException;


class RepositorioOsCustoBdr implements RepositorioOsCusto {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function salvar(array $dados): void {
        try {
            $sql = <<<SQL
                INSERT INTO os_custo ( os_id, os_tarefa_id, item_id, tipo, descricao, quantidade, subtotal )
                VALUES ( :os_id, :os_tarefa_id, :item_id, :tipo, :descricao, :quantidade, :subtotal )
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'os_id' => $dados['os_id'],
                'os_tarefa_id' => $dados['os_tarefa_id'],
                'item_id' => $dados['item_id'],
                'tipo' => $dados['tipo'],
                'descricao' => $dados['descricao'],
                'quantidade' => $dados['quantidade'],
                'subtotal' => $dados['subtotal']
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarPorOsId(int $osId): array {
        try {
            $sql = <<<SQL
                SELECT * FROM os_custo
                WHERE os_id = :os_id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['os_id' => $osId] );
            $dados = $stmt->fetchAll();
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

}


?>