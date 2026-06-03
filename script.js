/**
 * Simulador Financeiro Acadêmico — Mercado de Capitais
 * Design Flat / Terminal — Estilo Didático
 * Toda lógica matemática financeira (Black-Scholes, Markowitz, Monte Carlo)
 */

// ================= BANCO DE DADOS INTERNO DE ATIVOS (MOCK DATA) =================
const ASSET_DATABASE = {
    BNDES: { name: 'CXSE3 (Caixa Seguridade)', ticker: 'CXSE3', s0: 14.80, drift: 0.13, vol: 0.22, color: '#8B008B', seed: 42, thick: true, glow: true },
    BNDESPAR: { name: 'IFNC (Índice Financeiro B3)', ticker: 'IFNC', s0: 11.50, drift: 0.11, vol: 0.18, color: '#00E5FF', seed: 137, thick: true, glow: false },
    VOLKSWAGEN: { name: 'Banco Volkswagen S.A. (Ativo Sintético)', ticker: 'VOLKSWAGEN', s0: 15.00, drift: 0.07, vol: 0.10, color: '#3b82f6', seed: 256, thick: false, glow: false },
    MASTER: { name: 'BANCO MASTER (Ativo Sintético)', ticker: 'MASTER', s0: 14.00, drift: 0.13, vol: 0.22, color: '#f59e0b', seed: 512, thick: false, glow: false },
    NUBANK: { name: 'NUBANK', ticker: 'NUBANK', s0: 8.50, drift: 0.18, vol: 0.28, color: '#820AD1', seed: 789, thick: false, glow: false },
    BMG: { name: 'BMG', ticker: 'BMG', s0: 6.20, drift: 0.09, vol: 0.15, color: '#10b981', seed: 1024, thick: false, glow: false },
    BRB: { name: 'BRB', ticker: 'BRB', s0: 11.00, drift: 0.11, vol: 0.17, color: '#ef4444', seed: 2048, thick: false, glow: false }
};

// Map keys for the selects
const ASSET_KEYS = ['BNDES', 'BNDESPAR', 'VOLKSWAGEN', 'MASTER', 'NUBANK', 'BMG', 'BRB'];

// Definições de cenários de preços: Real (B3) vs Fictício (Didático)
const PRICE_SCENARIOS = {
    REAL: {
        BNDES_CAIXA: { name: 'CXSE3 (Caixa Seguridade)', ticker: 'CXSE3', s0: 14.80, drift: 0.13, vol: 0.22, color: '#8B008B', seed: 42, thick: true, glow: true },
        BNDESPAR_CAIXA: { name: 'IFNC (Índice Financeiro B3)', ticker: 'IFNC', s0: 11.50, drift: 0.11, vol: 0.18, color: '#00E5FF', seed: 137, thick: true, glow: false },
        BNDES_BNDES: { name: 'BNDES (Ativo Sintético)', ticker: 'BNDES', s0: 10.00, drift: 0.08, vol: 0.06, color: '#8B008B', seed: 42, thick: true, glow: true },
        BNDESPAR_BNDES: { name: 'Carteira BNDESPAR (Índice Sintético)', ticker: 'BNDESPAR', s0: 12.00, drift: 0.12, vol: 0.18, color: '#00E5FF', seed: 137, thick: true, glow: false },
        VOLKSWAGEN: { name: 'Banco Volkswagen S.A. (Ativo Sintético)', ticker: 'VOLKSWAGEN', s0: 15.00, drift: 0.07, vol: 0.10, color: '#3b82f6', seed: 256, thick: false, glow: false },
        MASTER: { name: 'BANCO MASTER (Ativo Sintético)', ticker: 'MASTER', s0: 14.00, drift: 0.13, vol: 0.22, color: '#f59e0b', seed: 512, thick: false, glow: false },
        NUBANK: { name: 'NUBANK (ROXO34)', ticker: 'ROXO34', s0: 12.50, drift: 0.18, vol: 0.28, color: '#820AD1', seed: 789, thick: false, glow: false },
        BMG: { name: 'BMG (BMGB4)', ticker: 'BMGB4', s0: 3.10, drift: 0.09, vol: 0.25, color: '#10b981', seed: 1024, thick: false, glow: false },
        BRB: { name: 'BRB (BSLI4)', ticker: 'BSLI4', s0: 14.50, drift: 0.11, vol: 0.20, color: '#ef4444', seed: 2048, thick: false, glow: false }
    },
    FICTICIO: {
        BNDES_CAIXA: { name: 'Caixa Econômica (Fictício)', ticker: 'CAIXA', s0: 10.00, drift: 0.075, vol: 0.065, color: '#8B008B', seed: 42, thick: true, glow: true },
        BNDESPAR_CAIXA: { name: 'Carteira CAIXAPAR (Fictício)', ticker: 'CAIXAPAR', s0: 12.00, drift: 0.125, vol: 0.175, color: '#00E5FF', seed: 137, thick: true, glow: false },
        BNDES_BNDES: { name: 'BNDES (Fictício)', ticker: 'BNDES', s0: 10.00, drift: 0.08, vol: 0.06, color: '#8B008B', seed: 42, thick: true, glow: true },
        BNDESPAR_BNDES: { name: 'Carteira BNDESPAR (Fictício)', ticker: 'BNDESPAR', s0: 12.00, drift: 0.12, vol: 0.18, color: '#00E5FF', seed: 137, thick: true, glow: false },
        VOLKSWAGEN: { name: 'Banco Volkswagen S.A. (Fictício)', ticker: 'VOLKSWAGEN', s0: 15.00, drift: 0.07, vol: 0.10, color: '#3b82f6', seed: 256, thick: false, glow: false },
        MASTER: { name: 'BANCO MASTER (Fictício)', ticker: 'MASTER', s0: 14.00, drift: 0.13, vol: 0.22, color: '#f59e0b', seed: 512, thick: false, glow: false },
        NUBANK: { name: 'NUBANK (Fictício)', ticker: 'NUBANK', s0: 10.00, drift: 0.15, vol: 0.20, color: '#820AD1', seed: 789, thick: false, glow: false },
        BMG: { name: 'BMG (Fictício)', ticker: 'BMG', s0: 5.00, drift: 0.08, vol: 0.15, color: '#10b981', seed: 1024, thick: false, glow: false },
        BRB: { name: 'BRB (Fictício)', ticker: 'BRB', s0: 10.00, drift: 0.10, vol: 0.15, color: '#ef4444', seed: 2048, thick: false, glow: false }
    }
};

