# AI-Powered Personal Finance Companion

A beautiful, intelligent desktop web application for tracking expenses, visualizing financial data, and getting personalized AI financial advice.

![Finance Companion](https://img.shields.io/badge/Status-Production%20Ready-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-18.0+-61DAFB)
![Flask](https://img.shields.io/badge/Flask-3.0+-green)

---
## Live Demo

**Try it now:** [https://personal-expense-tracker-frontend-43yd.onrender.com/](https://personal-expense-tracker-frontend-43yd.onrender.com/)

*Note: First load may take 30-60 seconds as the free tier backend wakes up.*

---

## Features

### 1. Expense Tracking
- **Full CRUD Operations** - Create, read, update, and delete expenses
- **Smart Categorization** - Pre-built categories + custom categories
- **Payment Methods** - Track UPI, Cash, and Card transactions
- **Rich Details** - Add amounts, dates, descriptions, and more
- **Real-time Updates** - Instant synchronization with dashboard

### 2. Visual Dashboard
- **Expense Distribution** - Beautiful pie charts showing category breakdown
- **Monthly Trends** - Line graphs tracking spending over time
- **Total Tracking** - Real-time expense totals and transaction counts
- **Goals Progress** - Visual progress bars for all savings goals
- **Color-Coded** - Category-specific colors for easy identification

### 3. AI Financial Advisor
- **Natural Conversations** - Chat with AI like talking to a friend
- **Context-Aware** - AI knows your spending patterns and goals
- **Personalized Advice** - Get budgeting tips based on YOUR data
- **Honest Feedback** - Real talk about spending habits
- **Pattern Analysis** - Identifies trends and suggests improvements
- **Powered by Groq** - Fast, intelligent responses using Llama 3.3 70B

### 4. Savings Goals Manager
- **Multiple Goals** - Track unlimited savings goals simultaneously
- **Priority System** - High, medium, and low priority levels
- **Progress Tracking** - Visual progress bars with percentage completion
- **Deadline Monitoring** - Days remaining countdown
- **Smart Updates** - Automatic progress calculation

### 5. Future Projections
- **3/6/12 Month Forecasts** - Predict future expenses
- **Pattern-Based** - Uses historical data for accuracy
- **Average Calculations** - Monthly spending averages
- **Visual Timelines** - See projected spending trajectory

---

## Tech Stack

### Backend
- **Python 3.8+** - Core language
- **Flask 3.0** - Web framework & REST API
- **PostgreSQL** - Production database (deployed on Render)
- **psycopg** - PostgreSQL adapter for Python
- **Flask-CORS** - Cross-origin resource sharing
- **python-dotenv** - Environment variable management
- **Requests** - HTTP library for Groq API

### Frontend
- **React 18+** - UI library
- **Recharts** - Beautiful, responsive charts
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Fetch API** - Backend communication

### AI
- **Groq API** - LLM inference (Llama 3.3 70B Versatile)
- **Context-aware prompting** - Financial data integration

---

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 14+ and npm
- Internet connection (for AI features)

### Backend Setup

1. **Navigate to project directory**
```bash
cd "path/to/New Expense tracker"
```

2. **Create virtual environment** (recommended)
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

4. **Verify .env file exists**
```bash
# Check if .env exists
cat .env
```

5. **Start the backend server**
```bash
python app.py
```

You should see:
```
Starting Finance Companion Backend...
Database initialized
Server running on http://localhost:5000
```

**Keep this terminal open!** The server needs to stay running.

---

### Frontend Setup

1. **Open a NEW terminal** (keep Flask running)

2. **Navigate to frontend directory**
```bash
cd frontend
```

3. **Install Node dependencies**
```bash
npm install
```

4. **Add Tailwind CSS via CDN** (for quick setup)

Open `frontend/public/index.html` and add inside `<head>`:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

**OR** for production setup:
```bash
npm install -D tailwindcss
npx tailwindcss init

# Then configure tailwind.config.js and src/index.css as shown below
```

5. **Start the frontend**
```bash
npm start
```

Frontend will open at `http://localhost:3000`

---

## Project Structure

```
NEW EXPENSE TRACKER
│
├── frontend
│   ├── node_modules
│   │
│   ├── public
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   │
│   ├── src
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── App.test.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── logo.svg
│   │   ├── reportWebVitals.js
│   │   └── setupTests.js
│   │
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   └── README.md
│
├── .env
├── app.py
├── finance.db
├── README.md
├── requirements.txt
├── test_backend.py
├── test_chat.py

```

---

## API Endpoints

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Create new expense |
| PUT | `/api/expenses/<id>` | Update expense |
| DELETE | `/api/expenses/<id>` | Delete expense |

**Example Request (POST):**
```json
{
  "amount": 500,
  "category": "Food",
  "date": "2025-01-15",
  "paymentMethod": "UPI",
  "description": "Lunch at cafe"
}
```

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | Get all goals |
| POST | `/api/goals` | Create new goal |
| PUT | `/api/goals/<id>` | Update goal |
| DELETE | `/api/goals/<id>` | Delete goal |

**Example Request (POST):**
```json
{
  "name": "Emergency Fund",
  "target": 100000,
  "deadline": "2025-12-31",
  "priority": "high"
}
```

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get custom categories |
| POST | `/api/categories` | Add custom category |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary?period=month` | Get expense summary |

**Query Parameters:**
- `period`: `week`, `month`, or `year`

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Chat with AI advisor |

**Example Request:**
```json
{
  "message": "Should I save more or spend more?",
  "expenses": [...],
  "goals": [...]
}
```

### Projections
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projections?months=3` | Get future projections |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check API status |
| GET | `/` | API information |

---

## Database Schema

### expenses
```sql
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### goals
```sql
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    target REAL NOT NULL,
    current REAL DEFAULT 0,
    deadline TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### categories
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);
```

---

## Usage Guide

### First Time Setup

1. **Start Backend**
```bash
python app.py
```

2. **Start Frontend** (new terminal)
```bash
cd frontend
npm start
```

3. **Open Browser**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

### Adding Your First Expense

1. Click **Expenses** tab
2. Fill in the form:
   - Amount: `500`
   - Category: `Food`
   - Payment Method: `UPI`
   - Description: (optional)
3. Click **Add Expense**
4. Go to **Dashboard** to see your chart!

### Creating a Savings Goal

1. Click **Goals** tab
2. Fill in the form:
   - Goal Name: `Emergency Fund`
   - Target Amount: `50000`
   - Deadline: Select date
   - Priority: `High`
3. Click **Create Goal**
4. Track progress on Dashboard

### Chatting with AI

1. Click **Advisor** tab
2. Type a question like:
   - "How am I doing?"
   - "Should I cut back on spending?"
   - "Help me reach my goals faster"
   - "Any tips for saving money?"
3. Get personalized, conversational advice!

---

## Testing

### Test Backend Health
```bash
python test_backend.py
```

Expected output:
```
Health Check: {'status': 'ok', 'message': 'Finance API is running'}
Expenses: []
Goals: []
All endpoints working!
```

### Test Chat Functionality
```bash
python test_chat.py
```

Should show:
```
Testing API Key: iubkjboblkb...
Status Code: 200
API Key is valid!
```

---

## Customization

### Change Color Scheme

Edit `frontend/src/App.js`:
```javascript
// Current: Purple gradient
className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"

// Example: Blue gradient
className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
```

### Add Custom Categories

**Via Frontend:**
1. Go to Expenses tab
2. Type new category in dropdown
3. It will be saved automatically

**Via API:**
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Investments"}'
```

### Modify AI Personality

Edit `app.py` line ~150:
```python
'temperature': 0.8,  # Lower = more focused, Higher = more creative
'max_tokens': 300,   # Response length
```

---

## Deployment

### Live Production URLs
- **Frontend**: https://personal-expense-tracker-frontend-43yd.onrender.com/
- **Backend API**: https://personal-expense-tracker-01c6.onrender.com
- **Database**: PostgreSQL on Render

### Backend Deployment (Render)

1. **Create PostgreSQL Database:**
   - New → PostgreSQL
   - Name: `finance-db`
   - Plan: Free
   - Copy the Internal Database URL

2. **Create Web Service:**
   - New → Web Service
   - Connect your GitHub repository
   - Settings:
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn app:app`
     - **Environment Variables**:
       - `DATABASE_URL`: (PostgreSQL Internal URL)
       - `GROQ_API_KEY`: (Your Groq API key)
       - `FLASK_ENV`: `production`

3. **Add `runtime.txt`** (if using Python 3.11):

### Frontend Deployment (Render Static Site)

1. **Create Static Site:**
   - New → Static Site
   - Connect same repository
   - Settings:
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`
     - **Environment Variable**:
       - `REACT_APP_API_URL`: `https://personal-expense-tracker-01c6.onrender.com`

2. **Deploy** - Render will auto-deploy from GitHub

### Important PostgreSQL Notes
- Uses `%s` placeholders instead of `?` (SQLite syntax)
- `SERIAL` instead of `AUTOINCREMENT`
- Database persists between deployments
- Free tier includes 1GB storage

---

## Security

### Important Notes
- **Never commit `.env`** to version control
- **Production uses PostgreSQL** - more robust than SQLite
- Add **authentication** before deploying publicly
- Implement **rate limiting** for API endpoints
- Use **HTTPS** in production

### Recommended Production Setup
- PostgreSQL instead of SQLite
- JWT authentication
- API rate limiting
- Input validation & sanitization
- HTTPS/SSL certificates
- Regular backups

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <PID> /F

# Or use different port
flask run --port 5001
```

### Frontend can't connect to backend
1. Check Flask is running: `http://localhost:5000`
2. Check CORS is enabled (already configured)
3. Clear browser cache
4. Check browser console for errors (F12)

### AI Chat not working
```
# Common issues:
# - Invalid API key
# - Model decommissioned
# - Rate limit exceeded
# - Network/firewall blocking
```

### Database errors
```bash
# Delete and recreate database
rm finance.db
python app.py  # Will auto-create new database

```
### PostgreSQL Connection Issues
```bash
# Check DATABASE_URL is set correctly in Render
# Format: postgresql://user:password@host:port/database

# Test connection locally (if using PostgreSQL locally)
psql $DATABASE_URL
### Charts not showing
1. Add some expenses first
2. Check browser console (F12)
3. Verify Recharts is installed: `npm list recharts`
4. Refresh page

---

## Dependencies

### Backend (`requirements.txt`)
```
Flask==3.0.0
flask-cors==4.0.0
python-dotenv==1.0.0
requests==2.31.0
gunicorn==21.2.0
psycopg[binary]==3.2.10
```

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "recharts": "^2.5.0",
    "lucide-react": "^0.263.1"
  }
}
```

---

## Contributing

This is a personal project, but feel free to:
1. Fork the repository
2. Create feature branches
3. Submit pull requests
4. Report issues

---

## Future Enhancements

- [ ] Export data to CSV/PDF
- [ ] Budget alerts & notifications
- [ ] Recurring expenses
- [ ] Multi-currency support
- [ ] Mobile responsive design
- [ ] Dark/light theme toggle
- [ ] Data backup & restore
- [ ] Multi-user support with authentication
- [ ] Email reports
- [ ] Bill reminders
- [ ] Receipt scanning (OCR)
- [ ] Investment tracking

---

## License

MIT License - Free to use and modify

---

## Support

**Q: Can I use a different AI model?**  
A: Yes! Edit `app.py` and change the model name. Check [Groq's models](https://console.groq.com/docs/models) for options.

**Q: How do I backup my data?**  
A: Copy the `finance.db` file to a safe location.

**Q: Is my data private?**  
A: Yes! All data is stored locally in `finance.db`. Only chat messages are sent to Groq API.

### Getting Help

- Check the troubleshooting section above
- Review Flask terminal logs for errors
- Check browser console (F12) for frontend errors
- Test API endpoints with the provided test scripts

---

## Quick Start Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 14+ installed
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `.env` file exists with Groq API key
- [ ] Backend running (`python app.py`)
- [ ] Frontend running (`npm start`)
- [ ] Opened `http://localhost:3000` in browser
- [ ] Added first expense
- [ ] Created first goal
- [ ] Chatted with AI advisor

---

**Made with ❤️ for better financial management**

*Version 1.0 - January 2025*
