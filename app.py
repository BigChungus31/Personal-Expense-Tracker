from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg
from psycopg.rows import dict_row
import os
from datetime import datetime, timedelta
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is not set")
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

DATABASE_URL = os.getenv('DATABASE_URL')

def get_db_connection():
    conn = psycopg.connect(DATABASE_URL)
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        target REAL NOT NULL,
        current REAL DEFAULT 0,
        deadline TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
    )''')
    
    conn.commit()
    conn.close()

# EXPENSES ENDPOINTS
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    conn = get_db_connection()
    cursor = conn.cursor(row_factory=dict_row)
    expenses = cursor.execute('SELECT * FROM expenses ORDER BY date DESC').fetchall()
    cursor.close()
    conn.close()
    return jsonify(expenses)

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO expenses (amount, category, date, payment_method, description)
                      VALUES (%s, %s, %s, %s, %s) RETURNING id''',
                   (data['amount'], data['category'], data['date'], 
                    data['paymentMethod'], data.get('description', '')))
    expense_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'id': expense_id, 'status': 'success'}), 201

@app.route('/api/expenses/<int:expense_id>', methods=['PUT'])
def update_expense(expense_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''UPDATE expenses 
                      SET amount = %s, category = %s, date = %s, payment_method = %s, description = %s
                      WHERE id = %s''',
                   (data['amount'], data['category'], data['date'], 
                    data['paymentMethod'], data.get('description', ''), expense_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM expenses WHERE id = %s', (expense_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

# GOALS ENDPOINTS
@app.route('/api/goals', methods=['GET'])
def get_goals():
    conn = get_db_connection()
    cursor = conn.cursor(row_factory=dict_row)
    goals = cursor.execute('SELECT * FROM goals ORDER BY deadline ASC').fetchall()
    cursor.close()
    conn.close()
    return jsonify(goals)

@app.route('/api/goals', methods=['POST'])
def add_goal():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO goals (name, target, deadline, priority)
                      VALUES (%s, %s, %s, %s) RETURNING id''',
                   (data['name'], data['target'], data['deadline'], data.get('priority', 'medium')))
    goal_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'id': goal_id, 'status': 'success'}), 201

