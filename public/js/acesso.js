// O servidor autentica a conta e mantém a sessão em um cookie protegido.
// O navegador armazena somente a contagem de erros, nunca a senha.
var enviandoAcesso = false;
function verificarBloqueio() {
    var tentativas = Number(sessionStorage.getItem('TENTATIVAS_LOGIN') || 0);
    if (tentativas >= 3) {
        document.getElementById('ipt_email').disabled = true;
        document.getElementById('ipt_senha').disabled = true;
        document.getElementById('btn_entrar').disabled = true;
        mostrarMensagem('Acesso bloqueado após 3 erros nesta aba. Feche esta aba e abra novamente para tentar entrar.', true);
        return true;
    }
    return false;
}
async function enviarAcesso(endereco, dados) {
    var resposta = await fetch(endereco, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
    var retorno = await resposta.json();
    return { ok: resposta.ok, status: resposta.status, dados: retorno };
}
async function entrar() {
    if (enviandoAcesso || verificarBloqueio() || !validarCampos(['ipt_email', 'ipt_senha'])) return;
    enviandoAcesso = true;
    document.getElementById('btn_entrar').disabled = true;
    try {
        var resposta = await enviarAcesso('/usuarios/autenticar', {
            email: document.getElementById('ipt_email').value.trim(), senha: document.getElementById('ipt_senha').value
        });
        if (resposta.ok) {
            sessionStorage.removeItem('TENTATIVAS_LOGIN');
            window.location.href = 'dashboard.html';
        } else if (resposta.status === 401) {
            var tentativas = Number(sessionStorage.getItem('TENTATIVAS_LOGIN') || 0) + 1;
            sessionStorage.setItem('TENTATIVAS_LOGIN', tentativas);
            if (!verificarBloqueio()) mostrarMensagem('E-mail ou senha incorretos. Tentativas restantes: ' + (3 - tentativas) + '.', true);
        } else mostrarMensagem(resposta.dados.mensagem, true);
    } catch (erro) { mostrarMensagem('Não foi possível conectar ao servidor. Abra o site pelo endereço local e confira se o servidor está iniciado.', true); }
    finally {
        enviandoAcesso = false;
        if (!verificarBloqueio()) document.getElementById('btn_entrar').disabled = false;
    }
}
async function cadastrar() {
    if (enviandoAcesso || !validarCampos(['ipt_nome', 'ipt_email', 'ipt_nivel', 'ipt_senha', 'ipt_confirmarSenha'])) return;
    var nome = document.getElementById('ipt_nome').value.trim();
    var email = document.getElementById('ipt_email').value.trim();
    var senha = document.getElementById('ipt_senha').value;
    if (nome.length < 3) return mostrarMensagem('Informe seu nome com pelo menos 3 caracteres.', true);
    if (!validarEmail(email)) return mostrarMensagem('Digite um e-mail válido.', true);
    if (!validarSenha(senha)) return mostrarMensagem('A senha precisa ter no mínimo 6 caracteres.', true);
    if (senha !== document.getElementById('ipt_confirmarSenha').value) return mostrarMensagem('As senhas não coincidem.', true);
    if (!document.getElementById('chk_termos').checked) return mostrarMensagem('Marque a opção de concordância para continuar.', true);
    enviandoAcesso = true;
    document.getElementById('btn_cadastrar').disabled = true;
    try {
        var resposta = await enviarAcesso('/usuarios/cadastrar', { nome: nome, email: email, senha: senha, nivel: document.getElementById('ipt_nivel').value });
        if (resposta.ok) {
            sessionStorage.removeItem('TENTATIVAS_LOGIN');
            mostrarMensagem('Conta criada no banco! Agora acesse “Fazer Login” para entrar.', false);
            document.getElementById('ipt_senha').value = '';
            document.getElementById('ipt_confirmarSenha').value = '';
        } else mostrarMensagem(resposta.dados.mensagem, true);
    } catch (erro) { mostrarMensagem('Não foi possível conectar ao servidor. Confira se o projeto está iniciado e tente novamente.', true); }
    finally { enviandoAcesso = false; document.getElementById('btn_cadastrar').disabled = false; }
}
function ajudarSenha() {
    mostrarMensagem('Use o e-mail e a senha da conta que você cadastrou. A recuperação de senha ainda não está disponível.', false);
}

function verificarSenha(senha) {
    let achouNumero = false;
    let achouMaiuscula = false;
    let achouSimbolo = false;

    for (let i = 0; i < senha.length; i++) {
        let caractere = senha[i];
        if (caractere >= "0" && caractere <= "9") {
            achouNumero = true;
        } else if (caractere.toUpperCase() == caractere.toLowerCase()) {
            achouSimbolo = true;
        } else if (caractere == caractere.toUpperCase()) {
            achouMaiuscula = true;
        }
    }

    let barra = document.getElementById("barra_senha");
    let texto = document.getElementById("texto_senha");

    if (senha.length == 0) {
        barra.className = "barra-senha";
        texto.textContent = "Digite uma senha segura";
    } else if (senha.length >= 8 && achouNumero && achouMaiuscula && achouSimbolo) {
        barra.className = "barra-senha senha-forte";
        texto.textContent = "Senha Forte e Segura!";
    } else if (senha.length >= 8 && (achouNumero || achouMaiuscula)) {
        barra.className = "barra-senha senha-media";
        texto.textContent = "Senha Média (adicione caracteres especiais)";
    } else {
        barra.className = "barra-senha senha-fraca";
        texto.textContent = "Senha Fraca (adicione números ou letras maiúsculas)";
    }
}
