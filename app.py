import streamlit as st
from google import genai

# Configuração da página
st.set_page_config(page_title="Professor Wilson", page_icon="👨‍🏫", layout="centered")

# ==========================================
# 1. A MEMÓRIA DO WILSON
# ==========================================

if "acertou" not in st.session_state:
    st.session_state.acertou = {} 

if "chat" not in st.session_state:
    # ATENÇÃO: Cole sua chave aqui dentro das aspas!
    cliente = genai.Client(api_key='AIzaSyAOjGNgd4L5auo50hJjmX6wuaC_gUQuqwE') 
    dna_do_wilson = "Você é o Wilson, um professor amigável e acessível."
    st.session_state.chat = cliente.chats.create(model='gemini-2.0-flash', config={'system_instruction': dna_do_wilson})

if "mensagens" not in st.session_state:
    st.session_state.mensagens = [] 

def sai_daqui(texto_sujo):
    return texto_sujo.replace("**", "").replace("#", "")

# ==========================================
# 2. O VISUAL DA PÁGINA
# ==========================================

st.title("👨‍🏫 Estude com o Professor Wilson")

aba_aula, aba_desafio, aba_placar = st.tabs(["📚 Aula", "🎯 Desafio", "📊 Relatório"])

# --- ABA 1: AULA ---
with aba_aula:
    st.write("Digite um assunto abaixo para começar a estudar!")
    
    for msg in st.session_state.mensagens:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    pedido = st.chat_input("O que vamos estudar agora?")

    if pedido:
        with st.chat_message("user"):
            st.markdown(pedido)
        st.session_state.mensagens.append({"role": "user", "content": pedido})

        with st.chat_message("assistant"):
            with st.spinner("Wilson está processando... ⏳"):
                # O ESCUDO ANTI-ERROS COMEÇA AQUI
                try:
                    resposta = st.session_state.chat.send_message(pedido)
                    texto_final = sai_daqui(resposta.text)
                    st.markdown(texto_final)
                    st.session_state.mensagens.append({"role": "assistant", "content": texto_final})
                except Exception as e:
                    st.warning("⚠️ Fomos muito rápido! O Google pediu para respirar. Espere uns 30 segundos e tente de novo.")


# --- ABA 2: DESAFIO ---
with aba_desafio:
    st.header("Hora de testar seus conhecimentos!")
    
    if st.button("Gerar um desafio sobre o assunto atual"):
        with st.spinner("Criando desafio..."):
            # O ESCUDO TAMBÉM VEM PARA CÁ
            try:
                prompt_desafio = "Gere uma pergunta de múltipla escolha sobre o que estávamos estudando agora. Ao final, use exatamente: [ASSUNTO]NomeDoAssunto [GABARITO]Letra."
                res_desafio = st.session_state.chat.send_message(prompt_desafio)
                texto_bruto = res_desafio.text
                
                if "[ASSUNTO]" in texto_bruto and "[GABARITO]" in texto_bruto:
                    partes_assunto = texto_bruto.split("[ASSUNTO]")
                    pergunta = partes_assunto[0]
                    partes_gabarito = partes_assunto[1].split("[GABARITO]")
                    
                    nome_assunto = partes_gabarito[0].strip()
                    gabarito_real = partes_gabarito[1].strip().upper()
                    
                    st.session_state.pergunta_atual = pergunta
                    st.session_state.gabarito_atual = gabarito_real
                    st.session_state.assunto_atual = nome_assunto
                    
                    if nome_assunto not in st.session_state.acertou:
                        st.session_state.acertou[nome_assunto] = [0, 0]
                else:
                    st.error("Erro na formatação da IA. Tente gerar de novo.")
            except Exception as e:
                st.warning("⚠️ O limite de uso gratuito estourou temporariamente. Espere uns 30 segundos antes de gerar o desafio.")

    if "pergunta_atual" in st.session_state:
        st.info(st.session_state.pergunta_atual)
        
        tentativa = st.radio("Escolha a alternativa correta:", ["A", "B", "C", "D", "E"], index=None)
        
        if st.button("Confirmar Resposta"):
            if tentativa:
                st.session_state.acertou[st.session_state.assunto_atual][1] += 1 
                
                if tentativa == st.session_state.gabarito_atual:
                    st.session_state.acertou[st.session_state.assunto_atual][0] += 1 
                    st.success("Brilhante! Você acertou! 🎉")
                    st.balloons() 
                else:
                    st.error(f"Quase lá! A certa era {st.session_state.gabarito_atual}.")
                    
                    with st.spinner("Wilson está explicando..."):
                        try:
                            res_expl = st.session_state.chat.send_message(f"Explique de forma curta por que a {st.session_state.gabarito_atual} é a correta.")
                            st.warning(sai_daqui(res_expl.text))
                        except Exception as e:
                            st.warning("Não consegui buscar a explicação agora por causa do limite de tempo, mas continue tentando!")


# --- ABA 3: RELATÓRIO DE DESEMPENHO ---
with aba_placar:
    st.header("Sua Caderneta de Pontos 📔")
    
    if st.session_state.acertou:
        for assunto, dados in st.session_state.acertou.items():
            vitorias = dados[0]
            total = dados[1]
            if total > 0:
                porcentagem = (vitorias / total) * 100
                st.metric(label=f"Assunto: {assunto}", value=f"{porcentagem:.0f}%", delta=f"{vitorias} acertos de {total} tentativas")
    else:
        st.write("Nenhum desafio respondido ainda. Vá estudar!")