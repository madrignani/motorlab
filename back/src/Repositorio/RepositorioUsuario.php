<?php


namespace App\Repositorio;


interface RepositorioUsuario {

    public function buscarPorId(int $id): ?array;
    public function buscarPorCpfOuEmail(string $valor): ?array;
    public function verificarHash(int $id, string $hash): bool;
    public function listarMecanicos(): array;

}


?>