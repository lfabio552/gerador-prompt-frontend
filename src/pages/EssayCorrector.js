import React, { useState, useEffect } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';
import { saveToHistory, TOOL_CONFIGS } from '../utils/saveToHistory';
import HistoryList from '../components/HistoryList';

export default function EssayCorrector() {
  const [theme, setTheme] = useState('');
  const [essay, setEssay] = useState('');
  const [result, setResult] = useState(null);
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
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para corrigir sua redação.');
      setUser(user);

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

      // SALVAR HISTÓRICO
      await saveToHistory(
        user,
        TOOL_CONFIGS.ESSAY_CORRECT,
        `Tema: ${theme}\n\nRedação: ${essay.substring(0, 300)}${essay.length > 300 ? '...' : ''}`,
        JSON.stringify({
          total_score: data.total_score,
          feedback: data.feedback.substring(0, 200) + '...'
        }),
        { 
          theme: theme,
          essay_length: essay.length,
          score: data.total_score,
          competencies_count: Object.keys(data.competencies || {}).length
        }
      );

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

  const getScoreLabel = (score) => {
    if (score >= 900) return 'Excelente';
    if (score >= 700) return 'Bom';
    if (score >= 500) return 'Regular';
    return 'Precisa melhorar';
  };

  const clearFields = () => {
    setTheme('');
    setEssay('');
    setResult(null);
    setError('');
  };

  return (
    <div className="container">
      <header>
        <h1>Corretor de Redação ENEM 📝</h1>
        <p>Receba sua nota e correções detalhadas em segundos.</p>
        
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
          <HistoryList user={user} toolType="essay" />
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Tema da Redação:</label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ex: Os desafios da mobilidade urbana no Brasil"
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
          <label>Sua Redação (mínimo 300 caracteres):</label>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Cole seu texto aqui... Lembre-se de incluir introdução, desenvolvimento e conclusão."
            required
            style={{ 
              minHeight: '300px', 
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
            textAlign: 'right', 
            marginTop: '5px',
            color: essay.length < 300 ? '#ef4444' : '#9ca3af',
            fontSize: '14px'
          }}>
            {essay.length} caracteres {essay.length < 300 && '(mínimo 300)'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
          <button 
            type="submit" 
            disabled={isLoading || essay.length < 300}
            style={{
              padding: '15px 30px',
              backgroundColor: isLoading || essay.length < 300 ? '#4c1d95' : '#7e22ce',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading || essay.length < 300 ? 'not-allowed' : 'pointer',
              opacity: isLoading || essay.length < 300 ? 0.8 : 1,
              minWidth: '200px'
            }}
          >
            {isLoading ? '📝 Corrigindo (-1 Crédito)...' : '✨ Enviar para Correção'}
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

      {result && (
        <div className="result-container" style={{
          textAlign: 'left', 
          marginTop: '40px', 
          border: 'none',
          padding: '0', 
          overflow: 'hidden',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}>
            
          {/* CABEÇALHO DA NOTA */}
          <div style={{ 
            backgroundColor: '#1f2937', 
            padding: '30px', 
            textAlign: 'center', 
            borderBottom: '1px solid #374151' 
          }}>
            <h3 style={{ margin: 0, color: '#9ca3af', fontSize: '18px' }}>
              SUA NOTA GERAL
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '20px',
              marginTop: '15px'
            }}>
              <h1 style={{ 
                fontSize: '4rem', 
                margin: '10px 0', 
                color: getScoreColor(result.total_score),
                textShadow: '0 0 20px rgba(74, 222, 128, 0.3)'
              }}>
                {result.total_score}
              </h1>
              <div style={{ textAlign: 'left' }}>
                <div style={{ 
                  backgroundColor: getScoreColor(result.total_score),
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}>
                  {getScoreLabel(result.total_score)}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                  Máxima: 1000 pontos
                </div>
              </div>
            </div>
          </div>

          {/* COMPETÊNCIAS */}
          <div style={{ padding: '25px', backgroundColor: '#111827' }}>
            <h3 style={{ 
              color: '#a855f7', 
              marginBottom: '20px',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              📊 Detalhes por Competência
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {Object.entries(result.competencies || {}).map(([key, value]) => (
                <div key={key} style={{ 
                  marginBottom: '0',
                  padding: '20px',
                  backgroundColor: '#1f2937',
                  borderRadius: '10px',
                  border: '1px solid #374151',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#e5e7eb',
                      fontSize: '16px'
                    }}>
                      Competência {key}
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      backgroundColor: '#374151',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      color: '#d1d5db'
                    }}>
                      {key === '1' ? 'Domínio da norma' :
                       key === '2' ? 'Compreensão' :
                       key === '3' ? 'Argumentação' :
                       key === '4' ? 'Coesão' :
                       key === '5' ? 'Proposta' : 'Geral'}
                    </span>
                  </div>
                  <p style={{ 
                    color: '#d1d5db', 
                    lineHeight: '1.5',
                    fontSize: '14px',
                    margin: 0
                  }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* FEEDBACK GERAL */}
          <div style={{ 
            padding: '25px', 
            backgroundColor: '#1f2937',
            borderTop: '1px solid #374151'
          }}>
            <h3 style={{ 
              color: '#facc15', 
              marginBottom: '15px',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              💡 Dicas de Melhoria
            </h3>
            <div style={{ 
              color: '#d1d5db', 
              lineHeight: '1.6',
              fontSize: '15px',
              padding: '20px',
              backgroundColor: '#111827',
              borderRadius: '10px',
              border: '1px solid #374151',
              whiteSpace: 'pre-wrap'
            }}>
              {result.feedback}
            </div>
            
            <div style={{ 
              marginTop: '25px',
              padding: '15px',
              backgroundColor: '#4c1d95',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <p style={{ 
                color: '#e9d5ff', 
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                <strong>💪 Próximos passos:</strong> Revise as competências com menor desempenho, 
                pratique com temas similares e foque na estruturação dos parágrafos para melhorar sua pontuação.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <ExemplosSection ferramentaId="corretor-redacao" />
    </div>
  );
}