<?php


namespace App\Modelo;


class Usuario {

    private int $id;
    private string $cpf;
    private string $nome;
    private string $email;
    private string $cargo;
    private bool $ativo;

    public function __construct(
        int $id,
        string $cpf,
        string $nome,
        string $email,
        string $cargo,
        bool $ativo
    ) {
        $this->id = $id;
        $this->cpf = $cpf;
        $this->nome = $nome;
        $this->email = $email;
        $this->cargo = $cargo;
        $this->ativo = $ativo;
    }

    public function getId(): int { return $this->id; }
    public function getCpf(): string { return $this->cpf; }
    public function getNome(): string { return $this->nome; }
    public function getEmail(): string { return $this->email; }
    public function getCargo(): string { return $this->cargo; }
    public function estaAtivo(): bool { return $this->ativo; }

}


?>