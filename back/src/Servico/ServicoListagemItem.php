<?php


namespace App\Servico;
use App\Excecao\DominioException;
use App\Excecao\AutenticacaoException;
use App\Repositorio\RepositorioItem;
use App\Dto\ItemDto;
use App\Modelo\Item;


class ServicoListagemItem {

    private RepositorioItem $repositorio;

    public function __construct(RepositorioItem $repositorio) {
        $this->repositorio = $repositorio;
    }

    public function listarItens(): array {
        $itens = $this->repositorio->listar();
        $itensDTO = [];
        foreach ($itens as $item) {
            $dto = new ItemDto(
                ( (int)$item['id'] ),
                $item['codigo'],
                $item['titulo'],
                $item['fabricante'],
                $item['descricao'],
                ( (float)$item['preco_venda']),
                ( (int)$item['estoque']),
                ( (int)$item['estoque_minimo']),
                $item['localizacao']
            );
            $itensDTO[] = $dto->arrayDados();
        }
        return $itensDTO;
    }

    public function removerItem(int $id, string $cargoUsuarioLogado): void {
        if ($cargoUsuarioLogado !== 'ATENDENTE' && $cargoUsuarioLogado !== 'GERENTE') {
            throw new AutenticacaoException('Permissão negada.');
        }
        $removido = $this->repositorio->remover($id);
        if (!$removido) {
            throw DominioException::comProblemas( ['Item não encontrado para remoção.'] );
        }
    }

    public function buscarItem(string $id): array {
        $id = trim($id);
        $dados = $this->repositorio->buscarPorId($id);
        if ( empty($dados) ) {
            return [];
        }
        $itemDto = new ItemDto(
            ( (int)$dados['id'] ),
            $dados['codigo'],
            $dados['titulo'],
            $dados['fabricante'],
            $dados['descricao'],
            ( (float)$dados['preco_venda'] ),
            ( (int)$dados['estoque'] ),
            ( (int)$dados['estoque_minimo'] ),
            $dados['localizacao']
        );
        return $itemDto->arrayDados();
    }

    public function atualizarItem(int $id, array $dadosAlteracao, string $cargoUsuarioLogado): void {
        if ($cargoUsuarioLogado !== 'ATENDENTE' && $cargoUsuarioLogado !== 'GERENTE') {
            throw new AutenticacaoException('Permissão negada.');
        }
        $dados = $this->repositorio->buscarPorId($id);
        if ( empty($dados) ) {
            throw DominioException::comProblemas( ['Item não encontrado para alteração.'] );
        }
        if ( $dados['preco_venda'] == $dadosAlteracao['precoVenda'] && $dados['estoque'] == $dadosAlteracao['estoque'] && $dados['estoque_minimo'] == $dadosAlteracao['estoqueMinimo'] && $dados['localizacao'] === $dadosAlteracao['localizacao'] ) {
            throw DominioException::comProblemas( ['Nenhum campo foi alterado.'] );
        }
        $codigo = $dados['codigo'];
        $titulo = $dados['titulo'];
        $fabricante = $dados['fabricante'];
        $descricao = $dados['descricao'];
        $precoVenda = $dadosAlteracao['precoVenda'];
        $estoque = $dadosAlteracao['estoque'];
        $estoqueMinimo = $dadosAlteracao['estoqueMinimo'];
        $localizacao = $dadosAlteracao['localizacao'];
        $item = $this->mapearItem($codigo, $titulo, $fabricante, $descricao, $precoVenda, $estoque, $estoqueMinimo, $localizacao);
        $problemas = $item->validar();
        if ( !empty($problemas) ) {
            throw DominioException::comProblemas($problemas);
        }
        $this->repositorio->atualizar($id, $precoVenda, $estoque, $estoqueMinimo, $localizacao);
    }

    private function mapearItem(string $codigo, string $titulo, string $fabricante, string $descricao, float $precoVenda, int $estoque, int $estoqueMinimo, string $localizacao): Item {
        return new Item(0, $codigo, $titulo, $fabricante, $descricao, $precoVenda, $estoque, $estoqueMinimo, $localizacao);
    }

}


?>