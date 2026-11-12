var database = require('../database/config');
function buscarPorEmail(email) {
    return database.executar('SELECT id, nome, email, senha FROM usuario WHERE email = ?;', [email]);
}
function cadastrar(nome, email, senha, nivel) {
    return database.executar('INSERT INTO usuario (nome, email, senha, nivel) VALUES (?, ?, ?, ?);', [nome, email, senha, nivel]);
}
module.exports = { buscarPorEmail, cadastrar };
