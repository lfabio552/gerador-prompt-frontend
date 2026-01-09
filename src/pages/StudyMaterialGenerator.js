import React, { useState, useEffect } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';
import { saveToHistory, TOOL_CONFIGS } from '../utils/saveToHistory';
import HistoryList from '../components/HistoryList';

export default function StudyMaterialGenerator() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('quiz');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAnswers, setShowAnswers] = useState({});

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
    setShowAnswers({});

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para gerar material de estudo.');
      setUser(user);

      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-study-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text,
          mode: mode,
          user_id: user.id 
        }),
      });

      const data = await response.json();

      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro ao gerar material.');

      setResult(data);

      // SALVAR HISTÓRICO
      await saveToHistory(
        user,
        TOOL_CONFIGS.STUDY_MATERIAL,
        `Modo: ${mode === 'quiz' ? 'Quiz' : 'Flashcards'}\n\nConteúdo: ${text.substring(0, 300)}${text.length > 300 ? '...' : ''}`,
        JSON.stringify({
          type: mode,
          count: mode === 'quiz' ? data.questions?.length || 0 : data.flashcards?.length || 0
        }),
        { 
          mode: mode,
          content_length: text.length,
          items_count: mode === 'quiz' ? data.questions?.length || 0 : data.flashcards?.length || 0
        }
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnswer = (index) => {
    setShowAnswers({
      ...showAnswers,
      [index]: !showAnswers[index]
    });
  };

  const clearFields = () => {
    setText('');
    setResult(null);
    setError('');
    setShowAnswers({});
  };

  const downloadQuiz = () => {
    if (!result || !result.questions) return;
    
    const quizText = result.questions.map((q, i) => {
      return `Pergunta ${i + 1}: ${q.question}\n\nOpções:\n${q.options.map((opt, j) => `${String.fromCharCode(65 + j)}) ${opt}`).join('\n')}\n\nResposta: ${q.answer}\nExplicação: ${q.explanation}\n\n`;
    }).join('---\n\n');
    
    const blob = new Blob([quizText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_estudo_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadFlashcards = () => {
    if (!result || !result.flashcards) return;
    
    const cardsText = result.flashcards.map((card, i) => {
      return `Cartão ${i + 1}:\nFrente: ${card.front}\nVerso: ${card.back}\n\n`;
    }).join('---\n\n');
    
    const blob = new Blob([cardsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <header>
        <h1>Gerador de Material de Estudo 🧠</h1>
        <p>Crie Quizzes e Flashcards automáticos a partir de qualquer texto.</p>
        
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
          <HistoryList user={user} toolType="study" />
        </div>
      )}
      
      <div style={{ width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Modo de estudo:</label>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mode"
                  value="quiz"
                  checked={mode === 'quiz'}
                  onChange={(e) => setMode(e.target.value)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ color: '#d1d5db' }}>🧪 Quiz (Perguntas e Respostas)</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mode"
                  value="flashcards"
                  checked={mode === 'flashcards'}
                  onChange={(e) => setMode(e.target.value)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ color: '#d1d5db' }}>📇 Flashcards (Cartões de Memória)</span>
              </label>
            </div>
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Cole o conteúdo para estudo:</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: A fotossíntese é o processo pelo qual as plantas convertem luz solar, água e dióxido de carbono em glicose e oxigênio. Ocorre nos cloroplastos e é essencial para a vida na Terra..."
              required
              style={{ 
                minHeight: '200px',
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
              💡 Cole apostilas, artigos, resumos ou qualquer conteúdo que queira transformar em material de estudo
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
                  Gerando (-1 Crédito)...
                </>
              ) : mode === 'quiz' ? '🧪 Gerar Quiz' : '📇 Gerar Flashcards'}
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
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            
            {/* CABEÇALHO */}
            <div style={{ 
              backgroundColor: mode === 'quiz' ? '#4c1d95' : '#065f46', 
              padding: '25px', 
              textAlign: 'center'
            }}>
              <h2 style={{ 
                color: '#fff', 
                margin: 0,
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px'
              }}>
                {mode === 'quiz' ? '🧪' : '📇'}
                {mode === 'quiz' ? 'Quiz Gerado com Sucesso!' : 'Flashcards Prontos!'}
              </h2>
              <p style={{ 
                color: mode === 'quiz' ? '#e9d5ff' : '#d1fae5', 
                margin: '10px 0 0 0',
                fontSize: '16px'
              }}>
                {mode === 'quiz' 
                  ? `${result.questions?.length || 0} perguntas de múltipla escolha com explicações`
                  : `${result.flashcards?.length || 0} cartões para estudo ativo`
                }
              </p>
            </div>

            {/* CONTEÚDO */}
            <div style={{ padding: '25px', backgroundColor: '#111827' }}>
              {mode === 'quiz' ? (
                // QUIZ
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px'
                  }}>
                    <h3 style={{ color: '#a855f7', margin: 0, fontSize: '20px' }}>
                      Perguntas do Quiz
                    </h3>
                    <button
                      onClick={downloadQuiz}
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
                      ⬇️ Baixar Quiz
                    </button>
                  </div>
                  
                  {result.questions.map((question, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        marginBottom: '25px',
                        backgroundColor: '#1f2937',
                        borderRadius: '10px',
                        padding: '20px',
                        border: '1px solid #374151',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7e22ce'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#374151'}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        gap: '15px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          width: '35px',
                          height: '35px',
                          backgroundColor: '#7e22ce',
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            color: '#fff', 
                            margin: '0 0 15px 0',
                            fontSize: '17px',
                            lineHeight: '1.4'
                          }}>
                            {question.question}
                          </h4>
                          
                          <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '10px'
                          }}>
                            {question.options.map((option, optIndex) => (
                              <div 
                                key={optIndex}
                                style={{
                                  padding: '12px 15px',
                                  backgroundColor: '#111827',
                                  borderRadius: '8px',
                                  border: '1px solid #374151',
                                  color: '#d1d5db',
                                  fontSize: '14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px'
                                }}
                              >
                                <div style={{
                                  width: '25px',
                                  height: '25px',
                                  backgroundColor: '#374151',
                                  color: '#d1d5db',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  flexShrink: 0
                                }}>
                                  {String.fromCharCode(65 + optIndex)}
                                </div>
                                <span>{option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleAnswer(index)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: showAnswers[index] ? '#10b981' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          transition: 'all 0.3s'
                        }}
                      >
                        {showAnswers[index] ? '👁️ Ocultar Resposta' : '👁️ Mostrar Resposta'}
                      </button>
                      
                      {showAnswers[index] && (
                        <div style={{ 
                          marginTop: '20px',
                          padding: '20px',
                          backgroundColor: '#064e3b',
                          borderRadius: '8px',
                          border: '1px solid #047857'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '15px'
                          }}>
                            <div style={{
                              width: '30px',
                              height: '30px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold'
                            }}>
                              ✓
                            </div>
                            <h5 style={{ 
                              color: '#4ade80', 
                              margin: 0,
                              fontSize: '16px'
                            }}>
                              Resposta Correta: {question.answer}
                            </h5>
                          </div>
                          
                          <div style={{ 
                            color: '#d1fae5', 
                            lineHeight: '1.6',
                            fontSize: '15px'
                          }}>
                            <strong>📚 Explicação:</strong> {question.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // FLASHCARDS
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px'
                  }}>
                    <h3 style={{ color: '#10b981', margin: 0, fontSize: '20px' }}>
                      Seus Flashcards
                    </h3>
                    <button
                      onClick={downloadFlashcards}
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
                      ⬇️ Baixar Flashcards
                    </button>
                  </div>
                  
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
                  }}>
                    {result.flashcards.map((card, index) => (
                      <div 
                        key={index}
                        style={{
                          backgroundColor: '#1f2937',
                          borderRadius: '12px',
                          padding: '25px',
                          border: '1px solid #374151',
                          minHeight: '200px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          transformStyle: 'preserve-3d',
                          position: 'relative'
                        }}
                        onClick={() => toggleAnswer(index)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '15px',
                          right: '15px',
                          backgroundColor: '#374151',
                          color: '#d1d5db',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          #{index + 1}
                        </div>
                        
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                          <div style={{
                            fontSize: '24px',
                            color: '#10b981',
                            marginBottom: '10px'
                          }}>
                            {showAnswers[index] ? '📇' : '🧠'}
                          </div>
                          <h4 style={{ 
                            color: '#fff', 
                            margin: 0,
                            fontSize: '18px'
                          }}>
                            {showAnswers[index] ? 'Verso (Resposta)' : 'Frente (Pergunta)'}
                          </h4>
                        </div>
                        
                        <div style={{ 
                          color: '#d1d5db', 
                          fontSize: '16px',
                          lineHeight: '1.6',
                          textAlign: 'center',
                          flexGrow: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {showAnswers[index] ? card.back : card.front}
                        </div>
                        
                        <div style={{ 
                          marginTop: '20px',
                          textAlign: 'center',
                          color: '#9ca3af',
                          fontSize: '14px'
                        }}>
                          Clique para {showAnswers[index] ? 'ver a pergunta' : 'ver a resposta'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ 
                    marginTop: '30px',
                    padding: '20px',
                    backgroundColor: '#4c1d95',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: '#e9d5ff', margin: 0, fontSize: '15px' }}>
                      <strong>💡 Como estudar com flashcards:</strong> Revise os cartões regularmente, 
                      tente responder antes de virar, e separe em pilhas "sei" e "preciso revisar".
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <ExemplosSection ferramentaId="gerador-estudos" />
    </div>
  );
}