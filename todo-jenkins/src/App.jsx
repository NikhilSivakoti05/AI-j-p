import React, { useState, useEffect } from 'react';
import './App.css'; // Assuming you have a basic CSS file for styling
const API_URL = "http://localhost:2030/Springboot-jenkins-p/api/summaries";




function App() {
  const [prompt, setPrompt] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editResponse, setEditResponse] = useState("");
  const [message, setMessage] = useState("");

  // Fetch all summaries from the backend
  const fetchSummaries = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch summaries");
      }
      const data = await response.json();
      setSummaries(data);
    } catch (error) {
      setMessage(`Error fetching summaries: ${error.message}`);
      console.error("Error fetching summaries:", error);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  // Handle new summary submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }
      const newSummary = await response.json();
      setSummaries([newSummary, ...summaries]);
      setPrompt("");
      setMessage("Summary generated and saved successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error("Error creating summary:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle update
  const handleUpdate = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: editPrompt, response: editResponse }),
      });
      if (!response.ok) {
        throw new Error("Failed to update summary");
      }
      await fetchSummaries();
      setEditingId(null);
      setMessage("Summary updated successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error("Error updating summary:", error);
    }
  };

  // Handle deletion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this summary?")) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete summary");
        }
        await fetchSummaries();
        setMessage("Summary deleted successfully!");
      } catch (error) {
        setMessage(`Error: ${error.message}`);
        console.error("Error deleting summary:", error);
      }
    }
  };

  const startEdit = (summary) => {
    setEditingId(summary.id);
    setEditPrompt(summary.prompt);
    setEditResponse(summary.response);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <style jsx>{`
        .container {
          max-width: 800px;
          width: 100%;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #0c0e11ff;
          border-radius: 8px;
          font-size: 1rem;
          resize: vertical;
        }
        .btn-primary {
          background-color: #3b82f6;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-primary:hover {
          background-color: #2563eb;
        }
        .list-container {
          margin-top: 2rem;
        }
        .summary-item {
          background-color: #121314ff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }
        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .summary-actions button {
          margin-left: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
        }
        .btn-edit {
          background-color: #f59e0b;
          color: white;
        }
        .btn-delete {
          background-color: #ef4444;
          color: white;
        }
        .btn-save {
          background-color: #10b981;
          color: white;
        }
        .btn-cancel {
          background-color: #6b7280;
          color: white;
        }
        .message-box {
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 8px;
        }
        .success {
          background-color: #d1fae5;
          color: #065f46;
        }
        .error {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="container">
        <h1 className="text-3xl font-bold text-center mb-6">Summarization App</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="form-group">
            <textarea
              className="form-input"
              rows="4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter text to summarize..."
              required
            ></textarea>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              "Generate and Save Summary"
            )}
          </button>
        </form>

        {message && (
          <div className={`message-box mt-4 ${message.startsWith("Error") ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="list-container">
          {summaries.length === 0 ? (
            <p className="text-center text-gray-500">No summaries yet. Try generating one!</p>
          ) : (
            summaries.map((summary) => (
              <div key={summary.id} className="summary-item">
                {editingId === summary.id ? (
                  <div className="flex flex-col space-y-2">
                    <textarea
                      className="form-input"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      rows="3"
                    ></textarea>
                    <textarea
                      className="form-input"
                      value={editResponse}
                      onChange={(e) => setEditResponse(e.target.value)}
                      rows="5"
                    ></textarea>
                    <div className="flex justify-end space-x-2">
                      <button className="btn-save" onClick={() => handleUpdate(summary.id)}>Save</button>
                      <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="summary-header">
                      <h3 className="font-semibold text-lg">Prompt</h3>
                      <div className="summary-actions">
                        <button className="btn-edit" onClick={() => startEdit(summary)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(summary.id)}>Delete</button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{summary.prompt}</p>
                    <h3 className="font-semibold text-lg">Response</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{summary.response}</p>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