function updateSimulationSettings() {
    const modeSelect = document.getElementById('select-institution-mode');
    const scenarioSelect = document.getElementById('select-scenario-mode');
    const mode = modeSelect ? modeSelect.value : 'CAIXA';
    const scenario = scenarioSelect ? scenarioSelect.value : 'REAL';

    const scenarioData = PRICE_SCENARIOS[scenario];
    if (!scenarioData) return;

    // 1. Atualizar ASSET_DATABASE
    if (mode === 'CAIXA') {
        ASSET_DATABASE.BNDES = { ...ASSET_DATABASE.BNDES, ...scenarioData.BNDES_CAIXA };
        ASSET_DATABASE.BNDESPAR = { ...ASSET_DATABASE.BNDESPAR, ...scenarioData.BNDESPAR_CAIXA };
    } else {
        ASSET_DATABASE.BNDES = { ...ASSET_DATABASE.BNDES, ...scenarioData.BNDES_BNDES };
        ASSET_DATABASE.BNDESPAR = { ...ASSET_DATABASE.BNDESPAR, ...scenarioData.BNDESPAR_BNDES };
    }

    ASSET_DATABASE.VOLKSWAGEN = { ...ASSET_DATABASE.VOLKSWAGEN, ...scenarioData.VOLKSWAGEN };
    ASSET_DATABASE.MASTER = { ...ASSET_DATABASE.MASTER, ...scenarioData.MASTER };
    ASSET_DATABASE.NUBANK = { ...ASSET_DATABASE.NUBANK, ...scenarioData.NUBANK };
    ASSET_DATABASE.BMG = { ...ASSET_DATABASE.BMG, ...scenarioData.BMG };
    ASSET_DATABASE.BRB = { ...ASSET_DATABASE.BRB, ...scenarioData.BRB };

    // 2. Atualizar textos estáticos do HTML de notas e cabeçalhos
    const compChartSubtitle = (mode === 'CAIXA')
        ? `Evolução do Preço Normalizado (Base 100). Destaque para ${ASSET_DATABASE.BNDES.ticker} e ${ASSET_DATABASE.BNDESPAR.ticker}.`
        : `Evolução do Preço Normalizado (Base 100). Destaque para BNDES e Carteira BNDESPAR.`;

    const noteTooltip = (mode === 'CAIXA')
        ? (scenario === 'REAL'
            ? "Nota: Banco Volkswagen e Banco Master são instituições de capital fechado e não possuem ações na B3. Para permitir a aplicação dos modelos de Black-Scholes e Monte Carlo, este simulador utiliza 'Ativos Sintéticos' para eles. O ativo 'CXSE3' representa as ações reais da Caixa Seguridade listadas na B3. O indexador 'IFNC' representa o Índice do Setor Financeiro oficial da B3, que engloba as principais instituições financeiras listadas."
            : "Nota: Caixa Econômica, Banco Volkswagen e Banco Master são instituições de fomento ou capital fechado neste cenário fictício. O ativo 'Caixa Econômica (Fictício)' representa a Caixa Econômica com dados didáticos simplificados para facilidade acadêmica.")
        : "Nota: BNDES, Banco Volkswagen e Banco Master são instituições de capital fechado e não possuem ações na B3. Para permitir a aplicação dos modelos de Black-Scholes e Monte Carlo, este simulador utiliza 'Ativos Sintéticos' com preços e volatilidades modelados pelo comportamento do setor financeiro. O ativo 'Carteira BNDESPAR' representa um índice sintético da subsidiária de participações do BNDES, refletindo o risco de mercado de sua carteira de ações em empresas de capital aberto.";

    document.getElementById('comp-chart-subtitle').textContent = compChartSubtitle;
    document.getElementById('tooltip-nota').innerHTML = '<span class="info-icon">i</span> ' + noteTooltip;

    // Toggles de Visibilidade
    const toggle0 = document.getElementById('toggle-label-0');
    if (toggle0) {
        const isChecked = toggle0.querySelector('input').checked;
        toggle0.innerHTML = `<input type="checkbox" ${isChecked ? 'checked' : ''}> ` + ASSET_DATABASE.BNDES.name;
    }
    const toggle1 = document.getElementById('toggle-label-1');
    if (toggle1) {
        const isChecked = toggle1.querySelector('input').checked;
        toggle1.innerHTML = `<input type="checkbox" ${isChecked ? 'checked' : ''}> ` + ASSET_DATABASE.BNDESPAR.name;
    }

    // Dropdowns
    const bsOptBndes = document.getElementById('bs-opt-bndes');
    if (bsOptBndes) bsOptBndes.textContent = ASSET_DATABASE.BNDES.name;
    const bsOptBndespar = document.getElementById('bs-opt-bndespar');
    if (bsOptBndespar) bsOptBndespar.textContent = ASSET_DATABASE.BNDESPAR.name;

    const mcOptBndes = document.getElementById('mc-opt-bndes');
    if (mcOptBndes) mcOptBndes.textContent = ASSET_DATABASE.BNDES.name;
    const mcOptBndespar = document.getElementById('mc-opt-bndespar');
    if (mcOptBndespar) mcOptBndespar.textContent = ASSET_DATABASE.BNDESPAR.name;

    // 3. Recalcular e desenhar
    simulateHistoricalPrices();
    drawComparativoChart();
    renderAssetsStatsTable();

    // Sincronizar inputs se o ativo de referência alterado estiver selecionado
    const bsSelect = document.getElementById('bs-asset-select');
    if (bsSelect.value === 'BNDES' || bsSelect.value === 'BNDESPAR') {
        const bsAsset = ASSET_DATABASE[bsSelect.value];
        document.getElementById('bs-s').value = bsAsset.s0.toFixed(2);
        document.getElementById('bs-vol').value = (bsAsset.vol * 100).toFixed(1);
    }
    const mcSelect = document.getElementById('mc-asset-select');
    if (mcSelect.value === 'BNDES' || mcSelect.value === 'BNDESPAR') {
        const mcAsset = ASSET_DATABASE[mcSelect.value];
        document.getElementById('mc-s0').value = mcAsset.s0.toFixed(2);
        document.getElementById('mc-drift').value = (mcAsset.drift * 100).toFixed(1);
        document.getElementById('mc-vol').value = (mcAsset.vol * 100).toFixed(1);
    }

    runBlackScholes();
    runMarkowitz();
    runMonteCarlo();
}


