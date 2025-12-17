// src/data/exemplos.js
export const exemplosPorFerramenta = {
  // ============================================
  // 1. GERADOR DE PLANILHAS
  // ============================================
  'gerador-planilha': [
    {
      id: 1,
      titulo: "📊 Controle Financeiro Pessoal",
      prompt: "Crie uma planilha de controle financeiro mensal com colunas: Data, Descrição, Categoria (Alimentação, Transporte, Lazer, Contas), Valor, Tipo (Entrada/Saída). Adicione totais por categoria e gráfico de pizza.",
      imagem: "https://placehold.co/600x400/3b82f6/ffffff?text=Planilha+Financeira",
      resultado: "Planilha com fórmulas de soma automática, tabela dinâmica por categoria e gráfico visual."
    },
    {
      id: 2,
      titulo: "📦 Controle de Estoque para Loja",
      prompt: "Planilha para loja de eletrônicos com: Código SKU, Nome do Produto, Quantidade em Estoque, Preço de Custo, Preço de Venda, Fornecedor. Adicione alerta condicional (vermelho) para estoque abaixo de 10 unidades.",
      imagem: "https://placehold.co/600x400/10b981/ffffff?text=Controle+Estoque",
      resultado: "Sistema completo com 50 produtos, fórmulas de lucro automático e formatação condicional."
    },
    {
      id: 3,
      titulo: "📈 Dashboard de Vendas Mensais",
      prompt: "Dashboard para equipe de vendas: Mês, Vendedor, Produto, Quantidade Vendida, Valor Total, Comissão (5%). Calcule ranking de vendedores e métricas de crescimento.",
      imagem: "https://placehold.co/600x400/8b5cf6/ffffff?text=Dashboard+Vendas",
      resultado: "Dashboard interativo com gráficos de barras, cálculo de comissão e relatório mensal."
    }
  ],

  // ============================================
  // 2. SOCIAL MEDIA GENERATOR
  // ============================================
  'social-media': [
    {
      id: 1,
      titulo: "🚀 Lançamento de Novo Produto",
      prompt: "Anuncie o lançamento do nosso novo app de produtividade com IA para profissionais criativos.",
      imagem: null, // Sem imagem para social media
      resultado: {
        instagram: "✨ O futuro da produtividade chegou! Apresentamos o [Nome do App], sua nova ferramenta com IA para turbinar sua criatividade. 🚀\n👉 Link na bio para testar GRÁTIS!\n\n#Produtividade #IA #FerramentasCriativas #AppNovo",
        linkedin: "🎯 É com grande satisfação que anunciamos o lançamento do [Nome do App], uma solução inovadora que utiliza Inteligência Artificial para otimizar fluxos de trabalho criativos. \n\nA plataforma já está disponível para testes e estamos ansiosos pelo feedback da comunidade. \n\n#Inovação #Tecnologia #IA #Produtividade #Startup",
        twitter: "🚀 ACABA DE CHEGAR: O app que vai revolucionar como você trabalha! \n\nExperimente agora (é grátis!) 👇\n[link]\n\n#IA #Produtividade #DicaDeApp"
      }
    },
    {
      id: 2,
      titulo: "🎓 Promoção de Curso Online",
      prompt: "Promova nosso curso 'IA para Marketing Digital' com 40% de desconto na primeira turma.",
      imagem: null,
      resultado: {
        instagram: "📣 OPORTUNIDADE ÚNICA! \n\nA primeira turma do curso \"IA para Marketing Digital\" está com 40% OFF! 🎉\n\nAprenda a usar ChatGPT, Midjourney e outras ferramentas para criar campanhas virais. \n\nVagas limitadas! ⏰\n🔗 Link na bio para garantir sua vaga!\n\n#MarketingDigital #IA #CursoOnline #Oportunidade",
        linkedin: "🚀 Profissionais de marketing, esta é para vocês! \n\nEstou lançando a primeira turma do curso \"IA para Marketing Digital\" com metodologia prática e cases reais. \n\nComo cortesia para meus contatos do LinkedIn, reservei um desconto especial de 40% para os primeiros inscritos. \n\nVamos dominar as ferramentas do futuro juntos? \n\n#Marketing #IA #DesenvolvimentoProfissional #Educação",
        twitter: "Quer usar IA no seu marketing mas não sabe por onde começar? \n\nMeu novo curso tem 40% OFF para as primeiras 50 pessoas! \n\nTudo prático, sem enrolação. \n\nGaranta sua vaga 👇\n[link]\n\n#IA #Marketing #Curso"
      }
    }
  ],

  // ============================================
  // 3. AGENTE ABNT
  // ============================================
  'agente-abnt': [
    {
      id: 1,
      titulo: "📚 Trabalho Acadêmico Completo",
      prompt: "Formate este texto nas normas ABNT para um trabalho de conclusão de curso: margens 3cm, fonte Arial 12, espaçamento 1.5, citações no padrão autor-data.",
      imagem: "https://placehold.co/600x400/ef4444/ffffff?text=Formatação+ABNT",
      resultado: "Texto formatado com capa, folha de rosto, sumário automático, headers com numeração, referências bibliográficas no padrão ABNT e paginação correta."
    },
    {
      id: 2,
      titulo: "🔬 Artigo Científico",
      prompt: "Converta este relatório em formato de artigo científico ABNT: resumo em português e inglês, palavras-chave, seções metodologia, resultados, discussão.",
      imagem: "https://placehold.co/600x400/0ea5e9/ffffff?text=Artigo+Científico",
      resultado: "Artigo estruturado com abstract, keywords, introdução, metodologia, resultados, discussão, conclusões e referências formatadas."
    }
  ],

  // ============================================
  // 4. GERADOR DE IMAGENS (quando estiver ativo)
  // ============================================
  'gerar-imagem-completa': [
    {
      id: 1,
      titulo: "🐉 Dragão em Cidade Futurista",
      prompt: "Um dragão de cristal azul sobrevoando uma cidade cyberpunk à noite, com arranha-céus de neon e chuva, estilo cinematográfico, luzes dramáticas.",
      imagem: "https://placehold.co/600x400/8b5cf6/ffffff?text=Dragão+Cyberpunk",
      resultado: "Imagem gerada com foco em detalhes do dragão, contraste de luzes de neon e atmosfera chuvosa futurista."
    },
    {
      id: 2,
      titulo: "🏝️ Praia Paradisíaca com Palafitas",
      prompt: "Praia tropical com água cristalina turquesa, palmeiras, casas de madeira sobre a água no estilo maldivas, pôr do sol alaranjado, fotorrealista, 8K.",
      imagem: "https://placehold.co/600x400/f59e0b/ffffff?text=Praia+Paradisíaca",
      resultado: "Cena realista com reflexos da água, detalhes das palafitas e gradiente de cores do pôr do sol."
    }
  ],

  // ============================================
  // 5. TRADUTOR CORPORATIVO
  // ============================================
  'tradutor-corporativo': [
    {
      id: 1,
      titulo: "✉️ E-mail para Adiar Reunião",
      prompt: "Mensagem informal: 'Opa, hoje não vai dar pra gente se falar, tô cheio de coisa. Bora marcar pra semana que vem?'",
      resultado: "Prezados,\n\nEm virtude de compromissos urgentes que demandaram minha atenção integral hoje, gostaria de propor o reagendamento de nossa reunião para a próxima semana.\n\nFico à disposição para acertarmos um novo horário que seja conveniente para todos.\n\nAtenciosamente,"
    },
    {
      id: 2,
      titulo: "📋 Feedback para Colaborador",
      prompt: "Feedback direto: 'Seu relatório tá bem ruim, cheio de erro. Tem que melhorar isso aí se quiser continuar no time.'",
      resultado: "Olá,\n\nAo analisar o relatório enviado, identifiquei algumas oportunidades de aprimoramento que gostaria de destacar para garantir a excelência de nossos entregáveis.\n\nSugiro que revisemos juntos as expectativas de qualidade e estabeleçamos um plano de ação para as próximas entregas.\n\nEstou disponível para apoiá-lo neste desenvolvimento.\n\nCordialmente,"
    }
  ],

  // ============================================
  // 6. CORRETOR DE REDAÇÃO
  // ============================================
  'corretor-redacao': [
    {
      id: 1,
      titulo: "📝 Tema: Redes Sociais e Saúde Mental",
      prompt: "Texto do aluno sobre os impactos das redes sociais na autoestima dos jovens.",
      resultado: {
        total_score: 860,
        competencies: {
          "1": "Demonstra domínio da norma culta com poucos desvios.",
          "2": "Compreende bem a proposta, com repertório adequado.",
          "3": "Organiza informações de forma coerente, mas poderia aprofundar mais.",
          "4": "Demonstra conhecimento do mecanismo de argumentação.",
          "5": "Proposta de intervenção apresenta todas as partes necessárias."
        },
        feedback: "Ótimo trabalho! Sua argumentação é clara e você utilizou bons exemplos. Para atingir uma nota mais alta, sugiro: 1) Aprofundar a análise dos dados citados; 2) Apresentar um contra-argumento para fortalecer sua tese; 3) Detalhar melhor os agentes da sua proposta de intervenção."
      }
    }
  ]
};

// Função auxiliar para pegar exemplos de uma ferramenta
export const getExemplos = (ferramentaId) => {
  return exemplosPorFerramenta[ferramentaId] || [];
};