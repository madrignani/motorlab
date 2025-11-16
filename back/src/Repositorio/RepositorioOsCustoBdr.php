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

    public function buscarPorOs(int $osId): array {
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

    public function buscarProduto(int $produtoId, int $tarefaId): ?array {
        try {
            $sql = <<<SQL
                SELECT * FROM os_custo 
                WHERE item_id = :produto_id 
                AND os_tarefa_id = :tarefa_id 
                AND tipo = 'ITEM'
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'produto_id' => $produtoId,
                'tarefa_id' => $tarefaId
            ] );
            $dados = $stmt->fetch();
            if ( $dados === false ) {
                return null;
            }
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarProdutosPorTarefa(int $tarefaId): array {
        try {
            $sql = <<<SQL
                SELECT os_custo.*, item.titulo, item.preco_venda 
                FROM os_custo 
                JOIN item ON os_custo.item_id = item.id 
                WHERE os_custo.os_tarefa_id = :tarefa_id 
                AND os_custo.tipo = 'ITEM'
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['tarefa_id' => $tarefaId] );
            $dados = $stmt->fetchAll();
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function remover(int $id): void {
        try {
            $sql = <<<SQL
                DELETE FROM os_custo 
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['id' => $id] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

}


?>