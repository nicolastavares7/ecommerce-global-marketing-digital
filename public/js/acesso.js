// Cadastro e login: ler os campos, validar e enviar os dados com fetch.
let enviandoAcesso = false;
let tentativas = 0; // Contador simples das tentativas nesta página.

function verificarBloqueio() {
    if (tentativas >= 3) {
        document.getElementById('ipt_email').disabled = true;
        document.getElementById('ipt_senha').disabled = true;
        document.getElementById('btn_entrar').disabled = true;
        mostrarMensagem('Acesso bloqueado após 3 erros nesta página. Recarregue para tentar novamente.', true);
        return true;
    }

    return false;
}

// Alteração: libera o botão tanto após uma resposta quanto após falha de conexão.
function liberarLogin() {
    enviandoAcesso = false;

    if (verificarBloqueio() == false) {
        document.getElementById('btn_entrar').disabled = false;
    }
}

function entrar() {
    if (enviandoAcesso == true || verificarBloqueio() == true) {
        return;
    }

    let camposPreenchidos = validarCampos(['ipt_email', 'ipt_senha']);
    if (camposPreenchidos == false) {
        return;
    }

    let email = document.getElementById('ipt_email').value.trim();
    let senha = document.getElementById('ipt_senha').value;

    enviandoAcesso = true;
    document.getElementById('btn_entrar').disabled = true;

    return fetch('/usuarios/autenticar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
    }).then(function (resposta) {
        return resposta.json().then(function (dados) {
            if (resposta.ok == true) {
                tentativas = 0;
                // Mesmo padrão da base WebDataViz: guarda os dados nesta aba.
                sessionStorage.ID_USUARIO = dados.id;
                sessionStorage.NOME_USUARIO = dados.nome;
                sessionStorage.EMAIL_USUARIO = dados.email;
                window.location.href = 'dashboard/dashboard.html';
            } else if (resposta.status == 401) {
                tentativas++;

                if (verificarBloqueio() == false) {
                    let restantes = 3 - tentativas;
                    mostrarMensagem('E-mail ou senha incorretos. Tentativas restantes: ' + restantes + '.', true);
                }
            } else {
                mostrarMensagem(dados.mensagem, true);
            }

            liberarLogin();
        });
    }).catch(function (erro) {
        // catch trata falhas de conexão ou de leitura da resposta.
        mostrarMensagem('Não foi possível conectar ao servidor. Abra o site pelo endereço local e confira se o servidor está iniciado.', true);
        liberarLogin();
    });
}

function liberarCadastro() {
    enviandoAcesso = false;
    document.getElementById('btn_cadastrar').disabled = false;
}

function cadastrar() {
    if (enviandoAcesso == true) {
        return;
    }

    let campos = ['ipt_nome', 'ipt_email', 'ipt_nivel', 'ipt_senha', 'ipt_confirmarSenha'];
    if (validarCampos(campos) == false) {
        return;
    }

    let nome = document.getElementById('ipt_nome').value.trim();
    let email = document.getElementById('ipt_email').value.trim();
    let senha = document.getElementById('ipt_senha').value;
    let confirmarSenha = document.getElementById('ipt_confirmarSenha').value;
    let nivel = document.getElementById('ipt_nivel').value;
    let termosAceitos = document.getElementById('chk_termos').checked;
    let tudoCerto = true;

    // Alteração: validações em cadeia, como no cadastro do projeto em grupo.
    if (nome.length < 3) {
        mostrarMensagem('Informe seu nome com pelo menos 3 caracteres.', true);
        tudoCerto = false;
    } else if (validarEmail(email) == false) {
        mostrarMensagem('Digite um e-mail válido.', true);
        tudoCerto = false;
    } else if (validarSenha(senha) == false) {
        mostrarMensagem('A senha precisa ter no mínimo 6 caracteres.', true);
        tudoCerto = false;
    } else if (senha != confirmarSenha) {
        mostrarMensagem('As senhas não coincidem.', true);
        tudoCerto = false;
    } else if (termosAceitos == false) {
        mostrarMensagem('Marque a opção de concordância para continuar.', true);
        tudoCerto = false;
    }

    if (tudoCerto == true) {
        enviandoAcesso = true;
        document.getElementById('btn_cadastrar').disabled = true;

        return fetch('/usuarios/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha, nivel })
        }).then(function (resposta) {
            return resposta.json().then(function (dados) {
                if (resposta.ok == true) {
                    tentativas = 0;
                    mostrarMensagem('Conta criada no banco! Agora acesse “Fazer Login” para entrar.', false);
                    document.getElementById('ipt_senha').value = '';
                    document.getElementById('ipt_confirmarSenha').value = '';
                } else {
                    mostrarMensagem(dados.mensagem, true);
                }

                liberarCadastro();
            });
        }).catch(function (erro) {
            mostrarMensagem('Não foi possível conectar ao servidor. Confira se o projeto está iniciado e tente novamente.', true);
            liberarCadastro();
        });
    }
}

function ajudarSenha() {
    mostrarMensagem('Use o e-mail e a senha da conta que você cadastrou. A recuperação de senha ainda não está disponível.', false);
}

// O for verifica cada caractere e o if decide quais requisitos foram encontrados.
function verificarSenha(senha) {
    let achouNumero = false;
    let achouMaiuscula = false;
    let achouSimbolo = false;

    for (let i = 0; i < senha.length; i++) {
        let caractere = senha[i];
        if (caractere >= '0' && caractere <= '9') {
            achouNumero = true;
        } else if (caractere.toUpperCase() == caractere.toLowerCase()) {
            achouSimbolo = true;
        } else if (caractere == caractere.toUpperCase()) {
            achouMaiuscula = true;
        }
    }

    let barra = document.getElementById('barra_senha');
    let texto = document.getElementById('texto_senha');

    if (senha.length == 0) {
        barra.className = 'barra-senha';
        texto.textContent = 'Digite uma senha segura';
    } else if (senha.length >= 8 && achouNumero && achouMaiuscula && achouSimbolo) {
        barra.className = 'barra-senha senha-forte';
        texto.textContent = 'Senha Forte e Segura!';
    } else if (senha.length >= 8 && (achouNumero || achouMaiuscula)) {
        barra.className = 'barra-senha senha-media';
        texto.textContent = 'Senha Média (adicione caracteres especiais)';
    } else {
        barra.className = 'barra-senha senha-fraca';
        texto.textContent = 'Senha Fraca (adicione números ou letras maiúsculas)';
    }
}
