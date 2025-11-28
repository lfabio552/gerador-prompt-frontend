import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';

export default function StudyMaterialGenerator() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('quiz'); // 'quiz' ou 'flashcards'
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para interação (ex: virar o card, ver resposta do quiz)
  const [flippedCards, setFlippedCards] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);
    setFlippedCards({});
    setQuizAnswers({});

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para gerar material de estudo.');

      // --- IMPORTANTE: TROQUE AQUI PELO SEU LINK DO RENDER ---
      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-study-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            text,
            mode,
            user_id: user.id 
        }),
      });

      const data = await response.json();

      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro ao gerar.');

      setResult(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCard = (index) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleQuizOption = (qIndex, option) => {
    setQuizAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  return (
    <div className="container">
      <header>
        <h1>Gerador de Estudos IA 🧠</h1>
        <p>Transforme seus textos em Quizzes ou Flashcards instantaneamente.</p>
      </header>
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Cole o conteúdo (Aula, Resumo, Apostila):</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cole o texto aqui..."
            required
            style={{ minHeight: '200px', width: '95%', padding: '15px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
          />
        </div>

        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>O que você quer criar?</label>
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
          >
            <option value="quiz">📝 Quiz de Múltipla Escolha</option>
            <option value="flashcards">🗂️ Flashcards (Frente e Verso)</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Gerando (-1 Crédito)...' : 'Gerar Material'}
        </button>
      </form>

      {error && <div className="error-message" style={{color: '#ff6b6b', marginTop: '20px'}}>{error}</div>}

      {/* RESULTADO: QUIZ */}
      {result && mode === 'quiz' && result.questions && (
        <div className="result-container" style={{textAlign: 'left', marginTop: '40px', border: 'none', padding: 0}}>
            <h2 style={{color: '#a855f7'}}>Seu Quiz Gerado:</h2>
            {result.questions.map((q, idx) => (
                <div key={idx} style={{backgroundColor: '#1f2937', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #374151'}}>
                    <p style={{fontWeight: 'bold', fontSize: '18px', color: '#fff'}}>{idx + 1}. {q.question}</p>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px'}}>
                        {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswers[idx] === opt.charAt(0); // A, B, C...
                            const isCorrect = q.answer.includes(opt.charAt(0));
                            let bgColor = '#374151';
                            
                            // Lógica de cores após responder
                            if (quizAnswers[idx]) {
                                if (isCorrect) bgColor = '#065f46'; // Verde escuro
                                else if (isSelected && !isCorrect) bgColor = '#7f1d1d'; // Vermelho escuro
                            }

                            return (
                                <button 
                                    key={optIdx} 
                                    onClick={() => handleQuizOption(idx, opt.charAt(0))}
                                    disabled={!!quizAnswers[idx]}
                                    style={{
                                        textAlign: 'left', 
                                        padding: '10px', 
                                        borderRadius: '8px', 
                                        border: isSelected ? '2px solid #a855f7' : '1px solid #4b5563',
                                        backgroundColor: bgColor,
                                        color: '#e5e7eb',
                                        cursor: quizAnswers[idx] ? 'default' : 'pointer'
                                    }}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {/* Explicação aparece depois de responder */}
                    {quizAnswers[idx] && (
                        <div style={{marginTop: '15px', padding: '10px', backgroundColor: '#312e81', borderRadius: '8px', color: '#c7d2fe'}}>
                            <strong>Explicação:</strong> {q.explanation}
                        </div>
                    )}
                </div>
            ))}
        </div>
      )}

      {/* RESULTADO: FLASHCARDS */}
      {result && mode === 'flashcards' && result.flashcards && (
        <div className="result-container" style={{textAlign: 'left', marginTop: '40px', border: 'none', padding: 0}}>
            <h2 style={{color: '#a855f7'}}>Seus Flashcards:</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
                {result.flashcards.map((card, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => toggleCard(idx)}
                        style={{
                            height: '200px', 
                            perspective: '1000px', 
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            textAlign: 'center',
                            transition: 'transform 0.6s',
                            transformStyle: 'preserve-3d',
                            transform: flippedCards[idx] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}>
                            {/* FRENTE */}
                            <div style={{
                                position: 'absolute', width: '100%', height: '100%', 
                                backfaceVisibility: 'hidden',
                                backgroundColor: '#1f2937', color: '#fff', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '20px', borderRadius: '12px', border: '2px solid #a855f7'
                            }}>
                                <h3 style={{fontSize: '16px'}}>❓ {card.front}</h3>
                            </div>
                            
                            {/* VERSO */}
                            <div style={{
                                position: 'absolute', width: '100%', height: '100%', 
                                backfaceVisibility: 'hidden',
                                backgroundColor: '#4c1d95', color: '#fff', 
                                transform: 'rotateY(180deg)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '20px', borderRadius: '12px', border: '2px solid #a855f7'
                            }}>
                                <p style={{fontSize: '14px'}}>💡 {card.back}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}