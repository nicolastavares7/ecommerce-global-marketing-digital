// Alteração: seleção das abas com let, for e if/else, no padrão do grupo.
let assuntos = ['plataformas', 'metricas', 'produtos', 'escala', 'orcamento', 'videos'];

function abrirAssunto(assunto) {
    for (let i = 0; i < assuntos.length; i++) {
        let selecionado = assuntos[i] === assunto;
        document.getElementById(assuntos[i]).hidden = !selecionado;
        let botao = document.getElementById('aba_' + assuntos[i]);
        if (selecionado == true) {
            botao.className = 'aba-ativa';
        } else {
            botao.className = '';
        }
        botao.setAttribute('aria-pressed', selecionado);
    }
}
function abrirPeloEndereco() {
    let assunto = window.location.hash.substring(1);
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
