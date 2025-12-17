import React, { useState, useEffect } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import HistoryPanel, { saveHistoryItem } from '../components/HistoryPanel';
import { 
  ArrowDownTrayIcon,
  ClipboardIcon,
  PhotoIcon,
  ClockIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/solid';

export default function ImageGenerator() {
  // Estados principais
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Estilos disponíveis
  const styles = {
    realistic: "Fotorrealista, detalhado, 8K",
    cinematic: "Cinematográfico, iluminação dramática, filme",
    anime: "Anime, estilo japonês, cores vibrantes",
    fantasy: "Arte de fantasia, mágico, épico",
    cyberpunk: "Cyberpunk, neon, futurista",
    painting: "Pintura a óleo, texturizado, artístico"
  };

  // Carregar usuário
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Ouvir evento de usar item do histórico
  useEffect(() => {
    const handleUseHistory = (event) => {
      if (event.detail && event.detail.text) {
        setPrompt(event.detail.text);
        // Rolagem suave para o campo
        document.getElementById('prompt-input')?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    window.addEventListener('useHistoryItem', handleUseHistory);
    return () => window.removeEventListener('useHistoryItem', handleUseHistory);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setImageUrl('');

    try {
      // Verificar login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para gerar imagens.');
      setUser(user);

      // Combinar prompt com estilo
      const fullPrompt = `${prompt}, ${styles[style]}, masterpiece, best quality`;

      // Chamar API
      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-image', {
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

      // Definir URL da imagem
      setImageUrl(data.image_url);
      
      // SALVAR NO HISTÓRICO
      await saveHistoryItem(
        user,
        'image',
        'Gerador de Imagens',
        prompt, // Salva o prompt original (sem o estilo)
        data.image_url,
        { 
          credits_used: 2, 
          style: style,
          full_prompt: fullPrompt 
        }
      );

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      
      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        
        {/* HEADER COM BOTÃO DE HISTÓRICO */}
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                🎨 Gerador de Imagens com IA
              </h1>
              <p className="text-gray-400 mt-2">
                Descreva sua ideia e receba uma imagem única em segundos!
              </p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="text-yellow-400">⚠️ Custa 2 créditos</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">Stable Diffusion SDXL</span>
              </div>
            </div>
            
            {/* BOTÃO PARA HISTÓRICO */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
            >
              <ClockIcon className="h-5 w-5" />
              <span className="hidden md:inline">
                {showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
              </span>
              <span className="md:hidden">Histórico</span>
            </button>
          </div>
        
          {/* FORMULÁRIO */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUNA 1: FORMULÁRIO */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                
                {/* CAMPO DE PROMPT */}
                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-3 text-lg">
                    ✨ Descreva a imagem que quer criar:
                  </label>
                  <textarea
                    id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Um dragão de cristal azul sobrevoando uma cidade cyberpunk à noite, com arranha-céus de neon e chuva..."
                    required
                    className="w-full min-h-[150px] p-4 rounded-lg border border-gray-600 bg-gray-900 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">
                      {prompt.length}/500 caracteres
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(prompt)}
                      disabled={!prompt}
                      className="text-sm text-purple-400 hover:text-purple-300 disabled:text-gray-600"
                    >
                      📋 Copiar
                    </button>
                  </div>
                </div>

                {/* SELEÇÃO DE ESTILO */}
                <div className="mb-8">
                  <label className="block text-gray-300 font-medium mb-3">
                    🎭 Estilo da imagem:
                  </label>
                  <select 
                    value={style} 
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-900 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="realistic">🎯 Realista (Fotorrealista)</option>
                    <option value="cinematic">🎬 Cinematográfico</option>
                    <option value="anime">🇯🇵 Anime</option>
                    <option value="fantasy">🧙‍♂️ Fantasia Épica</option>
                    <option value="cyberpunk">🤖 Cyberpunk</option>
                    <option value="painting">🖼️ Pintura Artística</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-400">
                    Estilo selecionado: <span className="text-purple-300">{styles[style]}</span>
                  </p>
                </div>

                {/* BOTÃO DE SUBMIT */}
                <button 
                  type="submit" 
                  disabled={isLoading || prompt.length < 10}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-purple-500/30 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      🎨 Gerando Imagem (-2 Créditos)...
                    </span>
                  ) : '✨ Gerar Imagem Agora'}
                </button>

                {/* MENSAGEM DE ERRO */}
                {error && (
                  <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                    <div className="flex items-center gap-2 text-red-300 font-medium mb-1">
                      ⚠️ Erro
                    </div>
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}
              </form>

              {/* IMAGEM GERADA */}
              {imageUrl && (
                <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      ✅ Sua Imagem Pronta!
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={downloadImage}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Baixar
                      </button>
                      <button
                        onClick={() => copyToClipboard(imageUrl)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <ClipboardIcon className="h-4 w-4" />
                        Copiar Link
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                    <img 
                      src={imageUrl} 
                      alt="Imagem gerada por IA"
                      className="w-full max-h-[500px] object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/600x400/1f2937/9ca3af?text=Imagem+Indisponível';
                      }}
                    />
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                    <h4 className="text-gray-300 font-medium mb-2">📝 Prompt usado:</h4>
                    <p className="text-gray-400 text-sm">{prompt}, {styles[style]}</p>
                  </div>
                </div>
              )}
            </div>

            {/* COLUNA 2: DICAS E INFORMAÇÕES */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                
                {/* DICAS */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    💡 Dicas para prompts
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Use adjetivos: "épico, detalhado, cinematográfico"',
                      'Especifique estilo: "fotorrealista, anime, pintura a óleo"',
                      'Descreva luz: "luz do pôr do sol, neon, dramática"',
                      'Mencione composição: "close-up, plano aberto, perspectiva"',
                      'Adicione qualidade: "8K, UHD, altamente detalhado"'
                    ].map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span className="text-gray-300 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* INFORMAÇÕES TÉCNICAS */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Cog6ToothIcon className="h-5 w-5" />
                    Informações Técnicas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Modelo:</span>
                      <span className="text-gray-300 text-sm font-medium">Stable Diffusion SDXL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Resolução:</span>
                      <span className="text-gray-300 text-sm font-medium">1024×1024 px</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Tempo médio:</span>
                      <span className="text-gray-300 text-sm font-medium">15-30 segundos</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Custo:</span>
                      <span className="text-yellow-300 text-sm font-medium">2 créditos/imagem</span>
                    </div>
                  </div>
                </div>

                {/* EXEMPLOS RÁPIDOS */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">🚀 Exemplos Rápidos</h3>
                  <div className="space-y-3">
                    {[
                      {text: 'Robô meditando em templo japonês na floresta', style: 'anime'},
                      {text: 'Astronauta encontrando civilização alienígena submarina', style: 'realistic'},
                      {text: 'Castelo flutuante nas nuvens com dragões', style: 'fantasy'}
                    ].map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPrompt(example.text);
                          setStyle(example.style);
                          document.getElementById('prompt-input')?.focus();
                        }}
                        className="w-full text-left p-3 bg-gray-900 hover:bg-gray-850 rounded-lg border border-gray-700 transition-colors group"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-300 text-sm font-medium group-hover:text-white">
                            {example.text.substring(0, 40)}...
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                            {example.style}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Clique para usar</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR DO HISTÓRICO */}
      <HistoryPanel 
        toolType="image" 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
}