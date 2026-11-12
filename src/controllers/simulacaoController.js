var simulacaoModel = require('../models/simulacaoModel');
function validar(dados) {
    if (typeof dados.nome !== 'string' || dados.nome.trim().length < 3 || dados.nome.trim().length > 120) return false;
    if (['Google Ads', 'Meta Ads', 'TikTok Ads'].indexOf(dados.plataforma) === -1) return false;
    var campos = ['precoVenda', 'custoProduto', 'custoAnuncio'];
    for (var i = 0; i < campos.length; i++) {
        var valor = dados[campos[i]];
        // Centavos e limite compatíveis com DECIMAL(10,2), sem aceitar texto parcial.
        if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0 || valor > 99999999.99 ||
            Math.abs(valor * 100 - Math.round(valor * 100)) > 0.00001) return false;
    }
    return Number.isInteger(dados.vendasDia) && dados.vendasDia >= 0 && dados.vendasDia <= 1000000;
}
function falha(res, erro) {
    console.error('Simulações indisponíveis:', erro.code || 'erro interno');
    res.status(503).json({ mensagem: 'Não foi possível acessar o banco. Nenhuma alteração foi confirmada. Tente novamente.' });
}
async function listar(req, res) {
    try { res.json(await simulacaoModel.listar(req.usuario.id)); }
    catch (erro) { falha(res, erro); }
}
async function cadastrar(req, res) {
    if (!validar(req.body)) return res.status(400).json({ mensagem: 'Confira nome, plataforma, valores não negativos com até 2 casas e vendas diárias inteiras.' });
    try {
        var resultado = await simulacaoModel.cadastrar(req.usuario.id, req.body);
        res.status(201).json({ id: resultado.insertId });
    } catch (erro) { falha(res, erro); }
}
async function excluir(req, res) {
    var id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ mensagem: 'Identificador inválido.' });
    try {
        var resultado = await simulacaoModel.excluir(id, req.usuario.id);
        if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Simulação não encontrada para esta conta.' });
        res.sendStatus(204);
    } catch (erro) { falha(res, erro); }
}
module.exports = { listar, cadastrar, excluir };
