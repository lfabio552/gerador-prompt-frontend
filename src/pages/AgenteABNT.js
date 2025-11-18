import React, { useState } from 'react';
import '../App.css'; // Reutilizando nosso CSS principal

export default function AgenteABNT() {
  const [rawText, setRawText] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

const handleDownload = async () => {
  if (!formattedText) {
    alert("Primeiro gere o texto formatado para depois baixá-lo.");
    return;
  }

  setIsDownloading(true);
  setError('');

  try {
    // ATENÇÃO: Mude para o link do Render no deploy final!
    const response = await fetch('https://meu-gerador-backend.onrender.com/download-docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ markdown_text: formattedText }), // Envia o texto formatado
    });

    if (!response.ok) {
      // Se der erro, tenta ler a mensagem de erro do backend
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao gerar o arquivo.');
    }

    // Pega o arquivo (blob) que o backend mandou
    const blob = await response.blob();

    // Cria um link "fantasma" para forçar o download no navegador
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trabalho_formatado.docx'; // O nome do arquivo
    document.body.appendChild(a); // Adiciona o link
    a.click(); // Clica no link
    a.remove(); // Remove o link
    URL.revokeObjectURL(url); // Limpa a memória

  } catch (err) {
    setError(err.message);
  } finally {
    setIsDownloading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFormattedText('');

    try {
      // ATENÇÃO: Estamos apontando para o Localhost para testar primeiro.
      // Lembrar de trocar para o Render antes do deploy final.
      const response = await fetch('https://meu-gerador-backend.onrender.com/format-abnt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: rawText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao formatar.');
      }

      setFormattedText(data.formatted_text);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
          <label>Seu texto (pode colar de qualquer jeito):</label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Cole seu TCC, introdução, citações, referências..."
            required
            style={{ minHeight: '250px' }} // Uma caixa maior
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Formatando...' : 'Formatar Texto'}
        </button>
      </form>

      {error && <div className="error-message" style={{color: '#ff6b6b', marginTop: '20px'}}>{error}</div>}

      {/* Área de Resultado */}
      {formattedText && (
        <div className="result-container" style={{textAlign: 'left', marginTop: '40px'}}>
          <h2 style={{color: '#9D4EDD'}}>Seu Texto Formatado:</h2>
          <div className="prompt-box" style={{whiteSpace: 'pre-wrap'}}>
            {/* O 'pre-wrap' é MÁGICO. Ele respeita os parágrafos e quebras de linha do Markdown */}
            <p>{formattedText}</p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(formattedText)} className="copy-button">Copiar Texto Formatado</button>
     	  <button onClick={handleDownload} disabled={isDownloading} className="copy-button" style={{marginLeft: '10px', backgroundColor: '#5A189A'}}>
        {isDownloading ? 'Gerando .docx...' : 'Baixar como Word (.docx)'}
      </button>
        </div>
      )}
    </div>
  );
}