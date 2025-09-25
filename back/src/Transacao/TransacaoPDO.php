<?php


namespace App\Transacao;
use App\Excecao\RepositorioException;
use Throwable;
use PDO;


class TransacaoPDO implements Transacao {
    
    public function __construct(private PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function iniciar(): void {
        try {
            $this->pdo->beginTransaction();
        } catch(Throwable $erro) {
            throw new RepositorioException( "Erro ao iniciar a transação: " . $erro->getMessage() );
        }
    }

    public function finalizar(): void {
        try {
            $this->pdo->commit();
        } catch (Throwable $erro) {
            throw new RepositorioException( "Erro ao finalizar a transação: " . $erro->getMessage() );
        }
    }

    public function desfazer(): void {
        try {
            $this->pdo->rollBack();
        } catch (Throwable $erro) {
            throw new RepositorioException( "Erro ao desfazer a transação: " . $erro->getMessage() );
        }
    }

}


?>