import React, { useState, useEffect } from 'react';

export default function HistoryList({ user, toolType }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Carrega histórico automaticamente quando o componente é montado
  useEffect(() => {
    if (user && user.id) {
      loadHistory();
    }
  }, [user, toolType]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://meu-gerador-backend.onrender.com/get-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id,
          tool_type: toolType,
          limit: 10
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history || []);
      } else {
        setError(data.error || 'Erro ao carregar histórico');
      }
    } catch (err) {
      setError('Falha na conexão com o servidor');
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('✅ Texto copiado!');
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Excluir este item do histórico?')) return;
    
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
        alert('✅ Item excluído!');
        loadHistory(); // Recarrega a lista
      } else {
        alert('❌ Erro ao excluir: ' + data.error);
      }
    } catch (err) {
      alert('❌ Erro de conexão ao excluir');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '30px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #7e22ce',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          margin: '0 auto 15px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#9ca3af' }}>Carregando seu histórico...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#450a0a', 
        borderRadius: '8px',
        color: '#fca5a5',
        textAlign: 'center'
      }}>
        ⚠️ {error}
        <br/>
        <button 
          onClick={loadHistory}
          style={{
            marginTop: '10px',
            padding: '8px 15px',
            backgroundColor: '#7e22ce',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
        <p>Nenhuma formatação no histórico ainda.</p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          Use a ferramenta para começar a construir seu histórico!
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {history.map((item) => (
        <div 
          key={item.id}
          style={{
            backgroundColor: '#111827',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '12px',
            borderLeft: '4px solid #7e22ce',
            position: 'relative'
          }}
        >
          {/* Cabeçalho com data e ações */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <span style={{ 
              color: '#9ca3af', 
              fontSize: '13px',
              backgroundColor: '#374151',
              padding: '3px 8px',
              borderRadius: '4px'
            }}>
              {formatDate(item.created_at)}
            </span>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => copyToClipboard(item.input_data)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                title="Copiar texto original"
              >
                📋
              </button>
              
              <button
                onClick={() => deleteItem(item.id)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                title="Excluir"
              >
                🗑️
              </button>
            </div>
          </div>
          
          {/* Texto original */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ 
              color: '#d1d5db', 
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '5px'
            }}>
              Texto original:
            </div>
            <div style={{
              color: '#9ca3af',
              fontSize: '13px',
              backgroundColor: '#1f2937',
              padding: '10px',
              borderRadius: '5px',
              maxHeight: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.input_data}
            </div>
          </div>
          
          {/* Texto formatado (se existir) */}
          {item.output_data && (
            <div>
              <div style={{ 
                color: '#d1d5db', 
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '5px'
              }}>
                Texto formatado:
              </div>
              <div style={{
                color: '#9ca3af',
                fontSize: '13px',
                backgroundColor: '#1f2937',
                padding: '10px',
                borderRadius: '5px',
                maxHeight: '60px',
                overflow: 'hidden'
              }}>
                {item.output_data.substring(0, 100)}
                {item.output_data.length > 100 ? '...' : ''}
              </div>
            </div>
          )}
          
          {/* Botão para usar novamente */}
          <button
            onClick={() => {
              // Dispara evento para o AgenteABNT usar este texto
              const event = new CustomEvent('loadFromHistory', { 
                detail: { text: item.input_data } 
              });
              window.dispatchEvent(event);
            }}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              border: '1px solid #7e22ce',
              color: '#d8b4fe',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#7e22ce';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#d8b4fe';
            }}
          >
            ↻ Usar Este Texto Novamente
          </button>
        </div>
      ))}
    </div>
  );
}