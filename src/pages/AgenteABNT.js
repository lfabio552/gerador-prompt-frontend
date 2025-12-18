import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';
// IMPORTANTE: Importar a função saveHistoryItem
import { saveHistoryItem } from '../components/HistoryPanel';

export default function AgenteABNT() {
  const [rawText, setRawText] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // Novo estado para mostrar histórico

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFormattedText('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Login necessário.');

      const response = await fetch('https://meu-gerador-backend.onrender.com/format-abnt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            text: rawText,
            user_id: user.id 
        }),
      });

      const data = await response.json();

      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro ao formatar.');

      setFormattedText(data.formatted_text);

      // ============================================
      // PARTE NOVA: SALVAR NO HISTÓRICO
      // ============================================
      try {
        const historySaved = await saveHistoryItem(
          user,
          'abnt',  // tool_type
          'Formatador ABNT',  // tool_name
          rawText.substring(0, 800),  // input_data (limitamos tamanho)
          data.formatted_text.substring(0, 1500),  // output_data
          { 
            credits_used: 1,
            original_length: rawText.length,
            formatted_length: data.formatted_text.length
          }
        );
        
        if (historySaved) {
          console.log('✅ Histórico do ABNT salvo com sucesso!');
        } else {
          console.warn('⚠️ Histórico não foi salvo (mas a ferramenta funcionou)');
        }
      } catch (historyError) {
        console.error('❌ Erro ao salvar histórico:', historyError);
        // NÃO mostramos erro para o usuário, só no console
        // O importante é que a ferramenta funcionou
      }
      // ============================================

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!formattedText) {
      alert("Primeiro gere o texto formatado.");
      return;
    }
    setIsDownloading(true);
    setError('');

    try {
      const response = await fetch('https://meu-gerador-backend.onrender.com/download-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown_text: formattedText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar o arquivo.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trabalho_formatado.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // Função para carregar um item do histórico
  const loadFromHistory = (text) => {
    setRawText(text);
    setFormattedText('');
    setError('');
    // Rola para o topo do formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container">
      <header>
        <h1>Agente de Formatação ABNT 🎓</h1>
        <p>Cole seu trabalho abaixo e deixe a IA formatar para você.</p>
        
        {/* BOTÃO PARA HISTÓRICO */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#374151',
            color: '#d1d5db',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showHistory ? '▲ Ocultar Histórico' : '📚 Ver Meu Histórico ABNT'}
        </button>
      </header>
      
      {/* SEÇÃO DO HISTÓRICO (se estiver visível) */}
      {showHistory && (
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#1f2937',
          borderRadius: '10px',
          border: '1px solid #374151'
        }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '15px' }}>
            📖 Seu Histórico de Formatações
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            O histórico está sendo salvo automaticamente. Em breve você poderá ver e reutilizar suas formatações anteriores aqui.
          </p>
          <div style={{
            padding: '15px',
            backgroundColor: '#111827',
            borderRadius: '8px',
            marginTop: '15px',
            color: '#6b7280',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            🚧 Funcionalidade em desenvolvimento
            <br/>
            <small>Os dados já estão sendo salvos no banco de dados.</small>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Seu texto:</label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Cole seu texto aqui..."
            required
            style={{ minHeight: '250px' }}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Formatando (-1 Crédito)...' : 'Formatar Texto'}
        </button>
      </form>

      {error && <div className="error-message" style={{color: '#ff6b6b', marginTop: '20px'}}>{error}</div>}

      {formattedText && (
        <div className="result-container" style={{textAlign: 'left', marginTop: '40px'}}>
          <h2 style={{color: '#9D4EDD'}}>Seu Texto Formatado:</h2>
          <div className="prompt-box" style={{whiteSpace: 'pre-wrap'}}>
            <p>{formattedText}</p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(formattedText)} className="copy-button">Copiar Texto</button>
          <button onClick={handleDownload} disabled={isDownloading} className="copy-button" style={{marginLeft: '10px', backgroundColor: '#5A189A'}}>
            {isDownloading ? 'Gerando .docx...' : 'Baixar como Word (.docx)'}
          </button>
        </div>
      )}
    
      <ExemplosSection ferramentaId="agente-abnt" />
    </div>
  );
}