var express = require('express');
var router = express.Router();
var sessao = require('../middleware/sessao');
var controller = require('../controllers/simulacaoController');
router.use(sessao.exigir);
router.get('/listar', controller.listar);
router.post('/cadastrar', controller.cadastrar);
router.delete('/excluir/:id', controller.excluir);
module.exports = router;
