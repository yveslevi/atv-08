import express, { json } from 'express';
import axios from 'axios';
import CircuitBreaker from 'opossum';

const app = express();
const port = 3000;

app.use(json());

const circuitBreakerOptions = {
  failureThreshold: 3, // Abra o circuito após 3 falhas
  successThreshold: 1, // Feche o circuito após 1 sucesso
  timeout: 10000, // Tempo para o circuito ir para o meio-aberto (10 segundos)
  resetTimeout: 5000, // Tempo em que o circuito deve tentar se reabrir após abrir (5 segundos)
};

const circuit = new CircuitBreaker(requestToThirdPartyAPI, circuitBreakerOptions);

async function requestToThirdPartyAPI() {
  const response = await axios.get('https://demo0668312.mockable.io/teste');
  return response.data;
}

// Rota para fazer uma requisição à sua API terceira com circuit breaker
app.get('/api-terceira', async (req, res) => {
  try {
    console.log('Circuit Breaker State:', circuit.stats);
    const result = await circuit.fire(); // Chama a função protegida pelo circuit breaker
    console.log(result)
    res.json({ message: 'Requisição bem-sucedida', result: result });
  } catch (error) {
    res.status(500).json({ error: 'Erro na requisição à API terceira: ' + error.message });
  }
});

// Rota para resetar o circuit breaker (apenas para fins de teste)
app.get('/reset', (req, res) => {
  circuit.open(); // Força o circuito a entrar no estado meio-aberto
  res.json({ message: 'Circuito resetado para o estado meio-aberto' });
});

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});