import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient'; // Importando

export default function SpreadsheetGenerator() {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Você precisa estar logado.');

      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-spreadsheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            description,
            user_id: user.id // Enviando ID
        }),
      });

      if (response.status === 402) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar a planilha.');
      }

      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'planilha_gerada.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Gerador de Planilhas IA 📊</h1>
        <p>Descreva a planilha que você precisa, e a IA cria o .xlsx para você.</p>
      </header>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Descreva sua planilha:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Uma planilha de controle de estoque..."
            required
            style={{ minHeight: '150px' }}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Gerando (-1 Crédito)...' : 'Baixar Planilha'}
        </button>
      </form>

      {error && <div className="error-message" style={{color: '#ff6b6b', marginTop: '20px'}}>{error}</div>}
    </div>
  );
}