var express = require('express');
var router = express.Router();
var usuarioController = require('../controllers/usuarioController');
var sessao = require('../middleware/sessao');
router.post('/cadastrar', usuarioController.cadastrar);
router.post('/autenticar', usuarioController.autenticar);
router.get('/sessao', sessao.exigir, function (req, res) { res.json(req.usuario); });
router.post('/sair', function (req, res) { sessao.encerrar(req, res); res.sendStatus(204); });
module.exports = router;
