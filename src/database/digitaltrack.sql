-- Banco do DigitalTrack. Não apaga nem modifica o banco AquaTech.
CREATE DATABASE IF NOT EXISTS digital_track CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE digital_track;

CREATE TABLE IF NOT EXISTS usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nivel VARCHAR(20) NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Um usuário pode cadastrar várias simulações. Valores unitários em reais.
CREATE TABLE IF NOT EXISTS simulacao_cenario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_usuario INT NOT NULL,
    nome_simulacao VARCHAR(120) NOT NULL,
    plataforma_anuncio VARCHAR(20) NOT NULL,
    preco_venda_unidade DECIMAL(10,2) NOT NULL,
    custo_produto_frete DECIMAL(10,2) NOT NULL,
    custo_anuncio_venda DECIMAL(10,2) NOT NULL,
    vendas_estimadas_dia INT NOT NULL,
    data_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id),
    CHECK (plataforma_anuncio IN ('Google Ads', 'Meta Ads', 'TikTok Ads')),
    CHECK (preco_venda_unidade >= 0),
    CHECK (custo_produto_frete >= 0),
    CHECK (custo_anuncio_venda >= 0),
    CHECK (vendas_estimadas_dia >= 0)
);

-- Consulta pessoal usada pela API, com parâmetro para o usuário autenticado:
-- SELECT * FROM simulacao_cenario WHERE fk_usuario = ? ORDER BY id DESC;
-- Os indicadores são calculados a partir destes dados, sempre para 30 dias.
