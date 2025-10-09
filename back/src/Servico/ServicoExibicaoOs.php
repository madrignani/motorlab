<?php


namespace App\Servico;
use App\Excecao\DominioException;
use App\Excecao\AutenticacaoException;
use App\Repositorio\RepositorioCliente;
use App\Repositorio\RepositorioItem;
use App\Repositorio\RepositorioOs;
use App\Repositorio\RepositorioOsCusto;
use App\Repositorio\RepositorioUsuario;
use App\Repositorio\RepositorioVeiculo;
use App\Dto\ItemDto;
use App\Dto\UsuarioDto;
use App\Dto\VeiculoDto;
use Throwable;
use DateTime;


class ServicoExibicaoOs {
    
    private RepositorioCliente $repositorioCliente;
    private RepositorioItem $repositorioItem;
    private RepositorioOs $repositorioOs;
    private RepositorioOsCusto $repositorioOsCusto;
    private RepositorioUsuario $repositorioUsuario;
    private RepositorioVeiculo $repositorioVeiculo;

    public function __construct (
        Transacao $transacao,
        RepositorioCliente $repositorioCliente,
        RepositorioItem $repositorioItem,
        RepositorioOs $repositorioOs,
        RepositorioOsCusto $repositorioOsCusto,
        RepositorioUsuario $repositorioUsuario,
        RepositorioVeiculo $repositorioVeiculo
    ) {
        $this->transacao = $transacao;
        $this->repositorioCliente = $repositorioCliente;
        $this->repositorioItem = $repositorioItem;
        $this->repositorioOs = $repositorioOs;
        $this->repositorioOsCusto = $repositorioOsCusto;
        $this->repositorioUsuario = $repositorioUsuario;
        $this->repositorioVeiculo = $repositorioVeiculo;
    }

    public function buscarDadosOs(int $id) {
        if (!$id) {
            throw DominioException::comProblemas( ['Dados obrigatórios não informados.'] );
        }
    }

}


?>