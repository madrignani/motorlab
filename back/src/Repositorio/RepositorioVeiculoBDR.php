<?php


namespace App\Repositorio;
use App\Excecao\RepositorioException;
use PDO;
use PDOException;


class RepositorioVeiculoBdr implements RepositorioVeiculo { 

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function salvar(int $clienteId, string $placa, string $chassi, string $fabricante, string $modelo, int $ano, int $quilometragem): void {
        try {
            $sql = <<<SQL
                INSERT INTO veiculo ( cliente_id, placa, chassi, fabricante, modelo, ano, quilometragem ) 
                VALUES ( :cliente_id, :placa, :chassi, :fabricante, :modelo, :ano, :quilometragem)
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( [
                'cliente_id' => $clienteId,
                'placa' => $placa,
                'chassi' => $chassi,
                'fabricante' => $fabricante,
                'modelo' => $modelo,
                'ano' => $ano,
                'quilometragem' => $quilometragem,
            ] );
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarPorCliente(int $idCliente): array {
        try {
            $sql = <<<SQL
                SELECT * FROM veiculo WHERE cliente_id = :idCliente
            SQL;
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute( ['idCliente' => $idCliente] );
            $dados = $stmt->fetchAll();
            return $dados;
        } catch (PDOException $erro) {
            throw new RepositorioException( $erro->getMessage() );
        }
    }

    public function buscarPorId(int $id): ?array {
        try {
            $sql = <<<SQL
                SELECT * FROM veiculo
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