@app.route('/api/goals/<int:goal_id>', methods=['PUT'])
def update_goal(goal_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''UPDATE goals 
                      SET name = %s, target = %s, current = %s, deadline = %s, priority = %s
                      WHERE id = %s''',
                   (data['name'], data['target'], data.get('current', 0), 
                    data['deadline'], data.get('priority', 'medium'), goal_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/api/goals/<int:goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM goals WHERE id = %s', (goal_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

# CATEGORIES ENDPOINTS
@app.route('/api/categories', methods=['GET'])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor(row_factory=dict_row)
    categories = cursor.execute('SELECT name FROM categories').fetchall()
    cursor.close()
    conn.close()
    return jsonify([row['name'] for row in categories])

@app.route('/api/categories', methods=['POST'])
def add_category():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO categories (name) VALUES (%s)', (data['name'],))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'}), 201
    except psycopg.IntegrityError:
        cursor.close()
        conn.close()
        return jsonify({'error': 'Category already exists'}), 400

# ANALYTICS ENDPOINTS
@app.route('/api/analytics/summary', methods=['GET'])
def get_summary():
    period = request.args.get('period', 'month')
    conn = get_db_connection()
    cursor = conn.cursor(row_factory=dict_row)
    
    if period == 'week':
        start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    elif period == 'month':
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    else:
        start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
    
    total = cursor.execute(
        'SELECT SUM(amount) as total FROM expenses WHERE date >= %s',
        (start_date,)
    ).fetchone()
    
    by_category = cursor.execute(
        'SELECT category, SUM(amount) as total FROM expenses WHERE date >= %s GROUP BY category',
        (start_date,)
    ).fetchall()
    
    by_payment = cursor.execute(
        'SELECT payment_method, SUM(amount) as total FROM expenses WHERE date >= %s GROUP BY payment_method',
        (start_date,)
    ).fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify({
        'total': total['total'] if total['total'] else 0,
        'by_category': by_category,
        'by_payment': by_payment
    })

# AI CHAT ENDPOINT
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data['message']
    expenses = data.get('expenses', [])
    goals = data.get('goals', [])
    conversation_history = data.get('history', [])
    
    first_message = len(expenses) == 0 or any(x in user_message.lower() for x in ["hi", "hey", "hello", "yo", "sup", "Hi", "Hey", "Hello", "Yo", "Sup"])
    
    # Calculate context
    total_expenses = sum(float(exp['amount']) for exp in expenses) if expenses else 0
    expense_count = len(expenses)
    
    category_breakdown = {}
    for exp in expenses:
        cat = exp['category']
        category_breakdown[cat] = category_breakdown.get(cat, 0) + float(exp['amount'])
    top_category = None
    if category_breakdown:
        top_category = max(category_breakdown, key=category_breakdown.get)
    
    if first_message:
        context = f"""You are a warm, approachable financial buddy.
The user just started chatting — don't jump into their finances yet.
Keep it light, friendly, and human. 
Example:
User: "Hey" → You: "Hey! How's it going? What's on your mind today?"
User: "What do you do?" → You: "I help you keep track of your money, goals, and spending — kind of like your finance buddy. Want me to show you how it works?"
Avoid talking about spending or data until the user brings it up."""
    else:
        context = f"""You are a calm, data-aware financial companion.
Your tone is friendly but balanced — you reflect on spending instead of telling users what to do.
USER'S CURRENT SITUATION:
- Total spent: ₹{total_expenses:.2f} ({expense_count} transactions)
{f"- Spending breakdown: {', '.join([f'{k} ₹{v:.0f}' for k, v in list(category_breakdown.items())[:3]])}" if category_breakdown else "- No expenses tracked yet"}
- Goals: {len(goals)} active
{f"- Top spending category: {top_category} (₹{category_breakdown[top_category]:.0f})" if top_category else ""}

CONVERSATION STYLE:
Speak like a calm, observant friend — not a coach or teacher.
→ Only make ONE reflection or gentle observation per reply. 
→ At most ONE open-ended question if needed — never stack multiple questions.
→ Give the user time to think, don't rush with facts."""
    
    print(f"\n AI Chat Request:")
    print(f"   Message: {user_message}")
    print(f"   Using API Key: {GROQ_API_KEY[:20]}...")
    
    # BUILD MESSAGE HISTORY
    messages = [
        {
            'role': 'system',
            'content': f"""{context}

You are a calm, observant financial buddy — not a coach, not a teacher.
Speak like a thoughtful friend who's listening first and reflecting second.
Never rush to analyze everything at once — share ONE observation or question per message.
Keep responses short (2–4 sentences max).
Be conversational, never robotic or interrogative."""
        }
    ]
    
    # ADD CONVERSATION HISTORY
    messages.extend(conversation_history)
    
    # ADD CURRENT USER MESSAGE
    messages.append({
        'role': 'user',
        'content': user_message
    })
    
    try:
        response = requests.post(
            GROQ_API_URL,
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.3-70b-versatile',
                'messages': messages,
                'temperature': 0.8,
                'max_tokens': 300
            },
            timeout=30
        )
        
        print(f"   Groq API Status: {response.status_code}")
        
        if response.status_code == 200:
            ai_response = response.json()['choices'][0]['message']['content']
            print(f"Response received")
            return jsonify({'response': ai_response})
        else:
            error_detail = response.text
            print(f"Error: {error_detail}")
            return jsonify({
                'response': f'Sorry, the AI service returned an error: {response.status_code}. Please check your API key or try again later.'
            }), 500
            
    except requests.exceptions.Timeout:
        print(f"Timeout error")
        return jsonify({'response': 'The AI service timed out. Please try again.'}), 500
    except requests.exceptions.ConnectionError:
        print(f"Connection error")
        return jsonify({'response': 'Cannot connect to the AI service. Please check your internet connection.'}), 500
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'response': f'Error: {str(e)}'}), 500

# PROJECTIONS ENDPOINT
@app.route('/api/projections', methods=['GET'])
def get_projections():
    months = int(request.args.get('months', 3))
    conn = get_db_connection()
    cursor = conn.cursor(row_factory=dict_row)
    
    # Get average monthly spending from last 3 months
    three_months_ago = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
    expenses = cursor.execute(
        'SELECT amount, date FROM expenses WHERE date >= %s',
        (three_months_ago,)
    ).fetchall()
    
    if not expenses:
        cursor.close()
        conn.close()
        return jsonify({'projections': [], 'message': 'Not enough data for projections'})
    
    total = sum(float(exp['amount']) for exp in expenses)
    avg_monthly = total / 3
    
    projections = []
    for i in range(1, months + 1):
        future_date = datetime.now() + timedelta(days=30 * i)
        projected_amount = avg_monthly * i
        projections.append({
            'month': future_date.strftime('%b %Y'),
            'projected_expenses': round(projected_amount, 2)
        })
    
    cursor.close()
    conn.close()
    return jsonify({'projections': projections, 'avg_monthly': round(avg_monthly, 2)})

# ERROR HANDLERS
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found', 'status': 404}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'status': 500}), 500

# HEALTH CHECK ENDPOINT
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Finance API is running'})

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'AI Finance Companion API',
        'version': '1.0',
        'endpoints': {
            'expenses': '/api/expenses',
            'goals': '/api/goals',
            'categories': '/api/categories',
            'chat': '/api/chat',
            'analytics': '/api/analytics/summary',
            'projections': '/api/projections'
        }
    })

# Initialize database on startup
with app.app_context():
    try:
        init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
