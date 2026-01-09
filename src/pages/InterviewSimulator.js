import React, { useState, useEffect } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';
import { saveToHistory, TOOL_CONFIGS } from '../utils/saveToHistory';
import HistoryList from '../components/HistoryList';

export default function InterviewSimulator() {
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

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
    setResult(null);
    setExpandedQuestion(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para simular a entrevista.');
      setUser(user);

      const response = await fetch('https://meu-gerador-backend.onrender.com/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role,
          description,
          user_id: user.id 
        }),
      });

      const data = await response.json();

      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro ao gerar simulação.');

      setResult(data);

      // SALVAR HISTÓRICO
      await saveToHistory(
        user,
        TOOL_CONFIGS.INTERVIEW_SIM,
        `Vaga: ${role}\n\nDescrição: ${description.substring(0, 300)}${description.length > 300 ? '...' : ''}`,
        JSON.stringify({
          questions_count: data.questions?.length || 0,
          tips: data.tips?.slice(0, 3) || []
        }),
        { 
          role: role,
          questions_count: data.questions?.length || 0,
          tips_count: data.tips?.length || 0
        }
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFields = () => {
    setRole('');
    setDescription('');
    setResult(null);
    setError('');
    setExpandedQuestion(null);
  };

  const toggleQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  return (
    <div className="container">
      <header>
        <h1>Simulador de Entrevista 💼</h1>
        <p>Descubra as perguntas que o RH vai fazer e saiba como responder.</p>
        
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
          <HistoryList user={user} toolType="interview" />
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Cargo / Vaga:</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex: Desenvolvedor Júnior, Gerente de Vendas, Analista de Marketing..."
            required
            style={{ 
              width: '95%', 
              padding: '12px', 
              marginBottom: '15px', 
              borderRadius: '8px', 
              border: '1px solid #4b5563', 
              backgroundColor: '#374151', 
              color: 'white' 
            }}
          />
        </div>

        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Descrição da Vaga (Copie e cole do LinkedIn/Vagas.com):</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Requisitos: Experiência com React, Python, banco de dados. Responsabilidades: Desenvolvimento front-end, integração com APIs, manutenção de sistemas..."
            required
            style={{ 
              minHeight: '150px', 
              width: '95%', 
              padding: '15px', 
              borderRadius: '8px', 
              border: '1px solid #4b5563', 
              backgroundColor: '#374151', 
              color: 'white' 
            }}
          />
          <div style={{ 
            marginTop: '5px',
            color: '#9ca3af',
            fontSize: '14px',
            fontStyle: 'italic'
          }}>
            💡 Quanto mais detalhada a descrição, mais precisa será a simulação
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
              minWidth: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {isLoading ? (
              <>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Preparando...
              </>
            ) : '🎯 Simular Entrevista'}
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
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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

      {result && (
        <div className="result-container" style={{
          textAlign: 'left', 
          marginTop: '40px', 
          padding: '0', 
          overflow: 'hidden', 
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}>
            
          {/* DICAS DE OURO */}
          <div style={{ 
            backgroundColor: '#4c1d95', 
            padding: '25px', 
            borderRadius: '12px',
            marginBottom: '30px',
            border: '1px solid #7e22ce'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#7e22ce',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                ⚠️
              </div>
              <h3 style={{ 
                margin: 0, 
                color: '#e9d5ff', 
                fontSize: '20px'
              }}>
                O que NÃO falar (Armadilhas comuns)
              </h3>
            </div>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '25px', 
              color: '#fff',
              lineHeight: '1.6'
            }}>
              {result.tips.map((tip, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>{tip}</li>
              ))}
            </ul>
          </div>

          {/* PERGUNTAS E RESPOSTAS */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h2 style={{ 
                color: '#a855f7', 
                margin: 0,
                fontSize: '22px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🗣️ Perguntas Prováveis & Respostas Ideais
              </h2>
              <div style={{ 
                backgroundColor: '#374151',
                color: '#d1d5db',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {result.questions.length} perguntas
              </div>
            </div>
            
            {result.questions.map((item, index) => (
              <div 
                key={index} 
                style={{ 
                  marginBottom: '15px', 
                  backgroundColor: '#1f2937', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  border: '1px solid #374151',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onClick={() => toggleQuestion(index)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7e22ce'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#374151'}
              >
                <div style={{ 
                  padding: '18px 20px', 
                  backgroundColor: '#374151', 
                  fontWeight: 'bold', 
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: '#7e22ce',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                    <span>P: {item.q}</span>
                  </div>
                  <div style={{ 
                    fontSize: '20px',
                    color: '#9ca3af',
                    transition: 'transform 0.3s',
                    transform: expandedQuestion === index ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </div>
                </div>
                
                {expandedQuestion === index && (
                  <div style={{ 
                    padding: '25px', 
                    color: '#d1d5db', 
                    lineHeight: '1.6',
                    borderTop: '1px solid #374151',
                    backgroundColor: '#111827'
                  }}>
                    <div style={{ 
                      color: '#34d399', 
                      fontWeight: 'bold',
                      marginBottom: '15px',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      💡 Melhor Resposta
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {item.a}
                    </div>
                    
                    <div style={{ 
                      marginTop: '20px',
                      padding: '15px',
                      backgroundColor: '#1f2937',
                      borderRadius: '8px',
                      borderLeft: '4px solid #f59e0b'
                    }}>
                      <div style={{ 
                        color: '#f59e0b', 
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}>
                        📌 Ponto-chave:
                      </div>
                      <div style={{ color: '#d1d5db', fontSize: '14px' }}>
                        {item.a.split('.')[0]}. Destaque sua experiência e resultados.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* DICAS FINAIS */}
          <div style={{ 
            backgroundColor: '#065f46', 
            padding: '25px', 
            borderRadius: '12px',
            border: '1px solid #10b981'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                💪
              </div>
              <h3 style={{ 
                margin: 0, 
                color: '#d1fae5', 
                fontSize: '20px'
              }}>
                Prepare-se para o Sucesso
              </h3>
            </div>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px',
                  color: '#10b981',
                  marginBottom: '10px'
                }}>
                  🎯
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>
                  Pratique em voz alta
                </div>
                <div style={{ color: '#d1fae5', fontSize: '14px' }}>
                  Grave suas respostas e analise
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px',
                  color: '#10b981',
                  marginBottom: '10px'
                }}>
                  📚
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>
                  Estude a empresa
                </div>
                <div style={{ color: '#d1fae5', fontSize: '14px' }}>
                  Conheça missão, valores, produtos
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px',
                  color: '#10b981',
                  marginBottom: '10px'
                }}>
                  ⏱️
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>
                  Controle o tempo
                </div>
                <div style={{ color: '#d1fae5', fontSize: '14px' }}>
                  Respostas de 1-2 minutos cada
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px',
                  color: '#10b981',
                  marginBottom: '10px'
                }}>
                  🤝
                </div>
                <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>
                  Tenha perguntas prontas
                </div>
                <div style={{ color: '#d1fae5', fontSize: '14px' }}>
                  Mostre interesse genuíno
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ExemplosSection ferramentaId="simulador-entrevista" />
    </div>
  );
}