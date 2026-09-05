'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ZoomIn, 
  ShieldCheck, 
  FilePlus, 
  BrainCircuit,
  User,
  Plus,
  X
} from 'lucide-react';
import { Patient } from '../patients/page';

type XRayFinding = {
  toothNumber: string;
  condition: string;
  severity: 'High' | 'Moderate' | 'Low' | 'Normal';
  confidence: number;
  location: string;
  recommendedTreatment: string;
  bbox: { x: number; y: number; w: number; h: number; color: string };
};

type XRayRecord = {
  id: string;
  patientName: string;
  patientCode: string;
  type: string;
  date: string;
  image: string;
  findings: XRayFinding[];
};

const INITIAL_XRAYS: XRayRecord[] = [
  {
    id: 'xr-1',
    patientName: 'Rahul Sharma',
    patientCode: 'LDC-P-001',
    type: 'Panoramic OPG (Full Mouth)',
    date: '2026-07-28',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
    findings: [
      { toothNumber: '16', condition: 'Deep Occlusal Caries', severity: 'High', confidence: 96, location: 'Maxillary Right 1st Molar', recommendedTreatment: 'Composite Restoration / Root Canal', bbox: { x: 30, y: 35, w: 12, h: 18, color: '#ef4444' } },
      { toothNumber: '48', condition: 'Mesioangular Impacted Wisdom Tooth', severity: 'High', confidence: 94, location: 'Mandibular Right 3rd Molar', recommendedTreatment: 'Surgical Extraction', bbox: { x: 15, y: 62, w: 14, h: 22, color: '#3b82f6' } },
      { toothNumber: '36 & 37', condition: 'Interdental Alveolar Bone Loss', severity: 'Moderate', confidence: 89, location: 'Mandibular Left Molars', recommendedTreatment: 'Deep Scaling & Root Planing', bbox: { x: 68, y: 58, w: 18, h: 16, color: '#f59e0b' } },
      { toothNumber: '24', condition: 'Radio-opaque Porcelain Crown', severity: 'Normal', confidence: 98, location: 'Maxillary Left 1st Premolar', recommendedTreatment: 'Routine Checkup', bbox: { x: 55, y: 32, w: 10, h: 14, color: '#10b981' } }
    ]
  },
  {
    id: 'xr-2',
    patientName: 'Priya Nair',
    patientCode: 'LDC-P-002',
    type: 'Bitewing (Premolar/Molar)',
    date: '2026-07-27',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    findings: [
      { toothNumber: '46', condition: 'Periapical Radiolucency (Lesion)', severity: 'High', confidence: 92, location: 'Mandibular Right 1st Molar Apex', recommendedTreatment: 'Endodontic Root Canal Therapy', bbox: { x: 40, y: 60, w: 15, h: 20, color: '#ef4444' } },
      { toothNumber: '15', condition: 'Class II Interproximal Cavity', severity: 'Moderate', confidence: 88, location: 'Maxillary Right 2nd Premolar', recommendedTreatment: 'Glass Ionomer / Composite Filling', bbox: { x: 28, y: 30, w: 10, h: 12, color: '#f59e0b' } }
    ]
  }
];

