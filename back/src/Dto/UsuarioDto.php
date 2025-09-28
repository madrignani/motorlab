<?php


namespace App\Dto;


class UsuarioDto {

    private int $id;
    private string $cpf;
    private string $nome;
    private string $email;
    private string $cargo;

    public function __construct(
        int $id,
        string $cpf,
        string $nome,
        string $email,
        string $cargo
    ) {
        $this->id = $id;
        $this->cpf = $cpf;
        $this->nome = $nome;
        $this->email = $email;
        $this->cargo = $cargo;
    }

    public function arrayDados(): array {
        return [
            'id' => $this->id,
            'cpf' => $this->cpf,
            'nome' => $this->nome,
            'email' => $this->email,
            'cargo' => $this->cargo
        ];
    }
    
}


?>
