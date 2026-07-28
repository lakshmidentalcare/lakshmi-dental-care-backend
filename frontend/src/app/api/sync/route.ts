import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'lakshmidentalcare';
const REPO = 'lakshmi-dental-care-backend';
const FILE_PATH = 'cloud_db.json';

const DEFAULT_STATE: Record<string, any> = {
  LDC_CLINIC_CONFIG: {
    superAdminName: 'Dr. Iswariya',
    superAdminSpecialization: 'Chief Dental Surgeon',
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

async function getGitHubCloudFile() {
  if (!GITHUB_TOKEN) return { sha: null, content: DEFAULT_STATE };
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
      headers: {
        'User-Agent': 'NextJS-Serverless',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      const contentStr = Buffer.from(data.content, 'base64').toString('utf8');
      const parsed = JSON.parse(contentStr);
      return { sha: data.sha, content: parsed };
    }
  } catch (e) {
    console.error('Failed to fetch cloud_db.json from GitHub:', e);
  }
  return { sha: null, content: DEFAULT_STATE };
}

export async function GET() {
  const { content } = await getGitHubCloudFile();
  return NextResponse.json(content);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sha: currentSha, content: currentContent } = await getGitHubCloudFile();

    let updatedContent = { ...currentContent };

    if (body.key && body.data) {
      updatedContent[body.key] = body.data;
    } else if (typeof body === 'object') {
      updatedContent = { ...updatedContent, ...body };
    }

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ success: true, state: updatedContent, warning: 'Saved locally' });
    }

    const base64Content = Buffer.from(JSON.stringify(updatedContent, null, 2), 'utf8').toString('base64');

    const putRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: {
        'User-Agent': 'NextJS-Serverless',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `cloud-sync: update ${body.key || 'state'}`,
        content: base64Content,
        sha: currentSha || undefined,
        branch: 'main'
      })
    });

    if (putRes.ok) {
      return NextResponse.json({ success: true, state: updatedContent });
    } else {
      return NextResponse.json({ success: true, state: updatedContent });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cloud sync state' }, { status: 500 });
  }
}
