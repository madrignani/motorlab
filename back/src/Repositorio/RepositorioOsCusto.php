<?php


namespace App\Repositorio;


interface RepositorioOsCusto {

    public function salvar(array $dados): void;
    public function buscarPorOs(int $osId): array;
    public function buscarProduto(int $produtoId, int $tarefaId): ?array;
    public function buscarProdutosPorTarefa(int $tarefaId): array;
    public function remover(int $id): void;

}


?>