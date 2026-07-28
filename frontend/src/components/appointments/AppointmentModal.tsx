import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: any;
}

export default function AppointmentModal({ isOpen, onClose, appointment }: AppointmentModalProps) {
  const queryClient = useQueryClient();

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const res = await apiClient.get('/patients');
      return res.data;
    }
  });

  const [formData, setFormData] = useState({
    patientId: '',
    startTime: '',
    duration: 30,
    type: 'REGULAR',
    status: 'SCHEDULED'
  });

  useEffect(() => {
    if (appointment) {
      // For datetime-local input, format needs to be YYYY-MM-DDThh:mm
      const start = new Date(appointment.startTime);
      // Adjust for timezone offset for local viewing
      const tzOffset = (new Date()).getTimezoneOffset() * 60000;
      const localISOTime = (new Date(start.getTime() - tzOffset)).toISOString().slice(0, 16);
      
      setFormData({
        patientId: appointment.patientId || '',
        startTime: localISOTime,
        duration: appointment.duration || 30,
        type: appointment.type || 'REGULAR',
        status: appointment.status || 'SCHEDULED'
      });
    } else {
      setFormData({
        patientId: '',
        startTime: '',
        duration: 30,
        type: 'REGULAR',
        status: 'SCHEDULED'
      });
    }
  }, [appointment, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert local time back to UTC for saving
      const payload = {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(new Date(data.startTime).getTime() + data.duration * 60000).toISOString(),
      };
      
      if (appointment) {
        return apiClient.put(`/appointments/${appointment.id}`, payload);
      } else {
        return apiClient.post('/appointments', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      queryClient.invalidateQueries(['dashboardMetrics']); // Update live queue
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {appointment ? 'Edit Appointment' : 'Book Appointment'}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Patient</label>
            <select 
              value={formData.patientId}
              onChange={(e) => setFormData({...formData, patientId: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            >
              <option value="">Select Patient</option>
              {patients?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Date & Time</label>
            <input 
              type="datetime-local" 
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Duration (mins)</label>
              <input 
                type="number" 
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value, 10)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              >
                <option value="REGULAR">Regular</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="FOLLOW_UP">Follow Up</option>
              </select>
            </div>
          </div>
          {appointment && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="WAITING">Waiting Room</option>
                <option value="IN_PROGRESS">In Progress (Chair)</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => saveMutation.mutate(formData)}
            disabled={saveMutation.isPending || !formData.patientId || !formData.startTime}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-xl text-sm transition-all shadow-sm"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}
