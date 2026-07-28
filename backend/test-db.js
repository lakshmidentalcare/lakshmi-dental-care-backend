const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.znepufohbiaogefpmjgu:Ishubarani%405@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
    }
  }
});

prisma.$connect()
  .then(() => {
    console.log('CONNECTED TO SUPABASE');
    process.exit(0);
  })
  .catch(e => {
    console.error('ERROR CONNECTING:', e);
    process.exit(1);
  });
