<?php


namespace App\Modelo;


class Servico {

    private int $id;
    private string $descricao;
    private float $valorMaoObra;
    private int $execucaoMinutos;

    public function __construct(
        int $id,
        string $descricao,
        float $valorMaoObra,
        int $execucaoMinutos
    ) {
        $this->id = $id;
        $this->descricao = $descricao;
        $this->valorMaoObra = $valorMaoObra;
        $this->execucaoMinutos = $execucaoMinutos;
    }

    public function getId(): int { return $this->id; }
    public function getDescricao(): string { return $this->descricao; }
    public function getValorMaoObra(): float { return $this->valorMaoObra; }
    public function getExecucaoMinutos(): int { return $this->execucaoMinutos; }

}


?>