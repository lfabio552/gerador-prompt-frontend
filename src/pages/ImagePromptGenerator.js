import React, { useState, useEffect } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';
import { saveToHistory, TOOL_CONFIGS } from '../utils/saveToHistory';
import HistoryList from '../components/HistoryList';

export default function ImagePromptGenerator() {
  const [idea, setIdea] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [advancedPrompt, setAdvancedPrompt] = useState('');
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
    setAdvancedPrompt('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Você precisa estar logado.');
      setUser(user);

      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idea, 
          style,
          user_id: user.id
        }),
      });

      const data = await response.json();

      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Falha na comunicação com o servidor.');

      setAdvancedPrompt(data.advanced_prompt);

      // SALVAR HISTÓRICO
      await saveToHistory(
        user,
        TOOL_CONFIGS.IMAGE_PROMPT,
        `Ideia: ${idea}\nEstilo: ${style}`,
        data.advanced_prompt,
        { 
          style: style,
          idea_length: idea.length,
          prompt_length: data.advanced_prompt.length 
        }
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(advancedPrompt);
    alert('Prompt copiado para a área de transferência!');
  };

  return (
    <div className="container">
      <header>
        <h1>Gerador de Prompt Avançado</h1>
        <p>Transforme suas ideias simples em prompts perfeitos para IA.</p>
        
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
          <HistoryList user={user} toolType="image" />
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="idea">Sua ideia simples:</label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Ex: um gato lendo um livro na lua"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="style">Escolha o estilo:</label>
          <select id="style" value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="cinematic">Cinematográfico</option>
            <option value="photorealistic">Fotorrealista</option>
            <option value="fantasy art">Arte de Fantasia</option>
            <option value="3d animation">Animação 3D</option>
            <option value="oil painting">Pintura a Óleo</option>
            <option value="cyberpunk">Cyberpunk</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Gerando (-1 Crédito)...' : 'Gerar Prompt Avançado'}
        </button>
      </form>

      {error && <div className="error-message" style={{ color: '#ff6b6b', marginTop: '10px' }}>{error}</div>}

      {advancedPrompt && (
        <div className="result-container">
          <h2>Seu Prompt Otimizado:</h2>
          <div className="prompt-box">
            <p>{advancedPrompt}</p>
          </div>
          <button onClick={handleCopy} className="copy-button">Copiar Prompt</button>
        </div>
      )}
    
      <ExemplosSection ferramentaId="gerar-imagem" />
    </div>
  );
}