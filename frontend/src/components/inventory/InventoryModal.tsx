import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any;
  onSave?: (data: any) => void;
}

export default function InventoryModal({ isOpen, onClose, item, onSave }: InventoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Anesthetics',
    sku: '',
    currentStock: 10,
    minStock: 5,
    unit: 'box',
    unitCost: 450
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || 'Anesthetics',
        sku: item.sku || '',
        currentStock: item.currentStock || 0,
        minStock: item.minStock || 0,
        unit: item.unit || 'box',
        unitCost: item.unitCost || 0
      });
    } else {
      setFormData({
        name: '',
        category: 'Anesthetics',
        sku: '',
        currentStock: 10,
        minStock: 5,
        unit: 'box',
        unitCost: 450
      });
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter Item Name.');
      return;
    }
    if (onSave) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-extrabold text-slate-900">
            {item ? 'Edit Inventory Supply Item' : 'Add New Dental Inventory Item'}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Item Name *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Lignocaine 2% Local Anesthetic"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium outline-none focus:bg-white focus:border-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
              <input 
                type="text" 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="e.g. Anesthetics, Endodontics, PPE"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">SKU Code</label>
              <input 
                type="text" 
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                placeholder="SKU-LDC-102"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Current Stock</label>
              <input 
                type="number" 
                value={formData.currentStock}
                onChange={(e) => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Minimum Stock Alert</label>
              <input 
                type="number" 
                value={formData.minStock}
                onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Unit (box, pack, vial)</label>
              <input 
                type="text" 
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                placeholder="box"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Unit Cost (₹)</label>
              <input 
                type="number" 
                value={formData.unitCost}
                onChange={(e) => setFormData({...formData, unitCost: parseFloat(e.target.value) || 0})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold font-mono outline-none"
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3 -mx-6 -mb-6 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-brand-500/20"
            >
              Save Supply Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
