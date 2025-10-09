<?php


namespace App\Repositorio;


interface RepositorioLaudo {

    public function buscarPorOsId(int $osId): ?array;

}


?>