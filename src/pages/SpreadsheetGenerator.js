import React, { useState, useEffect } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';
import { saveToHistory, TOOL_CONFIGS } from '../utils/saveToHistory';
import HistoryList from '../components/HistoryList';

export default function SpreadsheetGenerator() {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [generatedInfo, setGeneratedInfo] = useState(null);

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
    setGeneratedInfo(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para gerar planilhas.');
      setUser(user);

      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-spreadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: description,
          user_id: user.id 
        }),
      });

      const blob = await response.blob();

      if (response.status === 402) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      
      if (!response.ok) {
        throw new Error('Erro ao gerar planilha.');
      }

      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planilha_ia_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setGeneratedInfo({
        filename: a.download,
        size: `${(blob.size / 1024).toFixed(1)} KB`,
        description: description
      });

      // SALVAR HISTÓRICO
      await saveToHistory(
        user,
        TOOL_CONFIGS.SPREADSHEET,
        description,
        `Planilha gerada: ${a.download}`,
        { 
          file_size: `${(blob.size / 1024).toFixed(1)} KB`,
          format: 'Excel (.xlsx)'
        }
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedInfo) return;
    
    setIsDownloading(true);
    try {
      // Re-gera a planilha para download
      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-spreadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: description,
          user_id: user?.id 
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planilha_ia_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erro ao baixar novamente: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const clearFields = () => {
    setDescription('');
    setError('');
    setGeneratedInfo(null);
  };

  return (
    <div className="container">
      <header>
        <h1>Gerador de Planilhas 📊</h1>
        <p>Descreva o que precisa e receba um arquivo Excel pronto.</p>
        
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
          <HistoryList user={user} toolType="spreadsheet" />
        </div>
      )}
      
      <div style={{ width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Descreva sua planilha (seja específico):</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Planilha de controle financeiro mensal com colunas para data, descrição, categoria (alimentação, transporte, lazer), valor e saldo acumulado. Inclua fórmulas para soma automática e gráfico de pizza das categorias."
              required
              style={{ 
                minHeight: '150px',
                width: '95%',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #4b5563',
                backgroundColor: '#374151',
                color: 'white',
                fontFamily: 'sans-serif',
                fontSize: '16px'
              }}
            />
            <div style={{ 
              marginTop: '10px',
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              💡 <strong>Dicas para melhores resultados:</strong>
              <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                <li>Mencione as colunas necessárias</li>
                <li>Descreva fórmulas ou cálculos</li>
                <li>Fale sobre formatação desejada</li>
                <li>Inclua exemplos de dados</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
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
                minWidth: '200px',
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
              ) : '📊 Gerar Planilha Excel'}
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

        {generatedInfo && (
          <div className="result-container" style={{
            textAlign: 'left', 
            marginTop: '40px',
            padding: '25px',
            backgroundColor: '#064e3b',
            borderRadius: '12px',
            border: '1px solid #047857'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h2 style={{ color: '#4ade80', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                ✅ Planilha Gerada com Sucesso!
              </h2>
              <div style={{ 
                backgroundColor: '#065f46',
                color: '#d1fae5',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📁</span> {generatedInfo.size}
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: '#111827',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '25px',
              border: '1px solid #374151'
            }}>
              <h3 style={{ color: '#d1d5db', marginBottom: '10px', fontSize: '16px' }}>
                📝 Descrição usada:
              </h3>
              <p style={{ color: '#9ca3af', margin: 0, lineHeight: '1.5' }}>
                {generatedInfo.description}
              </p>
            </div>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '25px'
            }}>
              <div style={{ 
                backgroundColor: '#111827',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '5px' }}>Formato</div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Excel (.xlsx)</div>
              </div>
              
              <div style={{ 
                backgroundColor: '#111827',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '5px' }}>Tamanho</div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{generatedInfo.size}</div>
              </div>
              
              <div style={{ 
                backgroundColor: '#111827',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '5px' }}>Contém</div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Fórmulas</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                style={{
                  padding: '12px 25px',
                  backgroundColor: isDownloading ? '#059669' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isDownloading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minWidth: '180px'
                }}
              >
                {isDownloading ? (
                  <>
                    <div style={{ 
                      width: '18px', 
                      height: '18px', 
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Baixando...
                  </>
                ) : '⬇️ Baixar Novamente'}
              </button>
              
              <button 
                onClick={() => navigator.clipboard.writeText(description)}
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
                  gap: '10px'
                }}
              >
                📋 Copiar Descrição
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
                🗑️ Criar Nova
              </button>
            </div>
          </div>
        )}
      </div>
      
      <ExemplosSection ferramentaId="gerador-planilha" />
    </div>
  );
}