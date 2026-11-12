var assuntos = ['plataformas', 'metricas', 'produtos', 'escala', 'orcamento', 'videos'];

function abrirAssunto(assunto) {
    for (var i = 0; i < assuntos.length; i++) {
        var selecionado = assuntos[i] === assunto;
        document.getElementById(assuntos[i]).hidden = !selecionado;
        var botao = document.getElementById('aba_' + assuntos[i]);
        botao.className = selecionado ? 'aba-ativa' : '';
        botao.setAttribute('aria-pressed', selecionado);
    }
}
function abrirPeloEndereco() {
    var assunto = window.location.hash.substring(1);
    if (assunto === 'fornecedores') {
        assunto = 'produtos';
    }
    if (assunto === 'campanhas') {
        assunto = 'escala';
    }
    if (assunto === 'leilao') {
        assunto = 'orcamento';
    }
    if (assuntos.indexOf(assunto) === -1) {
        assunto = 'plataformas';
    }
    abrirAssunto(assunto);
}
window.addEventListener('hashchange', abrirPeloEndereco);
abrirPeloEndereco();
