// frontend/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom'; // Importante para criar links de navegação
import './HomePage.css'; // Vamos criar este arquivo de estilo a seguir

export default function HomePage() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Minha Plataforma de Ferramentas IA</h1>
        <p>Soluções criativas com o poder da Inteligência Artificial</p>
      </header>
      
      <main className="tools-grid">
        {/* Card para o Gerador de Imagem */}
        <Link to="/gerador-imagem" className="tool-card">
          <div className="tool-card-content">
            <h2>Gerador de Prompts de Imagem</h2>
            <p>Crie prompts detalhados para gerar imagens incríveis.</p>
          </div>
        </Link>
        
        {/* Card para o Gerador VEO 3 (ainda não funciona, mas já está na estrutura) */}
        <Link to="/gerador-veo3" className="tool-card">
          <div className="tool-card-content">
            <h2>Gerador de Prompts VEO 3</h2>
            <p>Elabore cenas complexas para a geração de vídeos.</p>
          </div>
        </Link>

	{/* Card para o Agente ABNT */}
      <Link to="/agente-abnt" className="tool-card">
        <div className="tool-card-content">
          <h2>Formatador ABNT</h2>
          <p>Formate seu TCC ou trabalho acadêmico em segundos.</p>
        </div>
      </Link>

	{/* Card para o Gerador de Planilhas */}
      <Link to="/gerador-planilha" className="tool-card">
        <div className="tool-card-content">
          <h2>Gerador de Planilhas</h2>
          <p>Descreva seu controle e baixe um arquivo Excel (.xlsx) pronto.</p>
        </div>
      </Link>

        {/* Adicione mais cards aqui no futuro */}
        
      </main>
    </div>
  );
}