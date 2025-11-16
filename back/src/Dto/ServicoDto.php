<?php


namespace App\Dto;


class ServicoDto {

    private $id;
    private $descricao;
    private $valor_mao_obra;
    private $execucao_minutos;
    private $tarefas;

    public function __construct(int $id, string $descricao, float $valor_mao_obra, int $execucao_minutos, array $tarefas = []) {
        $this->id = $id;
        $this->descricao = $descricao;
        $this->valor_mao_obra = $valor_mao_obra;
        $this->execucao_minutos = $execucao_minutos;
        $this->tarefas = $tarefas;
    }

    public function arrayDados(): array {
        return [
            'id' => $this->id,
            'descricao' => $this->descricao,
            'valorMaoObra' => $this->valor_mao_obra,
            'execucaoMinutos' => $this->execucao_minutos,
            'tarefas' => $this->tarefas
        ];
    }

}


?>