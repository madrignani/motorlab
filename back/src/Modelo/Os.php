<?php


namespace App\Modelo;
use DateTime;


class Os {

    private int $id;
    private Cliente $cliente;
    private Veiculo $veiculo;
    private Usuario $usuarioCriacao;
    private Usuario $usuarioResponsavel;
    private string $status;
    private DateTime $dataHoraCriacao;
    private DateTime $previsaoEntrega;
    private float $valorEstimado;
    private float $valorFinal;
    private ?string $observacoes;

    public function __construct(
        int $id,
        Cliente $cliente,
        Veiculo $veiculo,
        Usuario $usuarioCriacao,
        Usuario $usuarioResponsavel,
        string $status,
        DateTime $dataHoraCriacao,
        DateTime $previsaoEntrega,
        float $valorEstimado,
        float $valorFinal,
        ?string $observacoes
    ) {
        $this->id = $id;
        $this->cliente = $cliente;
        $this->veiculo = $veiculo;
        $this->usuarioCriacao = $usuarioCriacao;
        $this->usuarioResponsavel = $usuarioResponsavel;
        $this->status = $status;
        $this->dataHoraCriacao = $dataHoraCriacao;
        $this->previsaoEntrega = $previsaoEntrega;
        $this->valorEstimado = $valorEstimado;
        $this->valorFinal = $valorFinal;
        $this->observacoes = $observacoes;
    }

    public function getId(): int { return $this->id; }
    public function getCliente(): Cliente { return $this->cliente; }
    public function getVeiculo(): Veiculo { return $this->veiculo; }
    public function getUsuarioCriacao(): Usuario { return $this->usuarioCriacao; }
    public function getUsuarioResponsavel(): Usuario { return $this->usuarioResponsavel; }
    public function getStatus(): string { return $this->status; }
    public function getDataHoraCriacao(): DateTime { return $this->dataHoraCriacao; }
    public function getPrevisaoEntrega(): DateTime { return $this->previsaoEntrega; }
    public function getValorEstimado(): float { return $this->valorEstimado; }
    public function getValorFinal(): float { return $this->valorFinal; }
    public function getObservacoes(): ?string { return $this->observacoes; }

    public function validar(): array {
        $problemas = [];
        $statusValidos = [ 'PROVISORIA', 'ANDAMENTO', 'ALERTA', 'CONCLUIDA', 'FINALIZADA', 'CANCELADA' ];
        if ( !in_array($this->status, $statusValidos, true) ) {
            $problemas[] = "Status da OS inválido.";
        }
        if ( $this->dataHoraCriacao > (new DateTime()) ) {
            $problemas[] = "A data e hora de criação da OS não pode ser no futuro.";
        }
        if ( $this->previsaoEntrega <= $this->dataHoraCriacao ) {
            $problemas[] = "A previsão de entrega da OS deve ser após a data de criação.";
        }
        if ( $this->valorEstimado < 0 ) {
            $problemas[] = "O valor estimado da OS não pode ser negativo.";
        }
        if ( $this->valorFinal < 0 ) {
            $problemas[] = "O valor final da OS não pode ser negativo.";
        }
        if ( $this->observacoes !== null && mb_strlen($this->observacoes) > 2000 ) {
            $problemas[] = "Observações da OS não pode exceder 2000 caracteres.";
        }
        return $problemas;
    }

}


?>