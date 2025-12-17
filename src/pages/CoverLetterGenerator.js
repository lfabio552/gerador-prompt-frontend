import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';

export default function CoverLetterGenerator() {
  const [cvText, setCvText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [tone, setTone] = useState('Profissional e Confiante');
  const [letter, setLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setLetter('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para gerar sua carta.');

      // --- TROQUE PELO SEU LINK DO RENDER ---
      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            cv_text: cvText,
            job_desc: jobDesc,
            tone: tone,
            user_id: user.id 
        }),
      });

      const data = await response.json();

      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro ao gerar carta.');

      setLetter(data.cover_letter);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
    alert('Carta copiada!');
  };

  return (
    <div className="container">
      <header>
        <h1>Gerador de Carta de Apresentação ✍️</h1>
        <p>Aumente suas chances de entrevista com uma carta persuasiva.</p>
      </header>
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* COLUNA 1: Currículo */}
            <div className="form-group" style={{ flex: 1, minWidth: '300px', textAlign: 'left' }}>
              <label>1. Resumo do seu Currículo/Experiência:</label>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Ex: Tenho 5 anos de experiência com Vendas B2B, formei em Administração..."
                required
                style={{ minHeight: '200px', width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
              />
            </div>

            {/* COLUNA 2: Vaga */}
            <div className="form-group" style={{ flex: 1, minWidth: '300px', textAlign: 'left' }}>
              <label>2. Descrição da Vaga (Copie do LinkedIn):</label>
              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Ex: Buscamos vendedor com experiência em CRM e negociação..."
                required
                style={{ minHeight: '200px', width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
              />
      <ExemplosSection ferramentaId="gerador-carta" />

            </div>
        </div>

        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>3. Tom de Voz:</label>
          <select 
            value={tone} 
            onChange={(e) => setTone(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
          >
            <option>Profissional e Confiante (Padrão)</option>
            <option>Criativo e Inovador (Startups)</option>
            <option>Apaixonado e Entusiasta</option>
            <option>Direto e Executivo</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Escrevendo (-1 Crédito)...' : 'Gerar Carta'}
        </button>
      </form>

      {error && <div className="error-message" style={{color: '#ff6b6b', marginTop: '20px'}}>{error}</div>}

      {letter && (
        <div className="result-container" style={{textAlign: 'left', marginTop: '40px'}}>
            <h2 style={{color: '#a855f7'}}>Sua Carta Personalizada:</h2>
            <div className="prompt-box" style={{ whiteSpace: 'pre-wrap', fontFamily: 'serif', fontSize: '1.1rem', lineHeight: '1.6' }}>
                {letter}
            </div>
            <button onClick={copyToClipboard} className="copy-button">Copiar Texto</button>
        </div>
      )}
    </div>
  );
}