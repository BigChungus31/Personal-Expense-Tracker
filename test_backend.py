import requests

base_url = "http://localhost:5000"

# Test health
response = requests.get(f"{base_url}/api/health")
print(f"Health Check: {response.json()}")

# Test expenses
response = requests.get(f"{base_url}/api/expenses")
print(f"Expenses: {response.json()}")

# Test goals
response = requests.get(f"{base_url}/api/goals")
print(f"Goals: {response.json()}")

print("\nAll endpoints working!")