<?php


namespace App\Repositorio;


interface RepositorioLaudo {

    public function salvar(array $dados): int;
    public function buscarPorOs(int $osId): ?array;
    
}


?>