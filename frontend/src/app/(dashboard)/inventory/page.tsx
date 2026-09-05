'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Search, Edit, Trash2, Download } from 'lucide-react';
import InventoryModal from '@/components/inventory/InventoryModal';
import { exportToCSV } from '@/utils/exportUtils';

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  sku: string;
  currentStock: number;
  minStock: number;
  unit: string;
  unitCost: number;
};

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'Lignocaine 2% Adrenaline Cartridges', category: 'Anesthetics', sku: 'LDC-AN-01', currentStock: 45, minStock: 20, unit: 'cartridge', unitCost: 45 },
  { id: 'inv-2', name: 'Composite Resin Light-Cure Nano A2', category: 'Restorative', sku: 'LDC-CR-02', currentStock: 8, minStock: 10, unit: 'syringe', unitCost: 1200 },
  { id: 'inv-3', name: 'Gutta Percha Points 6% F2', category: 'Endodontics', sku: 'LDC-EN-03', currentStock: 15, minStock: 10, unit: 'box', unitCost: 350 },
  { id: 'inv-4', name: 'Prophy Paste Mint Flavor 200g', category: 'Preventive', sku: 'LDC-PR-04', currentStock: 4, minStock: 5, unit: 'tub', unitCost: 500 },
  { id: 'inv-5', name: 'Dental Nitrile Gloves Powder-Free (M)', category: 'PPE & Supplies', sku: 'LDC-PPE-05', currentStock: 120, minStock: 50, unit: 'box', unitCost: 300 },
];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('LDC_INVENTORY_ITEMS');
      if (saved) setItems(JSON.parse(saved));
    } catch (e) { console.error(e); }
  }, []);

  const saveItemsToStorage = (updated: InventoryItem[]) => {
    setItems(updated);
    try {
      localStorage.setItem('LDC_INVENTORY_ITEMS', JSON.stringify(updated));
    } catch (e) { console.error(e); }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSaveModal = (formData: any) => {
    if (selectedItem) {
      const updated = items.map(i => i.id === selectedItem.id ? { ...i, ...formData } as InventoryItem : i);
      saveItemsToStorage(updated);
    } else {
      const newItem: InventoryItem = {
        id: 'inv-' + Date.now(),
        name: formData.name,
        category: formData.category || 'Supplies',
        sku: formData.sku || `LDC-SKU-${items.length + 1}`,
        currentStock: Number(formData.currentStock) || 0,
        minStock: Number(formData.minStock) || 0,
        unit: formData.unit || 'unit',
        unitCost: Number(formData.unitCost) || 0
      };
      saveItemsToStorage([newItem, ...items]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      const updated = items.filter(i => i.id !== id);
      saveItemsToStorage(updated);
    }
  };

  const handleExportCSV = () => {
    const data = items.map(i => ({
      'Item Name': i.name,
      'Category': i.category,
      'SKU Code': i.sku,
      'Current Stock': `${i.currentStock} ${i.unit}`,
      'Minimum Alert Stock': `${i.minStock} ${i.unit}`,
      'Unit Cost (₹)': i.unitCost,
      'Total Value (₹)': i.currentStock * i.unitCost
    }));
    exportToCSV('Lakshmi_Dental_Inventory_Stock', data);
  };

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = items.filter(i => i.currentStock <= i.minStock);
  const totalValue = items.reduce((acc, curr) => acc + (curr.currentStock * curr.unitCost), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-600" />
            Dental Inventory & Clinical Supplies
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track anesthetics, composite resins, PPE, endodontic files, and low-stock alerts.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Export Inventory CSV
          </button>

          <button
            onClick={handleCreate}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Supply Item
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Total Tracked Items</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{items.length}</h3>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Low Stock Alerts</span>
            <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{lowStockItems.length}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Total Stock Value</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1 font-mono">₹{totalValue.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <span className="text-xl font-black">₹</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search inventory supplies by name, category, or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Item Name & SKU</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Current Stock</th>
                <th className="py-3.5 px-6">Min Alert Stock</th>
                <th className="py-3.5 px-6">Unit Cost</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isLow = item.currentStock <= item.minStock;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {isLow && <AlertTriangle className="w-4 h-4 text-rose-500 mr-2 shrink-0 animate-bounce" />}
                        <div>
                          <div className="font-extrabold text-slate-900">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-mono font-extrabold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono">{item.minStock} {item.unit}</td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">₹{item.unitCost}</td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-slate-50 mr-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onSave={handleSaveModal}
      />
    </div>
  );
}
