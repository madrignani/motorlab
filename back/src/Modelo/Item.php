<?php


namespace App\Modelo;


class Item {

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

    public function getId(): int { return $this->id; }
    public function getCodigo(): string { return $this->codigo; }
    public function getTitulo(): string { return $this->titulo; }
    public function getFabricante(): string { return $this->fabricante; }
    public function getDescricao(): string { return $this->descricao; }
    public function getPrecoVenda(): float { return $this->precoVenda; }
    public function getEstoque(): int { return $this->estoque; }
    public function getEstoqueMinimo(): int { return $this->estoqueMinimo; }
    public function getLocalizacao(): string { return $this->localizacao; }

    public function validar(): array {
        $problemas = [];
        if ( mb_strlen($this->codigo) < 2 || mb_strlen($this->codigo) > 30 ) {
            $problemas[] = "O código do item deve conter entre 2 e 30 caracteres.";
        }
        if ( mb_strlen($this->titulo) < 2 || mb_strlen($this->titulo) > 30 ) {
            $problemas[] = "O título do item deve conter entre 2 e 30 caracteres.";
        }
        if ( mb_strlen($this->fabricante) < 2 || mb_strlen($this->fabricante) > 30 ) {
            $problemas[] = "O fabricante deve conter entre 2 e 30 caracteres.";
        }
        if ( mb_strlen($this->descricao) < 2 || mb_strlen($this->descricao) > 70) {
            $problemas[] = "A descrição do item deve conter entre 2 e 70 caracteres.";
        }
        if ( $this->precoVenda < 0 ) {
            $problemas[] = "O preço de venda do item não pode ser negativo.";
        }
        if ( $this->estoque < 0 ) {
            $problemas[] = "O estoque do item não pode ser negativo.";
        }
        if ( $this->estoqueMinimo < 0 ) {
            $problemas[] = "O estoque mínimo do item não pode ser negativo.";
        }
        if ( mb_strlen($this->localizao) < 1 || mb_strlen($this->localizacao) > 20 ) {
            $problemas[] = "A localização do item deve conter entre 1 e 20 caracteres.";
        }
        return $problemas;
    }

}


?>