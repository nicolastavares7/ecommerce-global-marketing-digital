// Mesma simulação da referência: 30 dias por mês e câmbios de exemplo.
function formatarValor(valor) {
    return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatarMoeda(valor) {
    return valor.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function limparResultado(texto) {
    let resultados = ["div_lucro_reais", "div_lucro_moeda", "div_faturamento", "div_margem", "div_roas"];
    for (let i = 0; i < resultados.length; i++) {
        document.getElementById(resultados[i]).textContent = "—";
    }
    document.getElementById("aviso_calculadora").textContent = texto;
}

function calcular() {
    let moeda = document.getElementById("sel_moeda").value;
    let cambio = 5.75;
    let simbolo = "$";
    if (moeda == "EUR") {
        cambio = 6.20;
        simbolo = "€";
    } else if (moeda == "GBP") {
        cambio = 7.35;
        simbolo = "£";
    }

    document.getElementById("simbolo_preco").textContent = simbolo;
    document.getElementById("simbolo_custo").textContent = simbolo;
    document.getElementById("simbolo_anuncio").textContent = simbolo;

    let campos = ["ipt_preco", "ipt_custo", "ipt_anuncio", "ipt_vendas"];
    let valores = [];
    for (let i = 0; i < campos.length; i++) {
        let texto = document.getElementById(campos[i]).value.trim();
        let valor = Number(texto.replace(",", "."));
        if (texto == "" || isNaN(valor) || isFinite(valor) == false || valor < 0) {
            limparResultado("Preencha todos os campos com números válidos e não negativos.");
            return;
        }
        valores.push(valor);
    }

    let preco = valores[0];
    let custo = valores[1];
    let anuncio = valores[2];
    let vendasDia = valores[3];
    if (preco <= 0 || vendasDia % 1 != 0) {
        limparResultado("O preço precisa ser maior que zero e as vendas devem ser um número inteiro.");
        return;
    }

    let vendasMes = vendasDia * 30;
    let faturamento = preco * vendasMes;
    let investimento = anuncio * vendasMes;
    let lucro = faturamento - (custo + anuncio) * vendasMes;
    let lucroReais = lucro * cambio;
    let margem = 0;
    let roas = 0;
    if (faturamento > 0) {
        margem = lucro / faturamento * 100;
    }
    if (investimento > 0) {
        roas = faturamento / investimento;
    }
    if (isFinite(lucroReais) == false || isFinite(faturamento) == false || isFinite(lucro) == false || isFinite(margem) == false || isFinite(roas) == false) {
        limparResultado("Reduza os valores para realizar a simulação.");
        return;
    }

    document.getElementById("div_lucro_reais").textContent = "R$ " + formatarValor(lucroReais);
    document.getElementById("div_lucro_reais").className = "valor-lucro";
    if (lucro < 0) {
        document.getElementById("div_lucro_reais").className = "valor-lucro prejuizo";
    }
    document.getElementById("div_lucro_moeda").textContent = simbolo + " " + formatarMoeda(lucro) + " / mês";
    document.getElementById("div_faturamento").textContent = simbolo + " " + formatarMoeda(faturamento);
    document.getElementById("div_margem").textContent = margem.toFixed(1) + "%";
    document.getElementById("div_roas").textContent = roas.toFixed(2) + "x";
    if (investimento == 0) {
        document.getElementById("div_roas").textContent = "—";
    }
    document.getElementById("aviso_calculadora").textContent = "Câmbios de exemplo. Simulação de 30 dias, sem taxas ou impostos adicionais.";
}
