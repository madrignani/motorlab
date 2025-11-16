<?php


namespace App\Dto;


class OsDto {

    private int $id;
    private string $status;
    private string $dataHoraCriacao;
    private ?string $dataHoraFinalizacao;
    private string $previsaoEntregaSugerida;
    private string $previsaoEntrega;
    private float $valorMaoObraSugerido;
    private float $valorMaoObra;
    private float $valorEstimadoSugerido;
    private float $valorEstimado;
    private float $valorFinal;
    private ?string $observacoes;
    private array $cliente;
    private array $veiculo;
    private array $usuarioCriacao;
    private array $usuarioResponsavel;
    private array $servicos;
    private ?array $custos;
    private ?array $produtos;
    private ?array $laudo;
    private ?array $pagamento;

    public function __construct(
        int $id,
        string $status,
        string $dataHoraCriacao,
        ?string $dataHoraFinalizacao,
        string $previsaoEntregaSugerida,
        string $previsaoEntrega,
        float $valorMaoObraSugerido,
        float $valorMaoObra,
        float $valorEstimadoSugerido,
        float $valorEstimado,
        float $valorFinal,
        ?string $observacoes,
        array $cliente,
        array $veiculo,
        array $usuarioCriacao,
        array $usuarioResponsavel,
        array $servicos,
        ?array $custos = null,
        ?array $produtos = null,
        ?array $laudo = null,
        ?array $pagamento = null
    ) {
        $this->id = $id;
        $this->status = $status;
        $this->dataHoraCriacao = $dataHoraCriacao;
        $this->dataHoraFinalizacao = $dataHoraFinalizacao;
        $this->previsaoEntregaSugerida = $previsaoEntregaSugerida;
        $this->previsaoEntrega = $previsaoEntrega;
        $this->valorMaoObraSugerido = $valorMaoObraSugerido;
        $this->valorMaoObra = $valorMaoObra;
        $this->valorEstimadoSugerido = $valorEstimadoSugerido;
        $this->valorEstimado = $valorEstimado;
        $this->valorFinal = $valorFinal;
        $this->observacoes = $observacoes;
        $this->cliente = $cliente;
        $this->veiculo = $veiculo;
        $this->usuarioCriacao = $usuarioCriacao;
        $this->usuarioResponsavel = $usuarioResponsavel;
        $this->servicos = $servicos;
        $this->custos = $custos;
        $this->produtos = $produtos;
        $this->laudo = $laudo;
        $this->pagamento = $pagamento;
    }

    public function arrayDados(): array {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'dataHoraCriacao' => $this->dataHoraCriacao,
            'dataHoraFinalizacao' => $this->dataHoraFinalizacao,
            'previsaoEntregaSugerida' => $this->previsaoEntregaSugerida,
            'previsaoEntrega' => $this->previsaoEntrega,
            'valorMaoObraSugerido' => $this->valorMaoObraSugerido,
            'valorMaoObra' => $this->valorMaoObra,
            'valorEstimadoSugerido' => $this->valorEstimadoSugerido,
            'valorEstimado' => $this->valorEstimado,
            'valorFinal' => $this->valorFinal,
            'observacoes' => $this->observacoes,
            'cliente' => $this->cliente,
            'veiculo' => $this->veiculo,
            'usuarioCriacao' => $this->usuarioCriacao,
            'usuarioResponsavel' => $this->usuarioResponsavel,
            'servicos' => $this->servicos,
            'custos' => $this->custos,
            'produtos' => $this->produtos,
            'laudo' => $this->laudo,
            'pagamento' => $this->pagamento
        ];
    }
    
}


?>