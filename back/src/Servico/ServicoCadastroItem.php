<?php


namespace App\Servico;
use App\Excecao\DominioException;
use App\Excecao\AutenticacaoException;
use App\Repositorio\RepositorioItem;
use App\Modelo\Item;


class ServicoCadastroItem {

    private RepositorioItem $repositorio;

    public function __construct(RepositorioItem $repositorio) {
        $this->repositorio = $repositorio;
    }

    public function cadastrarItem(array $dados, string $cargoUsuarioLogado): void {
        if ($cargoUsuarioLogado !== 'ATENDENTE' && $cargoUsuarioLogado !== 'GERENTE') {
            throw new AutenticacaoException('Permissão negada.');
        }
        $codigo = $dados['codigo'];
        $titulo = $dados['titulo'];
        $fabricante = $dados['fabricante'];
        $descricao = $dados['descricao'];
        $precoVenda = $dados['precoVenda'];
        $estoque = $dados['estoque'];
        $estoqueMinimo = $dados['estoqueMinimo'];
        $localizacao = $dados['localizacao'];
        $item = $this->mapearItem($codigo, $titulo, $fabricante, $descricao, $precoVenda, $estoque, $estoqueMinimo, $localizacao);
        $problemas = $item->validar();
        if ( !empty($problemas) ) {
            throw DominioException::comProblemas($problemas);
        }
        $this->repositorio->salvar($codigo, $titulo, $fabricante, $descricao, $precoVenda, $estoque, $estoqueMinimo, $localizacao);
    }

    private function mapearItem(string $codigo, string $titulo, string $fabricante, string $descricao, float $precoVenda, int $estoque, int $estoqueMinimo, string $localizacao): Item {
        return new Item(0, $codigo, $titulo, $fabricante, $descricao, $precoVenda, $estoque, $estoqueMinimo, $localizacao);
    }

}


?>