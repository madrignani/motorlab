<?php


namespace App\Autenticacao;
use App\Excecao\AutenticacaoException;
use App\Modelo\Usuario;


class Sessao {
    
    public function iniciar(): void {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_set_cookie_params( [
                'lifetime' => 86400,
                'httponly' => true,
                'samesite' => 'Lax'
            ] );
            session_start();
        }
    }

    public function criaSessao(Usuario $usuario): void {
        $this->iniciar();
        session_regenerate_id(true);
        $_SESSION['id_usuario'] = $usuario->getId();
        $_SESSION['cpf_usuario'] = $usuario->getCpf();
        $_SESSION['nome_usuario'] = $usuario->getNome();
        $_SESSION['email_usuario'] = $usuario->getEmail();
        $_SESSION['cargo_usuario'] = $usuario->getCargo();
    }

    public function estaLogado(): bool {
        $this->iniciar();
        if ( !isset($_SESSION['id_usuario']) ) {
            throw new AutenticacaoException( 'Acesso negado. Faça login.' );
        }
        return true;
    }

    public function dadosUsuarioLogado(): array {
        $this->iniciar();
        if ( !isset($_SESSION['id_usuario']) ) {
            throw new AutenticacaoException( 'Sessão inexistente.' );
        }
        return [
            'id_usuario' => $_SESSION['id_usuario'],
            'cpf_usuario' => $_SESSION['cpf_usuario'],
            'nome_usuario' => $_SESSION['nome_usuario'],
            'email_usuario' => $_SESSION['email_usuario'],
            'cargo_usuario' => $_SESSION['cargo_usuario']
        ];
    }

    public function destruir(): void {
        $this->iniciar();
        session_regenerate_id(true);
        $_SESSION = [];
        if ( ini_get('session.use_cookies') ) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 86400,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        session_destroy();
    }

}


?>