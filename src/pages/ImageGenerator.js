import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const styles = {
    realistic: "Fotorrealista, detalhado, 8K",
    cinematic: "Cinematográfico, iluminação dramática, filme",
    anime: "Anime, estilo japonês, cores vibrantes",
    fantasy: "Arte de fantasia, mágico, épico",
    cyberpunk: "Cyberpunk, neon, futurista",
    painting: "Pintura a óleo, texturizado, artístico"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setImageUrl('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para gerar imagens.');

      // Combinar prompt com estilo escolhido
      const fullPrompt = `${prompt}, ${styles[style]}, masterpiece, best quality`;

      const response = await fetch('http://localhost:5000/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: fullPrompt,
          user_id: user.id 
        }),
      });

      const data = await response.json();

      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro ao gerar imagem.');

      setImageUrl(data.image_url);
      
      // Adicionar ao histórico local
      setHistory(prev => [{
        prompt: prompt,
        style: style,
        image_url: data.image_url,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)]); // Mantém só 5 no histórico

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imagem_ia_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao baixar imagem: ' + err.message);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🎨 Gerador de Imagens com IA</h1>
        <p>Descreva sua ideia e receba uma imagem única em segundos!</p>
        <p style={{ fontSize: '0.9rem', color: '#fbbf24', marginTop: '5px' }}>
          ⚠️ Custa 2 créditos (1 para prompt + 1 para geração)
        </p>
      </header>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* COLUNA 1: GERADOR */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Descreva a imagem que quer criar:</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Um dragão de cristal sobrevoando uma cidade futurística sob a lua cheia"
                required
                style={{ 
                  minHeight: '120px', 
                  width: '95%', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  border: '1px solid #4b5563', 
                  backgroundColor: '#374151', 
                  color: 'white',
                  fontSize: '16px'
                }}
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Estilo da imagem:</label>
              <select 
                value={style} 
                onChange={(e) => setStyle(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #4b5563', 
                  backgroundColor: '#374151', 
                  color: 'white' 
                }}
              >
                <option value="realistic">🎯 Realista (Fotorrealista)</option>
                <option value="cinematic">🎬 Cinematográfico</option>
                <option value="anime">🇯🇵 Anime</option>
                <option value="fantasy">🧙‍♂️ Fantasia Épica</option>
                <option value="cyberpunk">🤖 Cyberpunk</option>
                <option value="painting">🖼️ Pintura Artística</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || prompt.length < 10}
              style={{
                background: 'linear-gradient(90deg, #7e22ce 0%, #a855f7 100%)',
                padding: '15px 30px',
                fontSize: '1.1rem',
                marginTop: '10px'
              }}
            >
              {isLoading ? '🎨 Gerando Imagem (-2 Créditos)...' : '✨ Gerar Imagem Agora'}
            </button>
          </form>

          {error && (
            <div className="error-message" style={{ 
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#450a0a'
            }}>
              <strong>Erro:</strong> {error}
            </div>
          )}

          {/* IMAGEM GERADA */}
          {imageUrl && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <h3 style={{ color: '#a855f7', marginBottom: '15px' }}>✅ Sua Imagem Pronta!</h3>
              <div style={{
                backgroundColor: '#1f2937',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #7e22ce',
                marginBottom: '15px'
              }}>
                <img 
                  src={imageUrl} 
                  alt="Imagem gerada por IA"
                  style={{ 
                    maxWidth: '100%', 
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  onClick={downloadImage}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  💾 Baixar Imagem
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(imageUrl)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  📋 Copiar Link
                </button>
      <ExemplosSection ferramentaId="gerar-imagem-completa" />

              </div>
            </div>
          )}
        </div>

        {/* COLUNA 2: HISTÓRICO/EXEMPLOS */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ 
            backgroundColor: '#1f2937', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <h3 style={{ color: '#fbbf24', marginBottom: '15px' }}>📚 Exemplos & Histórico</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#d1d5db', fontSize: '14px' }}>💡 Dicas para prompts eficientes:</h4>
              <ul style={{ color: '#9ca3af', fontSize: '13px', paddingLeft: '20px' }}>
                <li>Use adjetivos: "épico, detalhado, cinematográfico"</li>
                <li>Especifique estilo: "fotorrealista, anime, pintura a óleo"</li>
                <li>Descreva luz: "luz do pôr do sol, neon, dramática"</li>
                <li>Mencione composição: "close-up, plano aberto, perspectiva"</li>
              </ul>
            </div>

            {history.length > 0 && (
              <div>
                <h4 style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '10px' }}>
                  Suas imagens recentes:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {history.map((item, idx) => (
                    <div key={idx} style={{ 
                      backgroundColor: '#111827', 
                      padding: '10px', 
                      borderRadius: '8px',
                      border: '1px solid #374151'
                    }}>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '5px' }}>
                        {item.timestamp} • {item.style}
                      </div>
                      <div style={{ fontSize: '13px', color: '#d1d5db' }}>
                        "{item.prompt.substring(0, 60)}..."
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#4c1d95', borderRadius: '8px' }}>
              <p style={{ color: '#e9d5ff', fontSize: '13px', margin: 0 }}>
                <strong>⚠️ Importante:</strong> Imagens geradas podem levar 15-30 segundos. 
                Elas são salvas por 24h no servidor da Replicate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}