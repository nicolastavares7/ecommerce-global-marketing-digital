let simulacoes = [];
let graficoCustos;
let graficoResultados;

function avisar(texto, erro) {

    document.getElementById('aviso').textContent = texto;
    document.getElementById('aviso').className = 'aviso';
    if (erro == true) {
        document.getElementById('aviso').className = 'aviso erro';
    }
}

function preencherIndicadores(registros) {

    let positivos = 0;
    let equilibrio = 0;
    let negativos = 0;

    for (let i = 0; i < registros.length; i++) {
        if (registros[i].resultado > 0) {
            positivos++;
        } else if (registros[i].resultado < 0) {
            negativos++;
        } else {
            equilibrio++;
        }
    }

    document.getElementById('total_simulacoes').textContent = registros.length;
    document.getElementById('total_positivos').textContent = positivos;
    document.getElementById('total_equilibrio').textContent = equilibrio;
    document.getElementById('total_negativos').textContent = negativos;
}

function atualizarPainel() {

    let registros = [];
    for (let i = 0; i < simulacoes.length; i++) {
        registros.push(calcularSimulacao(simulacoes[i]));
    }

    // Compara pares e troca de posição. Não altera o vetor vindo do banco.
    let ordem = document.getElementById('ordenacao').value;
    if (ordem != 'cadastro') {
        for (let i = 0; i < registros.length; i++) {
            for (let j = i + 1; j < registros.length; j++) {
                let trocar = false;
                if (ordem == 'resultado' && registros[j].resultado > registros[i].resultado) {
                    trocar = true;
                } else if (ordem == 'margem' && registros[j].margem != null) {
                    if (registros[i].margem == null || registros[j].margem > registros[i].margem) {
                        trocar = true;
                    }
                }
                if (trocar == true) {
                    let temporario = registros[i];
                    registros[i] = registros[j];
                    registros[j] = temporario;
                }
            }
        }
    }

    document.getElementById('sem_registros').hidden = registros.length > 0;
    document.getElementById('area_dados').hidden = registros.length == 0;
    document.getElementById('quantidade_lista').textContent = registros.length + ' cenário(s)';
    preencherIndicadores(registros);
    montarLista(registros);
    montarGraficos(registros);
}

function montarLista(registros) {

    let lista = document.getElementById('lista_simulacoes');
    lista.innerHTML = '';
    for (let i = 0; i < registros.length; i++) {
        let item = registros[i];
        let classe = classeResultado(item.resultado);
        lista.innerHTML += `
            <tr>
                <td><strong>${textoSeguro(item.nome)}</strong><small>${textoSeguro(item.plataforma)} · ${item.pagamento}</small></td>
                <td>${item.vendas}</td>
                <td class="azul">${moeda(item.faturamento)}</td>
                <td>${moeda(item.produto + item.frete + item.anuncios)}</td>
                <td><span class="badge ${classe}">${moeda(item.resultado)}</span></td>
                <td>${percentual(item.margem)}</td>
                <td>${roas(item.roas)}</td>
                <td class="acoes"><a class="analisar" href="analise.html?id=${Number(item.id)}">Analisar</a><button class="excluir" type="button" onclick="excluirSimulacao(${Number(item.id)})">Excluir</button></td>
            </tr>`;
    }
}

function montarGraficos(registros) {

    if (graficoCustos) {
        graficoCustos.destroy();
    }
    if (graficoResultados) {
        graficoResultados.destroy();
    }
    if (registros.length == 0) {
        return;
    }
    if (typeof Chart == 'undefined') {
        avisar('Os gráficos não carregaram. Os valores continuam disponíveis na tabela.', true);
        return;
    }

    let nomes = [];
    let receitas = [];
    let custos = [];
    let resultados = [];
    let cores = [];
    let equilibrio = '';
    for (let i = 0; i < registros.length; i++) {
        let item = registros[i];
        nomes.push(item.nome);
        receitas.push(item.faturamento);
        custos.push(item.produto + item.frete + item.anuncios);
        resultados.push(item.resultado);
        cores.push(corResultado(item.resultado));
        if (item.resultado == 0) {
            equilibrio += item.nome + ': R$ 0,00 — Em equilíbrio. ';
        }
    }
    document.getElementById('cenarios_equilibrio').textContent = equilibrio;
    document.getElementById('cenarios_equilibrio').className = 'detalhe amarelo';
    Chart.defaults.color = '#aabbd1';
    Chart.defaults.borderColor = '#243047';

    graficoCustos = new Chart(document.getElementById('grafico_custos'), {
        type: 'bar',
        data: {
            labels: nomes,
            datasets: [
                { label: 'Faturamento', data: receitas, backgroundColor: '#60a5fa' },
                { label: 'Custos totais', data: custos, backgroundColor: '#f0a15e' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                y: { beginAtZero: true, ticks: { maxRotation: 0, minRotation: 0, maxTicksLimit: 5, callback: function (valor) { return moedaEixo(valor); } } },
                x: { ticks: { callback: function (indice) { return 'Cenário ' + (indice + 1); } } }
            },
            plugins: {
                legend: { labels: { boxWidth: 10, padding: 16 } },
                tooltip: { callbacks: { label: function (contexto) { return contexto.dataset.label + ': ' + moeda(contexto.parsed.y); } } }
            }
        }
    });
    graficoResultados = new Chart(document.getElementById('grafico_resultados'), {
        type: 'bar',
        data: { labels: nomes, datasets: [{ label: 'Resultado estimado', data: resultados, backgroundColor: cores }] },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                y: { ticks: { callback: function (indice) { let nome = nomes[indice]; if (nome.length > 25) { return nome.substring(0, 23) + '…'; } return nome; } } },
                x: { beginAtZero: true, ticks: { maxRotation: 0, minRotation: 0, maxTicksLimit: 5, callback: function (valor) { return moedaEixo(valor); } }, grid: { color: function (contexto) { if (contexto.tick.value == 0) { return '#c9d6e8'; } return '#243047'; } } }
            },
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: function (contexto) { return moeda(contexto.parsed.x); } } }
            }
        }
    });
}

function carregarSimulacoes() {

    document.getElementById('btn_atualizar').disabled = true;
    return fetch('/simulacoes/listar/' + sessionStorage.ID_USUARIO).then(function (resposta) {
        return resposta.json().then(function (dados) {
            if (resposta.ok == false) {
                throw new Error(dados.mensagem);
            }
            simulacoes = dados;
            avisar('Cenários da sua conta atualizados.', false);
            atualizarPainel();
            document.getElementById('btn_atualizar').disabled = false;
        });
    }).catch(function (erro) {
        avisar('Não foi possível consultar o banco. ' + erro.message, true);
        document.getElementById('btn_atualizar').disabled = false;
    });
}

function excluirSimulacao(id) {

    if (confirm('Excluir este cenário?') == false) {
        return;
    }
    return fetch('/simulacoes/excluir/' + id + '/' + sessionStorage.ID_USUARIO, {
        method: 'DELETE'
    }).then(function (resposta) {
        if (resposta.ok == true) {
            return carregarSimulacoes();
        }
        return resposta.json().then(function (dados) {
            throw new Error(dados.mensagem);
        });
    }).catch(function (erro) {
        avisar(erro.message, true);
    });
}

function iniciar() {

    if (prepararConta() == true) {
        return carregarSimulacoes();
    }
}

iniciar();
