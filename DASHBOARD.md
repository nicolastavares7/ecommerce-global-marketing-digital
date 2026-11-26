# Dashboard do DigitalTrack

O DigitalTrack salva e compara hipóteses de venda. Os resultados são estimativas de 30 dias, não vendas realizadas nem lucro líquido.

## Três páginas comuns

| Página | Arquivo | Script |
| --- | --- | --- |
| Visão geral | `public/dashboard.html` | `public/js/dashboard.js` |
| Cadastro | `public/nova-simulacao.html` | `public/js/nova-simulacao.js` |
| Análise de um cenário | `public/analise.html?id=1` | `public/js/analise-simulacao.js` |

O botão Nova simulação é um link para outra página. Não há modal. Produto e frete são campos separados no mesmo formulário. Depois de salvar, a página abre a análise do registro criado. Analisar abre a mesma página com o ID do cenário no endereço. O link Voltar retorna à visão geral.

## Indicadores e gráficos

A visão geral conta os cenários totais, positivos, em equilíbrio e negativos. Verde, amarelo e vermelho têm o mesmo significado nos cartões, resultados da tabela e barras. Os custos têm suas próprias cores: produto laranja, frete dourado, anúncios lilás; faturamento azul.

O gráfico horizontal compara resultados entre cenários. O agrupado compara o que entra e sai. Não há gráfico temporal: as simulações não são histórico de vendas. Na análise, o gráfico mostra a composição de um cenário e aceita resultado negativo. Um rótulo abaixo do gráfico geral identifica os cenários em equilíbrio, porque uma barra com valor zero não tem altura.

Sem registros, os gráficos e a tabela ficam ocultos. A tela mostra uma orientação para cadastrar o primeiro cenário. Erros de consulta são mostrados separadamente e não significam conta vazia. A tabela permite ordenar por resultado ou margem com comparação e troca de posições usando dois laços `for`. Margens não calculáveis ficam ao final. A ordem original do vetor é preservada.

## Contas para explicar

- Vendas em 30 dias = vendas por dia × 30.
- Faturamento = vendas × preço.
- Custos = vendas × (produto + frete + anúncio).
- Sobra por venda = preço − produto − frete − anúncio.
- Resultado = vendas × sobra por venda.
- Margem = resultado ÷ faturamento × 100.
- ROAS = faturamento ÷ anúncios.
- Limite de anúncio = preço − produto − frete.

Valores unitários são arredondados para centavos antes da projeção. Margem e ROAS ficam como Não calculável quando seus denominadores são zero. Com zero vendas, a análise explica que não há vendas estimadas.

`contas-simulacao.js` reúne essas contas e a formatação usada nas páginas. `URLSearchParams` lê o número depois de `?id=`. As páginas usam `fetch`, `then` e `catch`. A biblioteca Chart.js desenha as barras a partir de vetores de números.

## Banco e rotas

Produto e frete ficam em `custo_produto` e `custo_frete` na mesma tabela `simulacao_cenario`. O relacionamento continua sendo um usuário para várias simulações.

| Método | Rota | Operação |
| --- | --- | --- |
| GET | `/simulacoes/listar/:idUsuario` | Listar os cenários da conta informada |
| GET | `/simulacoes/buscar/:id/:idUsuario` | Buscar um cenário da conta informada |
| POST | `/simulacoes/cadastrar/:idUsuario` | Inserir cenário |
| DELETE | `/simulacoes/excluir/:id/:idUsuario` | Excluir cenário da conta informada |

A rota chama o controller; o controller valida os campos e chama o model; o model executa o SQL. A consulta individual filtra por ID do cenário e do usuário.

O login usa `sessionStorage`, como no exemplo didático do WebDataViz. Esse filtro por ID enviado pelo navegador não autentica a identidade no servidor. Não é uma autorização segura para publicar dados de clientes. O projeto mantém essa limitação documentada, sem acrescentar a camada de sessão removida.

## Atualizar um banco já criado

- Banco novo: execute `src/database/script-tabelas.sql`.
Use apenas `src/database/script-tabelas.sql` para criar uma instalação nova. O banco local já está atualizado e os registros existentes devem ser preservados. Usuários e cenários podem ser cadastrados pelo site.
- Confira as colunas com `SHOW COLUMNS FROM digital_track.simulacao_cenario` antes de escolher o script.

A atualização preserva registros e totais: o valor combinado anterior fica em custo_produto e o novo custo_frete começa em zero. Não é possível recuperar a divisão histórica automaticamente. Ajuste os valores antigos quando souber a divisão real.

Use apenas `src/database/script-tabelas.sql` para criar uma instalação nova. O banco local já está atualizado e os registros existentes devem ser preservados. Usuários e cenários podem ser cadastrados pelo site.

## Simulador público

`calculadora.html` e `calculadora.js` usam produto e frete separados, cinco moedas e cotação manual. O modo COD considera receita apenas dos pedidos pagos, frete de todos os envios e anúncios como investimento diário. Os não vendidos retornam ao estoque sem perda; essa hipótese está explicada na tela. Não é uma análise de capital de giro. COD fica apenas na calculadora, sem criar registros no banco.

## Conferir antes da apresentação

Com o MySQL atualizado e o Node iniciados, crie uma conta e confira a tela vazia. Cadastre um cenário, abra a análise, volte ao painel, confira as contagens, ordene e exclua. Confira também prejuízo, equilíbrio, zero vendas e zero anúncio. Acesse outra conta e confira a listagem dela. Chart.js usa CDN e precisa de acesso à internet.


Pagamento nos cenários: `forma_pagamento` (antecipado/cod) e `percentual_pago` (0 a 100). A estrutura completa está em `src/database/script-tabelas.sql`. O banco local já está atualizado.
CPA é por pedido gerado. No COD, todos os pedidos gerados são considerados enviados. Receita e produto usam a quantidade paga; frete e anúncios usam a quantidade enviada. Produtos não pagos retornam ao estoque sem perda; não inclui frete de devolução. Sobra e CPA de equilíbrio são médias por pedido gerado.
