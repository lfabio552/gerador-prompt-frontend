import React, { useState, useEffect } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';
import ExemplosSection from '../components/ExemplosSection';
import { saveToHistory, TOOL_CONFIGS } from '../utils/saveToHistory';
import HistoryList from '../components/HistoryList';

export default function CoverLetterGenerator() {
  const [cvText, setCvText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [tone, setTone] = useState('Profissional e Confiante');
  const [letter, setLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

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
    setLetter('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para gerar sua carta.');
      setUser(user);

      const response = await fetch('https://meu-gerador-backend.onrender.com/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cv_text: cvText,
          job_desc: jobDesc,
          tone: tone,
          user_id: user.id 
        }),
      });

      const data = await response.json();

      if (response.status === 402) throw new Error(data.error);
      if (!response.ok) throw new Error(data.error || 'Erro ao gerar carta.');

      setLetter(data.cover_letter);

      // SALVAR HISTÓRICO
      await saveToHistory(
        user,
        TOOL_CONFIGS.COVER_LETTER,
        `Vaga: ${jobDesc.substring(0, 100)}...\n\nCurrículo: ${cvText.substring(0, 200)}...`,
        data.cover_letter.substring(0, 500) + '...',
        { 
          tone: tone,
          cv_length: cvText.length,
          job_desc_length: jobDesc.length,
          letter_length: data.cover_letter.length
        }
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
    alert('Carta copiada para a área de transferência!');
  };

  const downloadLetter = () => {
    if (!letter) return;
    
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carta_apresentacao_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFields = () => {
    setCvText('');
    setJobDesc('');
    setLetter('');
    setError('');
  };

  return (
    <div className="container">
      <header>
        <h1>Gerador de Carta de Apresentação ✍️</h1>
        <p>Aumente suas chances de entrevista com uma carta persuasiva.</p>
        
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
          <HistoryList user={user} toolType="cover-letter" />
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '25px' }}>
          {/* COLUNA 1: Currículo */}
          <div className="form-group" style={{ flex: 1, minWidth: '300px', textAlign: 'left' }}>
            <label style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#3b82f6' }}>📄</span>
              1. Resumo do seu Currículo/Experiência:
            </label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Ex: Tenho 5 anos de experiência com Vendas B2B, formado em Administração com MBA em Marketing. Conquistei aumento de 30% nas vendas trimestrais na empresa anterior..."
              required
              style={{ 
                minHeight: '200px', 
                width: '100%', 
                padding: '15px', 
                borderRadius: '8px', 
                border: '1px solid #4b5563', 
                backgroundColor: '#374151', 
                color: 'white',
                fontSize: '15px',
                lineHeight: '1.5'
              }}
            />
            <div style={{ 
              marginTop: '5px',
              color: '#9ca3af',
              fontSize: '13px'
            }}>
              💡 Inclua: Experiência, formação, conquistas, habilidades
            </div>
          </div>

          {/* COLUNA 2: Vaga */}
          <div className="form-group" style={{ flex: 1, minWidth: '300px', textAlign: 'left' }}>
            <label style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981' }}>💼</span>
              2. Descrição da Vaga (Copie do LinkedIn):
            </label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Ex: Buscamos vendedor com experiência em CRM e negociação. Responsabilidades: prospectar clientes, fechar contratos, manter relacionamento. Requisitos: Formação em Administração, inglês intermediário..."
              required
              style={{ 
                minHeight: '200px', 
                width: '100%', 
                padding: '15px', 
                borderRadius: '8px', 
                border: '1px solid #4b5563', 
                backgroundColor: '#374151', 
                color: 'white',
                fontSize: '15px',
                lineHeight: '1.5'
              }}
            />
            <div style={{ 
              marginTop: '5px',
              color: '#9ca3af',
              fontSize: '13px'
            }}>
              💡 Cole a descrição completa para melhor personalização
            </div>
          </div>
        </div>

        <div className="form-group" style={{ textAlign: 'left', marginBottom: '30px' }}>
          <label style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#8b5cf6' }}>🎭</span>
            3. Tom de Voz da Carta:
          </label>
          <select 
            value={tone} 
            onChange={(e) => setTone(e.target.value)}
            style={{ 
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #4b5563',
              backgroundColor: '#374151',
              color: 'white',
              fontSize: '16px'
            }}
          >
            <option>Profissional e Confiante (Padrão)</option>
            <option>Criativo e Inovador (Startups)</option>
            <option>Apaixonado e Entusiasta</option>
            <option>Direto e Executivo</option>
            <option>Formal e Técnico (Áreas jurídicas/médicas)</option>
            <option>Empático e Humano (ONGs/Educação)</option>
          </select>
          <div style={{ 
            marginTop: '8px',
            color: '#9ca3af',
            fontSize: '14px',
            padding: '10px',
            backgroundColor: '#1f2937',
            borderRadius: '6px',
            borderLeft: '4px solid #8b5cf6'
          }}>
            <strong>Tom selecionado:</strong> {tone} – A carta será adaptada para este estilo
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
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
                Escrevendo (-1 Crédito)...
              </>
            ) : '✨ Gerar Carta Personalizada'}
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

      {letter && (
        <div className="result-container" style={{
          textAlign: 'left', 
          marginTop: '40px',
          padding: '0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}>
          
          {/* CABEÇALHO */}
          <div style={{ 
            backgroundColor: '#4c1d95', 
            padding: '25px', 
            textAlign: 'center'
          }}>
            <h2 style={{ 
              color: '#fff', 
              margin: 0,
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px'
            }}>
              ✉️ Sua Carta de Apresentação Personalizada
            </h2>
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '15px',
              flexWrap: 'wrap'
            }}>
              <div style={{ 
                backgroundColor: '#7e22ce',
                color: 'white',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Tom: {tone}
              </div>
              <div style={{ 
                backgroundColor: '#7e22ce',
                color: 'white',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {letter.length} caracteres
              </div>
              <div style={{ 
                backgroundColor: '#7e22ce',
                color: 'white',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                📄 Formato profissional
              </div>
            </div>
          </div>

          {/* CARTA */}
          <div style={{ 
            padding: '40px',
            backgroundColor: '#f9fafb',
            color: '#111827',
            minHeight: '500px',
            fontFamily: 'Georgia, serif',
            lineHeight: '1.8'
          }}>
            <div style={{ 
              maxWidth: '800px',
              margin: '0 auto',
              padding: '40px',
              backgroundColor: 'white',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                textAlign: 'right',
                marginBottom: '40px',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                <div>Seu Nome</div>
                <div>Seu Endereço • Seu Telefone • Seu Email</div>
                <div>LinkedIn: linkedin.com/in/seu-perfil</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div>Data: {new Date().toLocaleDateString('pt-BR')}</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div>À equipe de Recrutamento</div>
                <div>Nome da Empresa</div>
                <div>Endereço da Empresa</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div><strong>Assunto:</strong> Candidatura à vaga de [Cargo]</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div><strong>Prezados(as) Senhores(as),</strong></div>
              </div>
              
              <div style={{ 
                whiteSpace: 'pre-wrap',
                fontSize: '15px',
                lineHeight: '1.8',
                marginBottom: '40px'
              }}>
                {letter}
              </div>
              
              <div style={{ marginBottom: '40px' }}>
                <div>Atenciosamente,</div>
                <div style={{ marginTop: '40px' }}>
                  <div>___________________________</div>
                  <div>Seu Nome Completo</div>
                </div>
              </div>
              
              <div style={{ 
                fontSize: '12px',
                color: '#6b7280',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '20px',
                fontStyle: 'italic'
              }}>
                <strong>Nota:</strong> Esta é uma carta gerada por IA. Revise e personalize com seus dados exatos antes de enviar.
              </div>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div style={{ 
            padding: '25px',
            backgroundColor: '#1f2937',
            borderTop: '1px solid #374151',
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={copyToClipboard}
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
                gap: '10px',
                minWidth: '180px'
              }}
            >
              📋 Copiar Texto
            </button>
            
            <button 
              onClick={downloadLetter}
              style={{
                padding: '12px 25px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '180px'
              }}
            >
              ⬇️ Baixar como .txt
            </button>
            
            <button 
              onClick={() => window.print()}
              style={{
                padding: '12px 25px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '180px'
              }}
            >
              🖨️ Imprimir/PDF
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
              ✨ Nova Carta
            </button>
          </div>
          
          {/* DICAS */}
          <div style={{ 
            padding: '20px',
            backgroundColor: '#4c1d95',
            textAlign: 'center'
          }}>
            <p style={{ color: '#e9d5ff', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
              <strong>💡 Dicas para usar sua carta:</strong> 
              1) Substitua "[Cargo]" pelo cargo real • 
              2) Adicione nome e dados da empresa • 
              3) Personalize trechos específicos • 
              4) Revise ortografia e gramática • 
              5) Salve como PDF para enviar
            </p>
          </div>
        </div>
      )}
      
      <ExemplosSection ferramentaId="gerador-carta" />
    </div>
  );
}