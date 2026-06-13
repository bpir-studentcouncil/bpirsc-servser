import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://webbpirscadmin_db_user:BcozdvFBLM8nLo34@cluster0.4ttgn5y.mongodb.net/bpirsc_db?appName=Cluster0';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB.');
    const db = client.db('bpirsc_db');
    const col = db.collection('teamMembers');
    
    const all = await col.find({}).toArray();
    console.log('Current teamMembers count:', all.length);
    all.forEach(member => {
      console.log(`Name: ${member.name}`);
      console.log('Social Info:', member.social);
      console.log('---');
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
