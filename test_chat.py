import requests

response = requests.post('http://localhost:5000/api/chat', json={
    'message': 'Hello',
    'expenses': [],
    'goals': []
})

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")