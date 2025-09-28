<?php


namespace App\Dto;


class ClienteDto {

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

    public function arrayDados(): array {
        return [
            'id' => $this->id,
            'cpf' => $this->cpf,
            'nome' => $this->nome,
            'telefone' => $this->telefone,
            'email' => $this->email
        ];
    }
    
}


?>