// ================= ESTADOS GLOBAIS =================
let chartComparativo = null;
let chartMarkowitz = null;
let chartMonteCarlo = null;

// Armazenamento das séries históricas simuladas (252 dias) para os 7 ativos
const historicalData = {};
const assetReturns = {}; // Retornos diários
const assetAnnualReturns = {}; // Retorno anual calculado
const assetAnnualVols = {}; // Volatilidade anual calculada
let covarianceMatrix = null;

// ================= GERADORES DE NÚMEROS E DISTRIBUIÇÕES =================

/** Gerador LCG com seed determinística para dados reproduzíveis */
function seededRandom(seed) {
    let s = seed;
    return function() {
        s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
        return (s >>> 0) / 0xFFFFFFFF;
    };
}

/** Gerador Normal via Box-Muller usando RNG seedado ou nativo */
function seededNormal(rng) {
    let u = rng(), v = rng();
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** Gerador Normal nativo (para Monte Carlo geral) */
function randomNormal() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** Pesos aleatórios via Distribuição de Dirichlet (garante soma = 1) */
function generateRandomWeights(n) {
    const weights = [];
    let sum = 0;
    for (let i = 0; i < n; i++) {
        let u = Math.random();
        while (u === 0) u = Math.random();
        const exp = -Math.log(u);
        weights.push(exp);
        sum += exp;
    }
    return weights.map(w => w / sum);
}

// ================= FUNÇÕES MATEMÁTICAS FINANCEIRAS =================

/** PDF da Normal Padrão */
function stdNormalPDF(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** CDF da Normal Padrão — Aproximação clássica de alta precisão */
function stdNormalCDF(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989422804 * Math.exp(-x * x / 2);
    const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return x > 0 ? 1 - p : p;
}

// ================= FORMATAÇÃO PT-BR =================
function formatBRL(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatPercent(value, decimals = 2) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + '%';
}

function formatNum(value, decimals = 4) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ================= SIMULAÇÃO DE BANCO DE DADOS INTERNO (HISTÓRICO) =================

function simulateHistoricalPrices() {
    const days = 252;
    const dt = 1 / days;

    for (const key of ASSET_KEYS) {
        const asset = ASSET_DATABASE[key];
        const rng = seededRandom(asset.seed);
        const mu = asset.drift;
        const sigma = asset.vol;
        const driftTerm = (mu - 0.5 * sigma * sigma) * dt;
        const volTerm = sigma * Math.sqrt(dt);

        const prices = [100.0]; // Base normalizada 100 para análise comparativa
        const returns = [];

        for (let t = 1; t <= days; t++) {
            const z = seededNormal(rng);
            const nextPrice = prices[t - 1] * Math.exp(driftTerm + volTerm * z);
            prices.push(nextPrice);
            
            // Retorno logarítmico diário
            const ret = Math.log(nextPrice / prices[t - 1]);
            returns.push(ret);
        }

        historicalData[key] = prices;
        assetReturns[key] = returns;

        // Calcular estatísticas anuais efetivas
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / (returns.length - 1);
        
        assetAnnualReturns[key] = avgReturn * 252;
        assetAnnualVols[key] = Math.sqrt(variance) * Math.sqrt(252);
    }

    // Calcular Matriz de Covariância dos 7 ativos
    covarianceMatrix = {};
    for (const k1 of ASSET_KEYS) {
        covarianceMatrix[k1] = {};
        for (const k2 of ASSET_KEYS) {
            const r1 = assetReturns[k1];
            const r2 = assetReturns[k2];
            const avg1 = assetAnnualReturns[k1] / 252;
            const avg2 = assetAnnualReturns[k2] / 252;

            let sumProduct = 0;
            for (let t = 0; t < days; t++) {
                sumProduct += (r1[t] - avg1) * (r2[t] - avg2);
            }
            const covDaily = sumProduct / (days - 1);
            covarianceMatrix[k1][k2] = covDaily * 252; // Covariância anualizada
        }
    }
}

// ================= ABA 1: ANÁLISE COMPARATIVA =================

function drawComparativoChart() {
    const days = 252;
    const labels = Array.from({ length: days + 1 }, (_, i) => `Dia ${i}`);

    const datasets = ASSET_KEYS.map((key) => {
        const asset = ASSET_DATABASE[key];
        const isBndes = key === 'BNDES';
        const isBndespar = key === 'BNDESPAR';

        // Definindo espessura e opacidade conforme especificações
        let width = 1.5;
        let opacity = 0.55;
        if (isBndes || isBndespar) {
            width = 3.2;
            opacity = 1.0;
        }

        // Converter cor hex para rgba com opacidade reduzida para ativos secundários
        const hex = asset.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const colorStr = `rgba(${r}, ${g}, ${b}, ${opacity})`;

        return {
            label: asset.name,
            data: historicalData[key],
            borderColor: colorStr,
            borderWidth: width,
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: false,
            tension: 0.1,
            // Guardar flags para o plugin de glow
            isBndes: isBndes
        };
    });

    const ctx = document.getElementById('chart-comparativo').getContext('2d');
    if (chartComparativo) chartComparativo.destroy();

    // Plugin customizado para aplicar efeito Glow na linha do BNDES
    const glowPlugin = {
        id: 'glowPlugin',
        beforeDatasetDraw: (chart, args) => {
            const dataset = chart.data.datasets[args.index];
            if (dataset.isBndes) {
                chart.ctx.shadowColor = '#8B008B';
                chart.ctx.shadowBlur = 12;
            } else {
                chart.ctx.shadowColor = 'transparent';
                chart.ctx.shadowBlur = 0;
            }
        },
        afterDatasetDraw: (chart) => {
            chart.ctx.shadowColor = 'transparent';
            chart.ctx.shadowBlur = 0;
        }
    };

    chartComparativo = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        plugins: [glowPlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false }, // Controlado por toggles HTML customizados
                tooltip: {
                    backgroundColor: '#111111',
                    titleColor: '#f8f8f8',
                    bodyColor: '#cccccc',
                    borderColor: '#222222',
                    borderWidth: 1,
                    titleFont: { family: 'Inter', weight: 'bold', size: 11 },
                    bodyFont: { family: 'Inter', size: 10 },
                    callbacks: {
                        label: function(ctx) {
                            if (ctx.dataset.hidden) return null;
                            return `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#1a1a1a' },
                    ticks: { color: '#888888', font: { family: 'Inter', size: 10 }, maxTicksLimit: 12 },
                    title: { display: true, text: 'Dias Úteis (1 Ano)', color: '#888888', font: { family: 'Inter', weight: 'bold', size: 11 } }
                },
                y: {
                    grid: { color: '#1a1a1a' },
                    ticks: { color: '#888888', font: { family: 'Inter', size: 10 } },
                    title: { display: true, text: 'Índice de Performance (Base 100)', color: '#888888', font: { family: 'Inter', weight: 'bold', size: 11 } }
                }
            }
        }
    });

    // Configurar os Toggles customizados
    const toggles = document.querySelectorAll('.comp-chart-toggles .toggle-chip');
    toggles.forEach(chip => {
        // Remover listeners anteriores recriando os elementos ou limpando
        const newChip = chip.cloneNode(true);
        chip.parentNode.replaceChild(newChip, chip);

        newChip.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-idx'));
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('active', checkbox.checked);

            const meta = chartComparativo.getDatasetMeta(idx);
            meta.hidden = !checkbox.checked;
            chartComparativo.update();
        });
    });
}

// ================= ABA 2: BLACK-SCHOLES =================

function initBlackScholesControls() {
    const select = document.getElementById('bs-asset-select');
    select.addEventListener('change', function() {
        const key = this.value;
        const asset = ASSET_DATABASE[key];
        if (asset) {
            document.getElementById('bs-s').value = asset.s0.toFixed(2);
            document.getElementById('bs-vol').value = (asset.vol * 100).toFixed(1);
            runBlackScholes();
        }
    });

    // Calcular valores iniciais
    const asset = ASSET_DATABASE[select.value];
    if (asset) {
        document.getElementById('bs-s').value = asset.s0.toFixed(2);
        document.getElementById('bs-vol').value = (asset.vol * 100).toFixed(1);
    }
}

function runBlackScholes() {
    const S = parseFloat(document.getElementById('bs-s').value);
    const K = parseFloat(document.getElementById('bs-k').value);
    const vol = parseFloat(document.getElementById('bs-vol').value);
    const r = parseFloat(document.getElementById('bs-r').value);
    const T = parseFloat(document.getElementById('bs-t').value);

    if (isNaN(S) || isNaN(K) || isNaN(vol) || isNaN(r) || isNaN(T) || S <= 0 || K <= 0 || T <= 0) {
        alert('Por favor, insira parâmetros válidos e positivos.');
        return;
    }

    const sigma = vol / 100;
    const rate = r / 100;

    // Fórmulas de Black-Scholes para d1 e d2
    const d1 = (Math.log(S / K) + (rate + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    const Nd1 = stdNormalCDF(d1);
    const Nd2 = stdNormalCDF(d2);
    const N_d1 = stdNormalCDF(-d1);
    const N_d2 = stdNormalCDF(-d2);
    const discount = Math.exp(-rate * T);

    // Precificação Call & Put
    const callPrice = S * Nd1 - K * discount * Nd2;
    const putPrice = K * discount * N_d2 - S * N_d1;

    // Gregas matemáticas
    const pdfD1 = stdNormalPDF(d1);
    const deltaCall = Nd1;
    const deltaPut = Nd1 - 1;
    const gamma = pdfD1 / (S * sigma * Math.sqrt(T));
    const vega = (S * Math.sqrt(T) * pdfD1) / 100;
    const thetaCall = (-(S * pdfD1 * sigma) / (2 * Math.sqrt(T)) - rate * K * discount * Nd2) / 365;
    const thetaPut = (-(S * pdfD1 * sigma) / (2 * Math.sqrt(T)) + rate * K * discount * N_d2) / 365;
    const rhoCall = (K * T * discount * Nd2) / 100;
    const rhoPut = (-K * T * discount * N_d2) / 100;

    // Atualizar HTML
    document.getElementById('val-call-price').textContent = formatBRL(callPrice);
    document.getElementById('val-call-delta').textContent = formatNum(deltaCall);
    document.getElementById('val-call-theta').textContent = formatNum(thetaCall);
    document.getElementById('val-call-rho').textContent = formatNum(rhoCall);

    document.getElementById('val-put-price').textContent = formatBRL(putPrice);
    document.getElementById('val-put-delta').textContent = formatNum(deltaPut);
    document.getElementById('val-put-theta').textContent = formatNum(thetaPut);
    document.getElementById('val-put-rho').textContent = formatNum(rhoPut);

    document.getElementById('val-d1').textContent = formatNum(d1);
    document.getElementById('val-d2').textContent = formatNum(d2);
    document.getElementById('val-gamma').textContent = formatNum(gamma);
    document.getElementById('val-vega').textContent = formatNum(vega);
}

// ================= ABA 3: FRONTEIRA EFICIENTE =================

function renderAssetsStatsTable() {
    const tbody = document.getElementById('assets-stats-body');
    tbody.innerHTML = '';

    ASSET_KEYS.forEach(key => {
        const asset = ASSET_DATABASE[key];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong style="color: ${asset.color}">${asset.name}</strong></td>
            <td>${formatPercent(assetAnnualReturns[key] * 100)}</td>
            <td>${formatPercent(assetAnnualVols[key] * 100)}</td>
        `;
        tbody.appendChild(row);
    });
}

function runMarkowitz() {
    const rf = parseFloat(document.getElementById('mark-rf').value) / 100;
    const numPortfolios = 1000;
    const portfolios = [];

    let minSharpe = Infinity, maxSharpe = -Infinity;
    let maxSharpePortfolio = null, minVarPortfolio = null;
    let minVol = Infinity;

    for (let p = 0; p < numPortfolios; p++) {
        // Gerar pesos para os 7 ativos
        const w = generateRandomWeights(7);

        // Retorno Esperado
        let pReturn = 0;
        for (let i = 0; i < 7; i++) {
            const key = ASSET_KEYS[i];
            pReturn += w[i] * assetAnnualReturns[key];
        }

        // Risco (Volatilidade) usando Matriz de Covariância
        let pVar = 0;
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                const keyI = ASSET_KEYS[i];
                const keyJ = ASSET_KEYS[j];
                pVar += w[i] * w[j] * covarianceMatrix[keyI][keyJ];
            }
        }
        const pVol = Math.sqrt(pVar);
        const pSharpe = (pReturn - rf) / pVol;

        const data = {
            weights: w,
            expectedReturn: pReturn * 100,
            volatility: pVol * 100,
            sharpe: pSharpe
        };
        portfolios.push(data);

        if (pSharpe < minSharpe) minSharpe = pSharpe;
        if (pSharpe > maxSharpe) {
            maxSharpe = pSharpe;
            maxSharpePortfolio = data;
        }
        if (pVol < minVol) {
            minVol = pVol;
            minVarPortfolio = data;
        }
    }

    const scatterData = portfolios.map(p => ({ x: p.volatility, y: p.expectedReturn }));

    // Gerar gradiente de cor vibrante com base no índice de Sharpe (roxa/magenta/ciano)
    const pointColors = portfolios.map(p => {
        let norm = (p.sharpe - minSharpe) / (maxSharpe - minSharpe);
        if (isNaN(norm)) norm = 0.5;
        norm = Math.max(0, Math.min(1, norm));
        
        // HSL Interpolation: do roxo (280) ao rosa choque (330) e ciano elétrico (190) para Sharpe mais alto
        let hue;
        if (norm < 0.4) {
            hue = 275 + (norm / 0.4) * 55; // 275 (purple) to 330 (magenta)
        } else {
            hue = 330 - ((norm - 0.4) / 0.6) * 140; // 330 (magenta) to 190 (cyan)
        }
        return `hsla(${hue}, 100%, 60%, ${0.5 + norm * 0.45})`;
    });

    const ctx = document.getElementById('chart-markowitz').getContext('2d');
    if (chartMarkowitz) chartMarkowitz.destroy();

    chartMarkowitz = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Portfólios Simulados',
                    data: scatterData,
                    backgroundColor: pointColors,
                    borderColor: 'transparent',
                    pointRadius: 4.5,
                    pointHoverRadius: 6.5,
                    order: 3
                },
                {
                    label: 'Sharpe Máximo (⭐)',
                    data: [{ x: maxSharpePortfolio.volatility, y: maxSharpePortfolio.expectedReturn }],
                    backgroundColor: '#F8F8F8',
                    borderColor: '#00E5FF',
                    borderWidth: 3,
                    pointRadius: 13,
                    pointStyle: 'rectRot',
                    pointHoverRadius: 15,
                    order: 1
                },
                {
                    label: 'Mínima Variância (🟢)',
                    data: [{ x: minVarPortfolio.volatility, y: minVarPortfolio.expectedReturn }],
                    backgroundColor: '#10b981',
                    borderColor: '#F8F8F8',
                    borderWidth: 2.5,
                    pointRadius: 11,
                    pointHoverRadius: 13,
                    order: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#cccccc',
                        font: { family: 'Inter', size: 11, weight: 'bold' },
                        filter: item => item.text !== 'Portfólios Simulados'
                    }
                },
                tooltip: {
                    backgroundColor: '#111111',
                    titleColor: '#f8f8f8',
                    bodyColor: '#cccccc',
                    borderColor: '#333333',
                    borderWidth: 1,
                    titleFont: { family: 'Inter', weight: 'bold', size: 11 },
                    bodyFont: { family: 'Inter', size: 10 },
                    callbacks: {
                        label: function(context) {
                            let p = null;
                            if (context.datasetIndex === 0) p = portfolios[context.dataIndex];
                            else if (context.datasetIndex === 1) p = maxSharpePortfolio;
                            else p = minVarPortfolio;
                            
                            const lines = [
                                `Vol (Risco): ${formatPercent(p.volatility)}`,
                                `Retorno: ${formatPercent(p.expectedReturn)}`,
                                `Sharpe: ${formatNum(p.sharpe, 3)}`
                            ];
                            
                            // Adicionar pesos maiores que 1% na tooltip
                            const wStr = ASSET_KEYS.map((k, idx) => {
                                const wVal = Math.round(p.weights[idx] * 100);
                                return wVal > 0 ? `${k}: ${wVal}%` : null;
                            }).filter(x => x !== null).join(' | ');
                            
                            lines.push(wStr);
                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#2b2b2b' },
                    ticks: { color: '#cccccc', font: { family: 'Inter', size: 10 }, callback: v => v + '%' },
                    title: { display: true, text: 'Volatilidade Anualizada (Risco) — %', color: '#cccccc', font: { family: 'Inter', weight: 'bold', size: 11 } }
                },
                y: {
                    grid: { color: '#2b2b2b' },
                    ticks: { color: '#cccccc', font: { family: 'Inter', size: 10 }, callback: v => v + '%' },
                    title: { display: true, text: 'Retorno Anualizado Esperado — %', color: '#cccccc', font: { family: 'Inter', weight: 'bold', size: 11 } }
                }
            }
        }
    });

    // Renderizar pesos nos cards inferiores
    updateAllocBars('alloc-sharpe-bars', maxSharpePortfolio.weights, '#8B008B');
    updateAllocBars('alloc-minvar-bars', minVarPortfolio.weights, '#10b981');

    document.getElementById('opt-sharpe-ret').textContent = formatPercent(maxSharpePortfolio.expectedReturn);
    document.getElementById('opt-sharpe-vol').textContent = formatPercent(maxSharpePortfolio.volatility);
    document.getElementById('opt-sharpe-val').textContent = formatNum(maxSharpePortfolio.sharpe, 3);

    document.getElementById('opt-minvar-ret').textContent = formatPercent(minVarPortfolio.expectedReturn);
    document.getElementById('opt-minvar-vol').textContent = formatPercent(minVarPortfolio.volatility);
    document.getElementById('opt-minvar-val').textContent = formatNum(minVarPortfolio.sharpe, 3);
}

