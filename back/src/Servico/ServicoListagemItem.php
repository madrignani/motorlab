<?php


namespace App\Servico;
use App\Excecao\DominioException;
use App\Excecao\AutenticacaoException;
use App\Repositorio\RepositorioItem;
use App\Dto\ItemDto;


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

}


?>