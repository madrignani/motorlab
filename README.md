# MotorLab

Este sistema web visa gerenciar os processos operacionais de oficinas mecânicas automotivas, aplicando os princípios do **Sistema Toyota de Produção** para otimizar qualidade e eficiência. Ele controla o fluxo de trabalho desde o contato inicial com o cliente até o fechamento do serviço, incluindo cadastro de clientes e veículos, geração e acompanhamento de Ordens de Serviço, cálculo final e gestão de estoque. 

O software faz parte do meu **Projeto Final 2 (TCC)**, desenvolvido sob a orientação do professor **Rafael Elias de Lima Escalfoni**, no curso de **Bacharelado em Sistemas de Informação do CEFET/RJ**, Campus Nova Friburgo.

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

- `vite`: 7.1.2
- `typescript`: 5.8.3
- `vitest`: 3.2.4
- `playwright/test`: 1.55.0

### Back-end (listadas no "composer.json")

No diretório `back`, a API PHP utiliza a seguinte dependência:

- `Laravel`: 12.0 (engloba todas as bibliotecas necessárias)



## Licença

Este projeto está licenciado sob os termos da [Licença MIT](./LICENSE).