function updateAllocBars(containerId, weights, barColor) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    ASSET_KEYS.forEach((key, idx) => {
        const pct = Math.round(weights[idx] * 100);
        const wrapper = document.createElement('div');
        wrapper.className = 'alloc-bar-wrapper';
        wrapper.innerHTML = `
            <span class="ticker-label">${ASSET_DATABASE[key].ticker || ASSET_DATABASE[key].name.split(' ')[0]}:</span>
            <div class="bar-container">
                <div class="bar" style="width: ${pct}%; background-color: ${barColor}"></div>
            </div>
            <span class="bar-val mono">${pct}%</span>
        `;
        container.appendChild(wrapper);
    });
}

// ================= ABA 4: MONTE CARLO =================

function initMonteCarloControls() {
    const select = document.getElementById('mc-asset-select');
    select.addEventListener('change', function() {
        const key = this.value;
        const asset = ASSET_DATABASE[key];
        if (asset) {
            document.getElementById('mc-s0').value = asset.s0.toFixed(2);
            document.getElementById('mc-drift').value = (asset.drift * 100).toFixed(1);
            document.getElementById('mc-vol').value = (asset.vol * 100).toFixed(1);
            runMonteCarlo();
        }
    });

    const asset = ASSET_DATABASE[select.value];
    if (asset) {
        document.getElementById('mc-s0').value = asset.s0.toFixed(2);
        document.getElementById('mc-drift').value = (asset.drift * 100).toFixed(1);
        document.getElementById('mc-vol').value = (asset.vol * 100).toFixed(1);
    }
}

