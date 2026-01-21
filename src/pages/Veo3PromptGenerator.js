import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import config from '../config';
import { saveToHistory, TOOL_CONFIGS } from '../utils/saveToHistory';
import HistoryList from '../components/HistoryList';
import ExemplosSection from '../components/ExemplosSection';

export default function Veo3PromptGenerator() {
  const [idea, setIdea] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleLoadFromHistory = (event) => {
      if (event.detail && event.detail.text) {
        setIdea(event.detail.text); 
        setShowHistory(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('loadFromHistory', handleLoadFromHistory);
    return () => {
      window.removeEventListener('loadFromHistory', handleLoadFromHistory);
    };
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setGeneratedPrompt('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para continuar.');

      const endpoint = config.ENDPOINTS?.GENERATE_VIDEO_PROMPT || 
                      `${config.BACKEND_URL || 'https://meuappprompt-backend.onrender.com'}/generate-veo3-prompt`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          idea,
          user_id: user.id,
          model: 'Veo 3'
        }),
      });
      
      if (!response.ok) {
        if (response.status === 402) {
          throw new Error('Créditos insuficientes! Compre mais créditos ou assine o plano Pro.');
        }
        if (response.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.prompt && !data.advanced_prompt) {
        throw new Error('Resposta inválida do servidor.');
      }

      setGeneratedPrompt(data.prompt || data.advanced_prompt);

      await saveToHistory(
        user,
        TOOL_CONFIGS.VEO3_PROMPT,
        idea,
        data.prompt || data.advanced_prompt,
        { type: 'video' }
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '10px' }}>
          🎥 Criador de Prompts para Vídeo
        </h1>
        <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '30px' }}>
          Gere descrições cinematográficas para Sora, Runway e Google Veo.
        </p>

        {error && (
          <div style={{
            backgroundColor: '#7f1d1d',
            color: '#fca5a5',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ef4444'
          }}>
            <strong>Erro:</strong> {error}
            <button 
              onClick={() => setError('')}
              style={{
                marginLeft: '10px',
                background: 'transparent',
                color: '#fca5a5',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
        )}

        {user && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                padding: '8px 16px',
                backgroundColor: showHistory ? '#7e22ce' : '#374151',
                color: '#d1d5db',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {showHistory ? '▲ Ocultar Histórico' : '📚 Ver Ideias Anteriores'}
            </button>
          </div>
        )}

        {showHistory && user && (
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#1f2937', borderRadius: '10px' }}>
            <HistoryList user={user} toolType="video-prompt" />
          </div>
        )}

        <div style={{ 
          backgroundColor: '#1f2937', 
          padding: '30px', 
          borderRadius: '12px', 
          border: '1px solid #374151'
        }}>
          <form onSubmit={handleGenerate}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ marginBottom: '10px' }}>Descreva sua cena:</label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Ex: Drone sobrevoando uma floresta tropical com cachoeiras ao amanhecer..."
                required
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  border: '1px solid #4b5563'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !idea.trim()}
              style={{
                width: '100%',
                padding: '15px',
                background: isLoading 
                  ? '#4b5563' 
                  : 'linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: isLoading ? 'wait' : 'pointer',
                opacity: (!idea.trim() || isLoading) ? 0.7 : 1
              }}
            >
              {isLoading ? '⏳ Escrevendo Roteiro...' : '🎬 Gerar Prompt de Vídeo'}
            </button>
          </form>

          {generatedPrompt && (
            <div style={{ 
              marginTop: '30px', 
              backgroundColor: '#111827', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '1px solid #8b5cf6'
            }}>
              <h3 style={{ color: '#ddd6fe', marginBottom: '10px' }}>Prompt Cinematográfico:</h3>
              <p style={{ 
                color: '#d1d5db', 
                lineHeight: '1.6', 
                marginBottom: '15px',
                whiteSpace: 'pre-wrap'
              }}>
                {generatedPrompt}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPrompt);
                  alert('Copiado!');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#5b21b6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                📋 Copiar
              </button>
            </div>
          )}
        </div>

        <ExemplosSection ferramentaId="video-prompt" />
      </div>
    </div>
  );
}
