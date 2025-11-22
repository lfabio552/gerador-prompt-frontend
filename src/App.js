import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


// --- IMPORTAÇÕES DE CSS ---
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// --- IMPORTANDO O SEGURANÇA (CATRACA) ---
import ProtectedRoute from './components/ProtectedRoute'; 
// (Se der erro aqui, verifique se o arquivo está na pasta components)

// --- IMPORTANDO AS PÁGINAS ---
import Home from './pages/HomePage';
import Login from './pages/Login'; // Importando a página de Login
import ImagePromptGenerator from './pages/ImagePromptGenerator';
import Veo3PromptGenerator from './pages/Veo3PromptGenerator';
import VideoSummarizer from './pages/VideoSummarizer';
import AgenteABNT from './pages/AgenteABNT';
import SpreadsheetGenerator from './pages/SpreadsheetGenerator';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import ChatPDF from './pages/ChatPDF';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        
        <main className="flex-grow">
          <Routes>
            
            {/* --- ROTAS PÚBLICAS (Qualquer um pode ver) --- */}
            <Route path="/" element={<Home />} /> 
            <Route path="/login" element={<Login />} />

	    <Route path="/forgot-password" element={<ForgotPassword />} />
	    <Route path="/update-password" element={<UpdatePassword />} />

            {/* --- ROTAS PROTEGIDAS (Só quem tem login entra) --- */}

	   <Route 
  	    path="/chat-pdf" 
  	    element={
	    <ProtectedRoute>
	 	<ChatPDF />
	    </ProtectedRoute>
	    } 
	   />
            
            <Route 
              path="/gerar-imagem" 
              element={
                <ProtectedRoute>
                  <ImagePromptGenerator />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/gerar-veo3-prompt" 
              element={
                <ProtectedRoute>
                  <Veo3PromptGenerator />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/resumir-video" 
              element={
                <ProtectedRoute>
                  <VideoSummarizer />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/agente-abnt" 
              element={
                <ProtectedRoute>
                  <AgenteABNT />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/gerador-planilha" 
              element={
                <ProtectedRoute>
                  <SpreadsheetGenerator />
                </ProtectedRoute>
              } 
            />
            
            {/* Rotas de placeholder (ainda vazias) */}
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