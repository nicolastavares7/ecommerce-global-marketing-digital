# DigitalTrack — E-commerce Global e Marketing Digital

Projeto individual com conteúdo educativo, simulador financeiro e dashboard de cenários de venda. Desenvolvido com HTML, CSS, JavaScript, Node.js, MySQL e Chart.js, usando a organização do WebDataViz.

## Executar

1. Instale as dependências na pasta do projeto: `npm install`.
2. No MySQL Workbench, abra e execute `src/database/digitaltrack.sql`.
3. Copie `.env.example` para `.env.dev` e preencha seu usuário e senha locais do MySQL.
4. Inicie o servidor: `npm start`.
5. Abra **http://localhost:3334/**. Crie uma conta e faça login para acessar a dashboard.

O MySQL e o servidor Node precisam estar ativos. O simulador público pode ser acessado sem login. Ao abrir login, cadastro ou dashboard diretamente como arquivo, a página encaminha para o servidor local na porta 3334.

## Dashboard

Cada usuário cadastra seus cenários com plataforma de anúncio, preço, custo de produto/frete, anúncio por venda e quantidade estimada por dia. As simulações ficam no MySQL e alimentam quatro indicadores e dois gráficos Chart.js em elementos `canvas`, sem animações.

As projeções usam reais e um período de 30 dias. Não representam vendas reais nem lucro líquido. Contas novas começam sem registros. O layout foi desenvolvido para computador.

## Banco e documentação

- [Script SQL](src/database/digitaltrack.sql)
- [Detalhes da dashboard e verificações realizadas](DASHBOARD.md)

A configuração da máquina virtual é uma etapa posterior. A base original WebDataViz e sua licença foram preservadas. Antigravity foi usado como referência visual; o código segue a organização do projeto individual.

## Verificar a integração

Com o MySQL e o servidor iniciados, execute `node tests/integracao.cjs`. O teste cria duas contas temporárias, verifica cadastro/login, gravação/exclusão, isolamento entre contas e cálculos, e remove os registros temporários ao terminar.

Não publique `.env` ou `.env.dev`; use apenas o modelo sem credenciais reais.
