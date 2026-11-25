// Alteração: dashboard resumida, com cadastro na página, sem janela flutuante.
let simulacoes = [];
let graficoCustos;
let graficoResultados;
let salvando = false;

function moeda(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

function percentual(valor) {
    if (valor == null) {
        return '—';
    }
    return valor.toFixed(1).replace('.', ',') + '%';
}

function roas(valor) {
    if (valor == null) {
        return '—';
    }
    return valor.toFixed(2).replace('.', ',') + 'x';
}

function avisar(texto, erro) {
    document.getElementById('aviso').textContent = texto;
    document.getElementById('aviso').className = 'aviso';
    if (erro == true) {
        document.getElementById('aviso').className = 'aviso erro';
    }
}

// Contas da projeção de 30 dias. Nenhum resultado é gravado no banco.
function calcularSimulacao(simulacao) {
    let vendas = Number(simulacao.vendasDia) * 30;
    let faturamento = vendas * Number(simulacao.precoVenda);
    let produto = vendas * Number(simulacao.custoProduto);
    let anuncios = vendas * Number(simulacao.custoAnuncio);
    let resultado = faturamento - produto - anuncios;
    let margem = null;
    let retorno = null;
    if (faturamento > 0) {
        margem = resultado / faturamento * 100;
    }
    if (anuncios > 0) {
        retorno = faturamento / anuncios;
    }
    return {
        id: simulacao.id,
        nome: simulacao.nome,
        plataforma: simulacao.plataforma,
        vendas: vendas,
        faturamento: faturamento,
        produto: produto,
        anuncios: anuncios,
        resultado: resultado,
        margem: margem,
        roas: retorno
    };
}

function preencherIndicadores(registros) {
    let melhorResultado = null;
    let melhorMargem = null;
    let positivos = 0;
    for (let i = 0; i < registros.length; i++) {
        let atual = registros[i];
        if (atual.resultado > 0) {
            positivos++;
        }
        if (melhorResultado == null || atual.resultado > melhorResultado.resultado) {
            melhorResultado = atual;
        }
        if (atual.margem != null) {
            if (melhorMargem == null || atual.margem > melhorMargem.margem) {
                melhorMargem = atual;
            }
        }
    }
    document.getElementById('total_simulacoes').textContent = registros.length;
    document.getElementById('total_positivos').textContent = positivos + ' de ' + registros.length;
    document.getElementById('maior_resultado').textContent = '—';
    document.getElementById('nome_resultado').textContent = 'Sem resultado calculável';
    document.getElementById('maior_margem').textContent = '—';
    document.getElementById('nome_margem').textContent = 'Sem resultado calculável';
    document.getElementById('maior_resultado').className = 'valor positivo';
    document.getElementById('maior_margem').className = 'valor azul';
    if (melhorResultado != null) {
        document.getElementById('maior_resultado').textContent = moeda(melhorResultado.resultado);
        document.getElementById('nome_resultado').textContent = melhorResultado.nome;
        if (melhorResultado.resultado < 0) {
            document.getElementById('maior_resultado').className = 'valor negativo';
        }
    }
    if (melhorMargem != null) {
        document.getElementById('maior_margem').textContent = percentual(melhorMargem.margem);
        document.getElementById('nome_margem').textContent = melhorMargem.nome;
        if (melhorMargem.margem < 0) {
            document.getElementById('maior_margem').className = 'valor negativo';
        }
    }
}

// O for percorre as simulações e guarda apenas as que passam nos filtros.
function atualizarPainel() {
    let plataforma = document.getElementById('filtro_plataforma').value;
    let resultado = document.getElementById('filtro_resultado').value;
    let registros = [];
    for (let i = 0; i < simulacoes.length; i++) {
        let item = calcularSimulacao(simulacoes[i]);
        let mostrar = true;
        if (plataforma != '' && item.plataforma != plataforma) {
            mostrar = false;
        }
        if (resultado == 'positivo' && item.resultado <= 0) {
            mostrar = false;
        } else if (resultado == 'negativo' && item.resultado >= 0) {
            mostrar = false;
        } else if (resultado == 'equilibrio' && item.resultado != 0) {
            mostrar = false;
        }
        if (mostrar == true) {
            registros.push(item);
        }
    }
    document.getElementById('detalhe_total').textContent = 'Todas as plataformas';
    if (plataforma != '') {
        document.getElementById('detalhe_total').textContent = plataforma;
    }
    document.getElementById('resumo_lista').textContent = registros.length + ' de ' + simulacoes.length + ' cenários';
    document.getElementById('quantidade_lista').textContent = registros.length + ' cenário(s)';
    document.getElementById('sem_registros').hidden = registros.length > 0;
    document.getElementById('area_graficos').hidden = registros.length == 0;
    document.getElementById('area_lista').hidden = registros.length == 0;
    document.getElementById('titulo_vazio').textContent = 'Nenhuma simulação para mostrar';
    document.getElementById('texto_vazio').textContent = 'Cadastre uma simulação abaixo ou limpe os filtros.';
    preencherIndicadores(registros);
    montarLista(registros);
    montarGraficos(registros);
}

// Protege o nome digitado antes de colocá-lo no HTML da lista.
function textoSeguro(texto) {
    let div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// Alteração: monta as linhas com HTML, como a exibição do resultado no PowerTrack.
function montarLista(registros) {
    let lista = document.getElementById('lista_simulacoes');
    lista.innerHTML = '';
    for (let i = 0; i < registros.length; i++) {
        let item = registros[i];
        let classe = 'positivo';
        if (item.resultado < 0) {
            classe = 'negativo';
        }
        lista.innerHTML += `
            <div class="linha-tabela">
                <div class="coluna-nome">
                    <div class="codigo">#${Number(item.id)}</div>
                    <div class="nome-cenario">${textoSeguro(item.nome)}</div>
                    <div class="plataforma">${textoSeguro(item.plataforma)}</div>
                </div>
                <div class="coluna-vendas">${item.vendas}</div>
                <div class="coluna-dinheiro">${moeda(item.faturamento)}</div>
                <div class="coluna-dinheiro">${moeda(item.produto + item.anuncios)}</div>
                <div class="coluna-dinheiro ${classe}">${moeda(item.resultado)}</div>
                <div class="coluna-metrica">${percentual(item.margem)}</div>
                <div class="coluna-metrica">${roas(item.roas)}</div>
                <div class="coluna-acao">
                    <button class="excluir" type="button" onclick="excluirSimulacao(${Number(item.id)})">Excluir</button>
                </div>
            </div>`;
    }
}

// Dois gráficos simples. O for separa os dados de cada simulação em vetores.
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
        avisar('Não foi possível abrir os gráficos. Confira os valores na lista.', true);
        return;
    }
    let nomes = [];
    let receitas = [];
    let produtos = [];
    let anuncios = [];
    let resultados = [];
    let cores = [];
    for (let i = 0; i < registros.length; i++) {
        nomes.push(registros[i].nome);
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
    graficoCustos = new Chart(document.getElementById('grafico_custos'), {
        type: 'bar',
        data: {
            labels: nomes,
            datasets: [
                { label: 'Faturamento', data: receitas, backgroundColor: '#00dda5' },
                { label: 'Produto e frete', data: produtos, backgroundColor: '#f5b544' },
                { label: 'Anúncios', data: anuncios, backgroundColor: '#7770f5' }
            ]
        },
        options: {
            responsive: false,
            animation: false,
            scales: { y: { beginAtZero: true } }
        }
    });
    graficoResultados = new Chart(document.getElementById('grafico_resultados'), {
        type: 'bar',
        data: {
            labels: nomes,
            datasets: [
                { label: 'Resultado', data: resultados, backgroundColor: cores }
            ]
        },
        options: {
            responsive: false,
            animation: false,
            indexAxis: 'y',
            scales: { x: { beginAtZero: true } }
        }
    });
}

// Busca as simulações do usuário e atualiza os indicadores, a lista e os gráficos.
function carregarSimulacoes() {
    document.getElementById('btn_atualizar').disabled = true;

    return fetch('/simulacoes/listar/' + sessionStorage.ID_USUARIO).then(function (resposta) {
        return resposta.json().then(function (dados) {
            if (resposta.ok == false) {
                throw new Error(dados.mensagem);
            }

            simulacoes = dados;
            atualizarPainel();
            avisar('Simulações atualizadas.', false);
            document.getElementById('btn_atualizar').disabled = false;
        });
    }).catch(function (erro) {
        avisar('Não foi possível atualizar. ' + erro.message, true);
        document.getElementById('btn_atualizar').disabled = false;
    });
}

// Alteração: formulário comum, sempre visível. Não precisa abrir ou fechar janela.
function salvarSimulacao() {
    if (salvando == true || document.getElementById('formulario_simulacao').reportValidity() == false) {
        return;
    }
    salvando = true;
    document.getElementById('btn_salvar').disabled = true;
    document.getElementById('erro_formulario').textContent = '';
    let dados = {
        nome: document.getElementById('nome_simulacao').value.trim(),
        plataforma: document.getElementById('plataforma_simulacao').value,
        precoVenda: Number(document.getElementById('preco_venda').value),
        custoProduto: Number(document.getElementById('custo_produto').value),
        custoAnuncio: Number(document.getElementById('custo_anuncio').value),
        vendasDia: Number(document.getElementById('vendas_dia').value)
    };
    return fetch('/simulacoes/cadastrar/' + sessionStorage.ID_USUARIO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    }).then(function (resposta) {
        return resposta.json().then(function (dados) {
            if (resposta.ok == false) {
                throw new Error(dados.mensagem);
            }

            document.getElementById('formulario_simulacao').reset();
            liberarFormulario();
            return carregarSimulacoes();
        });
    }).catch(function (erro) {
        document.getElementById('erro_formulario').textContent = erro.message;
        liberarFormulario();
    });
}

function liberarFormulario() {
    salvando = false;
    document.getElementById('btn_salvar').disabled = false;
}

function excluirSimulacao(id) {
    if (confirm('Excluir esta simulação?') == false) {
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

function limparFiltros() {
    document.getElementById('filtro_plataforma').value = '';
    document.getElementById('filtro_resultado').value = '';
    atualizarPainel();
}

// Sair limpa os dados do login desta aba, como no WebDataViz.
function sair() {
    limparSessao();
}

function iniciar() {
    if (validarSessao() == false) {
        return;
    }
    let nome = sessionStorage.NOME_USUARIO;

    document.getElementById('saudacao').textContent = 'Olá, ' + nome + '!';
    document.getElementById('iniciais_usuario').textContent = nome[0].toUpperCase();
    return carregarSimulacoes();
}

iniciar();
