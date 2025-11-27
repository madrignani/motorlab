# MotorLab

Este sistema web visa gerenciar os processos operacionais de oficinas mecânicas automotivas, aplicando os princípios do **Sistema Toyota de Produção** para otimizar qualidade e eficiência. Ele controla o fluxo de trabalho desde o contato inicial com o cliente até o fechamento do serviço, incluindo cadastro de clientes e veículos, geração e acompanhamento de Ordens de Serviço, cálculo final e gestão de estoque. 

O software é o elemento central do meu **Projeto Final 2 (TCC)**, desenvolvido sob a orientação do professor **Rafael Elias de Lima Escalfoni**, no curso de **Bacharelado em Sistemas de Informação do CEFET/RJ**, Campus Nova Friburgo.

Desenvolvido por **Giovanni de Oliveira Madrignani**.





## Funcionalidades

### Gestão de Clientes e Veículos
- Cadastro completo de clientes
- Cadastro de veículos vinculados aos clientes
- Busca e consulta de clientes e veículos


### Ordens de Serviço (OS)

O sistema de Ordens de Serviço aplica os princípios do **Sistema Toyota de Produção (STP)**, oferecendo:

**Cadastro e Criação de OS:**
- Criação de OS vinculada a cliente e veículo específico
- Seleção de serviços do catálogo com tarefas pré-configuradas em ordem de execução
- Cada serviço possui tempo de execução padrão e valor de mão de obra base
- Sistema de permissões (ATENDENTE, MECÂNICO E GERENTE)
- Valores sugeridos calculados automaticamente:
  - **Previsão de entrega:** soma dos tempos padrão de todos os serviços
  - **Valor de mão de obra sugerido:** soma dos valores de todos os serviços

**Personalização de Serviços:**
- Adição e remoção de tarefas com base nas condições do veículo
- Reordenação de tarefas seguindo o conceito de fluxo contínuo do STP
- Vinculação de produtos do estoque a cada tarefa
- Adição de custos extras personalizados

**Quadro Kanban de Acompanhamento:**
- Visualização estilo kanban com 6 colunas de status:
  - **PROVISÓRIA:** OS em elaboração, aguardando efetivação
  - **EM ANDAMENTO:** OS efetivada e em execução
  - **ALERTA:** OS com problemas identificados (princípio Jidoka do STP)
  - **CONCLUÍDA:** Trabalho finalizado, aguardando laudo e pagamento
  - **FINALIZADA:** OS paga e encerrada
  - **CANCELADA:** OS cancelada

**Sistema de Alertas (Jidoka - STP):**
- Mecânicos podem sinalizar problemas durante a execução
- Alertas visuais para OS com prazo excedido
- Gerentes podem remover alertas após resolução

**Cálculo e Gestão de Valores:**
- Valor de mão de obra
- Valor total de produtos consumidos
- Valor de custos extras
- Valor estimado total atualizado em tempo real
- Comparação com valores sugeridos inicialmente

**Conclusão e Fechamento:**
- Geração de laudo técnico obrigatório ao concluir OS
- Laudo contém resumo dos serviços e recomendações
- Registro de pagamento com desconto progressivo baseado em método e cargo
- Exportação de laudo em PDF
- Histórico completo de datas (criação, previsão, finalização)


### Gestão de Estoque
- Cadastro de produtos 
- Controle de estoque mínimo
- Busca de produtos por termo
- Atualização e remoção de itens
- Baixa automática no estoque ao adicionar produtos na OS





## Arquitetura do Projeto

### Back-end (PHP)

O back-end segue uma arquitetura em camadas com separação de responsabilidades:

```
back/
├── src/
│   ├── Autenticacao/       # sistema de autenticação e sessões
│   ├── Config/             # configurações (conexão BD)
│   ├── Dto/                # Data Transfer Objects
│   ├── Excecao/            # exceções personalizadas
│   ├── Modelo/             # entidades de domínio
│   ├── Repositorio/        # camada de acesso a dados
│   ├── Servico/            # lógica de negócio
│   ├── Transacao/          # gerenciamento de transações
│   └── Utils/              # utilitários diversos
├── bd/                     # scripts SQL
├── test/                   # testes unitários
└── index.php               # ponto de entrada da API
```

**Padrões utilizados:**
- **DTO (Data Transfer Object)**: Transferência de dados entre camadas
- **Service Layer**: Encapsulamento da lógica de negócio
- **Dependency Injection**: Injeção de dependências via construtor
- **Transaction Script**: Gerenciamento de transações de banco de dados


### Front-end (TypeScript)

```
front/
├── src/
│   ├── controladora/       # lógica de controle
│   ├── gestor/             # conexão com a API
│   ├── infra/              # infraestrutura de erros
│   └── visao/              # gerencimento dos componentes de UI
├── estilo/                 # CSS e assets
├── test/
│   ├── e2e/                # testes end-to-end
│   └── unit/               # testes unitários
└── *.html                  # páginas HTML
```

**Padrões utilizados:**
- **MVC (Model-View-Controller)**: Separação de responsabilidades
- **Módulos ES6**: Organização modular do código





## Ambiente de desenvolvimento

Para executar o projeto é necessário ter previamente instalado e configurado no ambiente: 

- [Node.js](https://nodejs.org/) (versão 18.0+)
- [PNPM](https://pnpm.io/) (versão 10.11.0+)
- [PHP](https://www.php.net/) (versão 8.4.3+)
- [Composer](https://getcomposer.org/) (versão 2.8.9+)
- [MariaDB](https://mariadb.org/) ou [MySQL](https://www.mysql.com/) (versão 5.7+)





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
```

### 2. Configurar o Banco de Dados

**Requisitos:** MariaDB ou MySQL instalado e em execução (recomendado via XAMPP ou WAMP).

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




## Testes

### Testes Unitários (Front-end)

Os testes unitários do front-end são executados com **Vitest**.

```bash
cd front
pnpm test
```

### Testes End-to-End (Front-end)

Os testes E2E são executados com **Playwright** e testam o fluxo completo da aplicação.

**Requisitos:** Certifique-se de que tanto o front-end quanto o back-end estejam em execução antes de rodar.

```bash
cd front
pnpm e2e
```

### Testes Unitários (Back-end)

Os testes unitários do back-end são executados com **Kahlan**.

**Nota:** A aplicação não precisa estar em execução para rodar estes testes.

```bash
cd back
composer test
```





## Licença

Este projeto está licenciado sob os termos da [Licença MIT](./LICENSE).





## Agradecimentos

- **CEFET/RJ**
- **Prof. Rafael Elias de Lima Escalfoni**
- **Sistema Toyota de Produção**