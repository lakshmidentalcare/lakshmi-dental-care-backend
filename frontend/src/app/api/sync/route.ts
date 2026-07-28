import { NextResponse } from 'next/server';

// Serverless Cloud Storage state on Vercel for cross-device sync
let globalClinicState: Record<string, any> = {
  LDC_CLINIC_CONFIG: {
    clinicName: 'Lakshmi Dental Care',
    regNumber: '1463',
    phone: '+91 86808 55897',
    email: 'lakshmidentalcare5@gmail.com',
    address: 'No.72, Barathipuram Main Road, Govindasalai, Puducherry-605011',
    gstRate: 18,
    currencySymbol: '₹',
    invoicePrefix: 'INV-2026-',
    chair1Name: 'Chair 1 (Premium Operatory)',
    chair2Name: 'Chair 2 (Surgical Suite)',
    chair3Name: 'Chair 3 (Orthodontics & Hygiene)',
    autoBackup: true,
  },
  LDC_STAFF: [
    { id: '1', name: 'Dr. Iswariya', email: 'admin@lakshmidental.com', phone: '9840001111', role: 'SUPER_ADMIN', regNumber: '1463', specialization: 'Chief Dental Surgeon', status: 'ACTIVE' },
    { id: '2', name: 'Dr. Ramana Krishnamurthy', email: 'ramana@lakshmidental.com', phone: '9840002222', role: 'DENTIST', regNumber: 'DENT-TN-9912', specialization: 'Endodontist (Root Canal Specialist)', status: 'ACTIVE' },
    { id: '3', name: 'Dr. Shruti Viswanathan', email: 'shruti@lakshmidental.com', phone: '9840003333', role: 'ASSOCIATE_DENTIST', regNumber: 'DENT-TN-1045', specialization: 'Pediatric & Orthodontic Specialist', status: 'ACTIVE' },
    { id: '4', name: 'Ananya Sundaram', email: 'reception@lakshmidental.com', phone: '9840004444', role: 'RECEPTIONIST', specialization: 'Front Desk Operations', status: 'ACTIVE' },
  ]
};

export async function GET() {
  return NextResponse.json(globalClinicState);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.key && body.data) {
      globalClinicState[body.key] = body.data;
    } else if (typeof body === 'object') {
      globalClinicState = { ...globalClinicState, ...body };
    }
    return NextResponse.json({ success: true, state: globalClinicState });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cloud sync state' }, { status: 500 });
  }
}
