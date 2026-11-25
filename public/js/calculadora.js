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

    // Alteração: lê cada campo diretamente, como na calculadora do PowerTrack.
    // replace permite que o usuário digite a parte decimal com vírgula.
    let textoPreco = document.getElementById("ipt_preco").value.trim();
    let textoCusto = document.getElementById("ipt_custo").value.trim();
    let textoAnuncio = document.getElementById("ipt_anuncio").value.trim();
    let textoVendas = document.getElementById("ipt_vendas").value.trim();

    let preco = Number(textoPreco.replace(",", "."));
    let custo = Number(textoCusto.replace(",", "."));
    let anuncio = Number(textoAnuncio.replace(",", "."));
    let vendasDia = Number(textoVendas.replace(",", "."));

    if (textoPreco == "" || textoCusto == "" || textoAnuncio == "" || textoVendas == "") {
        limparResultado("Preencha todos os campos com números válidos e não negativos.");
        return;
    }

    // isFinite recusa texto que não virou número e valores infinitos.
    if (isFinite(preco) == false || isFinite(custo) == false || isFinite(anuncio) == false || isFinite(vendasDia) == false) {
        limparResultado("Preencha todos os campos com números válidos e não negativos.");
        return;
    }

    if (preco < 0 || custo < 0 || anuncio < 0 || vendasDia < 0) {
        limparResultado("Preencha todos os campos com números válidos e não negativos.");
        return;
    }

    if (preco <= 0 || vendasDia % 1 != 0) {
        limparResultado("O preço precisa ser maior que zero e as vendas devem ser um número inteiro.");
        return;
    }

    // Cálculos em etapas: vendas do mês, faturamento, custos e resultado.
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
