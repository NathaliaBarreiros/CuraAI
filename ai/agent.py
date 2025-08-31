from audio_processor import main as audio_main
from audio_generator import generate_audio
from agents import Agent, function_tool, Runner
from dotenv import load_dotenv
import pygame, time
import requests
import asyncio
import os
load_dotenv()

conversation = []

def render_conversation(pairs, max_turns=20):
    last = pairs[-max_turns:]
    return "\n".join(f"{who}{text}" for who, text in last)

def create_agent(conversation_text, user_input):
    @function_tool
    def assistant_response(ai_response: str):
        """Generate a response to a user input"""
        try:
            print("[USING TOOL]")
            path = generate_audio(ai_response)
            pygame.mixer.init()
            pygame.mixer.music.load(path)
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
            pygame.mixer.music.unload()
            pygame.mixer.quit()
            os.remove(path)
            conversation.append(("CuraAI: ", ai_response))
            return ai_response
        except Exception as e:
            print(f"TOOL ERROR: {e}")
            return "TOOL ERROR"

    @function_tool
    def get_medical_articles(symptoms: str):
        """Fetch medical articles related to symptoms from PubMed."""
        print("[USING PUBMED TOOL]")
        try:
            from pubmed import get_medical_articles as fetch_articles
            articles = fetch_articles(symptoms)
            return articles if articles else "No relevant articles found."
        except Exception as e:
            print(f"PUBMED TOOL ERROR: {e}")
            return "PUBMED TOOL ERROR"

    @function_tool
    def search_by_pmid(pmid: str):
        """Fetch detailed information about a medical article using its PubMed ID (PMID)."""
        print("[USING SEARCH BY PMID TOOL]")
        try:
            fetch_url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
            fetch_params = {
                'db': 'pubmed',
                'id': pmid,
                'retmode': 'json',
                'rettype': 'abstract'
            }
            fetch_response = requests.get(fetch_url, params=fetch_params)
            return fetch_response.text
        except Exception as e:
            print(f"SEARCH BY PMID TOOL ERROR: {e}")
            return "SEARCH BY PMID TOOL ERROR"

    @function_tool
    def generate_file(diagnosis_summary: str):
        """Generate a text file with the diagnosis summary."""
        print("[USING GENERATE FILE TOOL]")
        try:
            file_path = "diagnosis_summary.txt"
            with open(file_path, "w") as f:
                f.write(diagnosis_summary)
            return f"Diagnosis summary saved to {file_path}"
        except Exception as e:
            print(f"GENERATE FILE TOOL ERROR: {e}")
            return "GENERATE FILE TOOL ERROR"

    prompt = f"""
        You are CuraAI, a medical voice assistant. 
        You must always respond to the user using the 'assistant_response' tool.

        Here is the conversation so far:
        {conversation_text}

        Your goal is to maintain a natural conversation with the patient. 
        Gather the following key info if possible:
        - Symptoms
        - How long the patient has had the condition
        - Family history (diabetes, hypertension, high blood pressure)

        Ask follow-up questions only once if some info is missing. 
        If the patient already provided most of the info, continue without insisting.

        After you have enough info, call get_medical_articles(symptoms) to fetch PubMed results. 
        Pick the most relevant PMID and call search_by_pmid(pmid) to get details. 
        Summarize the findings for the user and always respond via assistant_response.

        If you gives a diagnosis to the patient, also call generate_file(diagnosis_summary) to save a summary.
        
        If the user says goodbye, return "Goodbye, have a nice day!" using the tool.

        The user's message is:
        {user_input}
        """

    agent = Agent(
        name="CuraAI",
        model="gpt-4o-mini",
        instructions=prompt,
        tools=[assistant_response, get_medical_articles, search_by_pmid, generate_file]
    )
    return agent

async def main():
    while True:
        user_input = audio_main()
        conversation.append(("User: ", user_input))
        conv_text = render_conversation(conversation)
        agente = create_agent(conv_text, user_input)
        response = await Runner.run(agente, input=user_input)
        if isinstance(response.final_output, str) and response.final_output.strip().lower() == "goodbye, have a nice day!":
            print(conversation)
            break

if __name__ == "__main__":
    asyncio.run(main())
