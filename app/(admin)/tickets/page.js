'use client';

import { useState, useEffect } from 'react';
import { Ticket, Search, Filter, Loader2 } from 'lucide-react';
import TicketEditModal from '@/components/TicketEditModal';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.recNumber.toLowerCase().includes(search.toLowerCase()) ||
    ticket.requesterName.toLowerCase().includes(search.toLowerCase())
  );

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'CRITICAL': return 'badge-danger';
      case 'HIGH': return 'badge-warning';
      case 'MEDIUM': return 'badge-info';
      default: return 'badge-success';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'CLOSED': return 'badge-secondary';
      case 'RESOLVED': return 'badge-success';
      case 'IN_PROGRESS': return 'badge-info';
      default: return 'badge-warning';
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl">IT Helpdesk</h2>
          <p className="text-muted">Manage and resolve employee IT support requests</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="flex justify-between items-center">
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search tickets by REC Number or Requester..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>
          <div className="flex gap-4">
            <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <div className="badge badge-warning" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ticket size={16} />
              <span>{tickets.filter(t => t.status === 'OPEN').length} Open</span>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>REC Number</th>
              <th>Status</th>
              <th>Issue Date</th>
              <th>Requester Name</th>
              <th>Priority</th>
              <th>Issue Impact</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr 
                key={ticket.id} 
                onClick={() => setSelectedTicket(ticket)}
                style={{ cursor: 'pointer' }}
              >
                <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{ticket.recNumber}</td>
                <td><span className={`badge ${getStatusBadge(ticket.status)}`}>{ticket.status}</span></td>
                <td>{new Date(ticket.issueDate).toLocaleDateString()}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{ticket.requesterName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.email}</div>
                </td>
                <td><span className={`badge ${getPriorityBadge(ticket.priority)}`}>{ticket.priority}</span></td>
                <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ticket.issueImpact}
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }} className="text-muted">
                  <Ticket size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                  <p>No tickets found matching your search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTicket && (
        <TicketEditModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          onUpdate={fetchTickets} 
        />
      )}
    </div>
  );
}
