'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Calendar, Clock, AlertCircle, 
  CheckCircle2, Plus, Filter, MessageSquare, Phone
} from 'lucide-react';

const TasksDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/admin/bas/crm/tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await fetch('/api/admin/bas/crm/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus })
      });
    } catch (err) {
      console.error(err);
      fetchTasks(); // revert on fail
    }
  };

  const filteredTasks = tasks.filter(t => filterStatus === 'All' || t.status === filterStatus);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Urgent': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'Call': return <Phone className="w-4 h-4" />;
      case 'Meeting': return <Calendar className="w-4 h-4" />;
      case 'FollowUp': return <MessageSquare className="w-4 h-4" />;
      default: return <CheckSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-blue-600" />
            Task Management
          </h1>
          <p className="text-gray-500 mt-1">Manage calls, meetings, and follow-ups across all leads.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="flex gap-4 border-b pb-4">
        {['All', 'Pending', 'InProgress', 'Completed', 'Overdue'].map(status => (
          <button 
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterStatus === status 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.length === 0 && (
            <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed">
              <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No tasks found for this filter.</p>
            </div>
          )}

          {filteredTasks.map(task => (
            <div key={task.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition group">
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => handleStatusChange(task.id, task.status === 'Completed' ? 'Pending' : 'Completed')}
                  className={`mt-1 flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition
                    ${task.status === 'Completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500 text-transparent hover:text-gray-200'}`}
                >
                  <CheckSquare className="w-4 h-4" />
                </button>
                
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-semibold text-lg ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {getIconForType(task.type)} {task.type}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    {task.lead && (
                      <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Lead: {task.lead.customerName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <select 
                  className="text-sm border rounded-lg p-1.5 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksDashboard;
