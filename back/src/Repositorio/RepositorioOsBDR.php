<?php


namespace App\Repositorio;
use App\Excecao\RepositorioException;
use PDO;
use PDOException;


class RepositorioOsBdr implements RepositorioOs {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function salvar(array $dados): int {
        try {
            $sql = <<<SQL
                INSERT INTO os ( cliente_id, veiculo_id, usuario_criacao, usuario_responsavel, status, previsao_entrega, valor_estimado, valor_final, observacoes )
                VALUES ( :cliente_id, :veiculo_id, :usuario_criacao, :usuario_responsavel, :status, :previsao_entrega, :valor_estimado, :valor_final, :observacoes )
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'cliente_id' => $dados['cliente_id'],
                'veiculo_id' => $dados['veiculo_id'],
                'usuario_criacao' => $dados['usuario_criacao'],
                'usuario_responsavel' => $dados['usuario_responsavel'],
                'status' => $dados['status'],
                'previsao_entrega' => $dados['previsao_entrega'],
                'valor_estimado' => $dados['valor_estimado'],
                'valor_final' => $dados['valor_final'],
                'observacoes' => $dados['observacoes']
            ] );
            return $this->pdo->lastInsertId();
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function existeAtivaPeriodo(int $veiculoId, string $previsaoEntrega): bool {
        try {
            $sql = <<<SQL
                SELECT COUNT(*) AS count
                FROM os
                WHERE veiculo_id = :veiculo_id
                AND status NOT IN ('CANCELADA', 'FINALIZADA')
                AND data_hora_criacao <= :nova_previsao
                AND previsao_entrega >= NOW()
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'veiculo_id' => $veiculoId,
                'nova_previsao' => $previsaoEntrega
            ] );
            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
            return $resultado['count'] > 0;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarPorId(int $id): ?array {
        try {
            $sql = <<<SQL
                SELECT * FROM os
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

}


?>