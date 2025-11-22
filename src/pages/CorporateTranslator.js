import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';

export default function CorporateTranslator() {
  const [rawText, setRawText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [tone, setTone] = useState('Profissional');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTranslatedText('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Login necessário.');

      // Mude para o link do Render no deploy final
      const response = await fetch('https://meu-gerador-backend.onrender.com/corporate-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            text: rawText,
            tone: tone,
            user_id: user.id 
        }),
      });

      const data = await response.json();

      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro ao traduzir.');

      setTranslatedText(data.translated_text);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Tradutor Corporativo 👔</h1>
        <p>Transforme pensamentos "sinceros" em e-mails profissionais.</p>
      </header>
      
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
        
        {/* ÁREA DE ENTRADA */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>O que você quer dizer (sem filtro):</label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Ex: Não vou fazer isso hoje nem a pau, tô cheio de coisa."
              required
              style={{ minHeight: '150px', border: '1px solid #ef4444' }} // Borda vermelha pra indicar "perigo"
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Tom desejado:</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Profissional (Padrão)</option>
              <option>Diplomático (Muito educado)</option>
              <option>Executivo (Direto e Líder)</option>
              <option>Jurídico (Formal)</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Traduzindo (-1 Crédito)...' : 'Profissionalizar Texto'}
          </button>
        </form>

        {error && <div className="error-message" style={{color: '#ff6b6b'}}>{error}</div>}

        {/* ÁREA DE RESULTADO */}
        {translatedText && (
          <div className="result-container" style={{textAlign: 'left', border: '1px solid #22c55e', backgroundColor: '#064e3b'}}>
            <h2 style={{color: '#4ade80'}}>Versão Corporativa:</h2>
            <div className="prompt-box" style={{whiteSpace: 'pre-wrap', backgroundColor: '#1f2937'}}>
              <p>{translatedText}</p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(translatedText)} className="copy-button">
              Copiar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}