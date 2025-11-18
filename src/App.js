// frontend/src/App.js
import VideoSummarizer from './pages/VideoSummarizer';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ImagePromptGenerator from './pages/ImagePromptGenerator';
import Veo3PromptGenerator from './pages/Veo3PromptGenerator';
import './App.css'; // Estilo global que já temos
import AgenteABNT from './pages/AgenteABNT';
import SpreadsheetGenerator from './pages/SpreadsheetGenerator';


function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Aqui você poderia adicionar um menu de navegação que aparece em todas as páginas */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gerador-imagem" element={<ImagePromptGenerator />} />
          {/* A rota para o VEO 3 será adicionada aqui depois */}
          <Route path="/gerador-veo3" element={<Veo3PromptGenerator />} /> 
	  <Route path="/resumidor-video" element={<VideoSummarizer />} />
	  <Route path="/agente-abnt" element={<AgenteABNT />} />
	  <Route path="/gerador-planilha" element={<SpreadsheetGenerator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;