function runMonteCarlo() {
    const S0 = parseFloat(document.getElementById('mc-s0').value);
    const driftAnnual = parseFloat(document.getElementById('mc-drift').value) / 100;
    const volAnnual = parseFloat(document.getElementById('mc-vol').value) / 100;
    const steps = parseInt(document.getElementById('mc-days').value);
    const paths = 1000; // Fixo em 1.000 caminhos pelo escopo estrito

    if (isNaN(S0) || isNaN(driftAnnual) || isNaN(volAnnual) || isNaN(steps) || S0 <= 0 || steps <= 0) {
        alert('Por favor, insira parâmetros válidos.');
        return;
    }

    const dt = 1 / 252;
    const driftTerm = (driftAnnual - 0.5 * volAnnual * volAnnual) * dt;
    const volTerm = volAnnual * Math.sqrt(dt);

    // Gerar 1000 caminhos estocásticos
    const allPaths = new Array(paths);
    for (let i = 0; i < paths; i++) {
        allPaths[i] = new Float32Array(steps + 1);
        allPaths[i][0] = S0;
    }

    for (let t = 1; t <= steps; t++) {
        for (let i = 0; i < paths; i++) {
            const z = randomNormal();
            allPaths[i][t] = allPaths[i][t - 1] * Math.exp(driftTerm + volTerm * z);
        }
    }

    // Calcular curvas de percentis a cada dia da projeção
    const p5 = new Float32Array(steps + 1);
    const p50 = new Float32Array(steps + 1);
    const p95 = new Float32Array(steps + 1);
    p5[0] = S0; p50[0] = S0; p95[0] = S0;

    for (let t = 1; t <= steps; t++) {
        const dayPrices = new Float32Array(paths);
        for (let i = 0; i < paths; i++) {
            dayPrices[i] = allPaths[i][t];
        }
        dayPrices.sort();
        p5[t] = dayPrices[Math.floor(paths * 0.05)];
        p50[t] = dayPrices[Math.floor(paths * 0.50)];
        p95[t] = dayPrices[Math.floor(paths * 0.95)];
    }

    // Calcular estatísticas das simulações
    const finalPrices = new Float32Array(paths);
    let sumFinal = 0;
    let lossCount = 0;
    for (let i = 0; i < paths; i++) {
        finalPrices[i] = allPaths[i][steps];
        sumFinal += finalPrices[i];
        if (finalPrices[i] < S0) lossCount++;
    }
    const meanFinal = sumFinal / paths;
    let sumSqrDiff = 0;
    for (let i = 0; i < paths; i++) {
        sumSqrDiff += Math.pow(finalPrices[i] - meanFinal, 2);
    }
    const stdFinal = Math.sqrt(sumSqrDiff / (paths - 1));
    const lossProb = (lossCount / paths) * 100;

    // Atualizar UI
    document.getElementById('mc-val-5').textContent = formatBRL(p5[steps]);
    document.getElementById('mc-val-50').textContent = formatBRL(p50[steps]);
    document.getElementById('mc-val-95').textContent = formatBRL(p95[steps]);
    document.getElementById('mc-stat-mean').textContent = formatBRL(meanFinal);
    document.getElementById('mc-stat-std').textContent = formatBRL(stdFinal);
    document.getElementById('mc-stat-loss-prob').textContent = formatPercent(lossProb, 1);

    // Amostra de 40 caminhos para exibição de fundo
    const samplePaths = Math.min(40, paths);
    const labels = Array.from({ length: steps + 1 }, (_, i) => i);
    const datasets = [];

    // Linhas dos caminhos amostrais
    for (let i = 0; i < samplePaths; i++) {
        datasets.push({
            label: `Caminho ${i + 1}`,
            data: Array.from(allPaths[i]),
            borderColor: 'rgba(139, 0, 139, 0.05)', // Roxo com opacidade muito baixa
            borderWidth: 1,
            pointRadius: 0,
            fill: false,
            order: 4
        });
    }

    // Linhas de percentis estruturadas
    datasets.push({
        label: 'Estresse (5%)',
        data: Array.from(p5),
        borderColor: '#ef4444',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        order: 1
    });
    datasets.push({
        label: 'Mediano (50%)',
        data: Array.from(p50),
        borderColor: '#F8F8F8',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        order: 2
    });
    datasets.push({
        label: 'Otimista (95%)',
        data: Array.from(p95),
        borderColor: '#10b981',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        order: 3
    });

    const ctx = document.getElementById('chart-monte-carlo').getContext('2d');
    if (chartMonteCarlo) chartMonteCarlo.destroy();

    chartMonteCarlo = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#888888',
                        font: { family: 'Inter', size: 10 },
                        filter: item => ['Estresse (5%)', 'Mediano (50%)', 'Otimista (95%)'].includes(item.text)
                    }
                },
                tooltip: {
                    backgroundColor: '#111111',
                    titleColor: '#f8f8f8',
                    bodyColor: '#cccccc',
                    borderColor: '#222222',
                    borderWidth: 1,
                    callbacks: {
                        title: ctx => `Dia ${ctx[0].label}`,
                        label: ctx => {
                            if (['Estresse (5%)', 'Mediano (50%)', 'Otimista (95%)'].includes(ctx.dataset.label)) {
                                return `${ctx.dataset.label}: ${formatBRL(ctx.raw)}`;
                            }
                            return null;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#1a1a1a' },
                    ticks: { color: '#888888', font: { family: 'Inter', size: 10 } },
                    title: { display: true, text: 'Dias Úteis da Projeção', color: '#888888', font: { family: 'Inter', weight: 'bold', size: 11 } }
                },
                y: {
                    grid: { color: '#1a1a1a' },
                    ticks: { color: '#888888', font: { family: 'Inter', size: 10 }, callback: v => formatBRL(v) },
                    title: { display: true, text: 'Preço Estimado (R$)', color: '#888888', font: { family: 'Inter', weight: 'bold', size: 11 } }
                }
            }
        }
    });
}

