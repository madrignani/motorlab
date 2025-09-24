<?php


namespace App\Config;


class ConfiguracaoEnv {

    private static bool $carregado = false;

    public function carregar(): void {
        if (self::$carregado) { 
            return;
        }
        $caminho = __DIR__ . '/../../.env';
        $variaveis = parse_ini_file($caminho, false, INI_SCANNER_RAW);
        foreach ( $variaveis as $nome=>$valor ) {
            putenv("$nome=$valor");
            $_ENV[$nome] = $valor;
        }
        self::$carregado = true;
    }

    public function ler(string $chave): string {
        $this->carregar();
        $valor = getenv($chave);
        if (!$valor) {
            return '';
        }
        return $valor;
    }

}


?>