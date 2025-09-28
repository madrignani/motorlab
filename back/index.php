<?php


require_once __DIR__ . '/vendor/autoload.php';


use App\Autenticacao\Autenticacao;
use App\Autenticacao\Sessao;
use App\Config\Conexao;
use App\Excecao\AutenticacaoException;
use App\Excecao\DominioException;
use App\Excecao\RepositorioException;
use App\Transacao\TransacaoPDO;
use App\Servico\ServicoAutenticacao;
use App\Servico\ServicoCadastroCliente;
use App\Servico\ServicoCadastroVeiculo;
use App\Repositorio\RepositorioUsuarioBDR;
use App\Repositorio\RepositorioClienteBDR;
use App\Repositorio\RepositorioVeiculoBDR;
use App\Dto\UsuarioDTO;


use \phputil\router\Router;
use function \phputil\cors\cors;


date_default_timezone_set('America/Sao_Paulo');


$app = new Router();


$app->use( cors([
    'origin' => ['http://localhost:5173', 'http://localhost:8080'],
    'allowedHeaders' => ['Host', 'Origin', 'Accept', 'Content-Type'],
    'exposeHeaders' => ['Content-Type'],
    'allowMethods' => ['GET','POST','PATCH','DELETE','OPTIONS'],
    'allowCredentials' => true
]) );



////////////////////////////////////////////////////////////////////////



$app->post( '/login', function($req, $res) {
    try {
        $dados = ( (array)$req->body() );
        if ( (empty($dados['login'])) || (empty($dados['senha'])) ) {
            throw DominioException::comProblemas( ['Login e senha são obrigatórios.'] );
        }
        $login = ( (string)$dados['login'] );
        $senha = ( (string)$dados['senha'] );
        $pdo = Conexao::conectar();
        $repositorio = new RepositorioUsuarioBDR($pdo);
        $servico = new ServicoAutenticacao($repositorio);
        $autenticacao = new Autenticacao($servico);
        $usuario = $autenticacao->autenticar($login, $senha);
        $sessao = new Sessao();
        $sessao->criaSessao($usuario);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    }  catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->post( '/logout', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $sessao->destruir();
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->get( '/me', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->get( '/dados-usuario', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $usuarioDto = new UsuarioDTO (
            $logado['id_usuario'],
            $logado['cpf_usuario'],
            $logado['nome_usuario'],
            $logado['email_usuario'],
            $logado['cargo_usuario']
        );
        $res->status(200)->json( $usuarioDto->arrayDados() );
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->post( '/clientes', function($req, $res) {
    try{
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $dados = ( (array)$req->body() );
        if ( (empty($dados['cpf'])) || (empty($dados['nome'])) || (empty($dados['telefone'])) || (empty($dados['email'])) ) {
            throw DominioException::comProblemas( ['Dados necessários para cadastrar o Cliente não foram recebidos.'] );
        }
        $pdo = Conexao::conectar();
        $repositorio = new RepositorioClienteBDR($pdo);
        $servico = new ServicoCadastroCliente($repositorio); 
        $servico->cadastrarCliente($dados, $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    }  catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->get( '/clientes/:busca', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $busca = $req->param('busca');
        $pdo = Conexao::conectar();
        $repositorioCliente = new RepositorioClienteBDR($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBDR($pdo);
        $servico = new ServicoCadastroVeiculo($repositorioCliente, $repositorioVeiculo);
        $cliente = $servico->buscarCliente(
            $busca,
            $logado['cargo_usuario'] 
        );
        $res->status(200)->json($cliente);
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->post( '/veiculos', function($req, $res) {
    try{
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $dados = ( (array)$req->body() );
        if ( (empty($dados['cliente_id'])) || (empty($dados['placa'])) || (empty($dados['chassi'])) || (empty($dados['fabricante']))
            || (empty($dados['modelo'])) || (empty($dados['ano'])) || (empty($dados['quilometragem'])) ) {
            throw DominioException::comProblemas( ['Dados necessários para cadastrar o Veículo não foram recebidos.'] );
        }
        $pdo = Conexao::conectar();
        $repositorioCliente = new RepositorioClienteBDR($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBDR($pdo);
        $servico = new ServicoCadastroVeiculo($repositorioCliente, $repositorioVeiculo);
        $cliente = $servico->cadastrarVeiculo($dados, $logado['cargo_usuario'] );
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    }  catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );


$app->listen();


?>