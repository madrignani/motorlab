<?php


namespace App\Repositorio;


interface RepositorioPagamento {

    public function salvar(int $osId, int $usuarioResponsavel, float $valor, string $metodo): int;
    public function buscarPorOs(int $osId): ?array;

}


?>