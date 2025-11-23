<?php


namespace App\Repositorio;
use App\Excecao\RepositorioException;
use PDO;
use PDOException;


class RepositorioItemBdr implements RepositorioItem {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function salvar(string $codigo, string $titulo, string $fabricante, string $descricao, float $precoVenda, int $estoque, int $estoqueMinimo, string $localizacao): void {
        try {
            $sql = <<<SQL
                INSERT INTO item ( codigo, titulo, fabricante, descricao, preco_venda, estoque, estoque_minimo, localizacao ) 
                VALUES ( :codigo, :titulo, :fabricante, :descricao, :preco_venda, :estoque, :estoque_minimo, :localizacao )
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'codigo' => $codigo,
                'titulo' => $titulo,
                'fabricante' => $fabricante,
                'descricao' => $descricao,
                'preco_venda' => $precoVenda,
                'estoque' => $estoque,
                'estoque_minimo' => $estoqueMinimo,
                'localizacao' => $localizacao
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function listar(): array {
        try {
            $sql = <<<SQL
                SELECT * FROM item
                ORDER BY titulo ASC, fabricante ASC
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $dados = $stmt->fetchAll();
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function remover(int $id): bool {
        try {
            $sql = <<<SQL
                DELETE FROM item
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['id' => $id] );
            return $stmt->rowCount() > 0;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarPorId(int $id): ?array {
        try {
            $sql = <<<SQL
                SELECT * FROM item
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

    public function buscarPorCodigo(string $codigo): ?array {
        try {
            $sql = <<<SQL
                SELECT * FROM item
                WHERE codigo = :codigo
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['codigo' => $codigo] );
            $dados = $stmt->fetch();
            if ( empty($dados) ) {
                return null;
            }
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarPorTermo(string $termo): array {
        try {
            $sql = <<<SQL
                SELECT * FROM item
                WHERE titulo LIKE :termo OR codigo LIKE :termo
                ORDER BY titulo ASC, fabricante ASC
                LIMIT 10
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $termo = '%' . $termo . '%';
            $stmt->execute( ['termo' => $termo] );
            $dados = $stmt->fetchAll();
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function atualizar(int $id, float $precoVenda, int $estoque, int $estoqueMinimo, string $localizacao): void {
        try {
            $sql = <<<SQL
                UPDATE item 
                SET preco_venda = :preco_venda, estoque = :estoque, estoque_minimo = :estoque_minimo, localizacao = :localizacao 
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'id' => $id,
                'preco_venda' => $precoVenda,
                'estoque' => $estoque,
                'estoque_minimo' => $estoqueMinimo,
                'localizacao' => $localizacao
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException($erro->getMessage());
        }
    }

    public function atualizarEstoque(int $id, int $novoEstoque): void {
        try {
            $sql = <<<SQL
                UPDATE item
                SET estoque = :estoque
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'id' => $id,
                'estoque' => $novoEstoque
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

}


?>