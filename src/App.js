import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';

// --- IMPORTAÇÕES DE CSS (AQUI ESTÁ A CORREÇÃO DAS SETAS) ---
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
// -----------------------------------------------------------

// Importando nossas páginas
import HomePage from './pages/HomePage';
import ImagePromptGenerator from './pages/ImagePromptGenerator';
import Veo3PromptGenerator from './pages/Veo3PromptGenerator';
import VideoSummarizer from './pages/VideoSummarizer';
import AgenteABNT from './pages/AgenteABNT';
import SpreadsheetGenerator from './pages/SpreadsheetGenerator';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} /> 
            <Route path="/gerar-imagem" element={<ImagePromptGenerator />} />
            <Route path="/gerar-veo3-prompt" element={<Veo3PromptGenerator />} />
            <Route path="/resumir-video" element={<VideoSummarizer />} />
            <Route path="/agente-abnt" element={<AgenteABNT />} />
            <Route path="/gerador-planilha" element={<SpreadsheetGenerator />} />
	    <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 p-4 text-center text-gray-400 mt-8">
          <p>&copy; {new Date().getFullYear()} Meu App de IA. Todos os direitos reservados.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;