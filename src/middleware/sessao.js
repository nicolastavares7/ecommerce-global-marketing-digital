var crypto = require('crypto');
// Somente as sessões ficam em memória. Usuários e simulações ficam no MySQL.
// Reiniciar o servidor exige novo login, mas não remove os registros do banco.
var sessoes = new Map();
var duracao = 8 * 60 * 60 * 1000;

function tokenDaRequisicao(req) {
    var cookies = (req.headers.cookie || '').split(';');
    for (var i = 0; i < cookies.length; i++) {
        var partes = cookies[i].trim().split('=');
        if (partes[0] === 'digitaltrack_sessao') return partes[1];
    }
    return '';
}
function criar(req, res, usuario) {
    encerrar(req, res);
    sessoes.forEach(function (sessao, token) {
        if (sessao.expira < Date.now()) sessoes.delete(token);
    });
    var token = crypto.randomBytes(32).toString('hex');
    sessoes.set(token, { usuario: usuario, expira: Date.now() + duracao });
    res.cookie('digitaltrack_sessao', token, {
        httpOnly: true, sameSite: 'strict', secure: req.secure, maxAge: duracao, path: '/'
    });
}
function encerrar(req, res) {
    sessoes.delete(tokenDaRequisicao(req));
    res.clearCookie('digitaltrack_sessao', { path: '/' });
}
function exigir(req, res, next) {
    var token = tokenDaRequisicao(req);
    var sessao = sessoes.get(token);
    if (!sessao || sessao.expira < Date.now()) {
        sessoes.delete(token);
        return res.status(401).json({ mensagem: 'Faça login para acessar suas simulações.' });
    }
    // O identificador vem da sessão no servidor, não do formulário ou da URL.
    req.usuario = sessao.usuario;
    res.set('Cache-Control', 'no-store');
    next();
}
module.exports = { criar, encerrar, exigir };
