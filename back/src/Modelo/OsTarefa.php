<?php


namespace App\Modelo;


class OsTarefa {

    private int $id;
    private OsServico $osServico;
    private string $descricao;
    private int $ordenacao;

    public function __construct(
        int $id,
        OsServico $osServico,
        string $descricao,
        int $ordenacao
    ) {
        $this->id = $id;
        $this->osServico = $osServico;
        $this->descricao = $descricao;
        $this->ordenacao = $ordenacao;
    }

    public function getId(): int { return $this->id; }
    public function getOsServico(): OsServico { return $this->osServico; }
    public function getDescricao(): string { return $this->descricao; }
    public function getOrdenacao(): int { return $this->ordenacao; }

}


?>