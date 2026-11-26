let salvando = false;

function salvarSimulacao() {

    if (salvando == true || document.getElementById('formulario_simulacao').reportValidity() == false) {
        return;
    }

    let nome = document.getElementById('nome_simulacao').value.trim();
    let plataforma = document.getElementById('plataforma_simulacao').value;
    let precoVenda = Number(document.getElementById('preco_venda').value);
    let custoProduto = Number(document.getElementById('custo_produto').value);
    let custoFrete = Number(document.getElementById('custo_frete').value);
    let custoAnuncio = Number(document.getElementById('custo_anuncio').value);
    let vendasDia = Number(document.getElementById('vendas_dia').value);
    let formaPagamento = document.getElementById('forma_pagamento').value;
    let percentualPago = 100;
    if (formaPagamento == 'cod') {
        percentualPago = Number(document.getElementById('percentual_pago').value);
    }
    let dados = { nome, plataforma, precoVenda, custoProduto, custoFrete, custoAnuncio, vendasDia, formaPagamento, percentualPago };

    salvando = true;
    document.getElementById('btn_salvar').disabled = true;
    document.getElementById('erro_formulario').hidden = true;

    return fetch('/simulacoes/cadastrar/' + sessionStorage.ID_USUARIO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    }).then(function (resposta) {
        return resposta.json().then(function (retorno) {
            if (resposta.ok == false) {
                throw new Error(retorno.mensagem);
            }
            // Após salvar, abre uma página comum com a análise do novo registro.
            window.location.href = 'analise.html?id=' + retorno.id;
        });
    }).catch(function (erro) {
        document.getElementById('erro_formulario').textContent = 'Não foi possível salvar. ' + erro.message;
        document.getElementById('erro_formulario').hidden = false;
        document.getElementById('btn_salvar').disabled = false;
        salvando = false;
    });
}

function mudarPagamento() {

    let cod = document.getElementById('forma_pagamento').value == 'cod';
    document.getElementById('campo_percentual').hidden = !cod;
    document.getElementById('percentual_pago').required = cod;
}

prepararConta();
