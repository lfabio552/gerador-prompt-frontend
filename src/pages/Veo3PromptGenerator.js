// frontend/src/pages/Veo3PromptGenerator.js
import React, { useState } from 'react';
import '../App.css'; 

export default function Veo3PromptGenerator() {
  // Estados para os campos do formulário
  const [scene, setScene] = useState('');
  const [style, setStyle] = useState('Cinematográfico (Realista)');
  const [camera, setCamera] = useState('Plano Aberto (Wide Shot)');
  const [lighting, setLighting] = useState('Golden hour (pôr do sol)'); // Valor inicial da lista
  const [customLighting, setCustomLighting] = useState(''); // Novo estado para o campo de texto customizado
  const [audio, setAudio] = useState('');
  
  // Estados para a UI
  const [advancedPrompt, setAdvancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

 const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAdvancedPrompt('');
    // setError(''); // Podemos adicionar tratamento de erro depois

    // Lógica para decidir qual valor de iluminação usar
    const finalLighting = lighting === 'outro' ? customLighting : lighting;

    try {
      // Chamada para o nosso backend LOCAL
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
          audio 
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor.');
      }

      const data = await response.json();
      setAdvancedPrompt(data.advanced_prompt);

    } catch (err) {
      // setError(err.message);
      alert(err.message); // Usando um alerta simples por enquanto
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
        {/* Campo da Cena Principal (sem mudanças) */}
        <div className="form-group">
          <label>1. Descrição da Cena Principal:</label>
          <textarea value={scene} onChange={(e) => setScene(e.target.value)} placeholder="Ex: Um astronauta solitário encontra uma flor crescendo em Marte." />
        </div>

        {/* Campo de Estilo (sem mudanças) */}
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

        {/* Campo da Câmera (sem mudanças) */}
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
        
        {/* CAMPO DE ILUMINAÇÃO INTELIGENTE (NOVA VERSÃO) */}
        <div className="form-group">
          <label>4. Iluminação:</label>
          <select value={lighting} onChange={(e) => setLighting(e.target.value)}>
            <option>Golden hour (pôr do sol)</option>
            <option>Luz do meio-dia (forte)</option>
            <option>Noite com luz de neon</option>
            <option>Sombrio e misterioso (pouca luz)</option>
            <option>Luz de estúdio</option>
            <option value="outro">Outro (especificar)...</option> {/* Opção especial */}
          </select>

          {/* O campo de texto só aparece se a opção "Outro" for selecionada */}
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
        
        {/* Campo de Áudio (sem mudanças) */}
        <div className="form-group">
          <label>5. Design de Áudio (Sons e Música):</label>
          <textarea value={audio} onChange={(e) => setAudio(e.target.value)} placeholder="Ex: Vento suave, passos na areia, trilha sonora orquestral épica." />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Gerando...' : 'Gerar Prompt Final'}
        </button>
      </form>

      {/* Área de resultado (sem mudanças) */}
      {advancedPrompt && (
        <div className="result-container" style={{ textAlign: 'left' }}>
          <h2>Seu Prompt Otimizado:</h2>
          <div className="prompt-box">
            <p>{advancedPrompt}</p>
          </div>
          {/* Adicionei uma função de cópia ao botão, simples por enquanto */}
          <button onClick={() => navigator.clipboard.writeText(advancedPrompt)} className="copy-button">Copiar Prompt</button>
        </div>
      )}
    </div>
  );
}