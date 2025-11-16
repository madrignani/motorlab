<?php


namespace App\Repositorio;


interface RepositorioPagamento {

    public function buscarPorOs(int $osId): ?array;

}


?>