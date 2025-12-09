import React, { useState, useEffect } from 'react';
import { ticketsAPI, categoriesAPI } from '../services/api';
import { Ticket, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import '../styles/Tickets.css';

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { user, logout } = useAuth();

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    categoryId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ticketsRes, categoriesRes]: any = await Promise.all([
        ticketsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);
      setTickets(ticketsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ticketsAPI.create({
        ...newTicket,
        categoryId: parseInt(newTicket.categoryId),
        clientId: user?.id,
        createdById: user?.id,
      });
      setShowCreateModal(false);
      setNewTicket({ title: '', description: '', priority: 'MEDIUM', categoryId: '' });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating ticket');
    }
  };

  const handleUpdateStatus = async (ticketId: number, newStatus: string) => {
    try {
      await ticketsAPI.update(ticketId, { status: newStatus });
      loadData();
      setSelectedTicket(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating ticket');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      OPEN: '#3498db',
      IN_PROGRESS: '#f39c12',
      RESOLVED: '#2ecc71',
      CLOSED: '#95a5a6',
    };
    return colors[status] || '#333';
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      LOW: '#2ecc71',
      MEDIUM: '#f39c12',
      HIGH: '#e74c3c',
    };
    return colors[priority] || '#333';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="tickets-container">
      <header className="tickets-header">
        <h1>Tech Help Desk - Tickets</h1>
        <div className="user-info">
          <span>Welcome, {user?.name} ({user?.role.name})</span>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="tickets-actions">
        <button onClick={() => setShowCreateModal(true)} className="btn-create">
          + Create Ticket
        </button>
      </div>

      <div className="tickets-grid">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card" onClick={() => setSelectedTicket(ticket)}>
            <div className="ticket-header">
              <h3>{ticket.title}</h3>
              <span className="ticket-id">#{ticket.id}</span>
            </div>
            <p className="ticket-description">{ticket.description}</p>
            <div className="ticket-meta">
              <span className="badge" style={{ backgroundColor: getStatusColor(ticket.status) }}>
                {ticket.status}
              </span>
              <span className="badge" style={{ backgroundColor: getPriorityColor(ticket.priority) }}>
                {ticket.priority}
              </span>
            </div>
            <div className="ticket-footer">
              <span>Category: {ticket.category.name}</span>
              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="modal" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Ticket</h2>
            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  required
                  minLength={5}
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  required
                  minLength={10}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={newTicket.categoryId}
                  onChange={(e) => setNewTicket({ ...newTicket, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="modal" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Ticket #{selectedTicket.id}</h2>
            <div className="ticket-details">
              <h3>{selectedTicket.title}</h3>
              <p>{selectedTicket.description}</p>
              
              <div className="details-row">
                <strong>Status:</strong>
                <span className="badge" style={{ backgroundColor: getStatusColor(selectedTicket.status) }}>
                  {selectedTicket.status}
                </span>
              </div>

              <div className="details-row">
                <strong>Priority:</strong>
                <span className="badge" style={{ backgroundColor: getPriorityColor(selectedTicket.priority) }}>
                  {selectedTicket.priority}
                </span>
              </div>

              <div className="details-row">
                <strong>Category:</strong>
                <span>{selectedTicket.category.name}</span>
              </div>

              <div className="details-row">
                <strong>Created:</strong>
                <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
              </div>

              {user?.role.name === 'TECHNICIAN' && selectedTicket.status !== 'CLOSED' && (
                <div className="status-actions">
                  <h4>Update Status:</h4>
                  {selectedTicket.status === 'OPEN' && (
                    <button onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}>
                      Start Work
                    </button>
                  )}
                  {selectedTicket.status === 'IN_PROGRESS' && (
                    <button onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}>
                      Resolve
                    </button>
                  )}
                  {selectedTicket.status === 'RESOLVED' && (
                    <button onClick={() => handleUpdateStatus(selectedTicket.id, 'CLOSED')}>
                      Close
                    </button>
                  )}
                </div>
              )}

              <button onClick={() => setSelectedTicket(null)} className="btn-close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
