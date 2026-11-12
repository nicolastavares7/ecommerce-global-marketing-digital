// Ao abrir um HTML pelo Finder, encaminha para o servidor local do projeto.
// Pelo endereço HTTP da máquina virtual este redirecionamento não é executado.
if (window.location.protocol == "file:") {
    var partesCaminho = window.location.pathname.split("/");
    var pagina = partesCaminho[partesCaminho.length - 1];
    window.location.replace("http://localhost:3334/" + pagina);
}
