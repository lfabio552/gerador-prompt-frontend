import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import config from '../config';
import { saveToHistory, TOOL_CONFIGS } from '../utils/saveToHistory';
import HistoryList from '../components/HistoryList';
import ExemplosSection from '../components/ExemplosSection';

// URL do backend - ajuste conforme necessário
const BACKEND_URL = 'https://meuappprompt-backend.onrender.com';
// Ou use do config: const BACKEND_URL = config.BACKEND_URL;

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

  // --- OUVINTE DO HISTÓRICO ---
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
      if (!user) {
        throw new Error('Faça login para usar esta ferramenta.');
      }

      console.log('Enviando para:', `${BACKEND_URL}/generate-veo3-prompt`);
      
      const response = await fetch(`${BACKEND_URL}/generate-veo3-prompt`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // mode: 'cors' é padrão, mas pode ajudar ser explícito
        mode: 'cors',
        body: JSON.stringify({
          idea: idea.trim(),
          user_id: user.id,
          model: 'Veo 3',
          style: '',
          camera: '',
          lighting: '',
          audio: ''
        }),
      });

      console.log('Status da resposta:', response.status);
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta não é JSON:', text);
        throw new Error('Resposta inválida do servidor.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Erro do servidor:', data);
        throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
      }

      // Verificar se veio o prompt
      if (!data.prompt && !data.advanced_prompt) {
        throw new Error('Resposta do servidor não contém prompt.');
      }

      const finalPrompt = data.prompt || data.advanced_prompt;
      setGeneratedPrompt(finalPrompt);

      // Salvar no Histórico
      try {
        await saveToHistory(
          user,
          TOOL_CONFIGS.VEO3_PROMPT,
          idea,
          finalPrompt,
          { 
            type: 'video',
            model: 'Veo 3',
            timestamp: new Date().toISOString()
          }
        );
      } catch (historyError) {
        console.warn('Erro ao salvar histórico:', historyError);
        // Não falha a operação principal se só o histórico falhar
      }

    } catch (err) {
      console.error('Erro completo:', err);
      
      // Mensagens mais amigáveis
      if (err.message.includes('Failed to fetch')) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else if (err.message.includes('401') || err.message.includes('403')) {
        setError('Sessão expirada. Faça login novamente.');
      } else if (err.message.includes('402')) {
        setError('Créditos insuficientes. Compre mais créditos ou assine o plano Pro.');
      } else {
        setError(err.message || 'Ocorreu um erro inesperado. Tente novamente.');
      }
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

        {/* Exibir erro se houver */}
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

        {/* Botão Histórico */}
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

        {/* Lista Histórico */}
        {showHistory && user && (
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#1f2937', borderRadius: '10px' }}>
            <HistoryList user={user} toolType="video-prompt" />
          </div>
        )}

        <div style={{ backgroundColor: '#1f2937', padding: '30px', borderRadius: '12px', border: '1px solid '#374151' }}>
          <form onSubmit={handleGenerate}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>Descreva sua cena:</label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Ex: Drone sobrevoando uma floresta tropical com cachoeiras ao amanhecer..."
                required
                minLength="10"
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: '#111827',
                  color: 'white',
                  border: '1px solid '#4b5563',
                  fontSize: '16px'
                }}
              />
              <small style={{ color: '#9ca3af', display: 'block', marginTop: '5px' }}>
                Descreva com detalhes: cenário, ação, personagens, emoção...
              </small>
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
              {isLoading ? (
                <>
                  <span style={{ marginRight: '8px' }}>⏳</span>
                  Escrevendo Roteiro...
                </>
              ) : (
                '🎬 Gerar Prompt de Vídeo'
              )}
            </button>
          </form>

          {generatedPrompt && (
            <div style={{ 
              marginTop: '30px', 
              backgroundColor: '#111827', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '1px solid '#8b5cf6',
              animation: 'fadeIn 0.5s ease-in'
            }}>
              <h3 style={{ 
                color: '#ddd6fe', 
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>📝</span> Prompt Cinematográfico:
              </h3>
              <div style={{
                backgroundColor: '#1a1a1a',
                padding: '15px',
                borderRadius: '6px',
                marginBottom: '15px',
                borderLeft: '4px solid '#8b5cf6'
              }}>
                <p style={{ 
                  color: '#d1d5db', 
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '15px'
                }}>
                  {generatedPrompt}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPrompt);
                    alert('Prompt copiado para a área de transferência!');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#5b21b6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  📋 Copiar
                </button>
                <button
                  onClick={() => setGeneratedPrompt('')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Limpar
                </button>
              </div>
            </div>
          )}
        </div>

        <ExemplosSection ferramentaId="video-prompt" />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
