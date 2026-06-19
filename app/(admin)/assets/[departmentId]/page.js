'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Monitor, Mail, Phone, Calendar, ArrowLeft, Loader2, Search, Plus, Edit2, Trash2, Printer } from 'lucide-react';
import EmployeeProfileModal from '@/components/EmployeeProfileModal';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import EditEmployeeModal from '@/components/EditEmployeeModal';
import PrintReceiptModal from '@/components/PrintReceiptModal';

export default function DepartmentAssets() {
  const params = useParams();
  const router = useRouter();
  const [department, setDepartment] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [printingUser, setPrintingUser] = useState(null);

  useEffect(() => {
    fetchDepartmentData();
  }, [params.departmentId]);

  const fetchDepartmentData = async () => {
    try {
      const [deptRes, usersRes] = await Promise.all([
        fetch(`/api/departments/${params.departmentId}`),
        fetch(`/api/users?departmentId=${params.departmentId}`)
      ]);
      
      const deptData = await deptRes.json();
      const usersData = await usersRes.json();
      
      setDepartment(deptData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    user.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserClick = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const userData = await res.json();
      setSelectedUser(userData);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleEditEmployee = (e, user) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingEmployee(user);
  };

  const handlePrintClick = async (e, user) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/users/${user.id}`);
      const userData = await res.json();
      setPrintingUser(userData);
    } catch (error) {
      console.error('Error fetching user details for print:', error);
    }
  };

  const handleDeleteEmployee = async (e, userId, fullName) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete employee "${fullName}"? Their assigned assets will be returned to stock.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDepartmentData();
      } else {
        alert('Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="animate-spin" size={32} /></div>;
  }

  if (!department) {
    return <div className="text-center text-muted p-6">Department not found</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl">{department.name}</h2>
          <p className="text-muted">Employees and assigned assets</p>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setIsAddEmployeeModalOpen(true)}>
          <Plus size={18} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="flex justify-between items-center">
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>
          <div className="flex gap-4">
            <div className="badge badge-info" style={{ padding: '0.5rem 1rem' }}>
              {users.length} Employees
            </div>
            <div className="badge badge-success" style={{ padding: '0.5rem 1rem' }}>
              {department.assets?.length || 0} Total Assets
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {filteredUsers.map((user) => (
          <div 
            key={user.id} 
            className="glass-card" 
            style={styles.userCard}
            onClick={() => handleUserClick(user.id)}
          >
            <div style={styles.avatar}>
              <User size={32} />
              <div style={styles.cardActions}>
                <button onClick={(e) => handleEditEmployee(e, user)} className="icon-btn-small" title="Edit Employee"><Edit2 size={14} /></button>
                <button onClick={(e) => handlePrintClick(e, user)} className="icon-btn-small" title="Print IT Receipt" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'rgb(52, 211, 153)' }}><Printer size={14} /></button>
                <button onClick={(e) => handleDeleteEmployee(e, user.id, user.fullName)} className="icon-btn-small danger" title="Delete Employee"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 style={styles.userName}>{user.fullName}</h3>
            <p style={styles.userTitle}>{user.jobTitle}</p>
            
            <div style={styles.assetBadge}>
              <Monitor size={16} />
              <span>{user._count.assignedAssets} Assets</span>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center text-muted p-6 glass-panel">
          No employees found matching your search.
        </div>
      )}

      {selectedUser && (
        <EmployeeProfileModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onAssetAssigned={fetchDepartmentData} // Refresh data if an asset is assigned
        />
      )}

      {isAddEmployeeModalOpen && (
        <AddEmployeeModal 
          departmentId={params.departmentId}
          onClose={() => setIsAddEmployeeModalOpen(false)} 
          onUpdate={fetchDepartmentData} 
        />
      )}

      {editingEmployee && (
        <EditEmployeeModal 
          user={editingEmployee}
          onClose={() => setEditingEmployee(null)} 
          onUpdate={fetchDepartmentData} 
        />
      )}

      {printingUser && (
        <PrintReceiptModal 
          user={printingUser}
          onClose={() => setPrintingUser(null)}
        />
      )}
    </div>
  );
}

const styles = {
  userCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    padding: '2rem 1.5rem',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-primary)',
    marginBottom: '1rem',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  cardActions: {
    position: 'absolute',
    top: '-5px',
    right: '-45px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    opacity: 0.8,
  },
  userName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: 'var(--text-primary)',
  },
  userTitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginBottom: '1.5rem',
  },
  assetBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(15, 23, 42, 0.5)',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
  }
};
