import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';

export default function TextSummarizer() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setCharCount(newText.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      // 1. Verificar se usuário está logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para usar o resumidor.');

      // 2. Validação básica
      if (text.length < 50) {
        throw new Error('Texto muito curto. Mínimo 50 caracteres.');
      }

      // 3. Chamar API
      const response = await fetch('https://meu-gerador-backend.onrender.com/summarize-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text,
          user_id: user.id 
        }),
      });

      const data = await response.json();

      // 4. Verificar erros
      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro ao resumir texto.');

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
        <h1>Resumidor de Textos Longos 📝</h1>
        <p>Cole textos extensos e receba um resumo conciso.</p>
        <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '5px' }}>
          <strong>⚠️ Atenção:</strong> Consome 1 crédito. Limite: 15.000 caracteres.
        </p>
      </header>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Cole seu texto aqui (mínimo 50 caracteres):
            <span style={{ float: 'right', color: charCount > 15000 ? '#ef4444' : '#9ca3af', fontSize: '0.9rem' }}>
              {charCount} / 15.000 caracteres
            </span>
          </label>
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Ex: Cole aqui artigos, documentos, transcrições, apostilas..."
            required
            style={{ 
              minHeight: '300px', 
              width: '95%', 
              padding: '15px', 
              borderRadius: '8px', 
              border: charCount > 15000 ? '2px solid #ef4444' : '1px solid #4b5563', 
              backgroundColor: '#374151', 
              color: 'white',
              fontSize: '16px',
              fontFamily: 'sans-serif',
              resize: 'vertical'
            }}
            maxLength="15000"
          />
          {charCount > 15000 && (
            <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '5px' }}>
              ❌ Limite excedido. Os primeiros 15.000 caracteres serão processados.
            </p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isLoading || text.length < 50}
          style={{
            opacity: (isLoading || text.length < 50) ? 0.5 : 1,
            cursor: (isLoading || text.length < 50) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Processando (-1 Crédito)...' : 'Gerar Resumo'}
        </button>
      </form>

      {error && (
        <div className="error-message" style={{ 
          color: '#ff6b6b', 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#450a0a',
          borderRadius: '8px',
          border: '1px solid #dc2626'
        }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      {summary && (
        <div className="result-container" style={{ textAlign: 'left', marginTop: '40px' }}>
          <h2 style={{ color: '#10b981' }}>📋 Resumo Gerado:</h2>
          <div className="prompt-box" style={{ 
            whiteSpace: 'pre-wrap',
            backgroundColor: '#1f2937',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #374151',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            <p style={{ lineHeight: '1.6', margin: 0 }}>{summary}</p>
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => navigator.clipboard.writeText(summary)} 
              className="copy-button"
            >
              📋 Copiar Resumo
            </button>
            <button 
              onClick={() => {
                setText('');
                setSummary('');
                setCharCount(0);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                border: '1px solid #6b7280',
                color: '#9ca3af',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🔄 Novo Texto
            </button>
      <ExemplosSection ferramentaId="resumir-texto" />

          </div>
        </div>
      )}
    </div>
  );
}