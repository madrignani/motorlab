<?php


namespace App\Repositorio;


interface RepositorioOsCusto {

    public function salvar(array $dados): void;
    public function buscarPorOsId(int $osId): array;

}


?>