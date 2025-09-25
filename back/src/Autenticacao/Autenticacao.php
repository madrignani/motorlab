<?php


namespace App\Autenticacao;
use App\Config\ConfiguracaoEnv;
use App\Excecao\AutenticacaoException;
use App\Modelo\Usuario;
use App\Servico\ServicoAutenticacao;


class Autenticacao {

    private ServicoAutenticacao $servicoAutenticacao;

    public function __construct(ServicoAutenticacao $servicoAutenticacao) {
        $this->servicoAutenticacao = $servicoAutenticacao;
    }

    public function autenticar(string $login, string $senha): Usuario {
        $configEnv = new ConfiguracaoEnv();
        $pimenta = $configEnv->ler('PIMENTA');
        $usuario = $this->servicoAutenticacao->buscarUsuarioPorCpfOuEmail($login);
        if (!$usuario) {
            throw new AutenticacaoException( 'Usuário ou credenciais inválidas.' );
        }
        if (!(bool)(int)$usuario['ativo']) {
            throw new AutenticacaoException( 'Usuário inativo no sistema.' );
        }
        $senhaComposta = ( $usuario['sal'] . $senha . $pimenta );
        $hashGerado = hash('sha512', $senhaComposta);  
        if ( !$this->servicoAutenticacao->verificarHashUsuario($usuario['id'], $hashGerado) ) {
            throw new AutenticacaoException( 'Usuário ou credenciais inválidas.' );
        }
        $usuarioObj = $this->servicoAutenticacao->mapearUsuario($usuario);
        return $usuarioObj;
    }

}


?>