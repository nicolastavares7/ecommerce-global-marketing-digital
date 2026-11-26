// Alteração: variáveis com let, no mesmo padrão dos demais scripts próprios.
// Ao abrir um HTML pelo Finder, encaminha para o servidor local do projeto.
// Pelo endereço HTTP da máquina virtual este redirecionamento não é executado.
if (window.location.protocol == "file:") {
    let partesCaminho = window.location.pathname.split("/");
    let pagina = partesCaminho[partesCaminho.length - 1];
    window.location.replace("http://localhost:3334/" + pagina + window.location.search);
}
