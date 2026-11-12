function abrirResposta(idResposta, botao) {
    let resposta = document.getElementById(idResposta);
    if (resposta.style.display == "block") {
        resposta.style.display = "none";
        botao.setAttribute("aria-expanded", "false");
    } else {
        resposta.style.display = "block";
        botao.setAttribute("aria-expanded", "true");
    }
}
