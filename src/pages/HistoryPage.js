import React from 'react';
import HistoryPanel from '../components/HistoryPanel';

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            📜 Meu Histórico Completo
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Todas as ferramentas que você usou e os resultados gerados
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-purple-900/30 text-purple-300 rounded-full text-sm">
              🖼️ Imagens
            </span>
            <span className="px-4 py-2 bg-green-900/30 text-green-300 rounded-full text-sm">
              📊 Planilhas
            </span>
            <span className="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-full text-sm">
              📝 Documentos
            </span>
            <span className="px-4 py-2 bg-pink-900/30 text-pink-300 rounded-full text-sm">
              📱 Social Media
            </span>
          </div>
        </header>
        
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <HistoryPanel showHeader={false} />
        </div>
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-white">📊 Estatísticas</h3>
            <p className="text-gray-400 text-sm">
              Em breve: gráficos de uso, ferramentas mais usadas e insights sobre sua produtividade.
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-white">💾 Exportar</h3>
            <p className="text-gray-400 text-sm mb-4">
              Usuários PRO podem exportar histórico completo em PDF ou Excel.
            </p>
            <button 
              onClick={() => window.location.href = '/precos'}
              className="px-4 py-2 bg-gradient-to-r from-purple-700 to-pink-700 text-white rounded-lg text-sm font-medium"
            >
              Tornar-se PRO
            </button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-white">🔍 Busca Avançada</h3>
            <p className="text-gray-400 text-sm">
              Em breve: filtrar por data, tipo de ferramenta ou palavras-chave nos resultados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}