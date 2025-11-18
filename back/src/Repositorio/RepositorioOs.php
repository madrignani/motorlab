<?php


namespace App\Repositorio;


interface RepositorioOs {

    public function listarTodas(): array;
    public function salvar(array $dados): int;
    public function buscarPorId(int $id): ?array;
    public function salvarServico(int $osId, int $servicoId): int;
    public function buscarServicosPorOs(int $osId): array;
    public function buscarOsServico(int $osId, int $servicoId): ?array;
    public function removerServico(int $osId, int $servicoId): void;
    public function salvarTarefa(int $osServicoId, string $descricao, int $ordenacao): int;
    public function atualizarOrdenacaoTarefa(int $tarefaId, int $ordenacao): void;
    public function atualizarOsTarefaServicoId(int $tarefaId, int $osServicoId): void;
    public function buscarTarefasPorServico(int $osServicoId): array;
    public function buscarUltimaOrdenacaoTarefa(int $osServicoId): int;
    public function removerTarefa(int $osId, int $servicoId, int $tarefaId): void;
    public function atualizarStatus(int $id, string $status): void;
    public function finalizarOs(int $id, float $valorFinal): void;
    public function atualizarMaoObra(int $id, float $valor): void;
    public function atualizarMaoObraSugerido(int $id, float $valor): void;
    public function atualizarPrevisaoEntrega(int $id, string $data): void;
    public function atualizarPrevisaoSugerida(int $id, string $data): void;
    public function atualizarObservacoes(int $id, string $observacoes): void;
    public function atualizarValorEstimado(int $id, float $valor): void;
    public function existeAtivaPeriodo(int $veiculoId, string $previsaoEntrega): bool;
    public function existeAtivaPorResponsavel(int $usuarioResponsavelId): bool;
    
}


?>