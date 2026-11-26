function mostrarAnalise(simulacao) {

    let item = calcularSimulacao(simulacao);
    document.getElementById('titulo_cenario').textContent = item.nome;
    document.getElementById('plataforma_cenario').textContent = item.plataforma + " · " + item.pagamento;
    document.getElementById('preco_unitario').textContent = moeda(item.receitaPorPedido);
    document.getElementById('produto_unitario').textContent = moeda(item.produtoPorPedido);
    document.getElementById('frete_unitario').textContent = moeda(simulacao.custoFrete);
    document.getElementById('anuncio_unitario').textContent = moeda(simulacao.custoAnuncio);
    document.getElementById('sobra_unitaria').textContent = moeda(item.sobra);
    document.getElementById('sobra_unitaria').className = classeResultado(item.sobra);
    document.getElementById('resultado_analise').textContent = moeda(item.resultado);
    document.getElementById('resultado_analise').className = 'valor ' + classeResultado(item.resultado);
    document.getElementById('margem_analise').textContent = percentual(item.margem);
    document.getElementById('margem_analise').className = 'valor ' + classeResultado(item.resultado);
    document.getElementById('limite_anuncio').textContent = moeda(item.limite);
    document.getElementById('roas_analise').textContent = roas(item.roas);
    document.getElementById('faturamento_analise').textContent = moeda(item.faturamento);
    document.getElementById('produtos_analise').textContent = moeda(item.produto);
    document.getElementById('fretes_analise').textContent = moeda(item.frete);
    document.getElementById('anuncios_analise').textContent = moeda(item.anuncios);
    document.getElementById('vendas_analise').textContent = item.enviados + ' pedidos gerados em 30 dias · ' + item.vendas + ' pagos estimados (' + percentual(item.taxa * 100) + '). Preço: ' + moeda(simulacao.precoVenda) + ' · Produto por unidade: ' + moeda(simulacao.custoProduto);
    document.getElementById('explicacao_pedido').textContent = 'No pagamento antecipado, cada pedido é pago: preço menos produto, frete e CPA.';
    if (item.pagamento == 'COD') {
        document.getElementById('explicacao_pedido').textContent = 'No COD, apenas ' + percentual(item.taxa * 100) + ' dos envios são pagos. Receita e produto são médias por envio; frete e CPA são descontados de todos.';
    }
    document.getElementById('explicacao_limite').textContent = 'Até ' + moeda(item.limite) + ' em anúncios por pedido, o cenário não teria prejuízo com os custos informados. CPA atual: ' + moeda(simulacao.custoAnuncio) + '.';
    if (item.limite < 0) {
        document.getElementById('explicacao_limite').textContent = 'A receita esperada já é menor que produto e frete. Mesmo com anúncio grátis, faltariam ' + moeda(-item.limite) + ' por pedido.';
    }

    let estado = 'Em equilíbrio';
    let texto = 'O faturamento e os custos informados são iguais nesta projeção.';
    if (item.resultado > 0) {
        estado = 'Resultado estimado positivo';
        texto = 'O faturamento estimado supera os custos informados em ' + moeda(item.resultado) + ' no período de 30 dias.';
    } else if (item.resultado < 0) {
        estado = 'Resultado estimado negativo';
        texto = 'Os custos informados superam o faturamento estimado em ' + moeda(-item.resultado) + ' no período de 30 dias.';
    }
    texto += ' Cada pedido gerado deixaria, em média, ' + moeda(item.sobra) + ' após descontar produto, frete e anúncio.';
    if (item.enviados == 0) {
        estado = 'Sem vendas estimadas';
        texto = 'Com zero vendas, a projeção mensal fica zerada. Pelos valores unitários, cada venda simulada deixaria ' + moeda(item.sobra) + '.';
    }
    document.getElementById('status_cenario').textContent = estado;
    document.getElementById('status_cenario').className = 'status-cenario ' + classeResultado(item.resultado);
    document.getElementById('diagnostico_cenario').textContent = texto;
    document.getElementById('area_analise').hidden = false;
    document.getElementById('aviso').hidden = true;
    montarGraficoAnalise(item);
}

function montarGraficoAnalise(item) {

    if (typeof Chart == 'undefined') {
        document.getElementById('aviso').textContent = 'O gráfico não carregou. Confira os valores nos indicadores e no resumo.';
        document.getElementById('aviso').hidden = false;
        return;
    }
    Chart.defaults.color = '#aabbd1';
    Chart.defaults.borderColor = '#243047';
    new Chart(document.getElementById('grafico_analise'), {
        type: 'bar',
        data: {
            labels: ['Faturamento', 'Produto', 'Frete', 'Anúncios', 'Resultado'],
            datasets: [{
                label: 'Projeção de 30 dias',
                data: [item.faturamento, item.produto, item.frete, item.anuncios, item.resultado],
                backgroundColor: ['#60a5fa', '#f0a15e', '#e1c5a3', '#b49aee', corResultado(item.resultado)]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: { y: { beginAtZero: true, ticks: { maxRotation: 0, minRotation: 0, maxTicksLimit: 5, callback: function (valor) { return moedaEixo(valor); } } } },
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (contexto) { return moeda(contexto.parsed.y); } } } }
        }
    });
}

function iniciar() {

    if (prepararConta() == false) {
        return;
    }
    // Lê o número depois de ?id= no link da análise.
    let parametros = new URLSearchParams(window.location.search);
    let id = Number(parametros.get('id'));
    if (Number.isInteger(id) == false || id <= 0) {
        document.getElementById('aviso').textContent = 'Escolha um cenário na página Análise de cenários.';
        return;
    }

    return fetch('/simulacoes/buscar/' + id + '/' + sessionStorage.ID_USUARIO).then(function (resposta) {
        return resposta.json().then(function (dados) {
            if (resposta.ok == false) {
                throw new Error(dados.mensagem);
            }
            mostrarAnalise(dados);
        });
    }).catch(function (erro) {
        document.getElementById('area_analise').hidden = true;
        document.getElementById('aviso').textContent = 'Não foi possível abrir a análise. ' + erro.message;
        document.getElementById('aviso').className = 'aviso erro';
        document.getElementById('aviso').hidden = false;
    });
}

iniciar();
