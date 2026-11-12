var database = require('../database/config');
function listar(idUsuario) {
    return database.executar(`SELECT id, nome_simulacao AS nome, plataforma_anuncio AS plataforma,
        preco_venda_unidade AS precoVenda, custo_produto_frete AS custoProduto,
        custo_anuncio_venda AS custoAnuncio, vendas_estimadas_dia AS vendasDia, data_registro AS dataCadastro
        FROM simulacao_cenario WHERE fk_usuario = ? ORDER BY id DESC;`, [idUsuario]);
}
function cadastrar(idUsuario, dados) {
    return database.executar(`INSERT INTO simulacao_cenario
        (fk_usuario, nome_simulacao, plataforma_anuncio, preco_venda_unidade, custo_produto_frete, custo_anuncio_venda, vendas_estimadas_dia)
        VALUES (?, ?, ?, ?, ?, ?, ?);`, [idUsuario, dados.nome.trim(), dados.plataforma, dados.precoVenda, dados.custoProduto, dados.custoAnuncio, dados.vendasDia]);
}
function excluir(id, idUsuario) {
    return database.executar('DELETE FROM simulacao_cenario WHERE id = ? AND fk_usuario = ?;', [id, idUsuario]);
}
module.exports = { listar, cadastrar, excluir };
