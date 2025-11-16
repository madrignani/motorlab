<?php



require_once __DIR__ . '/vendor/autoload.php';


use App\Autenticacao\Autenticacao;
use App\Autenticacao\Sessao;
use App\Config\Conexao;
use App\Excecao\AutenticacaoException;
use App\Excecao\DominioException;
use App\Excecao\RepositorioException;
use App\Transacao\TransacaoPdo;
use App\Servico\ServicoAutenticacao;
use App\Servico\ServicoCadastroCliente;
use App\Servico\ServicoCadastroItem;
use App\Servico\ServicoCadastroOs;
use App\Servico\ServicoCadastroVeiculo;
use App\Servico\ServicoExibicaoEdicaoOs;
use App\Servico\ServicoListagemItem;
use App\Repositorio\RepositorioClienteBdr;
use App\Repositorio\RepositorioItemBdr;
use App\Repositorio\RepositorioLaudoBdr;
use App\Repositorio\RepositorioOsBdr;
use App\Repositorio\RepositorioOsCustoBdr;
use App\Repositorio\RepositorioPagamentoBdr;
use App\Repositorio\RepositorioServicoBdr;
use App\Repositorio\RepositorioUsuarioBdr;
use App\Repositorio\RepositorioVeiculoBdr;
use App\Dto\UsuarioDto;


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
        $repositorio = new RepositorioUsuarioBdr($pdo);
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
        $usuarioDto = new UsuarioDto (
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
        $repositorio = new RepositorioClienteBdr($pdo);
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
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoCadastroVeiculo($repositorioCliente, $repositorioVeiculo);
        $cliente = $servico->buscarCliente($busca, $logado['cargo_usuario']);
        $res->status(200)->json($cliente);
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
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
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoCadastroVeiculo($repositorioCliente, $repositorioVeiculo);
        $servico->cadastrarVeiculo($dados, $logado['cargo_usuario'] );
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

$app->post( '/itens', function($req, $res) {
    try{
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $dados = ( (array)$req->body() );
        if ( (empty($dados['codigo'])) || (empty($dados['titulo'])) || (empty($dados['fabricante'])) || (empty($dados['descricao']))
            || (empty($dados['precoVenda'])) || (empty($dados['estoque'])) || (empty($dados['estoqueMinimo'])) || (empty($dados['localizacao'])) ) {
            throw DominioException::comProblemas( ['Dados necessários para cadastrar o Item não foram recebidos.'] );
        }
        $pdo = Conexao::conectar();
        $repositorio = new RepositorioItemBdr($pdo);
        $servico = new ServicoCadastroItem($repositorio); 
        $servico->cadastrarItem($dados, $logado['cargo_usuario']);
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

$app->get( '/itens', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $pdo = Conexao::conectar();
        $repositorio = new RepositorioItemBdr($pdo);
        $servico = new ServicoListagemItem($repositorio);
        $itens = $servico->listarItens();
        $res->status(200)->json($itens);
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->delete( '/itens-remover/:id', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = ( (int)($req->param('id')) );
        $pdo = Conexao::conectar();
        $repositorio = new RepositorioItemBdr($pdo);
        $servico = new ServicoListagemItem($repositorio);
        $servico->removerItem($id, $logado['cargo_usuario']);
        $res->status(200)->json($itens);
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->get( '/itens/:busca', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $busca = $req->param('busca');
        $pdo = Conexao::conectar();
        $repositorio = new RepositorioItemBdr($pdo);
        $servico = new ServicoListagemItem($repositorio);
        $item = $servico->buscarItem($busca);
        $res->status(200)->json($item);
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->patch( '/itens-atualizar/:id', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = ( (int)($req->param('id')) );
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $repositorio = new RepositorioItemBdr($pdo);
        $servico = new ServicoListagemItem($repositorio);
        $item = $servico->atualizarItem($id, $dados, $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->get( '/veiculos-por-cliente/:idCliente', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $idCliente = ( (int)$req->param('idCliente') );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoCadastroOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioOs, 
            $repositorioOsCusto, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $veiculos = $servico->buscarVeiculosPorCliente($idCliente, $logado['cargo_usuario']);
        $res->status(200)->json($veiculos);
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->get( '/responsaveis', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoCadastroOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioOs, 
            $repositorioOsCusto, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $responsaveis = $servico->listarResponsaveis($logado['cargo_usuario']);
        $res->status(200)->json($responsaveis);
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->get( '/servicos-cadastro/:busca', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $termo = ( $req->param('busca') );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoCadastroOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioOs, 
            $repositorioOsCusto, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servicos = $servico->buscarServicos($termo, $logado['cargo_usuario']);
        $res->status(200)->json($servicos);
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->get( '/itens-cod/:busca', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $codigo = $req->param('busca');
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoCadastroOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioOs, 
            $repositorioOsCusto, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $item = $servico->buscarItemPorCodigo($codigo);
        $res->status(200)->json($item);
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->post( '/ordens-servico', function($req, $res) {
    try{
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoCadastroOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioOs, 
            $repositorioOsCusto, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $osId = $servico->cadastrarOs($dados, $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->json($osId);
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

$app->get( '/ordens-servico/:id', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $id = $req->param('id');
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $os = $servico->buscarDadosOs($id);
        $res->status(200)->json($os);
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->get( '/servicos-edicao/:busca', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $termo = ( $req->param('busca') );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servicos = $servico->buscarServicos($termo, $logado['cargo_usuario']);
        $res->status(200)->json($servicos);
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->post( '/ordens-servico/:id/servicos', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->adicionarServico($id, $dados, $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->delete( '/ordens-servico/:id/servicos/:servicoId', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $servicoId = $req->param('servicoId');
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->removerServico($id, $servicoId, $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->post( '/ordens-servico/:id/servicos/:servicoId/tarefas', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $servicoId = $req->param('servicoId');
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->adicionarTarefa($id, $servicoId, $dados['descricao'], $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->put( '/ordens-servico/:id/reordenar-tarefa', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->reordenarTarefa($id, $dados, $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->delete( '/ordens-servico/:id/servicos/:servicoId/tarefas/:tarefaId', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $servicoId = $req->param('servicoId');
        $tarefaId = $req->param('tarefaId');
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->removerTarefa($id, $servicoId, $tarefaId, $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->post( '/ordens-servico/:id/produtos', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->adicionarProduto($id, $dados, $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->delete( '/ordens-servico/:id/produtos', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->removerProduto($id, $dados, $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->post( '/ordens-servico/:id/extras', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->adicionarExtra($id, $dados, $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->delete( '/ordens-servico/:id/extras/:extraId', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $extraId = $req->param('extraId');
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->removerExtra($id, $extraId, $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->put( '/ordens-servico/:id/status', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->atualizarStatus($id, $dados['status'], $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->put( '/ordens-servico/:id/mao-obra', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->atualizarMaoObra($id, $dados['valorMaoObra'], $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->put( '/ordens-servico/:id/data-entrega', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->atualizarDataEntrega($id, $dados['previsaoEntrega'], $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->put( '/ordens-servico/:id/observacoes', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->atualizarObservacoes($id, $dados['observacoes'], $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->post( '/ordens-servico/:id/concluir', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $logado = $sessao->dadosUsuarioLogado();
        $id = $req->param('id');
        $dados = ( (array)$req->body() );
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $servico->concluirOsComLaudo($id, $dados, $logado['id_usuario'], $logado['cargo_usuario']);
        $res->status(200)->end();
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );

$app->get( '/ordens-servico/:id/laudo', function($req, $res) {
    try {
        $sessao = new Sessao();
        $sessao->estaLogado();
        $id = $req->param('id');
        $pdo = Conexao::conectar();
        $transacao = new TransacaoPdo($pdo);
        $repositorioCliente = new RepositorioClienteBdr($pdo);
        $repositorioItem = new RepositorioItemBdr($pdo);
        $repositorioLaudo = new RepositorioLaudoBdr($pdo);
        $repositorioOs = new RepositorioOsBdr($pdo);
        $repositorioOsCusto = new RepositorioOsCustoBdr($pdo);
        $repositorioPagamento = new RepositorioPagamentoBdr($pdo);
        $repositorioServico = new RepositorioServicoBdr($pdo);
        $repositorioUsuario = new RepositorioUsuarioBdr($pdo);
        $repositorioVeiculo = new RepositorioVeiculoBdr($pdo);
        $servico = new ServicoExibicaoEdicaoOs(
            $transacao, $repositorioCliente, $repositorioItem, $repositorioLaudo, $repositorioOs, $repositorioOsCusto, 
            $repositorioPagamento, $repositorioServico, $repositorioUsuario, $repositorioVeiculo
        );
        $laudo = $servico->obterLaudo($id);
        $res->status(200)->json($laudo);
    } catch (AutenticacaoException $erro) {
        $res->status(401)->json( ['mensagens' => [$erro->getMessage()]] );
    } catch (DominioException $erro) {
        $res->status(400)->json( ['mensagens' => $erro->getProblemas()] );
    } catch (RepositorioException $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no repositório -> ' . $erro->getMessage()]] );
    } catch (Exception $erro) {
        $res->status(500)->json( ['mensagens' => ['Erro no servidor -> ' . $erro->getMessage()]] );
    }
} );



////////////////////////////////////////////////////////////////////////



$app->listen();



?>