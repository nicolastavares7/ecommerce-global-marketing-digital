// sessão
function validarSessao() {
    var email = sessionStorage.EMAIL_USUARIO;
    var nome = sessionStorage.NOME_USUARIO;

    var b_usuario = document.getElementById("nome_usuario");
    var id = Number(sessionStorage.ID_USUARIO);

    if (email && nome && Number.isInteger(id) && id > 0) {
        b_usuario.textContent = nome;
        return true;
    } else {
        window.location.href = "../login.html";
        return false;
    }
}

function limparSessao() {
    sessionStorage.clear();
    window.location.href = "../login.html";
}

