import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';

export default function SocialMediaGenerator() {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para usar.');

      // URL do Render para produção
      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-social-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            text,
            user_id: user.id 
        }),
      });

      const data = await response.json();

      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro ao gerar.');

      setResults(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    alert("Copiado!");
  };

  return (
    <div className="container">
      <header>
        <h1>Gerador Social Media 📱</h1>
        <p>Um texto, três versões: Instagram, LinkedIn e Twitter.</p>
      </header>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{textAlign: 'left'}}>
          <label>Cole seu texto base, ideia ou notícia:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: Lançamos hoje uma nova ferramenta de IA..."
            required
            style={{ minHeight: '100px' }}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Criando Posts (-1 Crédito)...' : 'Gerar Conteúdo'}
        </button>
      </form>

      {error && <div className="error-message" style={{color: '#ff6b6b', marginTop: '20px'}}>{error}</div>}

      {results && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '40px' }}>
          
          {/* Instagram */}
          <div style={{ backgroundColor: '#1f2937', border: '1px solid #d946ef', borderRadius: '12px', padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: '#d946ef', marginBottom: '10px' }}>📸 Instagram</h3>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px', color: '#e5e7eb', flexGrow: 1 }}>{results.instagram}</p>
            <button onClick={() => copyToClipboard(results.instagram)} className="copy-button" style={{ width: '100%', marginTop: '15px', fontSize: '12px' }}>Copiar</button>
          </div>

          {/* LinkedIn */}
          <div style={{ backgroundColor: '#1f2937', border: '1px solid #0ea5e9', borderRadius: '12px', padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: '#0ea5e9', marginBottom: '10px' }}>💼 LinkedIn</h3>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px', color: '#e5e7eb', flexGrow: 1 }}>{results.linkedin}</p>
            <button onClick={() => copyToClipboard(results.linkedin)} className="copy-button" style={{ width: '100%', marginTop: '15px', fontSize: '12px', backgroundColor: '#0284c7' }}>Copiar</button>
          </div>

          {/* Twitter */}
          <div style={{ backgroundColor: '#1f2937', border: '1px solid #ffffff', borderRadius: '12px', padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '10px' }}>🐦 Twitter / X</h3>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px', color: '#e5e7eb', flexGrow: 1 }}>{results.twitter}</p>
            <button onClick={() => copyToClipboard(results.twitter)} className="copy-button" style={{ width: '100%', marginTop: '15px', fontSize: '12px', backgroundColor: '#333' }}>Copiar</button>
          </div>

        </div>
      )}
    </div>
  );
}