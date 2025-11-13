import React, { useState } from 'react';
import '../App.css';

export default function VideoSummarizer() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      // Lembre-se: Para testar local, use http://localhost:5000
      // Para subir, troque pelo link do Render
      const response = await fetch('https://meu-gerador-backend.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao resumir vídeo.');
      }

      setSummary(data.summary);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Resumidor de Vídeos IA 📹</h1>
        <p>Cole o link de um vídeo do YouTube e economize tempo.</p>
      </header>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Link do YouTube:</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Ex: https://www.youtube.com/watch?v=..."
            required
            style={{ width: '95%', padding: '15px', marginTop: '10px', borderRadius: '8px', border: '1px solid #3A3A3A', backgroundColor: '#2A2A2A', color: 'white' }}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Analisando Vídeo...' : 'Gerar Resumo'}
        </button>
      </form>

      {error && <div className="error-message" style={{color: '#ff6b6b', marginTop: '20px'}}>{error}</div>}

      {summary && (
        <div className="result-container" style={{textAlign: 'left', marginTop: '40px'}}>
          <h2 style={{color: '#9D4EDD'}}>Resumo do Vídeo:</h2>
          <div className="prompt-box" style={{whiteSpace: 'pre-wrap'}}>
            {/* O pre-wrap mantem a formatação de parágrafos que o Gemini manda */}
            <p>{summary}</p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(summary)} className="copy-button">Copiar Resumo</button>
        </div>
      )}
    </div>
  );
}