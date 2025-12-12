import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { ChevronLeftIcon, ChevronRightIcon, UserCircleIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { supabase } from '../supabaseClient'; 

// --- SETAS DO CARROSSEL ---
function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "flex", background: "#7e22ce", borderRadius: '50%', width: '40px', height: '40px', right: '-15px', justifyContent: 'center', alignItems: 'center', zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.3)', cursor: 'pointer' }}
      onClick={onClick}
    >
      <ChevronRightIcon style={{ width: '20px', height: '20px', color: 'white' }} />
    </div>
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "flex", background: "#7e22ce", borderRadius: '50%', width: '40px', height: '40px', left: '-15px', justifyContent: 'center', alignItems: 'center', zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.3)', cursor: 'pointer' }}
      onClick={onClick}
    >
      <ChevronLeftIcon style={{ width: '20px', height: '20px', color: 'white' }} />
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('credits, is_pro')
          .eq('id', user.id)
          .single();
        
        if (data) {
            setCredits(data.credits);
            setIsPro(data.is_pro);
        }
      }
    };
    getUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  const handleSubscribe = async () => {
    if (!user) return alert("Faça login primeiro!");
    try {
      const response = await fetch('https://meu-gerador-backend.onrender.com/create-checkout-session', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, email: user.email }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert("Erro: " + data.error);
    } catch (error) { alert("Erro: " + error.message); }
  };

  const handlePortal = async () => {
    try {
      const response = await fetch('https://meu-gerador-backend.onrender.com/create-portal-session', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url; 
      else alert("Erro: " + data.error);
    } catch (error) { alert("Erro: " + error.message); }
  };

  // --- CONFIGURAÇÃO DAS CATEGORIAS ---
  
  const featuredTools = [
    { 
      id: 7, title: "Social Media Kit", 
      description: "Gera posts virais para Instagram, LinkedIn e Twitter.", 
      imageUrl: "https://placehold.co/600x400/db2777/ffffff?text=Social+Media", 
      link: "/social-media" 
    },
    { 
      id: 9, title: "Simulador Entrevista", 
      description: "Treine para sua vaga com perguntas reais do RH.", 
      imageUrl: "https://placehold.co/600x400/4c1d95/ffffff?text=Entrevista+RH", 
      link: "/simulador-entrevista" 
    },
    { 
      id: 11, title: "Carta de Apresentação", 
      description: "Crie cartas persuasivas para anexar ao currículo.", 
      imageUrl: "https://placehold.co/600x400/ea580c/ffffff?text=Cover+Letter", 
      link: "/gerador-carta" 
    },
    { 
      id: 5, title: "Chat com PDF (RAG)", 
      description: "Converse com seus documentos e tire dúvidas.", 
      imageUrl: "https://placehold.co/600x400/be185d/ffffff?text=Chat+PDF", 
      link: "/chat-pdf" 
    },
    { 
      id: 13, 
      title: "Resumidor de Textos", 
      description: "Resuma artigos, documentos e transcrições longas.", 
      imageUrl: "https://placehold.co/600x400/0d9488/ffffff?text=Resumo+IA", 
      link: "/resumir-texto" 
     },
  ];

  const academicTools = [
    { 
      id: 10, title: "Gerador de Estudos", 
      description: "Crie Quizzes e Flashcards automáticos.", 
      imageUrl: "https://placehold.co/600x400/065f46/ffffff?text=Quiz+IA", 
      link: "/gerador-estudos" 
    },
    { 
      id: 2, title: "Formatador ABNT", 
      description: "Formate seu trabalho nas normas ABNT em segundos.", 
      imageUrl: "https://placehold.co/600x400/1e3a8a/ffffff?text=DOCX+ABNT", 
      link: "/agente-abnt" 
    },
    { 
      id: 8, title: "Corretor ENEM", 
      description: "Nota e correção detalhada para sua redação.", 
      imageUrl: "https://placehold.co/600x400/b91c1c/ffffff?text=Nota+1000", 
      link: "/corretor-redacao" 
    },
  ];

  const creativeTools = [
    { 
      id: 1, title: "Gerador de Imagem", 
      description: "Crie prompts detalhados para Midjourney e DALL-E.", 
      imageUrl: "https://placehold.co/600x400/581c87/ffffff?text=Imagem+IA", 
      link: "/gerar-imagem" 
    },
    { 
      id: 4, title: "Gerador de Vídeo", 
      description: "Prompts técnicos para VEO 3 e Sora.", 
      imageUrl: "https://placehold.co/600x400/374151/ffffff?text=Video+Prompt", 
      link: "/gerar-veo3-prompt" 
    },
  ];

  const productivityTools = [
    { 
      id: 6, title: "Tradutor Corporativo", 
      description: "Transforme textos informais em e-mails executivos.", 
      imageUrl: "https://placehold.co/600x400/2563eb/ffffff?text=Email+Pro", 
      link: "/tradutor-corporativo" 
    },
    { 
      id: 3, title: "Gerador de Planilhas", 
      description: "Crie arquivos Excel (.xlsx) descrevendo o que precisa.", 
      imageUrl: "https://placehold.co/600x400/064e3b/ffffff?text=Excel+IA", 
      link: "/gerador-planilha" 
    },
  ];
  
  const settings = {
    dots: false, infinite: false, speed: 500, slidesToShow: 3.2, slidesToScroll: 1, nextArrow: <SampleNextArrow />, prevArrow: <SamplePrevArrow />,
    responsive: [ { breakpoint: 1024, settings: { slidesToShow: 2.2 } }, { breakpoint: 640, settings: { slidesToShow: 1.2, arrows: false } } ]
  };

  // Componente interno para renderizar uma seção
  const ToolSection = ({ title, tools, icon }) => (
    <div style={{ marginBottom: '50px' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#f3f4f6' }}>
        {icon} {title}
      </h3>
      <Slider {...settings}>
        {tools.map((tool) => (
          <div key={tool.id} style={{ padding: '0 10px' }}>
            <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', overflow: 'hidden', height: '100%', border: '1px solid #374151', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '160px', overflow: 'hidden' }}>
                <img src={tool.imageUrl} alt={tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>{tool.title}</h4>
                <p style={{ color: '#9ca3af', marginBottom: '15px', flexGrow: 1, fontSize: '0.85rem' }}>{tool.description}</p>
                <Link to={tool.link} style={{ display: 'block', width: '100%', backgroundColor: '#7e22ce', color: 'white', fontWeight: 'bold', padding: '10px', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Acessar
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white', paddingBottom: '50px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER / NAVBAR */}
      <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {!isPro ? (
                  <button onClick={handleSubscribe} style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #d97706 100%)', border: 'none', padding: '8px 16px', borderRadius: '20px', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)' }}>
                  👑 Virar PRO
                  </button>
              ) : (
                  <button onClick={handlePortal} style={{ background: '#374151', border: '1px solid #6b7280', padding: '8px 16px', borderRadius: '20px', color: '#d1d5db', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Cog6ToothIcon style={{ width: '16px', height: '16px' }}/> Minha Assinatura
                  </button>
              )}
              <div style={{ backgroundColor: isPro ? '#581c87' : '#374151', padding: '6px 12px', borderRadius: '20px', border: isPro ? '1px solid #d8b4fe' : '1px solid #7e22ce', color: isPro ? '#fff' : '#e9d5ff', fontWeight: 'bold', fontSize: '14px' }}>
                💎 {isPro ? "ILIMITADO" : (credits !== null ? credits : 0)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db' }}>
                  <UserCircleIcon style={{ width: '36px', height: '36px', color: '#a855f7' }} />
              </div>
              <button onClick={handleLogout} style={{ marginLeft: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Sair</button>
            </div>
          ) : (
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#d1d5db', backgroundColor: '#1f2937', padding: '10px 20px', borderRadius: '9999px', border: '1px solid #374151' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Login</span>
                <UserCircleIcon style={{ width: '24px', height: '24px' }} />
            </Link>
          )}
      </div>

      {/* HERO SECTION */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 40px', marginBottom: '40px' }}>
        <div style={{ padding: '60px', borderRadius: '24px', background: 'linear-gradient(135deg, #4c1d95 0%, #1f2937 100%)', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: '#fff', marginBottom: '15px', lineHeight: '1.1' }}>
              Potencialize sua <br/><span style={{ color: '#fbbf24' }}>Produtividade</span> com IA.
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#d1d5db', maxWidth: '600px', marginBottom: '30px' }}>
              Mais de 10 ferramentas inteligentes para estudantes, profissionais e criativos. Acesse tudo em um só lugar.
            </p>
            {!user && (
              <Link to="/login" style={{ backgroundColor: '#fbbf24', color: '#111827', padding: '12px 30px', borderRadius: '50px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem', display: 'inline-block' }}>
                Começar Grátis
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* SEÇÕES DE FERRAMENTAS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        
        <ToolSection 
          title="Mais Usadas" 
          tools={featuredTools} 
          icon={<span style={{fontSize: '24px'}}>🔥</span>} 
        />

        <ToolSection 
          title="Área Acadêmica" 
          tools={academicTools} 
          icon={<span style={{fontSize: '24px'}}>🎓</span>} 
        />

        <ToolSection 
          title="Estúdio Criativo (Prompts)" 
          tools={creativeTools} 
          icon={<span style={{fontSize: '24px'}}>🎨</span>} 
        />

        <ToolSection 
          title="Produtividade & Trabalho" 
          tools={productivityTools} 
          icon={<span style={{fontSize: '24px'}}>💼</span>} 
        />

      </div>
      
      <footer style={{ textAlign: 'center', color: '#6b7280', padding: '40px', marginTop: '50px', borderTop: '1px solid #1f2937' }}>
        <p>&copy; {new Date().getFullYear()} Adapta IA. Todos os direitos reservados.</p>
        <div style={{ marginTop: '10px' }}>
          <Link to="/termos" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem', marginRight: '15px' }}>Termos de Uso</Link>
          <Link to="/termos" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Política de Privacidade</Link>
        </div>
      </footer>
    </div>
  );
}