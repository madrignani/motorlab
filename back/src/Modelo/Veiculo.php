<?php


namespace App\Modelo;
use DateTime;


class Veiculo {

    private int $id;
    private Cliente $cliente;
    private string $placa;
    private string $chassi;
    private string $fabricante;
    private string $modelo;
    private int $ano;
    private int $quilometragem;

    public function __construct(
        int $id,
        Cliente $cliente,
        string $placa,
        string $chassi,
        string $fabricante,
        string $modelo,
        int $ano,
        int $quilometragem
    ) {
        $this->id = $id;
        $this->clienteId = $clienteId;
        $this->placa = $placa;
        $this->chassi = $chassi;
        $this->fabricante = $fabricante;
        $this->modelo = $modelo;
        $this->ano = $ano;
        $this->quilometragem = $quilometragem;
    }

    public function getId(): int { return $this->id; }
    public function getCliente(): Cliente { return $this->cliente; }
    public function getPlaca(): string { return $this->placa; }
    public function getChassi(): string { return $this->chassi; }
    public function getFabricante(): string { return $this->fabricante; }
    public function getModelo(): string { return $this->modelo; }
    public function getAno(): int { return $this->ano; }
    public function getQuilometragem(): int { return $this->quilometragem; }

    public function validar(): array {
        $problemas = [];
        if ( !preg_match('/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/', $this->placa) ) {
            $problemas[] = "A placa do veículo deve estar no padrão nacional válido.";
        }
        if ( mb_strlen($this->chassi) !== 17 ) {
            $problemas[] = "O chassi do veículo deve conter exatamente 17 caracteres.";
        }
        if ( mb_strlen($this->fabricante) < 2 || mb_strlen($this->fabricante) > 30 ) {
            $problemas[] = "O fabricante do veículo deve conter entre 2 e 30 caracteres.";
        }
        if ( mb_strlen($this->modelo) < 2 || mb_strlen($this->modelo) > 70 ) {
            $problemas[] = "O modelo do veículo deve conter entre 2 e 70 caracteres.";
        }
        if ( $this->ano > ((int)(new \DateTime())->format("Y")) ) {
            $problemas[] = "O ano de fabricação do veículo não pode ser no futuro.";
        }
        if ( $this->quilometragem < 0 ) {
            $problemas[] = "A quilometragem do veículo não pode ser negativa.";
        }
        return $problemas;
    }

}


?>