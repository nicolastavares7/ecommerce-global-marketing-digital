# DigitalTrack — E-commerce Global e Marketing Digital

Projeto individual com conteúdo educativo, simulador financeiro e comparação de cenários de venda. HTML, CSS, JavaScript, Node.js, MySQL e Chart.js, organizados na base WebDataViz.

O DigitalTrack permite salvar e comparar cenários de venda, entendendo como preço, custos e anúncios afetam o resultado estimado antes de testar uma operação.

## Executar

1. Instale as dependências: `npm install`.
2. Banco novo: execute `src/database/script-tabelas.sql` no Workbench.
Use apenas `src/database/script-tabelas.sql` para criar uma instalação nova. O banco local já está atualizado e os registros existentes devem ser preservados. Usuários e cenários podem ser cadastrados pelo site.
4. Configure sua conexão local em `.env.dev`, usando `.env.example` como referência.
5. Inicie o Node com `npm start` e abra `http://localhost:3334/`.
6. Cadastre uma conta e faça login. A dashboard abre em `/dashboard.html`.

Os arquivos `.env` e `.env.dev` contêm configurações locais e não são enviados ao Git. Não substitua suas credenciais pelo exemplo.

## Organização

- `public`: telas, estilos, scripts e imagens.
- `public`: inclui também `dashboard.html`, `nova-simulacao.html` e `analise.html`, junto das demais páginas, sem pop-up.
- `src/routes`: recebe os endereços e chama os controllers.
- `src/controllers`: valida os campos e chama os models.
- `src/models`: consultas SQL, com os valores separados por parâmetros.
- `src/database`: conexão, criação das tabelas, atualização e exemplos opcionais.
- `docs/modelagem`: diagrama e explicação das tabelas.

O `app.js`, as rotas de usuários e a estrutura de conexão preservam a base original. Os nomes e campos das funcionalidades foram adaptados ao DigitalTrack. Não há novos pacotes ou framework.

## Fluxo para explicar

Página → fetch → rota → controller → model → MySQL → controller → resposta JSON → página.

Exemplo: salvar um cenário envia produto e frete separados. O controller valida, o model faz o INSERT e retorna o novo ID. A página abre `analise.html?id=ID`. Essa tela consulta o registro e calcula os indicadores.

## Dashboard

A conta começa vazia. Os quatro indicadores mostram total, positivos, equilíbrio e negativos. Dois gráficos comparam resultados e custos. A tabela permite ordenar, analisar e excluir. A análise individual mostra os valores por unidade, a projeção mensal, a margem, o ROAS e o limite de anúncio. Todos são estimativas baseadas nos custos informados.

`public/js/contas-simulacao.js` contém as contas e a formatação compartilhadas pelas páginas. Os scripts usam funções comuns, `let`, `if/else`, vetores e laços `for`, com o estilo de recuo do exemplo Interestelar. A comunicação usa `fetch`, `then` e `catch`, como na base. Chart.js é carregado por CDN na versão 4.4.8.

Produto e frete estão em duas colunas na mesma tabela. A atualização dos registros antigos preserva o custo total e inicia o frete separado em zero: consulte o comentário do script antes de usá-lo.

## Simulador financeiro

A calculadora pública aceita BRL, USD, EUR, GBP e COP. A cotação é manual; no BRL, vale 1. Produto e frete são campos separados. O modo COD projeta o efeito de pedidos enviados sem pagamento e informa suas hipóteses. Esse modo não é salvo na dashboard.

## Documentação e demonstração

- [Detalhes das telas, contas e conferência manual](DASHBOARD.md)
- [DER e relacionamento](docs/modelagem/README.md)
- [Diagrama](docs/modelagem/der.svg)
- [Criação das tabelas](src/database/script-tabelas.sql)

A conta de demonstração é cadastrada pelo site. O script opcional acrescenta quatro cenários somente à conta indicada; não preenche contas novas automaticamente.

## Limite do login didático

O login salva ID, nome e e-mail no `sessionStorage`, como na base WebDataViz. As consultas filtram pelo ID informado pela página. Isso não comprova a identidade no servidor e não oferece autorização para dados de clientes em produção. As senhas mantêm o formato scrypt existente.
