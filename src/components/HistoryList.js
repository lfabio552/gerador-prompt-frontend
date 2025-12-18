import React, { useState, useEffect } from 'react';

export default function HistoryList({ user, toolType }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.id) {
      loadHistory();
    }
  }, [user, toolType]);

  const loadHistory = async () => {
    if (!user || !user.id) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://meu-gerador-backend.onrender.com/get-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id,
          tool_type: toolType,
          limit: 5
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history || []);
      } else {
        setError(data.error || 'Erro ao carregar');
      }
    } catch (err) {
      setError('Falha na conexão');
      console.error('Erro histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  // ... resto do código do HistoryList que você já tem
  // (com as funções formatDate, copyToClipboard, deleteItem)
};