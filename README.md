# DigitalTrack — E-commerce Global e Marketing Digital

Projeto individual com conteúdo educativo, simulador financeiro e dashboard de cenários de venda. Desenvolvido com HTML, CSS, JavaScript, Node.js, MySQL e Chart.js, usando a organização do WebDataViz.

## Executar

1. Instale as dependências na pasta do projeto: `npm install`.
2. No MySQL Workbench, abra e execute `src/database/script-tabelas.sql`.
3. Copie `.env.example` para `.env.dev` e preencha seu usuário e senha locais do MySQL.
4. Inicie o servidor: `npm start`.
5. Abra **http://localhost:3334/**. Crie uma conta e faça login para acessar a dashboard.

O MySQL e o servidor Node precisam estar ativos. O simulador público pode ser acessado sem login. Ao abrir login, cadastro ou dashboard diretamente como arquivo, a página encaminha para o servidor local na porta 3334.

## Dashboard

Cada usuário cadastra seus cenários com plataforma de anúncio, preço, custo de produto/frete, anúncio por venda e quantidade estimada por dia. As simulações ficam no MySQL e alimentam quatro indicadores e dois gráficos Chart.js em elementos `canvas`, sem animações.

As projeções usam reais e um período de 30 dias. Não representam vendas reais nem lucro líquido. Contas novas começam sem registros. O layout foi desenvolvido para computador.

## Banco e documentação

- [DER e explicação do relacionamento](docs/modelagem/README.md)
- [Diagrama do banco](docs/modelagem/der.svg)
- [Script SQL](src/database/script-tabelas.sql)
- [Detalhes da dashboard e verificações realizadas](DASHBOARD.md)

A configuração da máquina virtual é uma etapa posterior. A estrutura do WebDataViz e sua licença foram preservadas. O conjunto original de usuários foi adaptado e o de avisos foi reaproveitado e renomeado para simulações. Os conjuntos de sensores, aquários e empresas e as páginas de exemplo foram retirados. Antigravity foi usado como referência visual; o código segue a organização do projeto individual.

## Código das páginas

Os scripts das funcionalidades usam contas em etapas, condicionais `if/else` e laços `for/while`. O `sessao.js` reaproveita as funções da base WebDataViz, incluindo as variáveis com `var`. Os trechos revisados possuem comentários explicando as alterações. O HTML usa recuo de quatro espaços por nível. O CSS tem uma propriedade por linha, com os blocos compactados expandidos. Os estilos dos campos e botões de login/cadastro ficam nos respectivos arquivos CSS. A dashboard agora tem um formulário na própria página, sem janela flutuante, e dois gráficos de comparação. Os trechos alterados estão comentados.

- `calculadora.js`: leitura dos campos, validação e contas do simulador.
- `validacoes.js`: campos obrigatórios, e-mail e senha.
- `acesso.js`: validações do cadastro/login e envio direto com `fetch` para o servidor.
- `sessao.js`: `validarSessao` e `limparSessao` reaproveitadas do WebDataViz, com os elementos da dashboard e o caminho do login adaptados.
- `dashboard.js`: contas, filtros, lista, gráficos e pedidos diretos com `fetch` para listar, cadastrar e excluir.
- `public/dashboard/dashboard.html`: tela da dashboard, na mesma organização de pasta da referência do Vini.
- `marketing-e-metricas.js`: troca das abas de conteúdo.

A comunicação com o servidor usa `fetch`, `then` e `catch`, como nos exemplos do WebDataViz: envia o pedido, espera a resposta e trata erros. O Chart.js continua responsável pelos gráficos. Essas partes complementam os cálculos de algoritmos e estão comentadas. As rotas, os controllers e os models de usuário e simulação também usam funções comuns, validações com `if/else` e consultas SQL separadas dos valores. O login guarda `ID_USUARIO`, `NOME_USUARIO` e `EMAIL_USUARIO` no `sessionStorage`, como na base original. Não há middleware próprio, cookies, tokens ou sessão no servidor. A proteção das senhas existentes e as consultas SQL com parâmetros foram mantidas. As dependências não foram alteradas.

