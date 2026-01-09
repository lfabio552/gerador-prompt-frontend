import React, { useState, useEffect } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';
import { saveToHistory, TOOL_CONFIGS } from '../utils/saveToHistory';
import HistoryList from '../components/HistoryList';

export default function CorporateTranslator() {
  const [rawText, setRawText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [tone, setTone] = useState('Profissional');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Carregar usuário ao montar
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTranslatedText('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Login necessário.');
      setUser(user);

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

      // SALVAR HISTÓRICO
      await saveToHistory(
        user,
        TOOL_CONFIGS.CORPORATE_TRANSLATE,
        rawText,
        data.translated_text,
        { 
          tone: tone,
          original_length: rawText.length,
          translated_length: data.translated_text.length
        }
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    alert('Texto copiado para a área de transferência!');
  };

  const clearFields = () => {
    setRawText('');
    setTranslatedText('');
    setError('');
  };

  return (
    <div className="container">
      <header>
        <h1>Tradutor Corporativo 👔</h1>
        <p>Transforme pensamentos "sinceros" em e-mails profissionais.</p>
        
        {/* Botão de histórico */}
        {user && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: showHistory ? '#7e22ce' : '#374151',
              color: '#d1d5db',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            {showHistory ? '▲ Ocultar Histórico' : '📚 Ver Meu Histórico'}
          </button>
        )}
      </header>
      
      {/* Seção de histórico */}
      {showHistory && user && (
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#1f2937',
          borderRadius: '10px',
          border: '1px solid #374151'
        }}>
          <HistoryList user={user} toolType="translation" />
        </div>
      )}
      
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
              style={{ 
                minHeight: '150px',
                width: '95%',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #ef4444',
                backgroundColor: '#374151',
                color: 'white',
                fontFamily: 'sans-serif',
                fontSize: '16px'
              }}
            />
            <div style={{ 
              marginTop: '5px',
              color: '#9ca3af',
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              💡 Digite como falaria no WhatsApp, a IA transforma em linguagem corporativa
            </div>
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Tom desejado:</label>
            <select 
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
              style={{ 
                width: '95%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #4b5563',
                backgroundColor: '#374151',
                color: 'white',
                fontSize: '16px'
              }}
            >
              <option>Profissional (Padrão)</option>
              <option>Diplomático (Muito educado)</option>
              <option>Executivo (Direto e Líder)</option>
              <option>Jurídico (Formal)</option>
              <option>Amigável (Startup/Cultura jovem)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                padding: '15px 30px',
                backgroundColor: isLoading ? '#4c1d95' : '#7e22ce',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.8 : 1,
                minWidth: '200px'
              }}
            >
              {isLoading ? '📝 Traduzindo (-1 Crédito)...' : '✨ Profissionalizar Texto'}
            </button>
            
            <button 
              type="button"
              onClick={clearFields}
              style={{
                padding: '15px 20px',
                backgroundColor: '#374151',
                color: '#d1d5db',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🗑️ Limpar
            </button>
          </div>
        </form>

        {error && <div className="error-message" style={{color: '#ff6b6b', marginTop: '20px'}}>{error}</div>}

        {/* ÁREA DE RESULTADO */}
        {translatedText && (
          <div className="result-container" style={{
            textAlign: 'left', 
            marginTop: '20px', 
            border: '1px solid #22c55e', 
            backgroundColor: '#064e3b',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              backgroundColor: '#065f46',
              padding: '15px 20px',
              borderBottom: '1px solid #047857'
            }}>
              <h2 style={{color: '#4ade80', margin: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                ✅ Versão Corporativa
                <span style={{ 
                  fontSize: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: '20px'
                }}>
                  Tom: {tone}
                </span>
              </h2>
            </div>
            
            <div className="prompt-box" style={{
              whiteSpace: 'pre-wrap',
              padding: '20px',
              lineHeight: '1.6',
              minHeight: '100px'
            }}>
              <p style={{ color: '#d1fae5', margin: 0 }}>{translatedText}</p>
            </div>
            
            <div style={{ 
              padding: '15px 20px',
              backgroundColor: '#065f46',
              borderTop: '1px solid #047857',
              display: 'flex',
              gap: '10px'
            }}>
              <button 
                onClick={copyToClipboard} 
                className="copy-button"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📋 Copiar Texto
              </button>
              
              <button 
                onClick={() => setRawText(translatedText)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔄 Refinar ainda mais
              </button>
            </div>
          </div>
        )}
      </div>
      
      <ExemplosSection ferramentaId="tradutor-corporativo" />
    </div>
  );
}