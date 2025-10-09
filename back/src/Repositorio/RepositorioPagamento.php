<?php


namespace App\Repositorio;


interface RepositorioPagamento {

    public function buscarPorOsId(int $osId): ?array;

}


?>