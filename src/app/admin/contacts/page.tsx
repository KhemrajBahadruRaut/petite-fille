"use client";
import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Trash2, Mail, Phone, User, Calendar, Filter } from "lucide-react";

// ---------------- Types ----------------
interface ContactSubmission {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

// ---------------- Toast Component ----------------
const ToastNotification = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${colors[toast.type]} shadow-sm mb-3`}>
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ---------------- Main Component ----------------
export default function AdminContacts() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);

  // ---------- Toasts ----------
  const addToast = (message: string, type: "success" | "error" | "warning") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ---------- Fetch Contacts ----------
  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost/petite-backend/contact/get_contacts.php");
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      setContacts(data);
      setFilteredContacts(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load contacts", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // ---------- Filter Contacts ----------
  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredContacts(contacts);
    } else {
      setFilteredContacts(contacts.filter(c => c.status === selectedStatus));
    }
  }, [selectedStatus, contacts]);

  // ---------- Update Status ----------
  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch("http://localhost/petite-backend/contact/update_status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      
      if (!res.ok) throw new Error("Failed to update status");
      
      addToast("Status updated successfully", "success");
      fetchContacts();
    } catch (err) {
      console.error(err);
      addToast("Error updating status", "error");
    }
  };

  // ---------- Delete Contact ----------
  const deleteContact = async (id: number, name: string) => {
    if (!confirm(`Delete message from "${name}"?`)) return;
    
    try {
      const res = await fetch(
        `http://localhost/petite-backend/contact/delete_contact.php?id=${id}`,
        { method: "DELETE" }
      );
      
      if (!res.ok) throw new Error("Failed to delete");
      
      addToast(`Message from ${name} deleted`, "success");
      fetchContacts();
      setSelectedContact(null);
    } catch (err) {
      console.error(err);
      addToast("Error deleting contact", "error");
    }
  };

  // ---------- Status Badge ----------
  const getStatusBadge = (status: string) => {
    const badges = {
      new: "bg-blue-100 text-blue-800 border-blue-200",
      read: "bg-gray-100 text-gray-800 border-gray-200",
      replied: "bg-green-100 text-green-800 border-green-200",
      archived: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return badges[status as keyof typeof badges] || badges.new;
  };

  // ---------- Format Date ----------
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ---------- Stats ----------
  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    read: contacts.filter(c => c.status === 'read').length,
    replied: contacts.filter(c => c.status === 'replied').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toasts */}
      <div className="fixed top-6 right-6 z-50 w-96 max-w-full">
        {toasts.map((t) => (
          <ToastNotification key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Mail className="w-6 h-6 text-indigo-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
        </div>
        <p className="text-gray-600">Manage and respond to customer inquiries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Messages</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
          <p className="text-sm text-blue-600 mb-1">New</p>
          <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Read</p>
          <p className="text-2xl font-bold text-gray-700">{stats.read}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
          <p className="text-sm text-green-600 mb-1">Replied</p>
          <p className="text-2xl font-bold text-green-700">{stats.replied}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Messages</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
          <span className="text-sm text-gray-600">
            Showing {filteredContacts.length} of {contacts.length} messages
          </span>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No contacts found</p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`bg-white rounded-xl shadow-sm border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedContact?.id === contact.id ? 'border-indigo-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{contact.full_name}</h3>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(contact.status)}`}>
                    {contact.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{contact.message}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(contact.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {contact.phone}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact Detail */}
        <div className="lg:sticky lg:top-6 h-fit">
          {selectedContact ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedContact.full_name}</h2>
                  <a href={`mailto:${selectedContact.email}`} className="text-sm text-indigo-600 hover:underline">
                    {selectedContact.email}
                  </a>
                </div>
                <button
                  onClick={() => deleteContact(selectedContact.id, selectedContact.full_name)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Phone Number</p>
                  <a href={`tel:${selectedContact.phone}`} className="text-gray-900 hover:text-indigo-600">
                    {selectedContact.phone}
                  </a>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Message</p>
                  <p className="text-gray-900 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Received</p>
                  <p className="text-gray-600">{formatDate(selectedContact.created_at)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {['read', 'replied', 'archived'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedContact.id, status)}
                      disabled={selectedContact.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedContact.status === status
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      Mark as {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}