<?php


namespace App\Excecao;


class DominioException extends \RuntimeException {  

    private array $problemas = [];

    public function __construct(string $message = "", array $problemas = []) {
        parent::__construct($message);
        $this->problemas = $problemas;
    }

    public function getProblemas(): array {
        return $this->problemas;
    }

    public static function comProblemas(array $problemas): DominioException {
        $mensagem = "Problemas encontrados: " . implode(", ", $problemas);
        return new self($mensagem, $problemas);
    }

}


?>