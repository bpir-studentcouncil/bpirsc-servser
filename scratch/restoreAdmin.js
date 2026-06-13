import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://webbpirscadmin_db_user:BcozdvFBLM8nLo34@cluster0.4ttgn5y.mongodb.net/bpirsc_db?appName=Cluster0';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB.');
    const db = client.db('bpirsc_db');
    
    // Find the user by email
    const user = await db.collection('users').findOne({ email: 'fardinsojon@gmail.com' });
    if (user) {
      console.log('Found user:', user);
      const res = await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { role: 'admin' } }
      );
      console.log('Update result:', res);
      console.log('Successfully restored fardinsojon@gmail.com to admin.');
    } else {
      console.log('User not found.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
