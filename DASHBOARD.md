# Dashboard do DigitalTrack

A dashboard compara cenários de venda cadastrados pelo usuário. São estimativas em reais para 30 dias, e não resultados reais de uma loja. O resultado desconta apenas produto/frete e anúncios. Os cenários são alternativas; seus faturamentos não são somados.

## Executar localmente

Na pasta `DigitalTrack`, instale as dependências com `npm install`, caso necessário. No MySQL, execute `src/database/digitaltrack.sql`. O script cria o banco `digital_track` e não apaga o banco AquaTech nem inclui exemplos automaticamente.

Configure a conexão no arquivo local `.env.dev`: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_DATABASE=digital_track`. As credenciais não devem ser publicadas. A porta local foi configurada como `APP_PORT=3334` para não disputar a 3333 com o projeto de referência.

Inicie com `npm start` e acesse `http://localhost:3334/login.html`. O projeto precisa do servidor Node e do MySQL; abrir os arquivos HTML diretamente não permite cadastrar nem consultar dados.

Crie uma conta e faça login. Contas novas começam sem simulações. Para conferir o estado vazio, crie outra conta: os registros da conta de demonstração não são compartilhados.

## Organização e banco

O fluxo mantém a organização do WebDataViz: rotas → controllers → models → conexão com MySQL. A tabela `usuario` possui uma relação de um para muitos com `simulacao_cenario`, por `fk_usuario`. Os valores monetários usam `DECIMAL(10,2)`. Os resultados são calculados a partir dos valores unitários retornados pela API.

A API obtém o usuário pela sessão do servidor, usando cookie HttpOnly. Tanto a consulta quanto a exclusão filtram pelo usuário autenticado. As consultas novas usam parâmetros SQL. As senhas são armazenadas com hash scrypt e salt individual.

As sessões ficam na memória do servidor durante até 8 horas. Reiniciar o Node exige novo login, mas os usuários e as simulações permanecem no MySQL. O contador de três erros é um bloqueio da interface nesta aba, não uma proteção completa contra tentativas na API. A recuperação de senha ainda não foi implementada.

## Cálculos e apresentação

- Vendas mensais: vendas estimadas por dia × 30.
- Faturamento: vendas mensais × preço unitário.
- Produto/frete e anúncios: vendas mensais × respectivos custos unitários.
- Resultado estimado: faturamento − produto/frete − anúncios.
- Margem: resultado ÷ faturamento × 100; sem faturamento, mostra “—”.
- ROAS: faturamento ÷ anúncios; sem anúncios, mostra “—”.

O painel possui quatro indicadores, dois gráficos, filtro de plataforma, lista e cadastro/exclusão. Os maiores valores identificam o cenário correspondente. Prejuízos aparecem em vermelho. Os gráficos usam códigos ligados à lista e apresentam o nome completo ao passar o mouse. O Chart.js está incluído localmente, com licença preservada, sem animações. O layout é para computador.

## Verificação realizada nesta alteração

Testado com MySQL local e Chrome:

- Cadastro, e-mail duplicado, senha incorreta, login e logout.
- Gravação/consulta/exclusão reais e persistência após recarregar e entrar novamente.
- Conta nova vazia e isolamento entre duas contas, inclusive na exclusão pela API.
- Hash da senha no banco e cookie HttpOnly.
- Exemplo: preço 100, produto/frete 40, anúncio 20 e 5 vendas/dia → faturamento 15.000, resultado 6.000, margem 40% e ROAS 5x.
- Valores inválidos, negativos de entrada, vendas fracionárias, resultados negativos, vendas zeradas e anúncios sem custo.
- Cadastro/exclusão pela tela, atualização dos gráficos, filtro e modal pelo teclado.
- Nome contendo marcação HTML exibido como texto.
- Falha de rede na dashboard e MySQL indisponível no cadastro/login: mensagens de erro, sem dados substitutos em memória.

Foram removidas as contas temporárias dos testes. Uma conta de demonstração separada contém três registros com “Exemplo” no nome, incluindo um cenário negativo. O script SQL não cria essa conta.

A máquina virtual, a publicação e a integração das páginas antigas de exemplo do WebDataViz não fazem parte desta alteração. As páginas de conteúdo e o simulador público foram preservados.
