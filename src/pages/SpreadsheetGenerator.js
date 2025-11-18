import React, { useState } from 'react';
import '../App.css';

export default function SpreadsheetGenerator() {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // ATENÇÃO: Testando no Localhost. Mudar para o Render no deploy.
      const response = await fetch('https://meu-gerador-backend.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar a planilha.');
      }

      // Se deu tudo certo, o backend manda o arquivo
      const blob = await response.blob();
      
      // Força o download no navegador
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
            placeholder="Ex: Uma planilha de controle de estoque com colunas para Nome do Produto, ID, Quantidade e Preço."
            required
            style={{ minHeight: '150px' }}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Gerando .xlsx...' : 'Baixar Planilha'}
        </button>
      </form>

      {error && <div className="error-message" style={{color: '#ff6b6b', marginTop: '20px'}}>{error}</div>}
    </div>
  );
}