let express = require('express');
let path = require('path');
let router = express.Router();

// Alteração: a rota original abre o HTML do DigitalTrack, sem motor de templates.
router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

module.exports = router;
