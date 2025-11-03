<?php


namespace App\Modelo;


class Tarefa {

    private int $id;
    private Servico $servico;
    private string $descricao;
    private int $ordenacao;

    public function __construct(
        int $id,
        Servico $servico,
        string $descricao,
        int $ordenacao
    ) {
        $this->id = $id;
        $this->servico = $servico;
        $this->descricao = $descricao;
        $this->ordenacao = $ordenacao;
    }

    public function getId(): int { return $this->id; }
    public function getServico(): Servico { return $this->servico; }
    public function getDescricao(): string { return $this->descricao; }
    public function getOrdenacao(): int { return $this->ordenacao; }

}


?>