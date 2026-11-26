// Alteração: arquivo de avisos da base reaproveitado para simulações do DigitalTrack.
let database = require('../database/config');

// Alteração: model apenas monta o SQL e chama o banco, como no WebDataViz.
// AS dá aos campos os nomes usados no JavaScript da dashboard.
function listar(idUsuario) {
    let instrucaoSql = `
        SELECT id, nome_simulacao AS nome, plataforma_anuncio AS plataforma,
            forma_pagamento AS formaPagamento, percentual_pago AS percentualPago,
            preco_venda_unidade AS precoVenda, custo_produto AS custoProduto,
            custo_frete AS custoFrete,
            custo_anuncio_venda AS custoAnuncio, vendas_estimadas_dia AS vendasDia
        FROM simulacao_cenario
        WHERE fk_usuario = ?
        ORDER BY id DESC;
    `;
    return database.executar(instrucaoSql, [idUsuario]);
}

function buscar(id, idUsuario) {
    let instrucaoSql = `
        SELECT id, nome_simulacao AS nome, plataforma_anuncio AS plataforma,
            forma_pagamento AS formaPagamento, percentual_pago AS percentualPago,
            preco_venda_unidade AS precoVenda, custo_produto AS custoProduto,
            custo_frete AS custoFrete, custo_anuncio_venda AS custoAnuncio,
            vendas_estimadas_dia AS vendasDia
        FROM simulacao_cenario
        WHERE id = ? AND fk_usuario = ?;
    `;
    return database.executar(instrucaoSql, [id, idUsuario]);
}

function cadastrar(idUsuario, nome, plataforma, preco, produto, frete, anuncio, vendas, formaPagamento, percentualPago) {
    let instrucaoSql = `
        INSERT INTO simulacao_cenario
            (fk_usuario, nome_simulacao, plataforma_anuncio, preco_venda_unidade,
             custo_produto, custo_frete, custo_anuncio_venda, vendas_estimadas_dia, forma_pagamento, percentual_pago)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    let valores = [idUsuario, nome, plataforma, preco, produto, frete, anuncio, vendas, formaPagamento, percentualPago];
    return database.executar(instrucaoSql, valores);
}

function excluir(id, idUsuario) {
    // Filtra pelo ID da simulação e pelo ID de usuário recebido da página.
    let instrucaoSql = 'DELETE FROM simulacao_cenario WHERE id = ? AND fk_usuario = ?;';
    return database.executar(instrucaoSql, [id, idUsuario]);
}

module.exports = {
    listar: listar,
    buscar: buscar,
    cadastrar: cadastrar,
    excluir: excluir
};
