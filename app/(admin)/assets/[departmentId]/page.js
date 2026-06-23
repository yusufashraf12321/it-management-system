'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Monitor, ArrowLeft, Loader2, Search, Plus, Edit2, Printer, LogOut } from 'lucide-react';
import EmployeeProfileModal from '@/components/EmployeeProfileModal';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import EditEmployeeModal from '@/components/EditEmployeeModal';
import PrintReceiptModal from '@/components/PrintReceiptModal';
import ResignEmployeeModal from '@/components/ResignEmployeeModal';
import BulkAddEmployeesModal from '@/components/BulkAddEmployeesModal';


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
  const [resigningUser, setResigningUser] = useState(null);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

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

  const handleResignClick = async (e, user) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Fetch full user with assets before opening modal
      const res = await fetch(`/api/users/${user.id}`);
      const userData = await res.json();
      setResigningUser(userData);
    } catch (error) {
      console.error('Error fetching user details for resignation:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={32} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading department data...</span>
      </div>
    );
  }

  if (!department) {
    return <div className="text-center text-muted p-6">Department not found</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <button onClick={() => router.back()} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{department.name}</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Asset tracking and employee custody management
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setIsBulkUploadModalOpen(true)}>
            <Plus size={18} />
            <span>Bulk Upload</span>
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddEmployeeModalOpen(true)}>
            <Plus size={18} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Stats & Search Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="badge badge-info" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              {users.length} Employees
            </div>
            <div className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              {department.assets?.length || 0} Total Assets
            </div>
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      <div style={styles.grid}>
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="glass-card"
            style={styles.userCard}
            onClick={() => handleUserClick(user.id)}
          >
            {/* Avatar */}
            <div style={styles.avatar}>
              <User size={30} />
            </div>

            {/* Name & Title */}
            <h3 style={styles.userName}>{user.fullName}</h3>
            <p style={styles.userTitle}>{user.jobTitle}</p>

            {/* Asset badge */}
            <div style={styles.assetBadge}>
              <Monitor size={14} />
              <span>{user._count?.assignedAssets ?? 0} Assets</span>
            </div>

            {/* Action buttons — appear on hover via CSS classes */}
            <div style={styles.cardActions} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => handleEditEmployee(e, user)}
                className="icon-btn-small"
                title="Edit Employee"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={(e) => handlePrintClick(e, user)}
                className="icon-btn-small"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'rgb(52, 211, 153)' }}
                title="Print IT Receipt"
              >
                <Printer size={13} />
              </button>
              <button
                onClick={(e) => handleResignClick(e, user)}
                className="icon-btn-small danger"
                title="Resign / Terminate Employee"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center text-muted p-6 glass-panel">
          No employees found{search ? ` matching "${search}"` : ''}.
        </div>
      )}

      {/* Modals */}
      {selectedUser && (
        <EmployeeProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onAssetAssigned={fetchDepartmentData}
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

      {resigningUser && (
        <ResignEmployeeModal
          user={resigningUser}
          onClose={() => setResigningUser(null)}
          onUpdate={fetchDepartmentData}
        />
      )}

      {isBulkUploadModalOpen && (
        <BulkAddEmployeesModal
          departmentId={params.departmentId}
          onClose={() => setIsBulkUploadModalOpen(false)}
          onUpdate={fetchDepartmentData}
        />
      )}
    </div>
  );
}

const styles = {
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.25rem',
  },
  userCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    padding: '2rem 1.25rem 1.25rem',
    position: 'relative',
    transition: 'all 0.2s',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(16, 185, 129, 0.25))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-primary)',
    marginBottom: '1rem',
    border: '2px solid rgba(255, 255, 255, 0.08)',
  },
  cardActions: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  userName: {
    fontSize: '1rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: 'var(--text-primary)',
  },
  userTitle: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginBottom: '1rem',
  },
  assetBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.875rem',
    background: 'rgba(15, 23, 42, 0.5)',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
  },
};
