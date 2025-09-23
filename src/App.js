import React, { useState } from 'react';
import './App.css'; // Arquivo para estilização

function App() {
  const [idea, setIdea] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [advancedPrompt, setAdvancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setAdvancedPrompt('');

    try {
      const response = await fetch('https://gerador-prompt-frontend.vercel.app/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea, style }),
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor.');
      }

      const data = await response.json();
      setAdvancedPrompt(data.advanced_prompt);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(advancedPrompt);
    alert('Prompt copiado para a área de transferência!');
  };

  return (
    <div className="container">
      <header>
        <h1>Gerador de Prompt Avançado</h1>
        <p>Transforme suas ideias simples em prompts perfeitos para IA.</p>
      </header>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="idea">Sua ideia simples:</label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Ex: um gato lendo um livro na lua"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="style">Escolha o estilo:</label>
          <select id="style" value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="cinematic">Cinematográfico</option>
            <option value="photorealistic">Fotorrealista</option>
            <option value="fantasy art">Arte de Fantasia</option>
            <option value="3d animation">Animação 3D</option>
            <option value="oil painting">Pintura a Óleo</option>
            <option value="cyberpunk">Cyberpunk</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Gerando...' : 'Gerar Prompt Avançado'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {advancedPrompt && (
        <div className="result-container">
          <h2>Seu Prompt Otimizado:</h2>
          <div className="prompt-box">
            <p>{advancedPrompt}</p>
          </div>
          <button onClick={handleCopy} className="copy-button">Copiar Prompt</button>
        </div>
      )}
    </div>
  );
}

export default App;
