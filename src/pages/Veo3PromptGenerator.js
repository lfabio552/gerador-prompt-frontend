import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient'; // 1. Importando Supabase

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
      // 2. Pegar usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Você precisa estar logado.');

      // 3. Enviar pedido com user_id
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
          user_id: user.id // Enviando a identidade para cobrança
        }),
      });

      // 4. Verificar se faltou crédito (Erro 402)
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
      alert(err.message); // Usando alerta simples como estava antes
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