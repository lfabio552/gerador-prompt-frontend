import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient'; // 1. Importamos o Supabase

export default function ImagePromptGenerator() {
  const [idea, setIdea] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [advancedPrompt, setAdvancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setAdvancedPrompt('');

    try {
      // 2. Pegamos o usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Você precisa estar logado.');

      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idea, 
          style,
          user_id: user.id // 3. Enviamos o ID junto com o pedido
        }),
      });

      const data = await response.json();

      // 4. Se o backend disser "Erro 402" (Pagamento), mostramos o erro de crédito
      if (response.status === 402) {
        throw new Error(data.error); // "Você não tem créditos suficientes..."
      }

      if (!response.ok) {
        throw new Error(data.error || 'Falha na comunicação com o servidor.');
      }

      setAdvancedPrompt(data.advanced_prompt);

      // (Opcional) Recarrega a página ou atualiza o contador de créditos no cabeçalho
      // window.location.reload(); // Se quiser atualizar o saldo na hora (bruto, mas funciona)

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
      </header>
      
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
    </div>
  );
}