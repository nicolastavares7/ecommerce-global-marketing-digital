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

// A análise usa o ID do cenário e o ID de usuário recebido da página.
function buscar(req, res) {
    let id = Number(req.params.id);
    let idUsuario = Number(req.params.idUsuario);

    if (Number.isInteger(id) == false || id <= 0 || Number.isInteger(idUsuario) == false || idUsuario <= 0) {
        res.status(400).json({ mensagem: 'Identificador inválido.' });
        return;
    }

    simulacaoModel.buscar(id, idUsuario).then(function (resultado) {
        if (resultado.length == 0) {
            res.status(404).json({ mensagem: 'Cenário não encontrado para esta conta.' });
        } else {
            res.json(resultado[0]);
        }
    }).catch(function (erro) {
        res.status(503).json({ mensagem: 'Não foi possível consultar o cenário.' });
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
    let frete = req.body.custoFrete;
    let anuncio = req.body.custoAnuncio;
    let vendas = req.body.vendasDia;
    let formaPagamento = req.body.formaPagamento;
    let percentualPago = req.body.percentualPago;
    if (formaPagamento == 'antecipado') {
        percentualPago = 100;
    }

    if (typeof nome != 'string' || nome.trim().length < 3 || nome.trim().length > 120) {
        res.status(400).json({ mensagem: 'O nome deve ter entre 3 e 120 caracteres.' });
    } else if (plataforma != 'Google Ads' && plataforma != 'Meta Ads' && plataforma != 'TikTok Ads') {
        res.status(400).json({ mensagem: 'Escolha uma das plataformas disponíveis.' });
    } else if (valorValido(preco) == false || valorValido(produto) == false || valorValido(frete) == false || valorValido(anuncio) == false) {
        res.status(400).json({ mensagem: 'Informe valores não negativos com até duas casas decimais.' });
    } else if (formaPagamento != 'antecipado' && formaPagamento != 'cod') {
        res.status(400).json({ mensagem: 'Escolha a forma de pagamento.' });
    } else if (typeof percentualPago != 'number' || isFinite(percentualPago) == false || percentualPago < 0 || percentualPago > 100 || percentualPago != Number(percentualPago.toFixed(2))) {
        res.status(400).json({ mensagem: 'Informe um percentual de entregas pagas entre 0 e 100, com até duas casas decimais.' });
    } else if (typeof vendas != 'number'  || vendas % 1 != 0 || vendas < 0 || vendas > 1000000) {
        res.status(400).json({ mensagem: 'Informe vendas diárias inteiras, de 0 a 1000000.' });
    } else {
        simulacaoModel.cadastrar(idUsuario, nome.trim(), plataforma, preco, produto, frete, anuncio, vendas, formaPagamento, percentualPago)
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
    buscar: buscar,
    cadastrar: cadastrar,
    excluir: excluir
};
