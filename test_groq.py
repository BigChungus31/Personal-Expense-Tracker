import requests
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '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')

print(f"Testing API Key: {GROQ_API_KEY[:20]}...")
print("Testing with llama-3.3-70b-versatile model...\n")

try:
    response = requests.post(
        'https://api.groq.com/openai/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {GROQ_API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'llama-3.3-70b-versatile',
            'messages': [
                {'role': 'user', 'content': 'Say hello in a friendly way'}
            ],
            'max_tokens': 50
        },
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("API Key is valid!")
        print(f"\nAI Response: {response.json()['choices'][0]['message']['content']}")
    else:
        print(f"Error: {response.status_code}")
        print(f"Details: {response.text}")
        
except Exception as e:
    print(f"Error: {str(e)}")