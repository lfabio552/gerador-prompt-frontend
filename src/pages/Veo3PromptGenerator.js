import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Função mock para evitar erros de import
const mockSaveToHistory = async () => {};
const mockHistoryList = () => <div>Histórico</div>;
const mockExemplosSection = () => <div>Exemplos</div>;

export default function Veo3PromptGenerator() {
  const [idea, setIdea] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // URL fixa do backend
  const BACKEND_URL = 'https://meu-gerador-backend.onrender.com';

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.log('Erro ao obter usuário:', err);
      }
    };
    getUser();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!idea.trim()) return;
    
    setIsLoading(true);
    setError('');
    setGeneratedPrompt('');

    try {
      // Verificar se usuário está logado
      const { data } = await supabase.auth.getUser();
      if (!data || !data.user) {
        throw new Error('Faça login para usar esta ferramenta.');
      }

      const response = await fetch(`${BACKEND_URL}/generate-veo3-prompt`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          idea: idea.trim(),
          user_id: data.user.id,
          model: 'Veo 3'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      setGeneratedPrompt(result.prompt || result.advanced_prompt || 'Prompt gerado com sucesso!');

    } catch (err) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      alert('Prompt copiado para a área de transferência!');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#111827', 
      color: 'white', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        paddingTop: '20px'
      }}>
        
        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '10px',
            background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            🎥 Criador de Prompts para Vídeo
          </h1>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '1.1rem',
            lineHeight: '1.6'
          }}>
            Gere descrições cinematográficas otimizadas para Veo 3, Sora e Runway
          </p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(127, 29, 29, 0.3)',
            color: '#fca5a5',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ef4444',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>⚠️ Erro:</strong> {error}</span>
              <button 
                onClick={() => setError('')}
                style={{
                  background: 'transparent',
                  color: '#fca5a5',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '0 5px'
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Área principal */}
        <div style={{ 
          backgroundColor: '#1f2937', 
          padding: '30px', 
          borderRadius: '16px',
          border: '1px solid #374151',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          marginBottom: '30px'
        }}>
          
          {/* Campo de entrada */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              ✨ Descreva sua cena:
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Ex: Uma cena de drone sobrevoando uma floresta tropical ao amanhecer, com cachoeiras cintilantes e névoa suave entre as árvores..."
              required
              style={{
                width: '100%',
                height: '120px',
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: '#111827',
                color: 'white',
                border: '2px solid #4b5563',
                fontSize: '16px',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#4b5563'}
            />
            <div style={{ 
              color: '#9ca3af', 
              fontSize: '0.9rem',
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>💡 Dica: Seja descritivo com cenário, ação, emoção e estilo visual.</span>
              <span>{idea.length}/500</span>
            </div>
          </div>

          {/* Botão de gerar */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !idea.trim()}
            style={{
              width: '100%',
              padding: '16px',
              background: isLoading || !idea.trim() 
                ? '#4b5563' 
                : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              cursor: isLoading ? 'wait' : 'pointer',
              opacity: (!idea.trim() || isLoading) ? 0.7 : 1,
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              if (!isLoading && idea.trim()) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 20px rgba(139, 92, 246, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {isLoading ? (
              <>
                <span style={{ marginRight: '10px' }}>⏳</span>
                Gerando seu prompt cinematográfico...
              </>
            ) : (
              <>
                <span style={{ marginRight: '10px' }}>🎬</span>
                Gerar Prompt de Vídeo
              </>
            )}
          </button>

          {/* Resultado */}
          {generatedPrompt && (
            <div style={{ 
              marginTop: '35px',
              animation: 'fadeIn 0.5s ease-out'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ 
                  color: '#ddd6fe', 
                  fontSize: '1.3rem',
                  margin: 0
                }}>
                  📝 Prompt Cinematográfico Gerado:
                </h3>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(91, 33, 182, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(91, 33, 182, 1)'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(91, 33, 182, 0.8)'}
                >
                  <span>📋</span>
                  Copiar
                </button>
              </div>
              
              <div style={{
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                padding: '20px',
                borderRadius: '10px',
                border: '2px solid rgba(139, 92, 246, 0.5)',
                borderLeft: '5px solid #8b5cf6',
                backdropFilter: 'blur(10px)'
              }}>
                <pre style={{ 
                  color: '#d1d5db', 
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '15px',
                  margin: 0,
                  overflowWrap: 'break-word'
                }}>
                  {generatedPrompt}
                </pre>
              </div>
              
              <div style={{ 
                marginTop: '15px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setGeneratedPrompt('')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#374151'}
                >
                  Limpar
                </button>
                <button
                  onClick={() => setIdea('')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#374151'}
                >
                  Nova Ideia
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Exemplos */}
        <div style={{ 
          backgroundColor: '#1f2937',
          padding: '25px',
          borderRadius: '12px',
          border: '1px solid #374151'
        }}>
          <h3 style={{ 
            color: '#ddd6fe', 
            marginBottom: '15px',
            fontSize: '1.2rem'
          }}>
            💡 Exemplos para inspirar:
          </h3>
          <ul style={{ 
            color: '#9ca3af', 
            paddingLeft: '20px',
            lineHeight: '1.8'
          }}>
            <li>Uma corrida de carros futuristas em uma cidade cyberpunk à noite, com chuva e neon refletindo nas ruas molhadas</li>
            <li>Macaco astronauta flutuando dentro de uma nave espacial, olhando para a Terra através da janela</li>
            <li>Time-lapse de uma flor desabrochando em um jardim mágico com fadas luminosas ao redor</li>
            <li>Cena de luta em câmera lenta entre samurais em um campo de cerejeiras durante o pôr do sol</li>
          </ul>
          <div style={{ 
            marginTop: '20px',
            padding: '15px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <p style={{ 
              color: '#c4b5fd', 
              margin: 0,
              fontSize: '0.95rem',
              fontStyle: 'italic'
            }}>
              <strong>Dica profissional:</strong> Inclua sempre o movimento da câmera (zoom in, drone shot, tracking), 
              iluminação (golden hour, neon lights, soft glow) e estilo visual (cinematic, anime, realistic VFX).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #374151',
          color: '#6b7280',
          fontSize: '0.9rem'
        }}>
          <p>✨ Compatível com Google Veo 3, OpenAI Sora, Runway Gen-3 e outras IAs de vídeo</p>
        </div>
      </div>

      {/* Estilos CSS inline */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        textarea:focus {
          outline: none;
        }
        
        button:disabled {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
