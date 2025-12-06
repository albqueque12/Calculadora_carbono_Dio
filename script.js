// Fatores de emissão de CO2 (kg CO2 por km)
const fatoresEmissao = {
    'carro': 0.192,
    'carro-flex': 0.130,
    'moto': 0.103,
    'onibus': 0.089,
    'metro': 0.040,
    'trem': 0.041,
    'aviao': 0.255,
    'bicicleta': 0,
    'caminhada': 0
};

// Nomes dos transportes para exibição
const nomesTransporte = {
    'carro': '🚗 Carro (gasolina)',
    'carro-flex': '🚙 Carro (flex/etanol)',
    'moto': '🏍️ Moto',
    'onibus': '🚌 Ônibus',
    'metro': '🚇 Metrô',
    'trem': '🚆 Trem',
    'aviao': '✈️ Avião',
    'bicicleta': '🚴 Bicicleta',
    'caminhada': '🚶 Caminhada'
};

// Selecionar elementos do DOM
const form = document.getElementById('carbonForm');
const resultado = document.getElementById('resultado');

// Event listener para o formulário
form.addEventListener('submit', function(e) {
    e.preventDefault();
    calcularEmissao();
});

function calcularEmissao() {
    // Obter valores do formulário
    const origem = document.getElementById('origem').value;
    const destino = document.getElementById('destino').value;
    const distancia = parseFloat(document.getElementById('distancia').value);
    const transporte = document.getElementById('transporte').value;

    // Validar inputs
    if (!origem || !destino || !distancia || !transporte) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Calcular emissão
    const fatorEmissao = fatoresEmissao[transporte];
    const emissaoCO2 = (distancia * fatorEmissao).toFixed(2);

    // Atualizar resultado
    document.getElementById('trajeto').textContent = `${origem} → ${destino}`;
    document.getElementById('distanciaResult').textContent = distancia;
    document.getElementById('transporteResult').textContent = nomesTransporte[transporte];
    document.getElementById('co2Result').textContent = emissaoCO2;

    // Adicionar equivalência
    const equivalenciaTexto = gerarEquivalencia(parseFloat(emissaoCO2), transporte);
    document.getElementById('equivalencia').innerHTML = equivalenciaTexto;

    // Adicionar comparação de transportes
    const comparacaoHTML = gerarComparacaoTransportes(distancia, transporte, parseFloat(emissaoCO2));
    
    // Verificar se já existe a div de comparação, se não, criar
    let divComparacao = document.getElementById('comparacao-transportes');
    if (!divComparacao) {
        divComparacao = document.createElement('div');
        divComparacao.id = 'comparacao-transportes';
        divComparacao.className = 'comparacao-transportes';
        document.querySelector('.resultado-detalhes').appendChild(divComparacao);
    }
    divComparacao.innerHTML = comparacaoHTML;

    // Mostrar resultado
    resultado.classList.remove('hidden');
    resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function gerarEquivalencia(emissao, transporte) {
    if (emissao === 0) {
        return '🎉 <strong>Parabéns!</strong> Este meio de transporte não emite CO₂!';
    }

    // Equivalências interessantes
    const arvores = (emissao / 21.77).toFixed(1); // Uma árvore absorve ~21.77 kg de CO2 por ano
    const dias = (emissao / 0.041).toFixed(0); // Emissão diária média de uma pessoa: ~41g
    
    let mensagem = `💡 <strong>Equivalência:</strong> `;
    
    if (arvores >= 0.1) {
        mensagem += `Esta emissão seria absorvida por <strong>${arvores} árvore(s)</strong> em um ano. `;
    }
    
    // Comparação com opção mais sustentável
    const melhorOpcao = encontrarMelhorOpcao(transporte);
    if (melhorOpcao) {
        mensagem += melhorOpcao;
    }
    
    return mensagem;
}

function encontrarMelhorOpcao(transporteAtual) {
    const opcoesSustentaveis = {
        'carro': 'Usar <strong>metrô</strong> reduziria a emissão em 79%! 🚇',
        'carro-flex': 'Usar <strong>metrô</strong> reduziria a emissão em 69%! 🚇',
        'moto': 'Usar <strong>ônibus</strong> reduziria a emissão em 14%! 🚌',
        'aviao': 'Usar <strong>trem</strong> reduziria a emissão em 84%! 🚆',
        'onibus': 'Usar <strong>metrô</strong> reduziria a emissão em 55%! 🚇'
    };
    
    return opcoesSustentaveis[transporteAtual] || '';
}

function gerarComparacaoTransportes(distancia, transporteAtual, emissaoAtual) {
    // Calcular emissões para todos os transportes
    const comparacoes = [];
    
    for (const [tipo, fator] of Object.entries(fatoresEmissao)) {
        if (tipo !== transporteAtual) {
            const emissao = distancia * fator;
            const diferenca = emissaoAtual - emissao;
            const percentual = emissaoAtual > 0 ? ((diferenca / emissaoAtual) * 100).toFixed(1) : 0;
            
            comparacoes.push({
                tipo: tipo,
                nome: nomesTransporte[tipo],
                emissao: emissao.toFixed(2),
                diferenca: diferenca,
                percentual: percentual,
                economia: diferenca > 0
            });
        }
    }
    
    // Ordenar por menor emissão
    comparacoes.sort((a, b) => a.emissao - b.emissao);
    
    // Pegar as 3 melhores opções
    const melhoresOpcoes = comparacoes.slice(0, 3);
    
    let html = '<h4>🔄 Comparação com outros transportes:</h4>';
    
    if (emissaoAtual === 0) {
        html += '<p style="color: #059669; font-weight: 600;">✅ Você já está usando a melhor opção sustentável!</p>';
    } else {
        html += '<p style="margin-bottom: 10px;"><strong>Melhores alternativas para esta viagem:</strong></p>';
        
        melhoresOpcoes.forEach((opcao, index) => {
            const classeExtra = index === 0 ? ' melhor' : '';
            const icone = index === 0 ? '🏆 ' : index === 1 ? '🥈 ' : '🥉 ';
            
            let mensagem = '';
            if (opcao.economia) {
                mensagem = `<span class="economia">↓ Reduziria ${Math.abs(opcao.percentual)}% (${Math.abs(opcao.diferenca).toFixed(2)} kg CO₂ a menos)</span>`;
            } else if (opcao.diferenca < 0) {
                mensagem = `<span style="color: #dc2626;">↑ Aumentaria ${Math.abs(opcao.percentual)}% (${Math.abs(opcao.diferenca).toFixed(2)} kg CO₂ a mais)</span>`;
            } else {
                mensagem = `<span style="color: #059669;">Mesma emissão</span>`;
            }
            
            html += `
                <div class="opcao-transporte${classeExtra}">
                    ${icone}<strong>${opcao.nome}</strong><br>
                    Emissão: ${opcao.emissao} kg CO₂ | ${mensagem}
                </div>
            `;
        });
        
        // Adicionar razões para escolher a melhor opção
        if (melhoresOpcoes.length > 0) {
            const melhor = melhoresOpcoes[0];
            html += gerarRazoesMelhorOpcao(melhor.tipo, transporteAtual, melhor);
        }
    }
    
    return html;
}

function gerarRazoesMelhorOpcao(melhorTipo, transporteAtual, dadosMelhor) {
    const razoes = {
        'bicicleta': [
            'Zero emissões de CO₂',
            'Exercício físico gratuito',
            'Sem custo com combustível',
            'Evita trânsito em áreas urbanas'
        ],
        'caminhada': [
            'Zero emissões de CO₂',
            'Benefícios à saúde cardiovascular',
            'Totalmente gratuito',
            'Ideal para distâncias curtas'
        ],
        'metro': [
            'Até 79% menos emissões que carro',
            'Evita congestionamentos',
            'Horários regulares e previsíveis',
            'Custo-benefício excelente'
        ],
        'trem': [
            'Até 84% menos emissões que avião',
            'Confortável para longas distâncias',
            'Permite trabalhar durante a viagem',
            'Menor impacto ambiental'
        ],
        'onibus': [
            'Transporte público acessível',
            'Menor emissão per capita',
            'Rede ampla de rotas',
            'Econômico'
        ]
    };
    
    if (razoes[melhorTipo] && dadosMelhor.economia) {
        let html = '<div style="margin-top: 10px; padding: 10px; background: #f0fdf4; border-radius: 6px;">';
        html += `<strong style="color: #11998e;">💡 Por que escolher ${nomesTransporte[melhorTipo]}?</strong><ul style="margin: 8px 0 0 20px; font-size: 0.9rem;">`;
        
        razoes[melhorTipo].forEach(razao => {
            html += `<li>${razao}</li>`;
        });
        
        html += '</ul></div>';
        return html;
    }
    
    return '';
}

function resetForm() {
    form.reset();
    resultado.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
