<?php


namespace App\Repositorio;


interface RepositorioCliente {

    public function salvar(string $cpf, string $nome, string $telefone, string $email): void;
    public function buscarPorCpfOuNome(string $valor): ?array;
    public function buscarPorId(int $id): ?array;

}


?>