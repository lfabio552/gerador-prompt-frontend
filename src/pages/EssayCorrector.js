import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';

export default function EssayCorrector() {
  const [theme, setTheme] = useState('');
  const [essay, setEssay] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para corrigir sua redação.');

      const response = await fetch('https://meu-gerador-backend.onrender.com/correct-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            theme,
            essay,
            user_id: user.id 
        }),
      });

      const data = await response.json();

      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro ao corrigir.');

      setResult(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 900) return '#4ade80'; // Verde
    if (score >= 700) return '#facc15'; // Amarelo
    return '#ef4444'; // Vermelho
  };

  return (
    <div className="container">
      <header>
        <h1>Corretor de Redação ENEM 📝</h1>
        <p>Receba sua nota e correções detalhadas em segundos.</p>
      </header>
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Tema da Redação:</label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ex: Os desafios da mobilidade urbana no Brasil"
            required
            style={{ width: '95%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
          />
        </div>

        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Sua Redação:</label>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Cole seu texto aqui..."
            required
            style={{ minHeight: '300px', width: '95%', padding: '15px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white', fontFamily: 'sans-serif', fontSize: '16px' }}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Corrigindo (-1 Crédito)...' : 'Enviar para Correção'}
        </button>
      </form>

      {error && <div className="error-message" style={{color: '#ff6b6b', marginTop: '20px'}}>{error}</div>}

      {result && (
        <div className="result-container" style={{textAlign: 'left', marginTop: '40px', border: '1px solid #374151', padding: '0', overflow: 'hidden'}}>
            
            {/* CABEÇALHO DA NOTA */}
            <div style={{ backgroundColor: '#1f2937', padding: '30px', textAlign: 'center', borderBottom: '1px solid #374151' }}>
                <h3 style={{ margin: 0, color: '#9ca3af' }}>SUA NOTA GERAL</h3>
                <h1 style={{ fontSize: '4rem', margin: '10px 0', color: getScoreColor(result.total_score) }}>
                    {result.total_score}
                </h1>
            </div>

            {/* COMPETÊNCIAS */}
            <div style={{ padding: '20px' }}>
                <h3 style={{ color: '#a855f7', marginBottom: '15px' }}>Detalhes por Competência:</h3>
                {Object.entries(result.competencies).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #374151' }}>
                        <span style={{ fontWeight: 'bold', color: '#e5e7eb' }}>Competência {key}: </span>
                        <span style={{ color: '#d1d5db' }}>{value}</span>
                    </div>
                ))}
            </div>

            {/* FEEDBACK GERAL */}
            <div style={{ padding: '20px', backgroundColor: '#111827' }}>
                <h3 style={{ color: '#facc15', marginBottom: '10px' }}>💡 Dicas de Melhoria:</h3>
                <p style={{ color: '#d1d5db', lineHeight: '1.6' }}>{result.feedback}</p>
      <ExemplosSection ferramentaId="corretor-redacao" />

            </div>
        </div>
      )}
    </div>
  );
}