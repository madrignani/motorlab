<?php


namespace App\Repositorio;


interface RepositorioOs {

    public function salvar(array $dados): int;
    public function buscarPorId(int $id): ?array;
    public function salvarServico(int $osId, int $servicoId): int;
    public function salvarTarefa(int $osServicoId, string $descricao, int $ordenacao): int;
    public function existeAtivaPeriodo(int $veiculoId, string $previsaoEntrega): bool;
    public function existeAtivaPorResponsavel(int $usuarioResponsavelId): bool;

}


?>