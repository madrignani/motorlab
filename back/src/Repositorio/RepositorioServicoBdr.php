<?php


namespace App\Repositorio;
use App\Excecao\RepositorioException;
use PDO;
use PDOException;


class RepositorioServicoBdr implements RepositorioServico {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function buscarPorId(int $id): ?array {
        try {
            $sql = <<<SQL
                SELECT id, descricao, valor_mao_obra, execucao_minutos
                FROM servico
                WHERE id = :id
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['id' => $id] );
            $servico = $stmt->fetch();
            if ( empty($servico) ) {
                return null;
            }
            $sql2 = <<<SQL
                SELECT id, descricao, ordenacao 
                FROM tarefa 
                WHERE servico_id = :id 
                ORDER BY ordenacao ASC
            SQL;
            $stmt2 = $this->pdo->prepare($sql2);
            $stmt2->execute( ['id' => $id] );
            $tarefas = $stmt2->fetchAll();
            return [
                'id' => $servico['id'],
                'descricao' => $servico['descricao'],
                'valor_mao_obra' => $servico['valor_mao_obra'],
                'execucao_minutos' => $servico['execucao_minutos'],
                'tarefas' => $tarefas
            ];
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarPorTermo(string $termo): array {
        try {
            $sql = <<<SQL
                SELECT s.id as servico_id, s.descricao as servico_descricao, s.valor_mao_obra, s.execucao_minutos,
                       t.id as tarefa_id, t.descricao as tarefa_descricao, t.ordenacao as tarefa_ordenacao
                FROM servico s
                LEFT JOIN tarefa t ON t.servico_id = s.id
                WHERE s.descricao LIKE :termo
                ORDER BY s.id ASC, t.ordenacao ASC
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $like = ( '%' . $termo . '%' );
            $stmt->execute( ['termo' => $like] );
            $linhas = $stmt->fetchAll();
            $servicos = [];
            foreach ($linhas as $linha) {
                $sid = $linha['servico_id'];
                if ( !isset($servicos[$sid]) ) {
                    $servicos[$sid] = [
                        'id' => $sid,
                        'descricao' => $linha['servico_descricao'],
                        'valor_mao_obra' => $linha['valor_mao_obra'],
                        'execucao_minutos' => $linha['execucao_minutos'],
                        'tarefas' => []
                    ];
                }
                if ( !empty($linha['tarefa_id']) ) {
                    $servicos[$sid]['tarefas'][] = [
                        'id' => $linha['tarefa_id'],
                        'descricao' => $linha['tarefa_descricao'],
                        'ordenacao' => $linha['tarefa_ordenacao']
                    ];
                }
            }
            return $servicos;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarTarefasPorServico(int $servicoId): array {
        try {
            $sql = <<<SQL
                SELECT id, descricao, ordenacao 
                FROM tarefa 
                WHERE servico_id = :servico_id 
                ORDER BY ordenacao ASC
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['servico_id' => $servicoId]);
            $dados = $stmt->fetchAll();
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException($erro->getMessage());
        }
    }

}


?>