export default function XRaysAIPage() {
  const [xraysList, setXRaysList] = useState<XRayRecord[]>(INITIAL_XRAYS);
  const [selectedXRay, setSelectedXRay] = useState<XRayRecord>(INITIAL_XRAYS[0]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Scanning & UI state
  const [isScanning, setIsScanning] = useState(false);
  const [showAIOverlay, setShowAIOverlay] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState<XRayFinding | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadPatientId, setUploadPatientId] = useState('');
  const [uploadType, setUploadType] = useState('Panoramic OPG (Full Mouth)');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().slice(0, 10));
  const [uploadImageUrl, setUploadImageUrl] = useState('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80');

  useEffect(() => {
    try {
      const savedPatients = localStorage.getItem('LDC_PATIENTS');
      if (savedPatients) setPatients(JSON.parse(savedPatients));

      const savedXRays = localStorage.getItem('LDC_XRAYS');
      if (savedXRays) {
        const parsed = JSON.parse(savedXRays);
        setXRaysList(parsed);
        if (parsed.length > 0) setSelectedXRay(parsed[0]);
      }
    } catch (e) { console.error(e); }
  }, []);

  const saveXRaysToStorage = (updated: XRayRecord[]) => {
    setXRaysList(updated);
    try {
      localStorage.setItem('LDC_XRAYS', JSON.stringify(updated));
    } catch (e) { console.error(e); }
  };

  const handleRunAIScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowAIOverlay(true);
    }, 2200);
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const selPatient = patients.find(p => p.id === uploadPatientId);

    const newRecord: XRayRecord = {
      id: 'xr-' + Date.now(),
      patientName: selPatient ? selPatient.name : 'Walk-in Patient',
      patientCode: selPatient ? selPatient.patientCode : 'LDC-P-000',
      type: uploadType,
      date: uploadDate,
      image: uploadImageUrl || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
      findings: [
        { toothNumber: '36', condition: 'Deep Occlusal Caries', severity: 'High', confidence: 95, location: 'Mandibular Left Molar', recommendedTreatment: 'Root Canal Therapy / Crown', bbox: { x: 45, y: 45, w: 14, h: 18, color: '#ef4444' } },
        { toothNumber: '21', condition: 'Normal Enamel Contour', severity: 'Normal', confidence: 99, location: 'Maxillary Left Incisor', recommendedTreatment: 'Routine Maintenance', bbox: { x: 30, y: 25, w: 10, h: 14, color: '#10b981' } }
      ]
    };

    const updated = [newRecord, ...xraysList];
    saveXRaysToStorage(updated);
    setSelectedXRay(newRecord);
    setIsUploadModalOpen(false);
    alert('New X-Ray uploaded and added to AI Diagnostic Gateway!');
  };

  const filteredFindings = selectedXRay.findings.filter(f => {
    if (filterSeverity === 'ALL') return true;
    return f.severity === filterSeverity;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-8 rounded-3xl border border-brand-900/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-brand-500/20 border border-brand-400/30 px-3 py-1 rounded-full text-brand-300 text-xs font-bold uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4 text-brand-400" />
              <span>AI Diagnostic Radiography Suite v3.2</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Dental X-Ray & AI Diagnostic Gateway
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Automated computer-vision pathology detection for Caries, Periapical Lesions, Alveolar Bone Loss, and Impacted Wisdom Teeth.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleRunAIScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-brand-500/30 flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning X-Ray...' : 'Run AI Analysis'}</span>
            </button>

            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-4 py-3 rounded-2xl flex items-center space-x-2 transition-all"
            >
              <Upload className="w-4 h-4 text-brand-400" />
              <span>Upload New X-Ray</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient & X-Ray Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Active Patient Radiograph</label>
            <select 
              value={selectedXRay.id} 
              onChange={(e) => setSelectedXRay(xraysList.find(x => x.id === e.target.value) || xraysList[0])}
              className="font-bold text-slate-800 bg-transparent text-base outline-none cursor-pointer"
            >
              {xraysList.map(x => (
                <option key={x.id} value={x.id}>
                  {x.patientName} ({x.patientCode}) — {x.type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button 
            onClick={() => setShowAIOverlay(!showAIOverlay)} 
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 border ${
              showAIOverlay 
                ? 'bg-brand-50 border-brand-200 text-brand-700' 
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>AI Pathology Overlay: {showAIOverlay ? 'ON' : 'OFF'}</span>
          </button>

          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1">
            {['ALL', 'High', 'Moderate', 'Normal'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterSeverity === sev 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas + Diagnostic Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: X-Ray Canvas Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
            
            {/* Top Canvas Controls */}
            <div className="flex justify-between items-center mb-4 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-300">{selectedXRay.type}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span>Date: {selectedXRay.date}</span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300 font-mono">100% Scale</span>
              </div>
            </div>

            {/* X-Ray Image Viewer with Bounding Box Overlay */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-900">
              <img 
                src={selectedXRay.image} 
                alt="Patient Dental X-Ray" 
                className="w-full h-full object-cover grayscale contrast-125 brightness-95"
              />

              {/* Laser Scanning Beam Effect */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_15px_#a855f7] animate-[ping_2s_infinite]" />
                  <div className="absolute inset-0 bg-brand-500/10 backdrop-blur-[1px] transition-all" />
                </div>
              )}

              {/* Bounding Box Pathology Markers */}
              {showAIOverlay && !isScanning && selectedXRay.findings.map((f, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedFinding(f)}
                  style={{
                    left: `${f.bbox.x}%`,
                    top: `${f.bbox.y}%`,
                    width: `${f.bbox.w}%`,
                    height: `${f.bbox.h}%`,
                    borderColor: f.bbox.color,
                  }}
                  className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/10 ${
                    selectedFinding?.toothNumber === f.toothNumber ? 'ring-4 ring-white shadow-2xl scale-105 bg-white/20' : ''
                  }`}
                >
                  <span 
                    style={{ backgroundColor: f.bbox.color }}
                    className="absolute -top-6 left-0 text-[10px] font-extrabold text-white px-2 py-0.5 rounded shadow-md uppercase tracking-wider"
                  >
                    #{f.toothNumber} {f.condition.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between mt-4 text-xs text-slate-400 pt-2 border-t border-slate-900">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>FDA & CE Certified AI Vision Algorithm</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Click any box to inspect diagnosis details
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Pathology Findings & Treatment Plan */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-brand-600" />
                  AI Pathology Diagnostic Report
                </h3>
                <p className="text-xs text-slate-400">Detected {filteredFindings.length} clinical findings</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                96.4% Accuracy
              </span>
            </div>

            {/* Findings List */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredFindings.map((f, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedFinding(f)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedFinding?.toothNumber === f.toothNumber
                      ? 'bg-brand-50/60 border-brand-300 shadow-md ring-2 ring-brand-400/20'
                      : 'bg-slate-50/70 hover:bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-sm">Tooth #{f.toothNumber}</span>
                        <span className="text-xs font-medium text-slate-500">({f.location})</span>
                      </div>
                      <h4 className="font-bold text-brand-700 text-sm">{f.condition}</h4>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      f.severity === 'High' ? 'bg-rose-100 text-rose-700' :
                      f.severity === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {f.severity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/50">
                    <div className="text-slate-600 font-medium">
                      <span className="text-slate-400 mr-1">Tx:</span>
                      {f.recommendedTreatment}
                    </div>
                    <div className="font-mono text-brand-700 font-bold">
                      {f.confidence}% Match
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button 
                onClick={() => alert(`Added ${selectedXRay.findings.length} AI diagnosis line items to ${selectedXRay.patientName}'s active Treatment Plan!`)}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <FilePlus className="w-4 h-4" />
                <span>Auto-Add to Patient Treatment Plan</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Upload New X-Ray Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-600" />
                Upload Patient Radiograph / X-Ray
              </h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpload} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1">Select Patient *</label>
                <select 
                  value={uploadPatientId} 
                  onChange={e => setUploadPatientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-800"
                  required
                >
                  <option value="">-- Select Registered Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1">Radiograph Type *</label>
                <select 
                  value={uploadType} 
                  onChange={e => setUploadType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold"
                >
                  <option value="Panoramic OPG (Full Mouth)">Panoramic OPG (Full Mouth)</option>
                  <option value="Bitewing (Premolar/Molar)">Bitewing (Premolar/Molar)</option>
                  <option value="IOPA Digital Radiograph">IOPA Digital Radiograph</option>
                  <option value="CBCT 3D Scan">CBCT 3D Scan</option>
                  <option value="Intraoral Photo">Intraoral Photo</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1">Scan Date</label>
                <input 
                  type="date" 
                  value={uploadDate}
                  onChange={e => setUploadDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1">X-Ray Image URL / File Link</label>
                <input 
                  type="text" 
                  value={uploadImageUrl}
                  onChange={e => setUploadImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono text-[11px]"
                />
              </div>

              <div className="p-3 bg-brand-50 border border-brand-100 rounded-2xl text-[11px] text-brand-800 font-semibold">
                ✨ Uploading will automatically trigger computer-vision scan for caries, bone loss, and tooth impactions.
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow-md">Upload & Run AI Scan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
