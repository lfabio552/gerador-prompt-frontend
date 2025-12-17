import React, { useState } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';

export default function ChatPDF() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documentId, setDocumentId] = useState(null); // ID do doc atual
  
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // Histórico da conversa
  const [asking, setAsking] = useState(false);

  // --- FUNÇÃO DE UPLOAD ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Selecione um arquivo!");
    
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login primeiro.');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', user.id);

      // ATENÇÃO: Mude para o link do Render no deploy!
      const response = await fetch('https://meu-gerador-backend.onrender.com/upload-document', {
        method: 'POST',
        body: formData, 
        // Não colocamos Content-Type aqui, o navegador define automatico para multipart/form-data
      });

      const data = await response.json();
      
      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro no upload.');

      setDocumentId(data.document_id);
      alert("Documento processado! Pode perguntar.");

    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- FUNÇÃO DE PERGUNTAR ---
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question) return;

    const userQuestion = question;
    setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);
    setQuestion('');
    setAsking(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch('https://meu-gerador-backend.onrender.com/ask-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuestion,
          user_id: user.id,
          document_id: documentId // Opcional, ajuda a filtrar se quiser
        }),
      });

      const data = await response.json();
      
      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro na resposta.');

      setChatHistory(prev => [...prev, { role: 'ai', content: data.answer }]);

    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "Erro: " + error.message }]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Chat com PDF (RAG) 🧠</h1>
        <p>Converse com seus contratos, apostilas ou livros.</p>
      </header>

      {/* FASE 1: UPLOAD (Só mostra se não tiver processado ainda) */}
      {!documentId && (
        <form onSubmit={handleUpload} style={{ marginBottom: '40px' }}>
          <div className="form-group" style={{ textAlign: 'center', border: '2px dashed #3A3A3A', padding: '40px', borderRadius: '10px' }}>
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', color: '#9D4EDD', fontWeight: 'bold', fontSize: '18px' }}>
              {file ? file.name : "📂 Clique para selecionar um PDF"}
            </label>
          </div>
          <button type="submit" disabled={uploading}>
            {uploading ? 'Lendo e vetorizando (-1 Crédito)...' : 'Processar Documento'}
          </button>
        </form>
      )}

      {/* FASE 2: CHAT (Mostra depois do upload) */}
      {documentId && (
        <div className="chat-interface" style={{ textAlign: 'left' }}>
          
          <div className="chat-box" style={{ 
            height: '400px', overflowY: 'auto', backgroundColor: '#1f2937', 
            padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #374151' 
          }}>
            {chatHistory.length === 0 && <p style={{color: '#6b7280', textAlign: 'center'}}>Pergunte algo sobre o documento...</p>}
            
            {chatHistory.map((msg, index) => (
              <div key={index} style={{ 
                marginBottom: '15px', 
                textAlign: msg.role === 'user' ? 'right' : 'left' 
              }}>
                <span style={{ 
                  display: 'inline-block',
                  padding: '10px 15px', 
                  borderRadius: '10px',
                  backgroundColor: msg.role === 'user' ? '#7e22ce' : '#374151',
                  color: 'white',
                  maxWidth: '80%'
                }}>
                  {msg.content}
                </span>
              </div>
            ))}
            {asking && <p style={{color: '#9ca3af'}}>A IA está lendo...</p>}
          </div>

          <form onSubmit={handleAsk} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Qual é o prazo do contrato?"
              style={{ flex: 1, padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: 'white' }}
            />
            <button type="submit" disabled={asking} style={{ width: '100px', marginTop: 0 }}>
              Enviar
            </button>
          </form>
          
          <button onClick={() => setDocumentId(null)} style={{ marginTop: '20px', backgroundColor: 'transparent', border: '1px solid #6b7280', fontSize: '12px', padding: '5px 10px' }}>
            Carregar outro arquivo
          </button>
        </div>
      )}
    
      <ExemplosSection ferramentaId="chat-pdf" />
</div>
  );
}