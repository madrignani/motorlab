<?php


use App\Config\Conexao;
use App\Excecao\DominioException;
use App\Repositorio\RepositorioUsuarioBdr;
use App\Servico\ServicoAutenticacao;


describe( 'ServicoAutenticacao', function () {

    beforeAll( function () {
        $this->pdo = Conexao::conectar();
        $this->repositorioUsuario = new RepositorioUsuarioBdr($this->pdo);
        $this->servico = new ServicoAutenticacao($this->repositorioUsuario);
    } );

    it( "Deve mapear Usuario com dados corretos - MECANICO", function() {
        $executar = function () {
            $dados = [
                'id' => 1,
                'cpf' => '123.456.789-00',
                'nome' => 'João Silva',
                'email' => 'joao.silva@motorlab.com.br',
                'cargo' => 'MECANICO',
                'ativo' => 1
            ];
            $usuario = $this->servico->mapearUsuario($dados);
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve mapear Usuario com dados corretos - GERENTE", function() {
        $executar = function () {
            $dados = [
                'id' => 2,
                'cpf' => '987.654.321-00',
                'nome' => 'Maria Santos',
                'email' => 'maria.santos@motorlab.com.br',
                'cargo' => 'GERENTE',
                'ativo' => 1
            ];
            $usuario = $this->servico->mapearUsuario($dados);
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve mapear Usuario com ativo como false", function() {
        $executar = function () {
            $dados = [
                'id' => 3,
                'cpf' => '111.222.333-44',
                'nome' => 'Pedro Costa',
                'email' => 'pedro.costa@motorlab.com.br',
                'cargo' => 'MECANICO',
                'ativo' => 0
            ];
            $usuario = $this->servico->mapearUsuario($dados);
        };
        expect($executar)->not->toThrow();
    } );

    it( "Deve buscar usuario por CPF existente", function() {
        $cpf = '01234567895';
        $resultado = $this->servico->buscarUsuarioPorCpfOuEmail($cpf);
        expect($resultado)->toBeA('array');
    } );

    it( "Deve buscar usuario por email existente", function() {
        $email = 'carlos.freitas@email.com';
        $resultado = $this->servico->buscarUsuarioPorCpfOuEmail($email);
        expect($resultado)->toBeA('array');
    } );

} );


?>