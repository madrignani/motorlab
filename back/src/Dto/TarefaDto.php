<?php


namespace App\Dto;


class TarefaDto {

    private $id;
    private $descricao;
    private $ordenacao;

    public function __construct($id, $descricao, $ordenacao) {
        $this->id = $id;
        $this->descricao = $descricao;
        $this->ordenacao = $ordenacao;
    }

    public function arrayDados(): array {
        return [
            'id' => $this->id,
            'descricao' => $this->descricao,
            'ordenacao' => $this->ordenacao,
        ];
    }

}


?>