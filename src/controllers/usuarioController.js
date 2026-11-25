let crypto = require('crypto');
let usuarioModel = require('../models/usuarioModel');

// Alteração: valida o e-mail com posições e um for, sem expressão regular.
function emailValido(email) {
    let arroba = email.indexOf('@');
    let ponto = email.lastIndexOf('.');
    if (arroba <= 0 || arroba != email.lastIndexOf('@')) {
        return false;
    }
    if (ponto <= arroba + 1 || ponto == email.length - 1) {
        return false;
    }
    for (let i = 0; i < email.length; i++) {
        if (email[i].trim() == '') {
            return false;
        }
    }
    return true;
}

function cadastrar(req, res) {
    let nome = req.body.nome;
    let email = req.body.email;
    let senha = req.body.senha;
    let nivel = req.body.nivel;

    if (typeof nome != 'string' || nome.trim().length < 3 || nome.trim().length > 100) {
        res.status(400).json({ mensagem: 'Informe um nome de 3 a 100 caracteres.' });
    } else if (typeof email != 'string' || email.length > 100 || emailValido(email.trim()) == false) {
        res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
    } else if (typeof senha != 'string' || senha.length < 6 || senha.length > 128) {
        res.status(400).json({ mensagem: 'A senha deve ter de 6 a 128 caracteres.' });
    } else if (nivel != 'Iniciante' && nivel != 'Intermediário' && nivel != 'Avançado') {
        res.status(400).json({ mensagem: 'Escolha um nível de experiência.' });
    } else {
        // Mantém o formato das senhas já cadastradas no banco.
        let salt = crypto.randomBytes(16).toString('hex');
        let hash = crypto.scryptSync(senha, salt, 64).toString('hex');
        let senhaProtegida = 'scrypt:' + salt + ':' + hash;
        usuarioModel.cadastrar(nome.trim(), email.trim().toLowerCase(), senhaProtegida, nivel).then(function () {
            res.status(201).json({ mensagem: 'Conta criada! Faça login.' });
        }).catch(function (erro) {
            if (erro.code == 'ER_DUP_ENTRY') {
                res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
            } else {
                res.status(503).json({ mensagem: 'Não foi possível salvar a conta.' });
            }
        });
    }
}

function autenticar(req, res) {
    let email = req.body.email;
    let senha = req.body.senha;

    if (typeof email != 'string' || typeof senha != 'string' || email.trim() == '' || senha == '' || email.length > 100 || senha.length > 128) {
        res.status(400).json({ mensagem: 'Informe e-mail e senha.' });
        return;
    }

    usuarioModel.buscarPorEmail(email.trim().toLowerCase()).then(function (usuarios) {
        if (usuarios.length == 0) {
            res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
            return;
        }

        let usuario = usuarios[0];
        // A senha guardada tem três partes: scrypt, salt e hash.
        let partes = usuario.senha.split(':');
        let hash = crypto.scryptSync(senha, partes[1], 64);
        let hashSalvo = Buffer.from(partes[2], 'hex');
        if (hash.length != hashSalvo.length || crypto.timingSafeEqual(hash, hashSalvo) == false) {
            res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
        } else {
            res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email });
        }
    }).catch(function (erro) {
        res.status(503).json({ mensagem: 'Não foi possível consultar a conta.' });
    });
}

// Cada nome exportado pode ser chamado pelo arquivo de rotas.
module.exports = {
    cadastrar: cadastrar,
    autenticar: autenticar
};
