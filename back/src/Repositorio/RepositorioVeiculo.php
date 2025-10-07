<?php


namespace App\Repositorio;


interface RepositorioVeiculo {

    public function salvar(int $clienteId, string $placa, string $chassi, string $fabricante, string $modelo, int $ano, int $quilometragem): void;
    public function buscarPorCliente(int $idCiente): array;
    public function buscarPorId(int $id): ?array;

}


?>