## Fluxo para explicar na apresentação

1. **Página (`public/js`)**: lê os campos e usa `fetch` para enviar a requisição.
2. **Rota (`src/routes`)**: associa o endereço à função do controller.
3. **Controller (`src/controllers`)**: recebe os dados, valida e chama o model.
4. **Model (`src/models`)**: contém a consulta SQL e chama `database.executar`.
5. **Banco (`src/database/config.js`)**: executa a consulta no MySQL e devolve o resultado.
6. O resultado volta ao controller, que responde com `res.json`. A página recebe a resposta no `then` e atualiza a tela.

Exemplo: `carregarSimulacoes()` em `dashboard.js` chama `GET /simulacoes/listar/:idUsuario`. A rota chama `simulacaoController.listar`, que chama `simulacaoModel.listar`. O model executa um `SELECT` com `WHERE fk_usuario = ?`.

No login, o controller consulta a conta e confere a senha. A página guarda o ID, nome e e-mail retornados no `sessionStorage`. Ao abrir a dashboard, `iniciar()` chama `validarSessao()` do `sessao.js`. Sair chama `limparSessao()`, que limpa o `sessionStorage` e abre o login.

Esse controle segue o exemplo didático: o ID enviado pelo navegador filtra as consultas, mas pode ser alterado pelo próprio cliente. Portanto, não constitui autorização no servidor para proteger dados entre contas em uma aplicação pública.

## Conferir para apresentar

Com o MySQL e o servidor iniciados, abra o site, cadastre uma conta, faça login e cadastre uma simulação. Confira os indicadores, os gráficos, os filtros e a exclusão pela própria tela. O simulador público pode ser conferido sem login.

Não publique `.env` ou `.env.dev`; use apenas o modelo sem credenciais reais.

O Chart.js é carregado pelo endereço `https://cdn.jsdelivr.net/npm/chart.js`, como no PowerTrack e no WebDataViz. Não há cópia da biblioteca em `public/js`; é necessário acesso à internet para carregá-la. As configurações e os dados dos gráficos ficam em `public/js/dashboard.js`.

## Reaproveitamento da base original

- `app.js`: configuração, dependências, arquivos públicos e inicialização originais; apenas os conjuntos de rotas foram ajustados ao DigitalTrack.
- `src/routes/usuarios.js`: código original.
- `src/routes/simulacoes.js`: formato das rotas de avisos, com os nomes e parâmetros das simulações.
- `src/database/config.js`: estrutura original de conexão; aceita também parâmetros para o SQL e encaminha os erros ao controller.
- `public/js/sessao.js`: validação e limpeza do login originais, adaptadas aos campos e endereços atuais.
- `package.json` e dependências: mantidos da base.

O índice continua servindo HTML com `sendFile`, porque o projeto não configura um motor de templates para `res.render`. Os controllers e models foram adaptados às tabelas de usuários e simulações. O formato das senhas foi preservado para manter as contas existentes.

## Estilo do código e organização

O HTML e os scripts das funcionalidades seguem o exemplo `Interestelar.html`: recuo de quatro espaços, variáveis com `let`, funções diretas, validações com `if/else`, vetores e laços `for/while`. O HTML mantém textos simples junto das tags. Os scripts continuam em arquivos separados dentro de `public/js`, para localizar cada parte facilmente. Os arquivos reaproveitados do WebDataViz mantêm seu padrão original.

O login redireciona para `/dashboard/dashboard.html`. Os caminhos de estilos, scripts, imagens e links da dashboard consideram essa subpasta. Não há funções intermediárias `enviarAcesso` ou `consultar`: cada operação mostra seu próprio `fetch`, `then` e `catch`.
