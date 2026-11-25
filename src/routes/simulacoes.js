var express = require("express");
var router = express.Router();
var simulacaoController = require("../controllers/simulacaoController");

// Mesmo formato das rotas de avisos da base; adaptado para simulações.
router.get("/listar/:idUsuario", function (req, res) {
    simulacaoController.listar(req, res);
});

router.post("/cadastrar/:idUsuario", function (req, res) {
    simulacaoController.cadastrar(req, res);
});

router.delete("/excluir/:id/:idUsuario", function (req, res) {
    simulacaoController.excluir(req, res);
});

module.exports = router;
