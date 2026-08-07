'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Plus, Filter, Search, Phone, Mail, 
  MoreVertical, Calendar, DollarSign 
} from 'lucide-react';

const STAGES = [
  { id: 'NEW', title: 'New Leads', color: 'bg-blue-100 border-blue-200 text-blue-800' },
  { id: 'QUALIFIED', title: 'Qualified', color: 'bg-purple-100 border-purple-200 text-purple-800' },
  { id: 'QUOTED', title: 'Quotation', color: 'bg-amber-100 border-amber-200 text-amber-800' },
  { id: 'WON', title: 'Closed Won', color: 'bg-green-100 border-green-200 text-green-800' },
  { id: 'LOST', title: 'Closed Lost', color: 'bg-gray-100 border-gray-200 text-gray-800' }
];

const PipelineDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedLeadId, setDraggedLeadId] = useState(null);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/admin/bas/crm/leads');
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    if (!draggedLeadId) return;

    // Optimistic UI update
    setLeads(prev => prev.map(lead => 
      lead.id === draggedLeadId ? { ...lead, status: targetStage } : lead
    ));

    try {
      await fetch(`/api/admin/bas/crm/leads/${draggedLeadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStage })
      });
    } catch (error) {
      console.error('Failed to update stage', error);
      fetchLeads(); // Revert on failure
    }
    
    setDraggedLeadId(null);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            Sales Pipeline
          </h1>
          <p className="text-gray-500 mt-1">Drag and drop leads through the sales stages.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="min-w-[300px] bg-gray-100/50 rounded-xl animate-pulse h-full"></div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
          {STAGES.map(stage => (
            <div 
              key={stage.id} 
              className="min-w-[320px] w-[320px] bg-gray-50/80 rounded-xl border border-gray-200 flex flex-col max-h-full"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className={`p-3 m-2 rounded-lg border flex justify-between items-center ${stage.color}`}>
                <h3 className="font-semibold text-sm">{stage.title}</h3>
                <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold">
                  {leads.filter(l => l.status === stage.id).length}
                </span>
              </div>

              {/* Column Body (Scrollable) */}
              <div className="p-2 flex-1 overflow-y-auto space-y-3">
                {leads.filter(l => l.status === stage.id).map(lead => (
                  <div 
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md transition group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{lead.customerName}</h4>
                      <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Phone className="w-3 h-3" /> {lead.customerPhone || 'No Phone'}
                    </div>

                    <div className="mt-3 flex justify-between items-end border-t pt-2">
                      <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                        <DollarSign className="w-3 h-3" />
                        {lead.expectedValue?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">
                        {lead.probability}% Prob
                      </div>
                    </div>
                  </div>
                ))}
                
                {leads.filter(l => l.status === stage.id).length === 0 && (
                  <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center text-sm text-gray-400">
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PipelineDashboard;
