# 🎉 Quick Setup Guide - FREE Database

## 5-Minute MongoDB Atlas Setup

### Step 1: Create Account (FREE - No Credit Card)
1. Go to https://mongodb.com/cloud/atlas
2. Click "Create a free account"
3. Sign up with email
4. Verify your email

### Step 2: Create Your First Cluster
1. Click "Create a database"
2. Select **"M0 (Free)"** tier
3. Choose your region (pick closest to you)
4. Click "Create Cluster"
5. ⏳ Wait 3-5 minutes for cluster to start

### Step 3: Create Database User
1. Left sidebar → "Security" → "Database Access"
2. Click "Add New Database User"
3. Username: `admin` (or your choice)
4. Password: Click "Generate Secure Password" or create one
5. **Save this password somewhere!**
6. Role: `readWriteAnyDatabase`
7. Click "Add User"

### Step 4: Allow Network Access
1. Left sidebar → "Security" → "Network Access"
2. Click "Add IP Address"
3. Enter `0.0.0.0/0` (for development, allows all IPs)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Clusters" page
2. Click "Connect" button
3. Choose "Drivers"
4. Copy the connection string

Example:
```
mongodb+srv://admin:YourPasswordHere@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 6: Setup Your App
1. Create `.env.local` file in your project root:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and replace the MONGODB_URI:
```env
MONGODB_URI=mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/talk-to-learn
```

Replace:
- `admin` with your username
- `YourPassword` with your password
- `cluster0.xxxxx` with your actual cluster name
- Remove `?retryWrites=true&w=majority` part (optional)

3. **Save the file**

### Step 7: Start Your App
```bash
pnpm dev
```

✅ **Done!** Your database is now connected.

---

## 📊 Free Tier Limits

| Feature | Limit |
|---------|-------|
| **Storage** | 512 MB |
| **Databases** | Unlimited |
| **Collections** | Unlimited |
| **Documents** | Unlimited (within 512MB) |
| **Backups** | 7-day snapshots |
| **Uptime SLA** | Best effort |

**This is enough for:**
- ✅ Development & testing
- ✅ MVP launch
- ✅ Small user base (< 10,000 users)

---

## 🆓 Alternative: Local MongoDB

**If you want unlimited storage:**

### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

Then use in `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/talk-to-learn
```

---

## ✅ Verify It Works

1. Create a test file `test-db.js`:
```javascript
const mongodb = require('mongodb');

async function test() {
  const client = new mongodb.MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    const db = client.db('talk-to-learn');
    const result = await db.collection('test').insertOne({ test: true });
    console.log('✅ Inserted test document:', result.insertedId);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.close();
  }
}

test();
```

2. Run it:
```bash
node test-db.js
```

Should show:
```
✅ Connected to MongoDB!
✅ Inserted test document: ...
```

---

## 🆘 Troubleshooting

### Error: "authentication failed"
- Check username and password are correct
- Verify you copied full connection string
- Make sure spaces are removed

### Error: "IP Address not in Whitelist"
- Add your IP to Network Access
- For development, use `0.0.0.0/0`

### Error: "Cannot connect"
- Wait 5 minutes for cluster to fully initialize
- Check internet connection
- Verify MongoDB URI has `mongodb+srv://` (not `mongodb://`)

### Need help?
- Visit: https://docs.mongodb.com/atlas/
- Email support: support@mongodb.com

---

## 🚀 Next Steps

1. ✅ Database is connected
2. Add OpenAI API key to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```
   Get from: https://platform.openai.com/account/api-keys

3. Start developing:
   ```bash
   pnpm dev
   ```

4. Later, when you have users:
   - Upgrade MongoDB to paid tier
   - Deploy to production (Vercel/Render)

---

**You're all set! 🎉**
