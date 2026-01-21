// Veo3PromptGenerator.js - versão simplificada para testar
import React, { useState, useEffect } from 'react';

export default function Veo3PromptGenerator() {
  const [idea, setIdea] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação temporária para testar o build
    setTimeout(() => {
      setGeneratedPrompt('Prompt de teste gerado com sucesso!');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Criador de Prompts para Vídeo</h1>
      
      <div>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Descreva sua cena..."
          style={{ width: '100%', height: '100px' }}
        />
      </div>

      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Gerando...' : 'Gerar Prompt'}
      </button>

      {generatedPrompt && (
        <div>
          <h3>Prompt:</h3>
          <p>{generatedPrompt}</p>
        </div>
      )}
    </div>
  );
}