// ================= NAVEGAÇÃO =================

function initTabNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');

            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            tabContents.forEach(tab => {
                if (tab.id === targetTab) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });

            // Forçar redimensionamento dos gráficos para ajustar ao container
            if (targetTab === 'tab-analise-comparativa' && chartComparativo) chartComparativo.resize();
            if (targetTab === 'tab-markowitz' && chartMarkowitz) chartMarkowitz.resize();
            if (targetTab === 'tab-monte-carlo' && chartMonteCarlo) chartMonteCarlo.resize();
        });
    });
}

function initHelperTextListeners() {
    const bsT = document.getElementById('bs-t');
    bsT.addEventListener('input', function() {
        const val = parseFloat(this.value);
        if (!isNaN(val) && val > 0) {
            const days = Math.round(val * 252);
            document.getElementById('bs-t-days').textContent = `Aproximadamente ${days} dias úteis (252 dias úteis/ano).`;
        }
    });
}

// ================= INICIALIZAÇÃO DO SISTEMA =================

window.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar controles e navegação
    initTabNavigation();
    initBlackScholesControls();
    initMonteCarloControls();
    initHelperTextListeners();

    // 2. Adicionar listeners dos botões de simulação/cálculo
    document.getElementById('btn-calcular-bs').addEventListener('click', runBlackScholes);
    document.getElementById('btn-simular-mark').addEventListener('click', runMarkowitz);
    document.getElementById('btn-simular-mc').addEventListener('click', runMonteCarlo);

    // 3. Adicionar listeners dos seletores de instituição e cenário
    const modeSelect = document.getElementById('select-institution-mode');
    const scenarioSelect = document.getElementById('select-scenario-mode');

    if (modeSelect) {
        modeSelect.addEventListener('change', updateSimulationSettings);
    }
    if (scenarioSelect) {
        scenarioSelect.addEventListener('change', updateSimulationSettings);
    }
    
    // 4. Carregar dados iniciais baseado nos seletores ativos
    updateSimulationSettings();
});
