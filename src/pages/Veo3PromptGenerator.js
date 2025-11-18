import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';

export default function Veo3PromptGenerator() {
  const [scene, setScene] = useState('');
  const [style, setStyle] = useState('Cinematográfico (Realista)');
  const [camera, setCamera] = useState('Plano Aberto (Wide Shot)');
  const [lighting, setLighting] = useState('Golden hour (pôr do sol)');
  const [customLighting, setCustomLighting] = useState('');
  const [audio, setAudio] = useState('');
  
  const [advancedPrompt, setAdvancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAdvancedPrompt('');

    const finalLighting = lighting === 'outro' ? customLighting : lighting;

    try {
      // 1. Pegar usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Você precisa estar logado.');

      // 2. Enviar pedido com user_id
      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-veo3-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          scene, 
          style, 
          camera, 
          lighting: finalLighting, 
          audio,
          user_id: user.id 
        }),
      });

      // 3. Verificar se faltou crédito
      if (response.status === 402) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor.');
      }

      const data = await response.json();
      setAdvancedPrompt(data.advanced_prompt);

    } catch (err) {
      alert(err.message); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Gerador de Prompts para VEO 3</h1>
        <p>Preencha os campos para criar um prompt de vídeo detalhado.</p>
      </header>
      
      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        <div className="form-group">
          <label>1. Descrição da Cena Principal:</label>
          <textarea value={scene} onChange={(e) => setScene(e.target.value)} placeholder="Ex: Um astronauta solitário encontra uma flor crescendo em Marte." />
        </div>

        <div className="form-group">
          <label>2. Estilo Visual:</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            <option>Cinematográfico (Realista)</option>
            <option>Animação 3D (Estilo Pixar)</option>
            <option>Anime (Estilo Ghibli)</option>
            <option>Documentário</option>
            <option>Filmagem Vintage (8mm)</option>
          </select>
        </div>

        <div className="form-group">
          <label>3. Câmera e Plano:</label>
          <select value={camera} onChange={(e) => setCamera(e.target.value)}>
            <option>Plano Aberto (Wide Shot)</option>
            <option>Close-up no Rosto</option>
            <option>Câmera Lenta (Slow Motion)</option>
            <option>Plano Sequência (Tracking Shot)</option>
            <option>Visão de Drone</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>4. Iluminação:</label>
          <select value={lighting} onChange={(e) => setLighting(e.target.value)}>
            <option>Golden hour (pôr do sol)</option>
            <option>Luz do meio-dia (forte)</option>
            <option>Noite com luz de neon</option>
            <option>Sombrio e misterioso (pouca luz)</option>
            <option>Luz de estúdio</option>
            <option value="outro">Outro (especificar)...</option>
          </select>

          {lighting === 'outro' && (
            <input
              type="text"
              value={customLighting}
              onChange={(e) => setCustomLighting(e.target.value)}
              placeholder="Descreva a iluminação personalizada"
              style={{ marginTop: '10px' }}
            />
          )}
        </div>
        
        <div className="form-group">
          <label>5. Design de Áudio (Sons e Música):</label>
          <textarea value={audio} onChange={(e) => setAudio(e.target.value)} placeholder="Ex: Vento suave, passos na areia, trilha sonora orquestral épica." />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Gerando (-1 Crédito)...' : 'Gerar Prompt Final'}
        </button>
      </form>

      {advancedPrompt && (
        <div className="result-container" style={{ textAlign: 'left' }}>
          <h2>Seu Prompt Otimizado:</h2>
          <div className="prompt-box">
            <p>{advancedPrompt}</p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(advancedPrompt)} className="copy-button">Copiar Prompt</button>
        </div>
      )}
    </div>
  );
}