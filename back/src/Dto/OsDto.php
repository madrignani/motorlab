<?php


namespace App\Dto;


class OsDto {

    private int $id;
    private int $clienteId;
    private int $veiculoId;
    private int $usuarioCriacaoId;
    private int $usuarioResponsavelId;
    private string $status;
    private string $dataHoraCriacao;
    private string $previsaoEntrega;
    private float $valorEstimado;
    private float $valorFinal;
    private ?string $observacoes;
    private array $cliente;
    private array $veiculo;
    private array $usuarioCriacao;
    private array $usuarioResponsavel;
    private array $custos;
    private ?array $laudo;
    private ?array $pagamento;

    public function __construct(
        int $id,
        int $clienteId,
        int $veiculoId,
        int $usuarioCriacaoId,
        int $usuarioResponsavelId,
        string $status,
        string $dataHoraCriacao,
        string $previsaoEntrega,
        float $valorEstimado,
        float $valorFinal,
        ?string $observacoes,
        array $cliente,
        array $veiculo,
        array $usuarioCriacao,
        array $usuarioResponsavel,
        array $custos,
        ?array $laudo,
        ?array $pagamento
    ) {
        $this->id = $id;
        $this->clienteId = $clienteId;
        $this->veiculoId = $veiculoId;
        $this->usuarioCriacaoId = $usuarioCriacaoId;
        $this->usuarioResponsavelId = $usuarioResponsavelId;
        $this->status = $status;
        $this->dataHoraCriacao = $dataHoraCriacao;
        $this->previsaoEntrega = $previsaoEntrega;
        $this->valorEstimado = $valorEstimado;
        $this->valorFinal = $valorFinal;
        $this->observacoes = $observacoes;
        $this->cliente = $cliente;
        $this->veiculo = $veiculo;
        $this->usuarioCriacao = $usuarioCriacao;
        $this->usuarioResponsavel = $usuarioResponsavel;
        $this->custos = $custos;
        $this->laudo = $laudo;
        $this->pagamento = $pagamento;
    }

    public function arrayDados(): array {
        return [
            'id' => $this->id,
            'clienteId' => $this->clienteId,
            'veiculoId' => $this->veiculoId,
            'usuarioCriacaoId' => $this->usuarioCriacaoId,
            'usuarioResponsavelId' => $this->usuarioResponsavelId,
            'status' => $this->status,
            'dataHoraCriacao' => $this->dataHoraCriacao,
            'previsaoEntrega' => $this->previsaoEntrega,
            'valorEstimado' => $this->valorEstimado,
            'valorFinal' => $this->valorFinal,
            'observacoes' => $this->observacoes,
            'cliente' => $this->cliente,
            'veiculo' => $this->veiculo,
            'usuarioCriacao' => $this->usuarioCriacao,
            'usuarioResponsavel' => $this->usuarioResponsavel,
            'custos' => $this->custos,
            'laudo' => $this->laudo,
            'pagamento' => $this->pagamento
        ];
    }
}

?>