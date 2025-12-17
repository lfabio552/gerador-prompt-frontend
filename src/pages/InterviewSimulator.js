import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';

export default function InterviewSimulator() {
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para simular a entrevista.');

      // --- ATENÇÃO AQUI: TROQUE PELO SEU LINK DO RENDER ---
      // Exemplo: 'https://seu-projeto-123.onrender.com/mock-interview'
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

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Simulador de Entrevista 💼</h1>
        <p>Descubra as perguntas que o RH vai fazer e saiba como responder.</p>
      </header>
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Cargo / Vaga:</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex: Desenvolvedor Júnior, Gerente de Vendas..."
            required
            style={{ width: '95%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
          />
        </div>

        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Descrição da Vaga (Copie e cole do LinkedIn/Vagas.com):</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Requisitos: Experiência com React, Python..."
            required
            style={{ minHeight: '150px', width: '95%', padding: '15px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Gerando Guia (-1 Crédito)...' : 'Simular Entrevista'}
        </button>
      </form>

      {error && <div className="error-message" style={{color: '#ff6b6b', marginTop: '20px'}}>{error}</div>}

      {result && (
        <div className="result-container" style={{textAlign: 'left', marginTop: '40px', padding: '0', overflow: 'hidden', border: 'none'}}>
            
            {/* DICAS DE OURO */}
            <div style={{ backgroundColor: '#4c1d95', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#e9d5ff' }}>⚠️ O que NÃO falar (Armadilhas):</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#fff' }}>
                    {result.tips.map((tip, index) => (
                        <li key={index} style={{ marginBottom: '5px' }}>{tip}</li>
                    ))}
                </ul>
            </div>

            {/* PERGUNTAS E RESPOSTAS */}
            <h2 style={{ color: '#a855f7', marginBottom: '20px' }}>Perguntas Prováveis & Respostas Ideais:</h2>
            
            {result.questions.map((item, index) => (
                <div key={index} style={{ marginBottom: '20px', backgroundColor: '#1f2937', borderRadius: '12px', overflow: 'hidden', border: '1px solid #374151' }}>
                    <div style={{ padding: '15px 20px', backgroundColor: '#374151', fontWeight: 'bold', color: '#fff' }}>
                        🗣️ P: {item.q}
                    </div>
                    <div style={{ padding: '20px', color: '#d1d5db', lineHeight: '1.6' }}>
                        <span style={{ color: '#34d399', fontWeight: 'bold' }}>💡 Melhor Resposta: </span> 
                        {item.a}
      <ExemplosSection ferramentaId="simulador-entrevista" />

                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}