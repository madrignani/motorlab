# MotorLab

Este sistema web visa gerenciar os processos operacionais de oficinas mecânicas automotivas, aplicando os princípios do **Sistema Toyota de Produção** para otimizar qualidade e eficiência. Ele controla o fluxo de trabalho desde o contato inicial com o cliente até o fechamento do serviço, incluindo cadastro de clientes e veículos, geração e acompanhamento de Ordens de Serviço, cálculo final e gestão de estoque. 

O software é o elemento central do meu **Projeto Final 2 (TCC)**, desenvolvido sob a orientação do professor **Rafael Elias de Lima Escalfoni**, no curso de **Bacharelado em Sistemas de Informação do CEFET/RJ**, Campus Nova Friburgo.

Desenvolvido por **Giovanni de Oliveira Madrignani**.



## Ambiente de desenvolvimento

Para executar o projeto é necessário ter previamente instalado e configurado no ambiente: 

- [Node.js](https://nodejs.org/) (versão 18.0+)
- [PNPM](https://pnpm.io/) (versão 10.11.0+)
- [PHP](https://www.php.net/) (versão 8.4.3+)
- [Composer](https://getcomposer.org/) (versão 2.8.9+)
- [MariaDB](https://mariadb.org/) ou MySQL (versão 5.7+)



## Dependências

### Front-end (listadas no "package.json")

No diretório `front`, o TypeScript utiliza as seguintes dependências:

- `@playwright/test`: ^1.55.0 - Framework para testes end-to-end
- `@types/node`: ^24.10.1 - Definições de tipos TypeScript para Node.js
- `dotenv`: ^17.2.3 - Carregamento de variáveis de ambiente
- `html2pdf.js`: ^0.12.1 - Conversão de HTML para PDF
- `mysql2`: ^3.15.3 - Cliente MySQL para Node.js
- `typescript`: ~5.8.3 - Linguagem TypeScript
- `vite`: ^7.1.2 - Build tool e dev server
- `vitest`: ^3.2.4 - Framework de testes unitários

### Back-end (listadas no "composer.json")

No diretório `back`, a API PHP utiliza as seguintes dependências:

- `phputil/router`: dev-main - Roteamento de requisições HTTP
- `phputil/cors`: dev-main - Gerenciamento de CORS
- `kahlan/kahlan`: ^6.0 - Framework de testes para PHP



## Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/madrignani/motorlab.git
cd motorlab
```

### 2. Configurar o Banco de Dados

**Requisitos:** MariaDB ou MySQL instalado e em execução (recomendado via XAMPP, WAMP, Laragon, etc).

1. Acesse o phpMyAdmin em [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
2. Crie um novo banco de dados chamado `motorlab`
3. Importe os arquivos SQL na seguinte ordem:
   - Selecione o banco `motorlab`
   - Vá até a aba **Importar**
   - Importe primeiro o arquivo `back/bd/estrutura.sql` (cria as tabelas)
   - Depois importe o arquivo `back/bd/dados.sql` (popula os dados iniciais)


### 3. Configurar o Back-end

No diretório `back`:

```bash
cd back
composer install
```

**Configurar variáveis de ambiente:**
- Certifique-se de que as credenciais do banco de dados estão corretas em `src/Config/Conexao.php`
- Por padrão, o sistema usa: host `localhost`, usuário `dev`, senha vazia, banco `motorlab`


### 4. Iniciar a API (Back-end)

No diretório `back`:

```bash
php -S localhost:8080
```

A API estará disponível em [http://localhost:8080](http://localhost:8080)


### 5. Configurar o Front-end

No diretório `front`:

```bash
cd front
pnpm install
```

### 6. Iniciar o Front-end

No diretório `front`:

```bash
pnpm dev
```

O front-end estará disponível em [http://localhost:5173](http://localhost:5173)


### 7. Acessar o Sistema

- **Front-end:** [http://localhost:5173](http://localhost:5173)
- **API (Back-end):** [http://localhost:8080](http://localhost:8080)

### Comandos úteis

**Front-end:**
```bash
pnpm build       # Gerar build de produção
pnpm preview     # Visualizar build de produção
```

**Back-end:**
```bash
composer dump    # Regenerar autoload
composer serve   # Iniciar servidor PHP
```


## Licença

Este projeto está licenciado sob os termos da [Licença MIT](./LICENSE).