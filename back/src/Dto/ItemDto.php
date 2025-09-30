<?php


namespace App\Dto;


class ItemDto {

    private int $id;
    private string $codigo;
    private string $titulo;
    private string $fabricante;
    private string $descricao;
    private float $precoVenda;
    private int $estoque;
    private int $estoqueMinimo;
    private string $localizacao;

    public function __construct(
        int $id,
        string $codigo,
        string $titulo,
        string $fabricante,
        string $descricao,
        float $precoVenda,
        int $estoque,
        int $estoqueMinimo,
        string $localizacao
    ) {
        $this->id = $id;
        $this->codigo = $codigo;
        $this->titulo = $titulo;
        $this->fabricante = $fabricante;
        $this->descricao = $descricao;
        $this->precoVenda = $precoVenda;
        $this->estoque = $estoque;
        $this->estoqueMinimo = $estoqueMinimo;
        $this->localizacao = $localizacao;
    }

    public function arrayDados(): array {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'titulo' => $this->titulo,
            'fabricante' => $this->fabricante,
            'descricao' => $this->descricao,
            'precoVenda' => $this->precoVenda,
            'estoque' => $this->estoque,
            'estoqueMinimo' => $this->estoqueMinimo,
            'localizacao' => $this->localizacao
        ];
    }
    
}


?>