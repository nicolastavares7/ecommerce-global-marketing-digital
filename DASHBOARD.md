# Dashboard do DigitalTrack

Tela: `public/dashboard/dashboard.html`. Script: `public/js/dashboard.js`. O acesso após o login abre `/dashboard/dashboard.html`.

O painel compara simulações de venda em reais para 30 dias. Os valores são estimativas, não vendas reais nem lucro líquido.

## Fluxo para apresentar

1. Cadastrar uma conta e fazer login.
2. Usar o formulário "Cadastrar simulação" na própria página. Não há popup.
3. Informar nome, plataforma, preço, produto/frete, anúncio por venda e vendas por dia.
4. Salvar e conferir os quatro indicadores, os dois gráficos e a lista.
5. Usar os filtros ou excluir uma simulação.

O botão "Nova simulação" é apenas um link para o formulário. "Limpar campos" é um botão HTML de reset. A análise individual e o terceiro gráfico foram retirados para reduzir o código.

## Como o código funciona

- A rota recebe o endereço e chama o controller.
- O controller confere os campos com `if/else` e chama o model.
- O model contém o SQL e passa os valores separadamente para a conexão.
- O navegador recebe os registros, faz as contas e monta a lista e os gráficos.

Cada operação usa `fetch` diretamente. `then` trata a resposta; `catch` mostra a falha. A dashboard usa vetores, `for`, `if/else` e funções comuns. O Chart.js desenha os dois gráficos.

## Contas

- Vendas no mês = vendas por dia × 30.
- Faturamento = vendas no mês × preço.
- Custos = vendas no mês × (produto/frete + anúncio).
- Resultado = faturamento − custos.
- Margem = resultado ÷ faturamento × 100.
- ROAS = faturamento ÷ custo dos anúncios.

Sem faturamento, a margem aparece como "—". Sem anúncios, o ROAS aparece como "—". Valores negativos indicam prejuízo estimado.

## Login e banco

As contas e simulações ficam no MySQL. O login retorna ID, nome e e-mail; `acesso.js` guarda esses dados no `sessionStorage`, como no WebDataViz. `iniciar()` chama `validarSessao()` em `public/js/sessao.js` antes de carregar a dashboard. O botão sair chama `limparSessao()`. Essas duas funções vieram da base WebDataViz, com os campos da tela e o endereço do login adaptados.

Não há middleware próprio nem endpoints de sessão ou logout. As rotas recebem o ID do usuário no endereço e chamam diretamente o controller:

| Método | Endereço | Função do controller |
| --- | --- | --- |
| POST | `/usuarios/cadastrar` | `usuarioController.cadastrar` |
| POST | `/usuarios/autenticar` | `usuarioController.autenticar` |
| GET | `/simulacoes/listar/:idUsuario` | `simulacaoController.listar` |
| POST | `/simulacoes/cadastrar/:idUsuario` | `simulacaoController.cadastrar` |
| DELETE | `/simulacoes/excluir/:id/:idUsuario` | `simulacaoController.excluir` |

O model filtra a listagem e a exclusão por `fk_usuario`. Como o navegador informa o ID, esse padrão didático não verifica a identidade no servidor: alterar o ID permite acessar os registros de outra conta. Não é um controle de autorização para uso público.

As senhas preservam o formato scrypt com salt, para os cadastros existentes continuarem funcionando. O controller usa as funções do módulo `crypto` do Node, sem uma função própria que cria uma Promise para esse cálculo. Os models mantêm SQL e valores separados: cada `?` recebe um valor do vetor de parâmetros.

O contador de três erros de login fica na página e reinicia ao recarregar.

## Conferência manual

Com o MySQL e o servidor iniciados, cadastre uma conta e faça login. Salve uma simulação, confira os indicadores e gráficos, filtre os registros e exclua a simulação. Saia e tente abrir a dashboard novamente: ela deve encaminhar ao login. Os dados já gravados permanecem no banco.

O Chart.js é carregado pelo endereço `https://cdn.jsdelivr.net/npm/chart.js`, como no PowerTrack e no WebDataViz. Não há cópia da biblioteca em `public/js`; é necessário acesso à internet para carregá-la. As configurações e os dados dos gráficos ficam em `public/js/dashboard.js`.
