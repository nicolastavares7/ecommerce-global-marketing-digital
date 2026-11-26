function formatarValor(valor) {

    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function mudarMoeda() {

    let moeda = document.getElementById('sel_moeda').value;
    let cotacao = document.getElementById('ipt_cotacao');
    cotacao.readOnly = false;
    cotacao.value = '';
    if (moeda == 'BRL') {
        cotacao.value = '1';
        cotacao.readOnly = true;
    }
    document.getElementById('ajuda_moeda').textContent = 'Informe todos os preços e custos em ' + moeda + '. A cotação é informada por você e não é atualizada automaticamente.';
    calcular();
}

function mudarModo() {

    let cod = document.getElementById('modo_pagamento').value == 'cod';
    document.getElementById('campos_cod').hidden = !cod;
    document.getElementById('resultado_cod').hidden = !cod;
    document.getElementById('label_quantidade').textContent = 'Vendas estimadas por dia';
    document.getElementById('label_anuncio').textContent = 'Anúncio por venda';
    if (cod == true) {
        document.getElementById('label_quantidade').textContent = 'Pedidos enviados por dia';
        document.getElementById('label_anuncio').textContent = 'Investimento diário em anúncios';
    }
    // A unidade do anúncio mudou: pede novo valor para evitar uma comparação errada.
    document.getElementById('ipt_anuncio').value = '';
    calcular();
}

function limparResultado(texto) {

    let campos = ['div_lucro_reais', 'div_lucro_moeda', 'div_faturamento', 'div_custos', 'div_margem', 'div_roas', 'div_enviados', 'div_pagos', 'div_nao_pagos', 'div_logistica', 'div_logistica_pedido'];
    for (let i = 0; i < campos.length; i++) {
        document.getElementById(campos[i]).textContent = '—';
    }
    document.getElementById('aviso_calculadora').textContent = texto;
}

function calcular() {

    let cod = document.getElementById('modo_pagamento').value == 'cod';
    let campos = ['ipt_preco', 'ipt_custo', 'ipt_frete', 'ipt_anuncio', 'ipt_vendas', 'ipt_cotacao'];
    if (cod == true) {
        campos.push('ipt_sucesso');
    }
    for (let i = 0; i < campos.length; i++) {
        let texto = document.getElementById(campos[i]).value.trim();
        let valor = Number(texto.replace(',', '.'));
        if (texto == '' || isFinite(valor) == false || valor < 0 || valor > 1000000000) {
            limparResultado('Preencha os campos para visualizar a estimativa. Use valores válidos e não negativos.');
            return;
        }
    }

    let moeda = document.getElementById('sel_moeda').value;
    let preco = Number(document.getElementById('ipt_preco').value.replace(',', '.'));
    let produto = Number(document.getElementById('ipt_custo').value.replace(',', '.'));
    let frete = Number(document.getElementById('ipt_frete').value.replace(',', '.'));
    let anuncio = Number(document.getElementById('ipt_anuncio').value.replace(',', '.'));
    let quantidade = Number(document.getElementById('ipt_vendas').value.replace(',', '.'));
    let cotacao = Number(document.getElementById('ipt_cotacao').value.replace(',', '.'));
    if (moeda == 'BRL') {
        cotacao = 1;
    }
    if (cotacao <= 0 || quantidade % 1 != 0 || quantidade > 1000000) {
        limparResultado('Informe uma cotação maior que zero e uma quantidade diária inteira de 0 a 1.000.000.');
        return;
    }

    let enviados = quantidade * 30;
    let pagos = enviados;
    let naoPagos = 0;
    let custoAnuncios = pagos * anuncio;
    if (cod == true) {
        let sucesso = Number(document.getElementById('ipt_sucesso').value.replace(',', '.'));
        if (sucesso > 100) {
            limparResultado('O percentual de pedidos pagos deve ficar entre 0% e 100%.');
            return;
        }
        pagos = enviados * sucesso / 100;
        naoPagos = enviados - pagos;
        custoAnuncios = anuncio * 30;
    }

    let faturamento = pagos * preco;
    let custoProdutos = pagos * produto;
    let custoFrete = enviados * frete;
    let logistica = custoFrete;
    let custos = custoProdutos + logistica + custoAnuncios;
    let resultado = Number((faturamento - custos).toFixed(2));
    let resultadoReais = resultado * cotacao;
    // Evita exibir valores fora da precisão adequada do JavaScript.
    if (Math.abs(resultadoReais) > 9000000000000 || custos > 9000000000000 || faturamento > 9000000000000) {
        limparResultado('Reduza os valores para realizar uma projeção com precisão.');
        return;
    }
    document.getElementById('div_lucro_reais').textContent = 'R$ ' + formatarValor(resultadoReais);
    document.getElementById('div_lucro_reais').className = 'simulador-valor';
    if (resultado < 0) {
        document.getElementById('div_lucro_reais').className = 'simulador-valor prejuizo';
    }
    document.getElementById('div_lucro_moeda').textContent = moeda + ' ' + formatarValor(resultado);
    document.getElementById('div_faturamento').textContent = moeda + ' ' + formatarValor(faturamento);
    document.getElementById('div_custos').textContent = moeda + ' ' + formatarValor(custos);
    document.getElementById('div_margem').textContent = 'Não calculável';
    document.getElementById('div_roas').textContent = 'Não calculável';
    if (faturamento > 0) {
        document.getElementById('div_margem').textContent = (resultado / faturamento * 100).toFixed(1).replace('.', ',') + '%';
    }
    if (custoAnuncios > 0) {
        document.getElementById('div_roas').textContent = (faturamento / custoAnuncios).toFixed(2).replace('.', ',') + 'x';
    }
    document.getElementById('div_enviados').textContent = enviados;
    document.getElementById('div_pagos').textContent = formatarValor(pagos);
    document.getElementById('div_nao_pagos').textContent = formatarValor(naoPagos);
    document.getElementById('div_logistica').textContent = moeda + ' ' + formatarValor(logistica);
    document.getElementById('div_logistica_pedido').textContent = 'Não calculável';
    if (pagos > 0) {
        document.getElementById('div_logistica_pedido').textContent = moeda + ' ' + formatarValor(logistica / pagos);
    }
    document.getElementById('aviso_calculadora').textContent = 'Estimativa com os custos informados e a cotação escolhida por você.';
}

calcular();
