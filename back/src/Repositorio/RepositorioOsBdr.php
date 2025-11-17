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
                INSERT INTO os ( cliente_id, veiculo_id, usuario_criacao, usuario_responsavel, status, previsao_entrega_sugerida, previsao_entrega, valor_mao_obra_sugerido, valor_mao_obra, valor_estimado_sugerido, valor_estimado, valor_final, observacoes )
                VALUES ( :cliente_id, :veiculo_id, :usuario_criacao, :usuario_responsavel, :status, :previsao_entrega_sugerida, :previsao_entrega, :valor_mao_obra_sugerido, :valor_mao_obra, :valor_estimado_sugerido, :valor_estimado, :valor_final, :observacoes )
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'cliente_id' => $dados['cliente_id'],
                'veiculo_id' => $dados['veiculo_id'],
                'usuario_criacao' => $dados['usuario_criacao'],
                'usuario_responsavel' => $dados['usuario_responsavel'],
                'status' => $dados['status'],
                'previsao_entrega_sugerida' => $dados['previsao_entrega_sugerida'],
                'previsao_entrega' => $dados['previsao_entrega'],
                'valor_mao_obra_sugerido' => $dados['valor_mao_obra_sugerido'],
                'valor_mao_obra' => $dados['valor_mao_obra'],
                'valor_estimado_sugerido' => $dados['valor_estimado_sugerido'],
                'valor_estimado' => $dados['valor_estimado'],
                'valor_final' => $dados['valor_final'],
                'observacoes' => $dados['observacoes']
            ] );
            return $this->pdo->lastInsertId();
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

    public function salvarServico(int $osId, int $servicoId): int {
        try {
            $sql = <<<SQL
                INSERT INTO os_servico (os_id, servico_id)
                VALUES (:os_id, :servico_id)
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'os_id' => $osId,
                'servico_id' => $servicoId
            ] );
            return $this->pdo->lastInsertId();
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarServicosPorOs(int $osId): array {
        try {
            $sql = <<<SQL
                SELECT os_servico.id as os_servico_id, os_servico.servico_id, servico.* 
                FROM os_servico 
                JOIN servico ON os_servico.servico_id = servico.id 
                WHERE os_servico.os_id = :os_id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['os_id' => $osId] );
            $dados = $stmt->fetchAll();
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarOsServico(int $osId, int $servicoId): ?array {
        try {
            $sql = <<<SQL
                SELECT * FROM os_servico 
                WHERE os_id = :os_id AND servico_id = :servico_id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'os_id' => $osId,
                'servico_id' => $servicoId
            ] );
            $dados = $stmt->fetch();
            if ( empty($dados) ) {
                return null;
            }
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function removerServico(int $osId, int $servicoId): void {
        try {
            $sql = <<<SQL
                DELETE FROM os_servico 
                WHERE os_id = :os_id 
                AND servico_id = :servico_id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'os_id' => $osId,
                'servico_id' => $servicoId
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function salvarTarefa(int $osServicoId, string $descricao, int $ordenacao): int {
        try {
            $sql = <<<SQL
                INSERT INTO os_tarefa (os_servico_id, descricao, ordenacao) 
                VALUES (:os_servico_id, :descricao, :ordenacao)
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'os_servico_id' => $osServicoId,
                'descricao' => $descricao,
                'ordenacao' => $ordenacao
            ] );
            return $this->pdo->lastInsertId();
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function atualizarOrdenacaoTarefa(int $tarefaId, int $ordenacao): void {
        try {
            $sql = <<<SQL
                UPDATE os_tarefa SET ordenacao = :ordenacao 
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'ordenacao' => $ordenacao,
                'id' => $tarefaId
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function atualizarOsTarefaServicoId(int $tarefaId, int $osServicoId): void {
        try {
            $sql = <<<SQL
                UPDATE os_tarefa SET os_servico_id = :os_servico_id 
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'os_servico_id' => $osServicoId,
                'id' => $tarefaId
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarTarefasPorServico(int $osServicoId): array {
        try {
            $sql = <<<SQL
                SELECT * FROM os_tarefa 
                WHERE os_servico_id = :os_servico_id 
                ORDER BY ordenacao
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['os_servico_id' => $osServicoId] );
            $dados = $stmt->fetchAll();
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarUltimaOrdenacaoTarefa(int $osServicoId): int {
        try {
            $sql = <<<SQL
                SELECT MAX(ordenacao) as max_ordenacao 
                FROM os_tarefa 
                WHERE os_servico_id = :os_servico_id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['os_servico_id' => $osServicoId] );
            $dados = $stmt->fetch();
            if ( empty($dados['max_ordenacao']) ) {
                return 0;
            }
            return ( (int)$dados['max_ordenacao'] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function removerTarefa(int $osId, int $servicoId, int $tarefaId): void {
        try {
            $sql = <<<SQL
                DELETE os_tarefa 
                FROM os_tarefa 
                JOIN os_servico ON os_tarefa.os_servico_id = os_servico.id 
                WHERE os_servico.os_id = :os_id 
                AND os_servico.servico_id = :servico_id 
                AND os_tarefa.id = :tarefa_id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'os_id' => $osId,
                'servico_id' => $servicoId,
                'tarefa_id' => $tarefaId
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function atualizarStatus(int $id, string $status): void {
        try {
            if ($status === 'CANCELADA') {
                $sql = <<<SQL
                    UPDATE os SET status = :status, data_hora_finalizacao = NOW() 
                    WHERE id = :id
                SQL;
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute( [
                    'id' => $id,
                    'status' => $status
                ] );
            } else {
                $sql = <<<SQL
                    UPDATE os SET status = :status, data_hora_finalizacao = NULL 
                    WHERE id = :id
                SQL;
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute( [
                    'id' => $id,
                    'status' => $status
                ] );
            }
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function atualizarMaoObra(int $id, float $valor): void {
        try {
            $sql = <<<SQL
                UPDATE os SET valor_mao_obra = :valor 
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'id' => $id,
                'valor' => $valor
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function atualizarMaoObraSugerido(int $id, float $valor): void {
        try {
            $sql = <<<SQL
                UPDATE os SET valor_mao_obra_sugerido = :valor 
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'id' => $id,
                'valor' => $valor
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function atualizarPrevisaoEntrega(int $id, string $data): void {
        try {
            $sql = <<<SQL
                UPDATE os SET previsao_entrega = :data 
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'id' => $id,
                'data' => $data
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function atualizarPrevisaoSugerida(int $id, string $data): void {
        try {
            $sql = <<<SQL
                UPDATE os SET previsao_entrega_sugerida = :data
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'id' => $id,
                'data' => $data
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function atualizarObservacoes(int $id, string $observacoes): void {
        try {
            $sql = <<<SQL
                UPDATE os SET observacoes = :observacoes 
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'id' => $id,
                'observacoes' => $observacoes
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function atualizarValorEstimado(int $id, float $valor): void {
        try {
            $sql = <<<SQL
                UPDATE os SET valor_estimado = :valor 
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'id' => $id,
                'valor' => $valor
            ] );
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

    public function existeAtivaPorResponsavel(int $usuarioResponsavelId): bool {
        try {
            $sql = <<<SQL
                SELECT COUNT(*) AS count
                FROM os
                WHERE usuario_responsavel = :usuario_responsavel
                AND status IN ('PROVISORIA', 'ANDAMENTO', 'ALERTA')
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['usuario_responsavel' => $usuarioResponsavelId] );
            $row = $stmt->fetch();
            return $row['count'] > 0;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

}


?>