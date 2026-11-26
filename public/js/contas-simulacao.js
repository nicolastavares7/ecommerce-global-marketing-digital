// Funções usadas pela visão geral e pela análise individual.
function moeda(valor) {

    return 'R$ ' + Number(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function percentual(valor) {

    if (valor == null) {
        return 'Não calculável';
    }
    return valor.toFixed(1).replace('.', ',') + '%';
}

function roas(valor) {

    if (valor == null) {
        return 'Não calculável';
    }
    return valor.toFixed(2).replace('.', ',') + 'x';
}

function classeResultado(valor) {

    if (valor > 0) {
        return 'positivo';
    } else if (valor < 0) {
        return 'negativo';
    }
    return 'amarelo';
}

function corResultado(valor) {

    if (valor > 0) {
        return '#2bd4a3';
    } else if (valor < 0) {
        return '#ff818c';
    }
    return '#f5cf61';
}

// Impede que nomes digitados sejam interpretados como HTML na tabela.
function textoSeguro(texto) {

    let div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function prepararConta() {

    if (validarSessao() == false) {
        return false;
    }
    let nome = sessionStorage.NOME_USUARIO;
    document.getElementById('saudacao').textContent = 'Olá, ' + nome + '!';
    document.getElementById('iniciais_usuario').textContent = nome[0].toUpperCase();
    return true;
}

// Faz as contas por unidade e depois projeta as vendas para 30 dias.
function calcularSimulacao(simulacao) {

    let preco = Number(simulacao.precoVenda);
    let produtoUnitario = Number(simulacao.custoProduto);
    let freteUnitario = Number(simulacao.custoFrete);
    let anuncioUnitario = Number(simulacao.custoAnuncio);
    let enviados = Number(simulacao.vendasDia) * 30;
    let taxa = 1;
    let pagamento = 'Antecipado';
    if (simulacao.formaPagamento == 'cod') {
        taxa = Number(simulacao.percentualPago) / 100;
        pagamento = 'COD';
    }
    let vendas = enviados * taxa;
    let sobra = Number((taxa * (preco - produtoUnitario) - freteUnitario - anuncioUnitario).toFixed(2));
    let limite = Number((taxa * (preco - produtoUnitario) - freteUnitario).toFixed(2));
    let faturamento = Number((vendas * preco).toFixed(2));
    let produto = Number((vendas * produtoUnitario).toFixed(2));
    let frete = Number((enviados * freteUnitario).toFixed(2));
    let anuncios = Number((enviados * anuncioUnitario).toFixed(2));
    let resultado = Number((faturamento - produto - frete - anuncios).toFixed(2));
    let margem = null;
    let retorno = null;

    if (faturamento > 0) {
        margem = resultado / faturamento * 100;
    }
    if (anuncios > 0) {
        retorno = faturamento / anuncios;
    }

    return {
        id: simulacao.id,
        nome: simulacao.nome,
        plataforma: simulacao.plataforma,
        vendas: vendas,
        enviados: enviados,
        pagamento: pagamento,
        taxa: taxa,
        receitaPorPedido: preco * taxa,
        produtoPorPedido: produtoUnitario * taxa,
        faturamento: faturamento,
        produto: produto,
        frete: frete,
        anuncios: anuncios,
        resultado: resultado,
        margem: margem,
        roas: retorno,
        sobra: sobra,
        limite: limite
    };
}

// Rótulos curtos nos eixos; o tooltip continua mostrando o valor completo.
function moedaEixo(valor) {

    let numero = Number(valor);
    if (Math.abs(numero) >= 1000000) {
        return 'R$ ' + (numero / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi';
    }
    if (Math.abs(numero) >= 1000) {
        return 'R$ ' + (numero / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil';
    }
    return 'R$ ' + numero.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}
