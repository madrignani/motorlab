<?php


namespace App\Repositorio;


interface RepositorioServico {

    public function buscarPorId(int $id): ?array;
    public function buscarPorTermo(string $termo): array;
    public function buscarTarefasPorServico(int $servicoId): array;

}


?>