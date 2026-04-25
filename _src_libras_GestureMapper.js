// Mapeia palavras em português para a GLOSA em LIBRAS usando a IA do Gemini,
// e depois converte a GLOSA em sequências de gestos 3D.

export class GestureMapper {
  constructor() {
    // A nossa "Biblioteca de Animações" virtuais.
    // As chaves são as palavras na GLOSA (sempre em Maiúsculas)
    // Os valores são os nomes exatos dos clips de animação no ficheiro .glb do teu avatar
    this.gestureLibrary = {
      'OLÁ': ['anim_ola'],
      'BEM-VINDO': ['anim_bem_vindo'], // Este é o sinal que mostraste no vídeo!
      'VOCÊ': ['anim_apontar_frente'],
      'COMO': ['anim_maos_questionar'],
      'ESTAR': ['anim_polegar_cima'],
      'OBRIGADO': ['anim_maos_peito_frente'],
      'EU': ['anim_apontar_peito'],
      'BOM': ['anim_bom'],
      'DIA': ['anim_dia'],
      'NOME': ['anim_nome'],
      'APRENDER': ['anim_aprender']
    };
  }

  // 1. Chama a API do Gemini para converter Português normal em GLOSA LIBRAS
  async translateToGlosa(texto, apiKey) {
    if (!apiKey) {
      console.warn("⚠️ Chave da API do Gemini não fornecida. A usar tradução literal como fallback.");
      return texto.toUpperCase(); 
    }

    // O Prompt perfeito para ensinar o Gemini a pensar como um tradutor de LIBRAS
    const prompt = `Traduza a seguinte frase em português para a GLOSA da LIBRAS (Língua Brasileira de Sinais). 
    Regras estritas da GLOSA: 
    1. Utilize a ordem gramatical da LIBRAS (ex: Tópico-Comentário, Sujeito-Objeto-Verbo). 
    2. Ignore artigos (o, a) e preposições (de, para) quando não houver sinal específico. 
    3. Retorne APENAS as palavras principais em LETRAS MAIÚSCULAS separadas por espaço. 
    4. Não forneça nenhuma explicação ou introdução, retorne única e exclusivamente as palavras da glosa.
    
    Frase: "${texto}"`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 } // Temperatura baixa para respostas diretas
        })
      });

      if (!response.ok) throw new Error("Falha na comunicação com a API do Gemini.");
      
      const data = await response.json();
      const glosa = data.candidates[0].content.parts[0].text.trim();
      
      console.log(`🧠 [Gemini IA] Tradução: "${texto}" -> GLOSA: "${glosa}"`);
      return glosa;
      
    } catch (error) {
      console.error("Erro ao traduzir para Glosa:", error);
      // Fallback de segurança: devolve as palavras em maiúsculas sem pontuação
      return texto.toUpperCase().replace(/[^\w\s]/g, '');
    }
  }

  // 2. Transforma a GLOSA na lista de animações que o Avatar deve reproduzir
  async textToGestures(texto, apiKey = "") {
    // Aguarda que a IA converta o texto para a estrutura de LIBRAS
    const glosa = await this.translateToGlosa(texto, apiKey);
    
    const palavrasGlosa = glosa.split(' ');
    const sequenciaAnimacoes = [];

    // Mapeia a Glosa para as animações 3D
    palavrasGlosa.forEach(palavra => {
      // Limpa eventuais pontos finais deixados pela IA
      const palavraLimpa = palavra.replace(/[.,!?]/g, '');
      
      if (this.gestureLibrary[palavraLimpa]) {
        sequenciaAnimacoes.push(...this.gestureLibrary[palavraLimpa]);
      } else {
        // Num cenário real e completo, se a palavra não tem um sinal próprio,
        // o sistema deve chamar animações de Datilologia (soletrar a-b-c com as mãos).
        console.warn(`⚠️ Animação 3D para a palavra "${palavraLimpa}" não encontrada no ficheiro do Avatar. A saltar o sinal.`);
      }
    });

    return sequenciaAnimacoes;
  }
}