import React, { useState } from 'react';
import '../App.css'; 
import { supabase } from '../supabaseClient';

export default function AgenteABNT() {
  const [rawText, setRawText] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

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
      // O download não cobra crédito extra, então não precisa mandar user_id se não quiser,
      // mas o backend não vai reclamar se não mandar.
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

  return (
    <div className="container">
      <header>
        <h1>Agente de Formatação ABNT 🎓</h1>
        <p>Cole seu trabalho abaixo e deixe a IA formatar para você.</p>
      </header>
      
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
    </div>
  );
}