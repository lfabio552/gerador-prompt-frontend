import React, { useState, useEffect } from 'react'; // ← useEffect aqui!
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';
import { saveHistoryItem } from '../utils/history';
import HistoryList from '../components/HistoryList'; // Novo componente

export default function AgenteABNT() {
  // Estados
  const [rawText, setRawText] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // ✅ CORRETO: useEffect NO NÍVEL DO COMPONENTE
  useEffect(() => {
    const handleLoadFromHistory = (event) => {
      if (event.detail && event.detail.text) {
        setRawText(event.detail.text);
        setFormattedText('');
        setError('');
        setShowHistory(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    window.addEventListener('loadFromHistory', handleLoadFromHistory);
    
    return () => {
      window.removeEventListener('loadFromHistory', handleLoadFromHistory);
    };
  }, []); // ← Importante: array vazio!

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

      // Salvar histórico
      const historySaved = await saveHistoryItem(
        user,
        'abnt',
        'Formatador ABNT',
        rawText,
        data.formatted_text,
        { 
          credits_used: 1,
          original_length: rawText.length,
          formatted_length: data.formatted_text.length
        }
      );

      console.log(historySaved ? '✅ Histórico salvo!' : '⚠️ Histórico não salvo');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ... resto das funções (handleDownload, etc) ...

  return (
    // ... JSX do componente ...
  );
}