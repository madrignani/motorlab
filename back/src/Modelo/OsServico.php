<?php


namespace App\Modelo;


class OsServico {

    private int $id;
    private Os $os;
    private Servico $servico;

    public function __construct(
        int $id,
        Os $os,
        Servico $servico
    ) {
        $this->id = $id;
        $this->os = $os;
        $this->servico = $servico;
    }

    public function getId(): int { return $this->id; }
    public function getOs(): Os { return $this->os; }
    public function getServico(): Servico { return $this->servico; }

}


?>