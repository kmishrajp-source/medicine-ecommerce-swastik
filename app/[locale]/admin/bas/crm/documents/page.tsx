'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, UploadCloud, Search, Trash2, 
  Download, File, Shield, Link as LinkIcon 
} from 'lucide-react';

const DocumentsDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'Prescription',
    accessLevel: 'Private',
    customerId: '',
    fileUrl: 'https://via.placeholder.com/150' // Simulated local mock URL
  });

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/admin/bas/crm/documents');
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/bas/crm/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadForm)
      });
      setIsUploading(false);
      setUploadForm({ title: '', type: 'Prescription', accessLevel: 'Private', customerId: '', fileUrl: 'https://via.placeholder.com/150' });
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to delete this document?")) return;
    try {
      await fetch(`/api/admin/bas/crm/documents?id=${id}`, { method: 'DELETE' });
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const getDocIcon = (type) => {
    switch(type) {
      case 'Prescription': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'Identity': return <Shield className="w-8 h-8 text-purple-500" />;
      case 'Invoice': return <File className="w-8 h-8 text-green-500" />;
      default: return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) || 
    (d.customerId && d.customerId.includes(search))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Document Vault
          </h1>
          <p className="text-gray-500 mt-1">Securely store Prescriptions, Invoices, and KYC Identity documents.</p>
        </div>
        <button 
          onClick={() => setIsUploading(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <UploadCloud className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border flex gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search documents by title or Customer ID..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden group">
              <div className="p-6 flex flex-col items-center text-center border-b bg-gray-50/50">
                {getDocIcon(doc.type)}
                <h3 className="mt-4 font-semibold text-gray-900 truncate w-full">{doc.title}</h3>
                <span className="text-xs text-gray-500 mt-1">{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="p-4 bg-white space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-900">{doc.type}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Access</span>
                  <span className={`font-medium ${doc.accessLevel === 'Private' ? 'text-red-600' : 'text-blue-600'}`}>
                    {doc.accessLevel}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Customer ID</span>
                  <span className="font-medium text-gray-900 truncate max-w-[100px]">{doc.customerId || 'N/A'}</span>
                </div>
              </div>
              <div className="p-3 border-t bg-gray-50 flex justify-between">
                <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition" title="View/Download">
                  <Download className="w-4 h-4" />
                </button>
                <button className="text-gray-500 hover:bg-gray-200 p-2 rounded-lg transition" title="Copy Link">
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed rounded-xl">
              No documents found.
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">Upload Document</h3>
            </div>
            <form onSubmit={handleUpload}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                  <input type="text" required className="w-full border rounded-lg p-2" value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <select className="w-full border rounded-lg p-2" value={uploadForm.type} onChange={e => setUploadForm({...uploadForm, type: e.target.value})}>
                    <option>Prescription</option>
                    <option>Identity</option>
                    <option>Invoice</option>
                    <option>Agreement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                  <select className="w-full border rounded-lg p-2" value={uploadForm.accessLevel} onChange={e => setUploadForm({...uploadForm, accessLevel: e.target.value})}>
                    <option>Private</option>
                    <option>Internal</option>
                    <option>Public</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID (Optional)</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={uploadForm.customerId} onChange={e => setUploadForm({...uploadForm, customerId: e.target.value})} placeholder="usr_123..." />
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsUploading(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
                  <UploadCloud className="w-4 h-4" /> Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsDashboard;
