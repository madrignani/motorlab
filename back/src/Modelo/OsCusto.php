<?php


namespace App\Modelo;


class OsCusto {

    private int $id;
    private Os $os;
    private ?Item $item;
    private string $tipo;
    private ?string $descricao;
    private int $quantidade;
    private float $subtotal;

    public function __construct(
        int $id,
        Os $os,
        ?Item $item,
        string $tipo,
        ?string $descricao,
        int $quantidade,
        float $subtotal
    ) {
        $this->id = $id;
        $this->os = $os;
        $this->item = $item;
        $this->tipo = $tipo;
        $this->descricao = $descricao;
        $this->quantidade = $quantidade;
        $this->subtotal = $subtotal;
    }

    public function getId(): int { return $this->id; }
    public function getOs(): Os { return $this->os; }
    public function getItem(): ?Item { return $this->item; }
    public function getTipo(): string { return $this->tipo; }
    public function getDescricao(): ?string { return $this->descricao; }
    public function getQuantidade(): int { return $this->quantidade; }
    public function getSubtotal(): float { return $this->subtotal; }

    public function validar(): array {
        $problemas = [];
        $tiposValidos = [ 'ITEM', 'EXTRA' ];
        if ( !in_array($this->tipo, $tiposValidos, true) ) {
            $problemas[] = "Tipo de custo inválido.";
        }
        if ( $this->quantidade <= 0 ) {
            $problemas[] = "A quantidade deve ser maior que zero.";
        }
        if ( $this->subtotal < 0 ) {
            $problemas[] = "O subtotal não pode ser negativo.";
        }
        if ( $this->descricao !== null && mb_strlen($this->descricao) > 70 ) {
            $problemas[] = "A descrição não pode exceder 70 caracteres.";
        }
        return $problemas;
    }

}


?>