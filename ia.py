import os
import pyttsx3
from google import genai
from colorama import Fore, Style, init

# 1. Inicialização de ferramentas
init(autoreset=True)
motor_voz = pyttsx3.init()
vozes = motor_voz.getProperty('voices')
motor_voz.setProperty('voice', vozes[1].id) 

# 2. Habilidades do Wilson
def tagarela(texto):
    motor_voz.say(texto)
    motor_voz.runAndWait()

def sai_daqui(texto_sujo):
    return texto_sujo.replace("**", "").replace("#", "")

# 3. Configuração do Cérebro e da Caderneta de Pontos 📔
cliente = genai.Client(api_key='AIzaSyAOjGNgd4L5auo50hJjmX6wuaC_gUQuqwE') 
dna_do_wilson = "Você é o Wilson, um professor amigável e acessível."
chat = cliente.chats.create(model='gemini-2.0-flash', config={'system_instruction': dna_do_wilson})

acertou = {} # Nosso dicionário: { 'Assunto': [acertos, total] }

# 4. Loop Principal da Aula 🔄
while True:
    pedido = input(Fore.CYAN + "\nO que vamos estudar agora? (ou 'sair'): ")
    
    if pedido.lower() == 'sair':
        break

    try:
        print(Fore.YELLOW + "Wilson está processando... ⏳")
        resposta = chat.send_message(pedido)
        
        texto_final = sai_daqui(resposta.text) 
        print(Fore.GREEN + "\nWilson diz:\n" + texto_final)
        
        # O Wilson agora fala o texto completo, sem procurar por [LIBRAS
        tagarela(texto_final) 

        # --- O DESAFIO ---
        print(Fore.YELLOW + "\n" + "-"*30)
        escolha = input(Fore.YELLOW + "Pronto pra um desafio de perguntas sobre o assunto? (SIM/NÃO): ").strip().upper()

        if escolha == "SIM":
            print(Fore.GREEN + "Gerando desafio...")
            prompt_desafio = "Gere uma pergunta de múltipla escolha sobre o assunto. Ao final, use exatamente: [ASSUNTO]NomeDoAssunto [GABARITO]Letra."
            res_desafio = chat.send_message(prompt_desafio)
            
            texto_bruto = res_desafio.text
            
            # Verificação de segurança para as etiquetas 🏷️
            if "[ASSUNTO]" in texto_bruto and "[GABARITO]" in texto_bruto:
                partes_assunto = texto_bruto.split("[ASSUNTO]")
                pergunta = partes_assunto[0]
                partes_gabarito = partes_assunto[1].split("[GABARITO]")
                
                nome_assunto = partes_gabarito[0].strip()
                gabarito_real = partes_gabarito[1].strip().upper()

                if nome_assunto not in acertou:
                    acertou[nome_assunto] = [0, 0] # [acertos, total]

                print(Fore.WHITE + "\n" + pergunta)
                tentativa = input(Fore.CYAN + "Sua resposta (Letra): ").strip().upper()
                
                acertou[nome_assunto][1] += 1 # Contabiliza tentativa

                if tentativa == gabarito_real:
                    acertou[nome_assunto][0] += 1 # Contabiliza acerto
                    print(Fore.GREEN + "Brilhante! Você acertou! 🎉")
                    tagarela("Brilhante! Você acertou!")
                else:
                    msg_erro = f"Quase lá! A certa era {gabarito_real}. Deixa eu explicar:"
                    print(Fore.RED + msg_erro)
                    tagarela(msg_erro)
                    
                    res_expl = chat.send_message(f"Explique de forma curta por que a {gabarito_real} é a correta.")
                    expl_limpa = sai_daqui(res_expl.text)
                    print(Fore.WHITE + expl_limpa)
                    tagarela(expl_limpa)
            else:
                print(Fore.RED + "Erro na geração das etiquetas. Tente novamente.")

    except Exception as e:
        print(Fore.RED + f"Erro: {e}")

# 5. Relatório Final de Desempenho 📊
if acertou:
    print(Fore.MAGENTA + "\n--- RELATÓRIO DE DESEMPENHO ---")
    for assunto, dados in acertou.items():
        vitorias = dados[0]
        total = dados[1]
        porcentagem = (vitorias / total) * 100
        print(f"Assunto: {assunto} | Aproveitamento: {porcentagem:.1f}%")