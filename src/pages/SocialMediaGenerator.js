import React, { useState, useEffect } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';
import { saveToHistory, TOOL_CONFIGS } from '../utils/saveToHistory';
import HistoryList from '../components/HistoryList';

export default function SocialMediaGenerator() {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState({});

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
    setResults(null);
    setCopied({});

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para usar.');
      setUser(user);

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

      // SALVAR HISTÓRICO
      await saveToHistory(
        user,
        TOOL_CONFIGS.SOCIAL_MEDIA,
        text,
        JSON.stringify(data),
        { 
          platforms: ['instagram', 'linkedin', 'twitter'],
          original_length: text.length
        }
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (content, platform) => {
    navigator.clipboard.writeText(content);
    setCopied({...copied, [platform]: true});
    setTimeout(() => {
      setCopied({...copied, [platform]: false});
    }, 2000);
  };

  const clearFields = () => {
    setText('');
    setResults(null);
    setError('');
    setCopied({});
  };

  return (
    <div className="container">
      <header>
        <h1>Gerador Social Media 📱</h1>
        <p>Um texto, três versões: Instagram, LinkedIn e Twitter.</p>
        
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
          <HistoryList user={user} toolType="social" />
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{textAlign: 'left'}}>
          <label>Cole seu texto base, ideia ou notícia:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: Lançamos hoje uma nova ferramenta de IA que ajuda empresas a criar conteúdo 10x mais rápido..."
            required
            style={{ 
              minHeight: '150px',
              width: '95%',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #4b5563',
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
            💡 A IA vai criar versões otimizadas para cada rede social automaticamente
          </div>
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
            {isLoading ? '📱 Criando Posts (-1 Crédito)...' : '✨ Gerar Conteúdo'}
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

      {error && (
        <div className="error-message" style={{
          color: '#ff6b6b', 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#450a0a',
          borderRadius: '8px',
          border: '1px solid #dc2626'
        }}>
          <strong>⚠️ Erro:</strong> {error}
        </div>
      )}

      {results && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ 
            color: '#fbbf24', 
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            📊 Seus Posts Otimizados
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px'
          }}>
            
            {/* Instagram */}
            <div style={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #d946ef', 
              borderRadius: '12px', 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <h3 style={{ color: '#d946ef', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>📸</span> Instagram
                </h3>
                <div style={{ 
                  fontSize: '12px',
                  backgroundColor: '#d946ef',
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontWeight: 'bold'
                }}>
                  Stories/Feed
                </div>
              </div>
              
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '14px', 
                color: '#e5e7eb', 
                flexGrow: 1,
                lineHeight: '1.6',
                marginBottom: '15px',
                padding: '15px',
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {results.instagram}
              </div>
              
              <button 
                onClick={() => copyToClipboard(results.instagram, 'instagram')}
                style={{
                  padding: '10px',
                  backgroundColor: copied.instagram ? '#10b981' : '#d946ef',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s'
                }}
              >
                {copied.instagram ? '✅ Copiado!' : '📋 Copiar'}
              </button>
            </div>

            {/* LinkedIn */}
            <div style={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #0ea5e9', 
              borderRadius: '12px', 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <h3 style={{ color: '#0ea5e9', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>💼</span> LinkedIn
                </h3>
                <div style={{ 
                  fontSize: '12px',
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontWeight: 'bold'
                }}>
                  Profissional
                </div>
              </div>
              
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '14px', 
                color: '#e5e7eb', 
                flexGrow: 1,
                lineHeight: '1.6',
                marginBottom: '15px',
                padding: '15px',
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {results.linkedin}
              </div>
              
              <button 
                onClick={() => copyToClipboard(results.linkedin, 'linkedin')}
                style={{
                  padding: '10px',
                  backgroundColor: copied.linkedin ? '#10b981' : '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s'
                }}
              >
                {copied.linkedin ? '✅ Copiado!' : '📋 Copiar'}
              </button>
            </div>

            {/* Twitter */}
            <div style={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #ffffff', 
              borderRadius: '12px', 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <h3 style={{ color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🐦</span> Twitter / X
                </h3>
                <div style={{ 
                  fontSize: '12px',
                  backgroundColor: '#333',
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontWeight: 'bold'
                }}>
                  280 caracteres
                </div>
              </div>
              
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '14px', 
                color: '#e5e7eb', 
                flexGrow: 1,
                lineHeight: '1.6',
                marginBottom: '15px',
                padding: '15px',
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {results.twitter}
              </div>
              
              <button 
                onClick={() => copyToClipboard(results.twitter, 'twitter')}
                style={{
                  padding: '10px',
                  backgroundColor: copied.twitter ? '#10b981' : '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s'
                }}
              >
                {copied.twitter ? '✅ Copiado!' : '📋 Copiar'}
              </button>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '30px',
            padding: '15px',
            backgroundColor: '#4c1d95',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#e9d5ff', margin: 0, fontSize: '14px' }}>
              💡 <strong>Dica:</strong> Adicione hashtags relevantes e mencione perfis importantes para aumentar o alcance!
            </p>
          </div>
        </div>
      )}
      
      <ExemplosSection ferramentaId="social-media" />
    </div>
  );
}