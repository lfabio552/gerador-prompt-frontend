import React, { useState, useEffect } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';
import { saveToHistory, TOOL_CONFIGS } from '../utils/saveToHistory';
import HistoryList from '../components/HistoryList';

export default function Veo3PromptGenerator() {
  // Estados principais
  const [model, setModel] = useState('Veo 3'); 
  const [scene, setScene] = useState('');
  const [style, setStyle] = useState('Cinematográfico (Realista)');
  const [camera, setCamera] = useState('Plano Aberto (Wide Shot)');
  const [lighting, setLighting] = useState('Golden hour (pôr do sol)');
  const [customLighting, setCustomLighting] = useState('');
  const [audio, setAudio] = useState('');
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

    const finalLighting = lighting === 'outro' ? customLighting : lighting;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Você precisa estar logado.');
      setUser(user);

      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-veo3-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model,
          scene, 
          style, 
          camera, 
          lighting: finalLighting, 
          audio,
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
        TOOL_CONFIGS.VEO3_PROMPT,
        `Modelo: ${model}\nCena: ${scene}\nEstilo: ${style}\nCâmera: ${camera}\nIluminação: ${finalLighting}\nÁudio: ${audio}`,
        data.advanced_prompt,
        { 
          model: model,
          style: style,
          camera: camera,
          lighting: finalLighting,
          prompt_length: data.advanced_prompt.length
        }
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(advancedPrompt);
    alert('Prompt copiado para a área de transferência!');
  };

  const clearFields = () => {
    setScene('');
    setCustomLighting('');
    setAudio('');
    setAdvancedPrompt('');
    setError('');
  };

  return (
    <div className="container">
      <header>
        <h1>Gerador de Vídeo IA 🎬</h1>
        <p>Crie prompts perfeitos para Google Veo 3 e OpenAI Sora 2.</p>
        
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
          <HistoryList user={user} toolType="video-prompt" />
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        
        {/* SELETOR DE MODELO */}
        <div className="form-group" style={{
          backgroundColor: '#374151', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '1px solid #7e22ce',
          marginBottom: '20px'
        }}>
          <label style={{color: '#d8b4fe', fontWeight: 'bold', fontSize: '16px'}}>
            🎯 Qual IA você vai usar?
          </label>
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            style={{
              width: '100%', 
              marginTop: '10px', 
              fontWeight: 'bold', 
              padding: '12px', 
              borderRadius: '6px',
              backgroundColor: '#1f2937',
              color: 'white',
              border: '1px solid #4b5563',
              fontSize: '15px'
            }}
          >
            <option value="Veo 3">Google Veo 3 (Melhor para Cinema/Técnica)</option>
            <option value="Sora 2">OpenAI Sora 2 (Melhor para Física/Realismo)</option>
          </select>
        </div>

        <div className="form-group">
          <label>1. 📽️ Descrição da Cena Principal:</label>
          <textarea 
            value={scene} 
            onChange={(e) => setScene(e.target.value)} 
            placeholder="Ex: Um astronauta solitário encontra uma flor crescendo em Marte." 
            required
            style={{ 
              minHeight: '100px',
              width: '95%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #4b5563',
              backgroundColor: '#374151',
              color: 'white'
            }}
          />
        </div>

        <div className="form-group">
          <label>2. 🎨 Estilo Visual:</label>
          <select 
            value={style} 
            onChange={(e) => setStyle(e.target.value)}
            style={{ 
              width: '95%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #4b5563',
              backgroundColor: '#374151',
              color: 'white'
            }}
          >
            <option>Cinematográfico (Realista)</option>
            <option>Animação 3D (Estilo Pixar)</option>
            <option>Anime (Estilo Ghibli)</option>
            <option>Documentário</option>
            <option>Filmagem Vintage (8mm)</option>
            <option>Cyberpunk / Neon</option>
          </select>
        </div>

        <div className="form-group">
          <label>3. 📹 Câmera e Plano:</label>
          <select 
            value={camera} 
            onChange={(e) => setCamera(e.target.value)}
            style={{ 
              width: '95%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #4b5563',
              backgroundColor: '#374151',
              color: 'white'
            }}
          >
            <option>Plano Aberto (Wide Shot)</option>
            <option>Close-up no Rosto</option>
            <option>Câmera Lenta (Slow Motion)</option>
            <option>Plano Sequência (Tracking Shot)</option>
            <option>Visão de Drone (Flyover)</option>
            <option>Câmera de Mão (Handheld)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>4. 💡 Iluminação:</label>
          <select 
            value={lighting} 
            onChange={(e) => setLighting(e.target.value)}
            style={{ 
              width: '95%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #4b5563',
              backgroundColor: '#374151',
              color: 'white'
            }}
          >
            <option>Golden hour (pôr do sol)</option>
            <option>Luz do meio-dia (forte)</option>
            <option>Noite com luz de neon</option>
            <option>Sombrio e misterioso (pouca luz)</option>
            <option>Luz de estúdio (Suave)</option>
            <option value="outro">Outro (especificar)...</option>
          </select>

          {lighting === 'outro' && (
            <input
              type="text"
              value={customLighting}
              onChange={(e) => setCustomLighting(e.target.value)}
              placeholder="Descreva a iluminação personalizada..."
              style={{ 
                width: '95%',
                marginTop: '10px',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #4b5563',
                backgroundColor: '#374151',
                color: 'white'
              }}
            />
          )}
        </div>
        
        <div className="form-group">
          <label>5. 🔊 Design de Áudio (Sons e Música):</label>
          <textarea 
            value={audio} 
            onChange={(e) => setAudio(e.target.value)} 
            placeholder="Ex: Vento suave, passos na areia, trilha sonora orquestral épica."
            style={{ 
              minHeight: '80px',
              width: '95%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #4b5563',
              backgroundColor: '#374151',
              color: 'white'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
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
              minWidth: '250px',
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
            ) : `🎬 Gerar Prompt para ${model}`}
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

      {advancedPrompt && (
        <div className="result-container" style={{ 
          textAlign: 'left', 
          marginTop: '40px',
          border: `1px solid ${model === 'Sora 2' ? '#10a37f' : '#ea4335'}`,
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            backgroundColor: model === 'Sora 2' ? '#065f46' : '#4c1d95',
            padding: '20px',
            borderBottom: `1px solid ${model === 'Sora 2' ? '#10a37f' : '#ea4335'}`
          }}>
            <h2 style={{
              color: '#fff', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>
                ✨ Seu Prompt ({model})
                <span style={{ 
                  fontSize: '14px',
                  backgroundColor: model === 'Sora 2' ? '#10a37f' : '#ea4335',
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  marginLeft: '15px'
                }}>
                  {model === 'Sora 2' ? 'OpenAI' : 'Google'}
                </span>
              </span>
              <div style={{ 
                fontSize: '14px',
                color: '#d1d5db',
                backgroundColor: '#1f2937',
                padding: '5px 15px',
                borderRadius: '20px'
              }}>
                {advancedPrompt.length} caracteres
              </div>
            </h2>
          </div>
          
          <div className="prompt-box" style={{
            whiteSpace: 'pre-wrap',
            padding: '25px',
            backgroundColor: '#111827',
            fontSize: '15px',
            lineHeight: '1.6',
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid #374151'
          }}>
            <p style={{ margin: 0, color: '#d1d5db' }}>{advancedPrompt}</p>
          </div>
          
          <div style={{ 
            padding: '20px',
            backgroundColor: '#1f2937',
            borderTop: '1px solid #374151',
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={copyToClipboard}
              style={{
                padding: '12px 25px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '180px'
              }}
            >
              📋 Copiar Prompt
            </button>
            
            <button 
              onClick={() => navigator.clipboard.writeText(`Modelo: ${model}\n\n${advancedPrompt}`)}
              style={{
                padding: '12px 25px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '180px'
              }}
            >
              📝 Copiar com Detalhes
            </button>
            
            <button 
              onClick={clearFields}
              style={{
                padding: '12px 25px',
                backgroundColor: '#374151',
                color: '#d1d5db',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              🎬 Novo Prompt
            </button>
          </div>
          
          <div style={{ 
            padding: '15px',
            backgroundColor: model === 'Sora 2' ? '#065f46' : '#4c1d95',
            textAlign: 'center',
            borderTop: '1px solid #374151'
          }}>
            <p style={{ 
              color: '#e9d5ff', 
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <strong>💡 Dica:</strong> Cole este prompt diretamente no {model === 'Sora 2' ? 'Sora 2' : 'Veo 3'} para gerar seu vídeo.
              {model === 'Veo 3' && ' Inclua termos técnicos como "cinematic", "8K", "professional lighting".'}
              {model === 'Sora 2' && ' Foque em descrições físicas realistas como "fluid dynamics", "realistic textures", "natural motion".'}
            </p>
          </div>
        </div>
      )}
    
      <ExemplosSection ferramentaId="gerar-veo3-prompt" />
    </div>
  );
}