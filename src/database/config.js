var mysql = require('mysql2');

// Mantém a conexão do WebDataViz. Os valores da consulta seguem separados do SQL.
function executar(instrucao, parametros) {
    if (!parametros) parametros = [];
    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            connectTimeout: 5000
        });
        conexao.on('error', function (erro) {
            conexao.destroy();
            reject(erro);
        });
        conexao.query(instrucao, parametros, function (erro, resultados) {
            if (erro) {
                conexao.destroy();
                return reject(erro);
            }
            conexao.end(function () { resolve(resultados); });
        });
    });
}
module.exports = { executar };
