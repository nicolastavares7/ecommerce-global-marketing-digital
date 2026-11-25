// Alteração: arquivo de avisos da base reaproveitado para simulações do DigitalTrack.
let simulacaoModel = require('../models/simulacaoModel');

// Alteração: funções comuns e then/catch, seguindo o formato do WebDataViz.
function listar(req, res) {
    let idUsuario = Number(req.params.idUsuario);
    if (Number.isInteger(idUsuario) == false || idUsuario <= 0) {
        res.status(400).json({ mensagem: 'Usuário inválido.' });
        return;
    }

    simulacaoModel.listar(idUsuario).then(function (resultado) {
        res.json(resultado);
    }).catch(function (erro) {
        res.status(503).json({ mensagem: 'Não foi possível consultar as simulações.' });
    });
}

// Confere um valor em reais: de zero ao limite do banco e até dois decimais.
function valorValido(valor) {
    if (typeof valor != 'number' || isFinite(valor) == false) {
        return false;
    }
    if (valor < 0 || valor > 99999999.99) {
        return false;
    }
    // toFixed(2) arredonda para centavos; o valor original deve ser igual.
    return valor == Number(valor.toFixed(2));
}

function cadastrar(req, res) {
    let idUsuario = Number(req.params.idUsuario);
    if (Number.isInteger(idUsuario) == false || idUsuario <= 0) {
        res.status(400).json({ mensagem: 'Usuário inválido.' });
        return;
    }

    let nome = req.body.nome;
    let plataforma = req.body.plataforma;
    let preco = req.body.precoVenda;
    let produto = req.body.custoProduto;
    let anuncio = req.body.custoAnuncio;
    let vendas = req.body.vendasDia;

    if (typeof nome != 'string' || nome.trim().length < 3 || nome.trim().length > 120) {
        res.status(400).json({ mensagem: 'O nome deve ter entre 3 e 120 caracteres.' });
    } else if (plataforma != 'Google Ads' && plataforma != 'Meta Ads' && plataforma != 'TikTok Ads') {
        res.status(400).json({ mensagem: 'Escolha uma das plataformas disponíveis.' });
    } else if (valorValido(preco) == false || valorValido(produto) == false || valorValido(anuncio) == false) {
        res.status(400).json({ mensagem: 'Informe valores não negativos com até duas casas decimais.' });
    } else if (typeof vendas != 'number' || vendas % 1 != 0 || vendas < 0 || vendas > 1000000) {
        res.status(400).json({ mensagem: 'Informe vendas diárias inteiras, de 0 a 1000000.' });
    } else {
        simulacaoModel.cadastrar(idUsuario, nome.trim(), plataforma, preco, produto, anuncio, vendas)
            .then(function (resultado) {
                res.status(201).json({ id: resultado.insertId });
            }).catch(function (erro) {
                res.status(503).json({ mensagem: 'Não foi possível salvar a simulação.' });
            });
    }
}

function excluir(req, res) {
    let idUsuario = Number(req.params.idUsuario);
    if (Number.isInteger(idUsuario) == false || idUsuario <= 0) {
        res.status(400).json({ mensagem: 'Usuário inválido.' });
        return;
    }

    let id = Number(req.params.id);

    if (Number.isSafeInteger(id) == false || id <= 0) {
        res.status(400).json({ mensagem: 'Identificador inválido.' });
    } else {
        simulacaoModel.excluir(id, idUsuario).then(function (resultado) {
            if (resultado.affectedRows == 0) {
                res.status(404).json({ mensagem: 'Simulação não encontrada para esta conta.' });
            } else {
                res.sendStatus(204);
            }
        }).catch(function (erro) {
            res.status(503).json({ mensagem: 'Não foi possível excluir a simulação.' });
        });
    }
}

module.exports = {
    listar: listar,
    cadastrar: cadastrar,
    excluir: excluir
};
