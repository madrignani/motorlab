<?php


namespace App\Modelo;


class Laudo {

    private int $id;
    private Os $os;
    private ?string $resumo;
    private ?string $recomendacoes;

    public function __construct(
        int $id,
        Os $os,
        ?string $resumo,
        ?string $recomendacoes
    ) {
        $this->id = $id;
        $this->os = $os;
        $this->resumo = $resumo;
        $this->recomendacoes = $recomendacoes;
    }

    public function getId(): int { return $this->id; }
    public function getOs(): Os { return $this->os; }
    public function getResumo(): ?string { return $this->resumo; }
    public function getRecomendacoes(): ?string { return $this->recomendacoes; }

    public function validar(): array {
        $problemas = [];
        if ( $this->resumo !== null && mb_strlen($this->resumo) > 2000 ) {
            $problemas[] = "O resumo do laudo não pode exceder 2000 caracteres.";
        }
        if ( $this->recomendacoes !== null && mb_strlen($this->recomendacoes) > 2000 ) {
            $problemas[] = "As recomendações do laudo não podem exceder 2000 caracteres.";
        }
        return $problemas;
    }

}


?>