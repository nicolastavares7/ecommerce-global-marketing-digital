let database = require('../database/config');

// Alteração: SQL e valores separados, com uma função para cada operação.
// Cada ? recebe um valor do vetor, na mesma ordem, sem juntar texto ao SQL.
function buscarPorEmail(email) {
    let instrucaoSql = 'SELECT id, nome, email, senha FROM usuario WHERE email = ?;';
    return database.executar(instrucaoSql, [email]);
}

function cadastrar(nome, email, senha, nivel) {
    let instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, nivel)
        VALUES (?, ?, ?, ?);
    `;
    return database.executar(instrucaoSql, [nome, email, senha, nivel]);
}

module.exports = {
    buscarPorEmail: buscarPorEmail,
    cadastrar: cadastrar
};
