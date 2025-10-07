<?php


namespace App\Repositorio;


interface RepositorioOs {

    public function salvar(array $dados): int;
    public function existeAtivaPeriodo(int $veiculoId, string $previsaoEntrega): bool;

}


?>