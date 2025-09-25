<?php


namespace App\Modelo;
use DateTime;


class Pagamento {

    private int $id;
    private Os $os;
    private Usuario $usuarioResponsavel;
    private DateTime $dataHora;
    private float $valor;
    private string $metodo;

    public function __construct(
        int $id,
        Os $os,
        Usuario $usuarioResponsavel,
        DateTime $dataHora,
        float $valor,
        string $metodo
    ) {
        $this->id = $id;
        $this->os = $os;
        $this->usuarioResponsavel = $usuarioResponsavel;
        $this->dataHora = $dataHora;
        $this->valor = $valor;
        $this->metodo = $metodo;
    }

    public function getId(): int { return $this->id; }
    public function getOs(): Os { return $this->os; }
    public function getUsuarioResponsavel(): Usuario { return $this->usuarioResponsavel; }
    public function getDataHora(): DateTime { return $this->dataHora; }
    public function getValor(): float { return $this->valor; }
    public function getMetodo(): string { return $this->metodo; }

    public function validar(): array {
        $problemas = [];
        if ( $this->valor <= 0 ) {
            $problemas[] = "O valor do pagamento deve ser maior que zero.";
        }
        if ( $this->metodo === '' || mb_strlen($this->metodo) > 30 ) {
            $problemas[] = "O método do pagamento deve ter entre 1 e 30 caracteres.";
        }
        if ( $this->dataHora > new DateTime() ) {
            $problemas[] = "A data e hora do pagamento não pode ser no futuro.";
        }
        return $problemas;
    }

}


?>