import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, Target, MessageSquare, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

export default function FinanceCompanion() {
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    description: ''
  });
  
  const [goalForm, setGoalForm] = useState({
    name: '',
    target: '',
    deadline: '',
    priority: 'medium'
  });
  
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchGoals();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_BASE}/expenses`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API_BASE}/goals`);
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      setCustomCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const addExpense = async () => {
    if (!expenseForm.amount || !expenseForm.category) return;
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm)
      });
      if (res.ok) {
        fetchExpenses();
        setExpenseForm({
          amount: '',
          category: 'Food',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'UPI',
          description: ''
        });
      }
    } catch (err) {
      console.error('Failed to add expense:', err);
    }
  };

  const updateExpense = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingExpense)
      });
      if (res.ok) {
        fetchExpenses();
        setEditingExpense(null);
      }
    } catch (err) {
      console.error('Failed to update expense:', err);
    }
  };

  const deleteExpense = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) fetchExpenses();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const clearAllData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL expenses and goals? This cannot be undone.')) {
      return;
    }
    
    try {
      // Delete all expenses
      for (const expense of expenses) {
        await fetch(`${API_BASE}/expenses/${expense.id}`, { method: 'DELETE' });
      }
      // Delete all goals
      for (const goal of goals) {
        await fetch(`${API_BASE}/goals/${goal.id}`, { method: 'DELETE' });
      }
      
      // Refresh data
      fetchExpenses();
      fetchGoals();
      
      // Clear chat
      setChatMessages([]);
      setConversationHistory([]);
      
      alert('All data cleared successfully!');
    } catch (err) {
      console.error('Failed to clear data:', err);
      alert('Failed to clear data. Please try again.');
    }
  };

  const addGoal = async () => {
    if (!goalForm.name || !goalForm.target || !goalForm.deadline) return;
    try {
      const res = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalForm)
      });
      if (res.ok) {
        fetchGoals();
        setGoalForm({ name: '', target: '', deadline: '', priority: 'medium' });
      }
    } catch (err) {
      console.error('Failed to add goal:', err);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          expenses: expenses,
          goals: goals,
          history: conversationHistory  // ADD THIS LINE
        })
      });
      const data = await res.json();
      const assistantMessage = { role: 'assistant', content: data.response };
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // ADD THESE 2 LINES - Update conversation history
      setConversationHistory(prev => [...prev, userMessage, assistantMessage]);
      
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryData = () => {
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyTrend = () => {
    const monthlyData = {};
    expenses.forEach(exp => {
      const month = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + parseFloat(exp.amount);
    });
    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  };

  const allCategories = [...new Set([...CATEGORIES, ...customCategories])];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Wallet className="w-10 h-10 text-purple-400" />
            AI Finance Companion
          </h1>
          <p className="text-purple-200">Your intelligent personal finance assistant</p>
          <button
            onClick={clearAllData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </button>
        </header>

        <div className="flex gap-4 mb-6 flex-wrap">
          {['dashboard', 'expenses', 'goals', 'advisor'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                Expense Distribution
              </h2>
              {getCategoryData().length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getCategoryData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 text-center py-20">No expense data yet</div>
              )}
            </div>

            <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Monthly Trend</h2>
              {getMonthlyTrend().length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getMonthlyTrend()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 text-center py-20">No trend data yet</div>
              )}
            </div>

            <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Total Expenses</h2>
              <div className="text-5xl font-bold text-purple-400">
                ₹{getTotalExpenses().toLocaleString('en-IN')}
              </div>
              <p className="text-slate-400 mt-2">Across {expenses.length} transactions</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-400" />
                Goals Progress
              </h2>
              {goals.length > 0 ? (
                goals.map(goal => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={goal.id} className="mb-4">
                      <div className="flex justify-between text-white mb-2">
                        <span>{goal.name}</span>
                        <span>₹{goal.current} / ₹{goal.target}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-400 text-center py-10">No goals set yet</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Add Expense</h2>
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Amount"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                >
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
                <select
                  value={expenseForm.paymentMethod}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={addExpense}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Expense
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Recent Expenses</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {expenses.length > 0 ? (
                  expenses.map(expense => (
                    <div key={expense.id} className="bg-slate-700 p-4 rounded-lg flex justify-between items-center">
                      {editingExpense?.id === expense.id ? (
                        <div className="flex gap-2 flex-1 flex-wrap">
                          <input
                            type="number"
                            value={editingExpense.amount}
                            onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                            className="p-2 rounded bg-slate-600 text-white w-24"
                          />
                          <select
                            value={editingExpense.category}
                            onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                            className="p-2 rounded bg-slate-600 text-white"
                          >
                            {allCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => updateExpense(expense.id)}
                            className="p-2 bg-green-600 rounded hover:bg-green-700 text-white"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingExpense(null)}
                            className="p-2 bg-slate-600 rounded hover:bg-slate-500 text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="text-white font-semibold">₹{expense.amount}</div>
                            <div className="text-slate-400 text-sm">
                              {expense.category} • {expense.paymentMethod} • {new Date(expense.date).toLocaleDateString()}
                            </div>
                            {expense.description && (
                              <div className="text-slate-500 text-xs">{expense.description}</div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingExpense(expense)}
                              className="p-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="p-2 bg-red-600 rounded hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-center py-20">No expenses yet. Add your first expense!</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Create Savings Goal</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Goal Name"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Target Amount"
                  value={goalForm.target}
                  onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
                <input
                  type="date"
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
                <select
                  value={goalForm.priority}
                  onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                <button
                  onClick={addGoal}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  Create Goal
                </button>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Your Goals</h2>
              <div className="space-y-4">
                {goals.length > 0 ? (
                  goals.map(goal => {
                    const progress = (goal.current / goal.target) * 100;
                    const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={goal.id} className="bg-slate-700 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-white font-semibold text-lg">{goal.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${
                              goal.priority === 'high' ? 'bg-red-900 text-red-200' :
                              goal.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                              'bg-green-900 text-green-200'
                            }`}>
                              {goal.priority} priority
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">₹{goal.current} / ₹{goal.target}</div>
                            <div className="text-slate-400 text-sm">{daysLeft} days left</div>
                          </div>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-4 mt-2">
                          <div
                            className={`h-4 rounded-full transition-all ${
                              progress >= 100 ? 'bg-green-500' :
                              progress >= 75 ? 'bg-blue-500' :
                              progress >= 50 ? 'bg-yellow-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="text-slate-400 text-sm mt-1">{progress.toFixed(1)}% complete</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-400 text-center py-20">No goals yet. Create your first goal!</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advisor' && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-400" />
              AI Financial Advisor
            </h2>
            <div className="bg-slate-900 rounded-lg p-4 h-96 overflow-y-auto mb-4">
              {chatMessages.length === 0 ? (
                <div className="text-slate-400 text-center mt-20">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p>Ask me anything about your finances!</p>
                  <p className="text-sm mt-2">I can analyze patterns, suggest budgets, and help you reach your goals.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-purple-600 ml-12 text-white'
                          : 'bg-slate-700 mr-12 text-slate-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="bg-slate-700 mr-12 p-4 rounded-lg text-slate-100">
                      Thinking...
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask your AI advisor..."
                className="flex-1 p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={sendChatMessage}
                disabled={isLoading}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}