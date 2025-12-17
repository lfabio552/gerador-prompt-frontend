import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  TrashIcon, 
  ArrowDownTrayIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ClockIcon,
  DocumentTextIcon,
  PhotoIcon,
  TableCellsIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/solid';

export default function HistoryPanel({ toolType = null, showHeader = true }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Verificar se é PRO
        const { data } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', user.id)
          .single();
        
        setIsPro(data?.is_pro || false);
        loadHistory(user.id);
      } else {
        setLoading(false);
      }
    };
    
    getUserData();
  }, []);

  const loadHistory = async (userId) => {
    try {
      const payload = { user_id: userId };
      if (toolType) payload.tool_type = toolType;
      
      const response = await fetch('https://meu-gerador-backend.onrender.com/get-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history);
      } else {
        setError(data.error || 'Erro ao carregar histórico');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (itemId) => {
    // CORREÇÃO AQUI: window.confirm em vez de confirm
    if (!window.confirm('Tem certeza que deseja excluir este item do histórico?')) return;
    
    try {
      const response = await fetch('https://meu-gerador-backend.onrender.com/delete-history-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, 
          item_id: itemId 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setHistory(prev => prev.filter(item => item.id !== itemId));
        alert('✅ Item excluído com sucesso!');
      } else {
        alert('❌ Erro: ' + data.error);
      }
    } catch (error) {
      alert('❌ Erro ao excluir item');
    }
  };

  const saveToHistory = async (historyData) => {
    try {
      const response = await fetch('https://meu-gerador-backend.onrender.com/save-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyData)
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
      return false;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours} h`;
    if (diffDays < 7) return `Há ${diffDays} dia(s)`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getToolIcon = (toolType) => {
    const icons = {
      'image': <PhotoIcon className="h-5 w-5 text-purple-400" />,
      'spreadsheet': <TableCellsIcon className="h-5 w-5 text-green-400" />,
      'social': <ChatBubbleLeftRightIcon className="h-5 w-5 text-pink-400" />,
      'abnt': <DocumentTextIcon className="h-5 w-5 text-blue-400" />,
      'translation': <BriefcaseIcon className="h-5 w-5 text-yellow-400" />,
      'essay': <AcademicCapIcon className="h-5 w-5 text-red-400" />,
      'interview': <BriefcaseIcon className="h-5 w-5 text-indigo-400" />,
      'study': <PuzzlePieceIcon className="h-5 w-5 text-teal-400" />,
      'cover-letter': <DocumentTextIcon className="h-5 w-5 text-orange-400" />,
      'video-prompt': <PhotoIcon className="h-5 w-5 text-cyan-400" />,
      'text-summary': <DocumentTextIcon className="h-5 w-5 text-gray-400" />,
      'chat-pdf': <DocumentTextIcon className="h-5 w-5 text-lime-400" />
    };
    return icons[toolType] || <DocumentTextIcon className="h-5 w-5 text-gray-400" />;
  };

  const getToolColor = (toolType) => {
    const colors = {
      'image': 'bg-purple-900/30 border-purple-700',
      'spreadsheet': 'bg-green-900/30 border-green-700',
      'social': 'bg-pink-900/30 border-pink-700',
      'abnt': 'bg-blue-900/30 border-blue-700',
      'default': 'bg-gray-800 border-gray-700'
    };
    return colors[toolType] || colors.default;
  };

  // Usuários free só veem últimos 3 itens (a menos que sejam PRO)
  const displayHistory = isPro || showAll ? history : history.slice(0, 3);

  if (!user) {
    return (
      <div className="mt-8 p-6 text-center bg-gray-800 rounded-xl border border-gray-700">
        <p className="text-gray-400">Faça login para ver seu histórico de atividades</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-8 p-8 text-center bg-gray-800 rounded-xl border border-gray-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Carregando histórico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-6 text-center bg-red-900/20 rounded-xl border border-red-700">
        <p className="text-red-300">❌ {error}</p>
        <button 
          onClick={() => user && loadHistory(user.id)}
          className="mt-3 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="mt-8 p-8 text-center bg-gray-800 rounded-xl border border-gray-700">
        <div className="text-4xl mb-4">📭</div>
        <p className="text-gray-300 font-medium">Nenhuma atividade registrada ainda</p>
        <p className="text-gray-500 text-sm mt-2">
          {toolType 
            ? `Use a ferramenta "${toolType}" e seus resultados aparecerão aqui!`
            : 'Use as ferramentas e seus resultados aparecerão aqui!'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* HEADER */}
      {showHeader && (
        <div className="px-6 py-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ClockIcon className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">
              Histórico de Atividades
              {toolType && (
                <span className="ml-3 px-3 py-1 bg-purple-900 text-purple-300 text-xs font-medium rounded-full">
                  {toolType === 'image' ? 'Imagens' : 
                   toolType === 'spreadsheet' ? 'Planilhas' :
                   toolType === 'social' ? 'Social Media' : 
                   toolType.charAt(0).toUpperCase() + toolType.slice(1)}
                </span>
              )}
            </h3>
          </div>
          
          {!isPro && history.length > 3 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              {showAll ? (
                <>
                  <EyeSlashIcon className="h-4 w-4" />
                  Mostrar menos
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4" />
                  Mostrar todos ({history.length})
                </>
              )}
              {!isPro && <span className="text-yellow-400 text-xs">PRO</span>}
            </button>
          )}
        </div>
      )}
      
      {/* LISTA DE ITENS */}
      <div className="max-h-[500px] overflow-y-auto">
        {displayHistory.map((item) => (
          <div 
            key={item.id} 
            className={`p-5 border-b border-gray-700 hover:bg-gray-750 transition-colors ${getToolColor(item.tool_type)}`}
          >
            <div className="flex gap-4">
              {/* ÍCONE */}
              <div className="flex-shrink-0 pt-1">
                <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
                  {getToolIcon(item.tool_type)}
                </div>
              </div>
              
              {/* CONTEÚDO */}
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-semibold text-base mb-1">
                      {item.tool_name}
                    </h4>
                    <div className="flex items-center gap-4 text-gray-400 text-xs">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {formatDate(item.created_at)}
                      </span>
                      {item.metadata?.credits_used && (
                        <span className="flex items-center gap-1">
                          💎 {item.metadata.credits_used} crédito(s)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* AÇÕES */}
                  <div className="flex gap-2">
                    {item.output_data && item.tool_type === 'image' && (
                      <button
                        onClick={() => window.open(item.output_data, '_blank')}
                        className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 border border-blue-700 text-blue-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Ver imagem"
                      >
                        <EyeIcon className="h-3 w-3" />
                        Ver
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Excluir do histórico"
                    >
                      <TrashIcon className="h-3 w-3" />
                      Excluir
                    </button>
                  </div>
                </div>
                
                {/* INPUT DO USUÁRIO */}
                <div className="mb-3">
                  <div className="text-gray-500 text-xs font-medium mb-1.5">ENTRADA:</div>
                  <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <p className="text-gray-300 text-sm break-words">
                      {item.input_data.length > 200 
                        ? `${item.input_data.substring(0, 200)}...` 
                        : item.input_data}
                    </p>
                  </div>
                </div>
                
                {/* OUTPUT GERADO (se existir) */}
                {item.output_data && (
                  <div>
                    <div className="text-green-500 text-xs font-medium mb-1.5">RESULTADO:</div>
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <div className="text-gray-300 text-sm break-words">
                        {item.output_data.length > 250 
                          ? `${item.output_data.substring(0, 250)}...` 
                          : item.output_data}
                      </div>
                      {item.tool_type === 'spreadsheet' && (
                        <button
                          onClick={() => {
                            // Simular download
                            const a = document.createElement('a');
                            a.href = '#';
                            a.download = `backup_${item.id.slice(0, 8)}.xlsx`;
                            a.click();
                          }}
                          className="mt-2 px-3 py-1 bg-green-900 hover:bg-green-800 text-green-300 rounded text-xs font-medium flex items-center gap-1 inline-flex"
                        >
                          <ArrowDownTrayIcon className="h-3 w-3" />
                          Baixar novamente
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* FOOTER - Upsell para PRO */}
      {!isPro && history.length > 3 && (
        <div className="p-5 bg-gradient-to-r from-purple-900/40 to-gray-900 border-t border-gray-700 text-center">
          <p className="text-purple-300 font-medium mb-2">
            👑 Acesso limitado ao histórico
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Usuários PRO veem histórico completo ilimitado + exportação em PDF
          </p>
          <button
            onClick={() => window.location.href = '/precos'}
            className="px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-yellow-500/20"
          >
            Ver Planos PRO
          </button>
        </div>
      )}
    </div>
  );
}

// Exportar função auxiliar para outras páginas usarem
export const saveHistoryItem = async (user, toolType, toolName, input, output = '', metadata = {}) => {
  if (!user) return false;
  
  const historyData = {
    user_id: user.id,
    tool_type: toolType,
    tool_name: toolName,
    input_data: input,
    output_data: output,
    metadata: metadata
  };
  
  try {
    const response = await fetch('https://meu-gerador-backend.onrender.com/save-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(historyData)
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
    return false;
  }
};