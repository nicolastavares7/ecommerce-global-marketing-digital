// Funções simples compartilhadas pelas telas de login e cadastro.
function mostrarMensagem(texto, erro) {
    let mensagem = document.getElementById("msg_senha");
    mensagem.textContent = texto;
    mensagem.style.display = "block";
    if (erro == true) {
        mensagem.className = "mensagem erro";
    } else {
        mensagem.className = "mensagem aviso";
    }
}

function validarCampos(campos) {
    for (let i = 0; i < campos.length; i++) {
        let campo = document.getElementById(campos[i]);
        campo.removeAttribute("aria-invalid");
    }

    for (let i = 0; i < campos.length; i++) {
        let campo = document.getElementById(campos[i]);
        if (campo.value.trim() == "") {
            mostrarMensagem("Por favor, preencha todos os campos!", true);
            campo.setAttribute("aria-invalid", "true");
            campo.focus();
            return false;
        }
    }
    return true;
}

function validarEmail(email) {
    let contador = 0;
    let quantidadeArrobas = 0;
    let posicaoArroba = -1;
    let posicaoPonto = -1;

    while (contador < email.length) {
        let caractere = email[contador];
        if (caractere.trim() == "") {
            return false;
        }
        if (caractere == "@") {
            quantidadeArrobas++;
            posicaoArroba = contador;
        }
        if (caractere == "." && quantidadeArrobas == 1) {
            posicaoPonto = contador;
        }
        contador++;
    }

    if (quantidadeArrobas != 1 || posicaoArroba <= 0) {
        return false;
    }
    if (posicaoPonto <= posicaoArroba + 1 || posicaoPonto == email.length - 1) {
        return false;
    }
    if (email.indexOf("..") != -1 || email[posicaoArroba - 1] == "." || email[posicaoArroba + 1] == ".") {
        return false;
    }
    return true;
}

function validarSenha(senha) {
    let contador = 0;
    while (contador < senha.length) {
        contador++;
    }
    return contador >= 6;
}

function mostrarSenha(idCampo, botao) {
    let campo = document.getElementById(idCampo);
    if (campo.type == "password") {
        campo.type = "text";
        botao.setAttribute("aria-label", "Ocultar senha");
        botao.setAttribute("aria-pressed", "true");
    } else {
        campo.type = "password";
        botao.setAttribute("aria-label", "Mostrar senha");
        botao.setAttribute("aria-pressed", "false");
    }
}
