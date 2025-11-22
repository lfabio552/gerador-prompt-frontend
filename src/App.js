import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// --- IMPORTAÇÕES DE CSS ---
// Certifique-se de que instalou: npm install slick-carousel react-slick
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// --- IMPORTANDO O SEGURANÇA (CATRACA) ---
import ProtectedRoute from './components/ProtectedRoute'; 

// --- IMPORTANDO AS PÁGINAS ---
import Home from './pages/HomePage';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';

// Ferramentas
import ImagePromptGenerator from './pages/ImagePromptGenerator';
import Veo3PromptGenerator from './pages/Veo3PromptGenerator';
import VideoSummarizer from './pages/VideoSummarizer';
import AgenteABNT from './pages/AgenteABNT';
import SpreadsheetGenerator from './pages/SpreadsheetGenerator';
import ChatPDF from './pages/ChatPDF';
import CorporateTranslator from './pages/CorporateTranslator'; 
import SocialMediaGenerator from './pages/SocialMediaGenerator';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        
        <main className="flex-grow">
          <Routes>
            
            {/* --- ROTAS PÚBLICAS --- */}
            <Route path="/" element={<Home />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />

            {/* --- ROTAS PROTEGIDAS (Ferramentas) --- */}
            
            <Route 
              path="/gerar-imagem" 
              element={<ProtectedRoute><ImagePromptGenerator /></ProtectedRoute>} 
            />

            <Route 
              path="/gerar-veo3-prompt" 
              element={<ProtectedRoute><Veo3PromptGenerator /></ProtectedRoute>} 
            />

            <Route 
              path="/resumir-video" 
              element={<ProtectedRoute><VideoSummarizer /></ProtectedRoute>} 
            />

            <Route 
              path="/agente-abnt" 
              element={<ProtectedRoute><AgenteABNT /></ProtectedRoute>} 
            />

            <Route 
              path="/gerador-planilha" 
              element={<ProtectedRoute><SpreadsheetGenerator /></ProtectedRoute>} 
            />

            <Route 
              path="/chat-pdf" 
              element={<ProtectedRoute><ChatPDF /></ProtectedRoute>} 
            />

            <Route 
              path="/tradutor-corporativo" 
              element={<ProtectedRoute><CorporateTranslator /></ProtectedRoute>} 
            />

            {/* NOVA ROTA DE SOCIAL MEDIA */}
            <Route 
              path="/social-media" 
              element={<ProtectedRoute><SocialMediaGenerator /></ProtectedRoute>} 
            />
            
            {/* Rotas de placeholder */}
            <Route path="/chat" element={<div>Página de Chat em breve!</div>} />
            <Route path="/cursos" element={<div>Página de Cursos em breve!</div>} />
            <Route path="/newsletters" element={<div>Página de Newsletters em breve!</div>} />
            <Route path="/chat-com-pesquisa" element={<div>Chat com pesquisa em breve!</div>} />
            <Route path="/analisar-imagens" element={<div>Analisar imagens em breve!</div>} />

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