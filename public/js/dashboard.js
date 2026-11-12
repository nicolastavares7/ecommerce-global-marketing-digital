var simulacoes = [];
var graficoCustos;
var graficoResultados;
var salvando = false;
var carregando = false;
var ultimoBotao;

function elemento(id) {
    return document.getElementById(id);
}
function moeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}
function percentual(valor) {
    if (valor === null) {
        return "—";
    }
    return valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
}
function roas(valor) {
    if (valor === null) {
        return "—";
    }
    return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "x";
}
function avisar(texto, erro) {
    elemento('aviso').textContent = texto;
    if (erro) {
        elemento('aviso').className = 'aviso erro';
    } else {
        elemento('aviso').className = 'aviso';
    }
}
async function consultar(endereco, opcoes) {
    var resposta = await fetch(endereco, opcoes);
    if (resposta.status === 401) {
        window.location.href = 'login.html';
        throw new Error('Entre na sua conta novamente.');
    }
    if (!resposta.ok) {
        var dados = await resposta.json();
        throw new Error(dados.mensagem || 'Não foi possível concluir a operação.');
    }
    if (resposta.status === 204) {
        return null;
    }
    return resposta.json();
}
// Os valores vêm do MySQL; este vetor serve apenas para montar a tela.
function calcularSimulacao(simulacao) {
    var vendas = Number(simulacao.vendasDia) * 30;
    var faturamento = vendas * Number(simulacao.precoVenda);
    var produto = vendas * Number(simulacao.custoProduto);
    var anuncios = vendas * Number(simulacao.custoAnuncio);
    var resultado = faturamento - produto - anuncios;
    var margem = null;
    var retornoAnuncios = null;
    if (faturamento > 0) {
        margem = resultado / faturamento * 100;
    }
    if (anuncios > 0) {
        retornoAnuncios = faturamento / anuncios;
    }

    return {
        id: simulacao.id,
        nome: simulacao.nome,
        plataforma: simulacao.plataforma,
        vendasDia: Number(simulacao.vendasDia), vendas: vendas,
        faturamento: faturamento, produto: produto, anuncios: anuncios, resultado: resultado,
        margem: margem,
        roas: retornoAnuncios
    };
}
function destacarValor(id, valor, texto, classe) {
    elemento(id).textContent = texto;
    if (valor !== null && valor < 0) {
        elemento(id).className = 'valor negativo';
    } else {
        elemento(id).className = 'valor ' + classe;
    }
}
function preencherIndicador(registros, campo, idValor, idNome, formato, classe) {
    var melhor = null;
    for (var i = 0; i < registros.length; i++) {
        if (registros[i][campo] !== null && (melhor === null || registros[i][campo] > melhor[campo])) {
            melhor = registros[i];
        }
    }
    if (melhor === null) {
        destacarValor(idValor, null, '—', classe);
        elemento(idNome).textContent = 'Sem resultado calculável';
    } else {
        destacarValor(idValor, melhor[campo], formato(melhor[campo]), classe);
        elemento(idNome).textContent = melhor.nome;
    }
}
function atualizarPainel() {
    var filtro = elemento('filtro_plataforma').value;
    var registros = [];
    for (var i = 0; i < simulacoes.length; i++) {
        if (filtro === '' || simulacoes[i].plataforma === filtro) {
            registros.push(calcularSimulacao(simulacoes[i]));
        }
    }
    elemento('total_simulacoes').textContent = registros.length;
    elemento('detalhe_total').textContent = filtro || 'Todas as plataformas';
    elemento('resumo_lista').textContent = filtro ? 'Indicadores e gráficos filtrados por ' + filtro : 'Todos os seus cenários de venda';
    preencherIndicador(registros, 'resultado', 'maior_resultado', 'nome_resultado', moeda, 'positivo');
    preencherIndicador(registros, 'margem', 'maior_margem', 'nome_margem', percentual, 'azul');
    preencherIndicador(registros, 'roas', 'maior_roas', 'nome_roas', roas, 'amarelo');
    var vazio = registros.length === 0;
    elemento('sem_registros').hidden = !vazio;
    elemento('area_graficos').hidden = vazio;
    elemento('area_lista').hidden = vazio;
    elemento('nota_graficos').hidden = vazio;
    elemento('titulo_vazio').textContent = filtro && simulacoes.length ? 'Nenhum cenário nesta plataforma' : 'Cadastre sua primeira simulação';
    elemento('texto_vazio').textContent = filtro && simulacoes.length ? 'Escolha outra plataforma ou cadastre uma nova simulação.' : 'Seus indicadores e gráficos aparecerão aqui depois do cadastro.';
    elemento('quantidade_lista').textContent = registros.length + (registros.length === 1 ? ' cenário' : ' cenários');
    montarLista(registros);
    montarGraficos(registros);
}
function criarTexto(classe, texto) {
    var div = document.createElement('div');
    div.className = classe;
    div.textContent = texto;
    return div;
}
function montarLista(registros) {
    var lista = elemento('lista_simulacoes');
    lista.replaceChildren();
    for (var i = 0; i < registros.length; i++) {
        var item = registros[i];
        var linha = criarTexto('linha-tabela', '');
        var nome = criarTexto('coluna-nome', '');
        nome.append(criarTexto('codigo', '#' + item.id), criarTexto('nome-cenario', item.nome), criarTexto('plataforma', item.plataforma));
        linha.appendChild(nome);
        linha.appendChild(criarTexto('coluna-vendas', item.vendas.toLocaleString('pt-BR') + ' (' + item.vendasDia + '/dia)'));
        linha.appendChild(criarTexto('coluna-dinheiro', moeda(item.faturamento)));
        linha.appendChild(criarTexto('coluna-dinheiro', moeda(item.produto + item.anuncios)));
        linha.appendChild(criarTexto('coluna-dinheiro ' + (item.resultado < 0 ? 'negativo' : 'positivo'), moeda(item.resultado)));
        linha.appendChild(criarTexto('coluna-metrica', percentual(item.margem)));
        linha.appendChild(criarTexto('coluna-metrica', roas(item.roas)));
        var acao = criarTexto('coluna-acao', '');
        var botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'excluir';
        botao.textContent = 'Excluir';
        botao.dataset.id = item.id;
        botao.dataset.nome = item.nome;
        botao.setAttribute('aria-label', 'Excluir ' + item.nome);
        botao.onclick = function () { excluirSimulacao(this); };
        acao.appendChild(botao);
        linha.appendChild(acao);
        lista.appendChild(linha);
    }
}
function montarGraficos(registros) {
    if (graficoCustos) {
        graficoCustos.destroy();
    }
    if (graficoResultados) {
        graficoResultados.destroy();
    }
    if (!registros.length) {
        return;
    }
    if (typeof Chart === 'undefined') {
        avisar('Dados carregados do banco. Não foi possível abrir os gráficos; os valores estão na lista.', true);
        return;
    }
    var nomes = [], receitas = [], produtos = [], anuncios = [], resultados = [], cores = [];
    for (var i = 0; i < registros.length; i++) {
        nomes.push('#' + registros[i].id);
        receitas.push(registros[i].faturamento);
        produtos.push(registros[i].produto);
        anuncios.push(registros[i].anuncios);
        resultados.push(registros[i].resultado);
        if (registros[i].resultado < 0) {
            cores.push('#fa8297');
        } else {
            cores.push('#04c9e6');
        }
    }
    Chart.defaults.color = '#9cacc2';
    Chart.defaults.font.family = 'Arial';
    var largura = Math.max(550, elemento('grafico_custos').parentElement.clientWidth - 5, registros.length * 78);
    elemento('grafico_custos').width = largura;
    elemento('grafico_custos').height = 330;
    elemento('grafico_resultados').width = Math.max(330, elemento('grafico_resultados').parentElement.clientWidth - 5);
    elemento('grafico_resultados').height = Math.max(330, registros.length * 48);
    function valorResumido(valor) {
        if (Math.abs(valor) >= 1000000) {
            return 'R$ ' + (valor / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi';
        }
        if (Math.abs(valor) >= 1000) {
            return 'R$ ' + (valor / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil';
        }
        return moeda(valor);
    }
    function tituloTooltip(itens) { return registros[itens[0].dataIndex].nome; }
    var opcoes = {
        responsive: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: {
            title: tituloTooltip,
            label: function (item) { return item.dataset.label + ': ' + moeda(item.raw); }
        } } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#253044' }, ticks: { callback: valorResumido } } }
    };
    graficoCustos = new Chart(elemento('grafico_custos'), {
        type: 'bar', data: { labels: nomes, datasets: [
            { label: 'Faturamento', data: receitas, backgroundColor: '#00dda5', borderRadius: 4 },
            { label: 'Produto e frete', data: produtos, backgroundColor: '#f5b544', borderRadius: 4 },
            { label: 'Anúncios', data: anuncios, backgroundColor: '#7770f5', borderRadius: 4 }
        ] }, options: opcoes
    });
    graficoResultados = new Chart(elemento('grafico_resultados'), {
        type: 'bar', data: { labels: nomes, datasets: [{ label: 'Resultado', data: resultados, backgroundColor: cores, borderRadius: 4, maxBarThickness: 28 }] },
        options: { responsive: false, animation: false, indexAxis: 'y',
            plugins: { legend: { display: false }, tooltip: { callbacks: { title: tituloTooltip, label: function (item) { return moeda(item.raw); } } } },
            scales: { y: { grid: { display: false } }, x: { beginAtZero: true, grid: { color: '#253044' }, ticks: { maxTicksLimit: 5, callback: valorResumido } } }
        }
    });
}
async function carregarSimulacoes() {
    if (carregando) {
        return false;
    }
    carregando = true;
    elemento('btn_atualizar').disabled = true;
    avisar('Consultando suas simulações no banco…', false);
    try {
        simulacoes = await consultar('/simulacoes/listar');
        avisar('Dados consultados no banco às ' + new Date().toLocaleTimeString('pt-BR') + '. As projeções usam apenas suas simulações.', false);
        atualizarPainel();
        return true;
    } catch (erro) {
        avisar('Não foi possível atualizar os dados. ' + erro.message + ' Use “Atualizar dados” para tentar novamente. Os valores anteriores podem estar desatualizados.', true);
        return false;
    } finally {
        carregando = false;
        elemento('btn_atualizar').disabled = false;
    }
}
function abrirCadastro(botao) {
    if (carregando) {
        return;
    }
    ultimoBotao = botao;
    elemento('formulario_simulacao').reset();
    elemento('erro_formulario').textContent = '';
    elemento('fundo_modal').hidden = false;
    document.body.style.overflow = 'hidden';
    elemento('nome_simulacao').focus();
}
function fecharCadastro() {
    if (salvando) {
        return;
    }
    elemento('fundo_modal').hidden = true;
    document.body.style.overflow = '';
    if (ultimoBotao) ultimoBotao.focus();
}
async function salvarSimulacao() {
    if (salvando || !elemento('formulario_simulacao').reportValidity()) {
        return;
    }
    salvando = true;
    elemento('btn_salvar').disabled = true;
    elemento('btn_cancelar').disabled = true;
    elemento('btn_fechar').disabled = true;
    elemento('erro_formulario').textContent = '';
    var dados = {
        nome: elemento('nome_simulacao').value.trim(), plataforma: elemento('plataforma_simulacao').value,
        precoVenda: Number(elemento('preco_venda').value), custoProduto: Number(elemento('custo_produto').value),
        custoAnuncio: Number(elemento('custo_anuncio').value), vendasDia: Number(elemento('vendas_dia').value)
    };
    try {
        await consultar('/simulacoes/cadastrar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
        salvando = false;
        fecharCadastro();
        await carregarSimulacoes();
    } catch (erro) {
        elemento('erro_formulario').textContent = erro.message + ' Se houve interrupção de conexão, confira a lista antes de cadastrar novamente.';
    } finally {
        salvando = false;
        elemento('btn_salvar').disabled = false;
        elemento('btn_cancelar').disabled = false;
        elemento('btn_fechar').disabled = false;
    }
}
async function excluirSimulacao(botao) {
    if (!confirm('Excluir a simulação “' + botao.dataset.nome + '”? Essa ação remove o registro do banco.')) {
        return;
    }
    botao.disabled = true;
    try {
        await consultar('/simulacoes/excluir/' + botao.dataset.id, { method: 'DELETE' });
        await carregarSimulacoes();
    } catch (erro) { avisar(erro.message, true); botao.disabled = false; }
}
async function sair() {
    try {
        await consultar('/usuarios/sair', { method: 'POST' });
        window.location.href = 'login.html';
    } catch (erro) { avisar('Não foi possível sair. ' + erro.message, true); }
}
document.addEventListener('keydown', function (evento) {
    if (elemento('fundo_modal').hidden) {
        return;
    }
    if (evento.key === 'Escape') fecharCadastro();
    if (evento.key === 'Tab') {
        var campos = elemento('fundo_modal').querySelectorAll('button:not(:disabled), input, select');
        var primeiro = campos[0], ultimo = campos[campos.length - 1];
        if (evento.shiftKey && document.activeElement === primeiro) { evento.preventDefault(); ultimo.focus(); }
        else if (!evento.shiftKey && document.activeElement === ultimo) { evento.preventDefault(); primeiro.focus(); }
    }
});
async function iniciar() {
    if (window.location.protocol == "file:") {
        avisar("Abrindo o DigitalTrack pelo servidor local…", false);
        return;
    }
    try {
        var usuario = await consultar('/usuarios/sessao');
        elemento('nome_usuario').textContent = usuario.nome;
        elemento('saudacao').textContent = 'Olá, ' + usuario.nome + '!';
        var partes = usuario.nome.trim().split(' ');
        elemento('iniciais_usuario').textContent = (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
        await carregarSimulacoes();
    } catch (erro) { avisar('Não foi possível verificar sua sessão. ' + erro.message, true); }
}
iniciar();
