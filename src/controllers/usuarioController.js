var crypto = require('crypto');
var usuarioModel = require('../models/usuarioModel');
var sessao = require('../middleware/sessao');

// A proteção da senha fica isolada aqui. Não guardamos a senha digitada.
function derivarSenha(senha, salt) {
    return new Promise(function (resolve, reject) {
        crypto.scrypt(senha, salt, 64, function (erro, hash) {
            if (erro) return reject(erro);
            resolve(hash);
        });
    });
}
async function cadastrar(req, res) {
    var nome = req.body.nome;
    var email = req.body.email;
    var senha = req.body.senha;
    var nivel = req.body.nivel;
    var niveis = ['Iniciante', 'Intermediário', 'Avançado'];
    if (typeof nome !== 'string' || nome.trim().length < 3 || nome.trim().length > 100 ||
        typeof email !== 'string' || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        typeof senha !== 'string' || senha.length < 6 || senha.length > 128 || niveis.indexOf(nivel) === -1) {
        return res.status(400).json({ mensagem: 'Confira nome, e-mail, nível e senha de 6 a 128 caracteres.' });
    }
    try {
        var salt = crypto.randomBytes(16).toString('hex');
        var hash = await derivarSenha(senha, salt);
        await usuarioModel.cadastrar(nome.trim(), email.trim().toLowerCase(), 'scrypt:' + salt + ':' + hash.toString('hex'), nivel);
        res.status(201).json({ mensagem: 'Conta criada! Faça login para cadastrar suas simulações.' });
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
        console.error('Cadastro indisponível:', erro.code || 'erro interno');
        res.status(503).json({ mensagem: 'Não foi possível salvar a conta no banco. Tente novamente.' });
    }
}
async function autenticar(req, res) {
    var email = req.body.email;
    var senha = req.body.senha;
    if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha || email.length > 100 || senha.length > 128) {
        return res.status(400).json({ mensagem: 'Informe e-mail e senha.' });
    }
    try {
        var usuarios = await usuarioModel.buscarPorEmail(email.trim().toLowerCase());
        var usuario = usuarios[0];
        var salt = '00000000000000000000000000000000';
        var original = Buffer.alloc(64);
        if (usuario) {
            var partes = usuario.senha.split(':');
            if (partes[0] === 'scrypt' && partes.length === 3) {
                salt = partes[1];
                original = Buffer.from(partes[2], 'hex');
            }
        }
        var tentativa = await derivarSenha(senha, salt);
        if (!usuario || original.length !== tentativa.length || !crypto.timingSafeEqual(original, tentativa)) {
            return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
        }
        var dados = { id: usuario.id, nome: usuario.nome, email: usuario.email };
        sessao.criar(req, res, dados);
        res.json(dados);
    } catch (erro) {
        console.error('Login indisponível:', erro.code || 'erro interno');
        res.status(503).json({ mensagem: 'Não foi possível consultar o banco. Tente novamente.' });
    }
}
module.exports = { cadastrar, autenticar };
