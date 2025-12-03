import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient'; 

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

      // --- AQUI ESTAVA O PROBLEMA! ---
      // Para testar no seu PC, use o link LOCAL (127.0.0.1:5000)
      // Quando for subir pro ar (deploy), troque pelo link do Render.
      
      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-spreadsheet', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            description,
            user_id: user.id 
        }),
      });

      if (response.status === 402) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      if (!response.ok) {
        let errorMessage = 'Erro ao gerar a planilha.';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch (e) {
            errorMessage = `Erro do Servidor: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'planilha_ia.xlsx';
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
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Descreva sua planilha:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Uma planilha de controle de estoque com colunas para produto, quantidade, valor unitário e valor total..."
            required
            style={{ minHeight: '150px', width: '95%', padding: '15px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#374151', color: 'white' }}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Gerando (-1 Crédito)...' : 'Baixar Planilha'}
        </button>
      </form>

      {error && (
        <div className="error-message" style={{color: '#ff6b6b', marginTop: '20px', padding: '10px', border: '1px solid #ff6b6b', borderRadius: '8px', backgroundColor: '#450a0a'}}>
            <strong>Ops!</strong> {error}
        </div>
      )}
    </div>
  );
}