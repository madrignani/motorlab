<?php


namespace App\Repositorio;


interface RepositorioItem {

    public function salvar(string $codigo, string $titulo, string $fabricante, string $descricao, float $precoVenda, int $estoque, int $estoqueMinimo, string $localizacao): void;
    public function listar(): array;
    public function remover(int $id): bool;
    public function buscarPorId(int $id): ?array;
    public function atualizar(int $id, float $precoVenda, int $estoque, int $estoqueMinimo, string $localizacao): void;

}


?>