<?php


namespace App\Dto;


class VeiculoDto {

    private int $id;
    private int $idCliente;
    private string $placa;
    private string $chassi;
    private string $fabricante;
    private string $modelo;
    private int $ano;
    private int $quilometragem;

    public function __construct(
        int $id,
        int $idCliente,
        string $placa,
        string $chassi,
        string $fabricante,
        string $modelo,
        int $ano,
        int $quilometragem
    ) {
        $this->id = $id;
        $this->idCliente = $idCliente;
        $this->placa = $placa;
        $this->chassi = $chassi;
        $this->fabricante = $fabricante;
        $this->modelo = $modelo;
        $this->ano = $ano;
        $this->quilometragem = $quilometragem;
    }

    public function arrayDados(): array {
        return [
            'id' => $this->id,
            'idCliente' => $this->idCliente,
            'placa' => $this->placa,
            'chassi' => $this->chassi,
            'fabricante' => $this->fabricante,
            'modelo' => $this->modelo,
            'ano' => $this->ano,
            'quilometragem' => $this->quilometragem
        ];
    }
    
}


?>