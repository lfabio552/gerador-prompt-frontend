import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { ChevronLeftIcon, ChevronRightIcon, UserCircleIcon } from '@heroicons/react/24/solid';

// --- SETAS DO CARROSSEL ---
function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ 
        ...style, display: "flex", background: "#7e22ce", borderRadius: '50%', width: '50px', height: '50px', right: '-25px', justifyContent: 'center', alignItems: 'center', zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.3)', cursor: 'pointer'
      }}
      onClick={onClick}
    >
      <ChevronRightIcon style={{ width: '30px', height: '30px', color: 'white' }} />
    </div>
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ 
        ...style, display: "flex", background: "#7e22ce", borderRadius: '50%', width: '50px', height: '50px', left: '-25px', justifyContent: 'center', alignItems: 'center', zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.3)', cursor: 'pointer'
      }}
      onClick={onClick}
    >
      <ChevronLeftIcon style={{ width: '30px', height: '30px', color: 'white' }} />
    </div>
  );
}

export default function HomePage() {
  const tools = [
    { id: 1, title: "Gerador de Prompts", description: "Crie prompts detalhados para gerar imagens incríveis em IAs.", imageUrl: "https://placehold.co/600x400/581c87/ffffff?text=Imagem+IA", link: "/gerar-imagem" },
    { id: 2, title: "Formatador ABNT", description: "Cole seu trabalho e baixe o .docx formatado nas normas.", imageUrl: "https://placehold.co/600x400/1e3a8a/ffffff?text=DOCX+ABNT", link: "/agente-abnt" },
    { id: 3, title: "Gerador de Planilhas", description: "Descreva sua planilha e a IA cria o arquivo .xlsx pronto.", imageUrl: "https://placehold.co/600x400/064e3b/ffffff?text=Excel+IA", link: "/gerador-planilha" },
    { id: 4, title: "Gerador VEO 3", description: "Crie prompts técnicos para geração de vídeo.", imageUrl: "https://placehold.co/600x400/374151/ffffff?text=Video+Prompt", link: "/gerar-veo3-prompt" }
  ];
  
  const settings = {
    dots: true, infinite: false, speed: 500, slidesToShow: 2.5, slidesToScroll: 1, nextArrow: <SampleNextArrow />, prevArrow: <SamplePrevArrow />,
    responsive: [ { breakpoint: 1024, settings: { slidesToShow: 1.5 } }, { breakpoint: 640, settings: { slidesToShow: 1, arrows: false } } ]
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white', padding: '2rem', position: 'relative', fontFamily: 'sans-serif' }}>
      
      {/* --- BOTÃO DE LOGIN (CORRIGIDO: Agora tem tamanho fixo) --- */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#d1d5db', backgroundColor: '#1f2937', padding: '10px 20px', borderRadius: '9999px', border: '1px solid #374151' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Login</span>
              {/* Tamanho forçado aqui para não ficar gigante */}
              <UserCircleIcon style={{ width: '24px', height: '24px' }} />
          </Link>
      </div>
      {/* --------------------------------------------------------- */}

      <div style={{ position: 'relative', width: '100%', maxWidth: '900px', padding: '40px', marginBottom: '50px', borderRadius: '16px', overflow: 'hidden', marginTop: '40px' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('https://placehold.co/1200x400/111827/3b0764?text=Background+Abstract')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.6, zIndex: 0 }}></div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#c084fc', marginBottom: '10px' }}>Minha Plataforma de IA</h1>
          <p style={{ fontSize: '1.25rem', color: '#e5e7eb' }}>Potencialize sua produtividade com nossas ferramentas inteligentes.</p>
        </div>
      </div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 50px' }}> 
        <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '20px', borderLeft: '4px solid #a855f7', paddingLeft: '16px' }}>Ferramentas Disponíveis</h3>
        
        <Slider {...settings}>
          {tools.map((tool) => (
            <div key={tool.id} style={{ padding: '16px' }}>
              <div style={{ backgroundColor: '#1f2937', borderRadius: '16px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #374151', margin: '0 10px' }}>
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <img src={tool.imageUrl} alt={tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px' }}>{tool.title}</h2>
                  <p style={{ color: '#9ca3af', marginBottom: '24px', flexGrow: 1, fontSize: '0.875rem' }}>{tool.description}</p>
                  <Link to={tool.link} style={{ display: 'block', width: '100%', backgroundColor: '#7e22ce', color: 'white', fontWeight: 'bold', padding: '12px', borderRadius: '8px', textAlign: 'center', textDecoration: 'none' }}>
                    Abrir Ferramenta →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
      
      <footer style={{ textAlign: 'center', color: '#9ca3af', padding: '20px', marginTop: '50px', borderTop: '1px solid #374151' }}>
        <p>&copy; {new Date().getFullYear()} Meu App de IA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}