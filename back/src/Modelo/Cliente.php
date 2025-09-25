<?php


namespace App\Modelo;


class Cliente {

    private int $id;
    private string $cpf;
    private string $nome;
    private string $telefone;
    private string $email;

    public function __construct(
        int $id,
        string $cpf,
        string $nome,
        string $telefone,
        string $email
    ) {
        $this->id = $id;
        $this->cpf = $cpf;
        $this->nome = $nome;
        $this->telefone = $telefone;
        $this->email = $email;
    }

    public function getId(): int { return $this->id; }
    public function getCpf(): string { return $this->cpf; }
    public function getNome(): string { return $this->nome; }
    public function getTelefone(): string { return $this->telefone; }
    public function getEmail(): string { return $this->email; }

    public function validar(): array {
        $problemas = [];
        if ( mb_strlen($this->nome) < 3 || mb_strlen($this->nome) > 70 ) {
            $problemas[] = "O nome do cliente deve conter entre 3 e 70 caracteres.";
        }
        if ( mb_strlen($this->cpf) !== 11 || !ctype_digit($this->cpf) ) {
            $problemas[] = "O CPF do cliente deve conter exatamente 11 dígitos numéricos.";
        }
        if ( mb_strlen($this->telefone) < 8 || mb_strlen($this->telefone) > 15 ) {
            $problemas[] = "O telefone do cliente deve conter entre 8 e 15 caracteres.";
        }
        return $problemas;
    }

}


?>