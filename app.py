import os
import math
import random
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('.', path)

# Black-Scholes Formula & Cumulative Normal Distribution
def std_normal_cdf(x):
    t = 1 / (1 + 0.2316419 * abs(x))
    d = 0.3989422804 * math.exp(-x * x / 2)
    p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
    return 1 - p if x > 0 else p

def std_normal_pdf(x):
    return math.exp(-0.5 * x * x) / math.sqrt(2 * math.pi)

@app.route('/api/black-scholes', methods=['POST'])
def black_scholes():
    data = request.json
    try:
        S = float(data['S'])
        K = float(data['K'])
        vol = float(data['vol']) / 100
        r = float(data['r']) / 100
        T = float(data['T'])
    except (KeyError, ValueError, TypeError):
        return jsonify({'error': 'Parâmetros inválidos'}), 400

    if S <= 0 or K <= 0 or T <= 0 or vol <= 0:
        return jsonify({'error': 'Os valores devem ser positivos'}), 400

    d1 = (math.log(S / K) + (r + 0.5 * vol * vol) * T) / (vol * math.sqrt(T))
    d2 = d1 - vol * math.sqrt(T)

    Nd1 = std_normal_cdf(d1)
    Nd2 = std_normal_cdf(d2)
    N_d1 = std_normal_cdf(-d1)
    N_d2 = std_normal_cdf(-d2)
    discount = math.exp(-r * T)

    call_price = S * Nd1 - K * discount * Nd2
    put_price = K * discount * N_d2 - S * N_d1

    pdfD1 = std_normal_pdf(d1)
    delta_call = Nd1
    delta_put = Nd1 - 1
    gamma = pdfD1 / (S * vol * math.sqrt(T))
    vega = (S * math.sqrt(T) * pdfD1) / 100
    theta_call = (-(S * pdfD1 * vol) / (2 * math.sqrt(T)) - r * K * discount * Nd2) / 365
    theta_put = (-(S * pdfD1 * vol) / (2 * math.sqrt(T)) + r * K * discount * N_d2) / 365
    rho_call = (K * T * discount * Nd2) / 100
    rho_put = (-K * T * discount * N_d2) / 100

    return jsonify({
        'callPrice': call_price,
        'putPrice': put_price,
        'd1': d1,
        'd2': d2,
        'deltaCall': delta_call,
        'deltaPut': delta_put,
        'gamma': gamma,
        'vega': vega,
        'thetaCall': theta_call,
        'thetaPut': theta_put,
        'rhoCall': rho_call,
        'rhoPut': rho_put
    })

@app.route('/api/markowitz', methods=['POST'])
def markowitz_api():
    data = request.json
    try:
        rf = float(data['rf']) / 100
        returns_list = [float(x) for x in data['annualReturns']]
        cov_matrix = data['covarianceMatrix']
        asset_keys = data['assetKeys']
    except (KeyError, ValueError, TypeError):
        return jsonify({'error': 'Parâmetros inválidos'}), 400

    num_portfolios = 1000
    portfolios = []
    min_sharpe = float('inf')
    max_sharpe = float('-inf')
    max_sharpe_portfolio = None
    min_var_portfolio = None
    min_vol = float('inf')

    # Para reprodutibilidade do backend
    rng = random.Random(42)

    for _ in range(num_portfolios):
        # Dirichlet weights
        raw_w = [-math.log(rng.random()) for _ in range(len(asset_keys))]
        sum_w = sum(raw_w)
        w = [x / sum_w for x in raw_w]

        # Retorno do portfólio
        p_return = sum(w[i] * returns_list[i] for i in range(len(asset_keys)))

        # Variância usando matriz de covariância
        p_var = 0.0
        for i in range(len(asset_keys)):
            for j in range(len(asset_keys)):
                key_i = asset_keys[i]
                key_j = asset_keys[j]
                p_var += w[i] * w[j] * cov_matrix[key_i][key_j]
        
        p_vol = math.sqrt(p_var)
        p_sharpe = (p_return - rf) / p_vol if p_vol > 0 else 0

        portfolio_data = {
            'weights': w,
            'expectedReturn': p_return * 100,
            'volatility': p_vol * 100,
            'sharpe': p_sharpe
        }
        portfolios.append(portfolio_data)

        if p_sharpe < min_sharpe:
            min_sharpe = p_sharpe
        if p_sharpe > max_sharpe:
            max_sharpe = p_sharpe
            max_sharpe_portfolio = portfolio_data
        if p_vol < min_vol:
            min_vol = p_vol
            min_var_portfolio = portfolio_data

    return jsonify({
        'portfolios': portfolios,
        'maxSharpePortfolio': max_sharpe_portfolio,
        'minVarPortfolio': min_var_portfolio,
        'minSharpe': min_sharpe,
        'maxSharpe': max_sharpe
    })

@app.route('/api/monte-carlo', methods=['POST'])
def monte_carlo_api():
    data = request.json
    try:
        S0 = float(data['S0'])
        drift_annual = float(data['drift']) / 100
        vol_annual = float(data['vol']) / 100
        steps = int(data['steps'])
    except (KeyError, ValueError, TypeError):
        return jsonify({'error': 'Parâmetros inválidos'}), 400

    paths = 1000
    dt = 1.0 / 252.0
    drift_term = (drift_annual - 0.5 * vol_annual * vol_annual) * dt
    vol_term = vol_annual * math.sqrt(dt)

    # Simulação dos caminhos
    rng = random.Random()
    all_paths = []
    for _ in range(paths):
        path = [S0]
        for _ in range(steps):
            z = rng.gauss(0, 1)
            next_p = path[-1] * math.exp(drift_term + vol_term * z)
            path.append(next_p)
        all_paths.append(path)

    # Percentis por dia
    p5 = []
    p50 = []
    p95 = []
    
    for t in range(steps + 1):
        day_prices = [all_paths[i][t] for i in range(paths)]
        day_prices.sort()
        p5.append(day_prices[int(paths * 0.05)])
        p50.append(day_prices[int(paths * 0.50)])
        p95.append(day_prices[int(paths * 0.95)])

    final_prices = [all_paths[i][steps] for i in range(paths)]
    mean_final = sum(final_prices) / paths
    loss_count = sum(1 for p in final_prices if p < S0)
    
    sum_sqr_diff = sum((p - mean_final) ** 2 for p in final_prices)
    std_final = math.sqrt(sum_sqr_diff / (paths - 1))
    loss_prob = (loss_count / paths) * 100

    return jsonify({
        'paths': [all_paths[i] for i in range(min(40, paths))], # Envia 40 caminhos amostrais
        'p5': p5,
        'p50': p50,
        'p95': p95,
        'meanFinal': mean_final,
        'stdFinal': std_final,
        'lossProb': loss_prob
    })

if __name__ == '__main__':
    print("Iniciando o servidor Flask em http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
