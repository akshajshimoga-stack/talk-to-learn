# Talk To Learn - Deployment & Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 10+
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key
- Text-to-Speech API key (optional)

### Local Development Setup

1. **Clone and Install**
```bash
pnpm install
```

2. **Environment Variables**
```bash
# Copy the example file
cp .env.example .env.local

# Edit with your keys
nano .env.local
```

3. **Run Development Server**
```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

---

## 📋 Environment Variables Setup

### Required Variables

#### Database
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/talk-to-learn
```
- **Local**: `mongodb://localhost:27017/talk-to-learn`
- **MongoDB Atlas**: Get connection string from your cluster

#### JWT Authentication
```env
JWT_SECRET=your-super-secret-key
```
Generate secure key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### OpenAI API
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo
```
[Get API Key →](https://platform.openai.com/account/api-keys)

### Optional Variables

#### Text-to-Speech (For Voice Explanations)
```env
TTS_API_KEY=your-api-key
TTS_VOICE_ID_MALE=male-voice-id
TTS_VOICE_ID_FEMALE=female-voice-id
```
Options:
- ElevenLabs
- Google Cloud Text-to-Speech
- AWS Polly

#### File Storage
```env
STORAGE_TYPE=s3  # or local, gcs
AWS_S3_BUCKET=talk-to-learn-pdfs
AWS_REGION=us-east-1
```

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Wait for cluster to provision

2. **Create Database User**
   - Database Access → Add New Database User
   - Username & password (save securely)
   - Built-in Role: `readWriteAnyDatabase`

3. **Get Connection String**
   - Clusters → Connect → Driver
   - Copy connection string
   - Replace `<password>` and `<username>`

4. **Whitelist IP**
   - Network Access → Add IP Address
   - For production: add your server's IP
   - For development: `0.0.0.0/0` (less secure)

### Local MongoDB

```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb

# Start service
mongo
```

Connection string:
```env
MONGODB_URI=mongodb://localhost:27017/talk-to-learn
```

---

## 🔑 API Keys Setup

### OpenAI API

1. Create account at [platform.openai.com](https://platform.openai.com)
2. Go to API keys section
3. Create new secret key
4. Add to `.env.local`:
```env
OPENAI_API_KEY=sk-your-key-here
```

### Text-to-Speech Services

#### ElevenLabs (Recommended)
1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Go to API section
3. Get your API key
4. Get voice IDs for male/female voices

#### Google Cloud
1. Enable Text-to-Speech API
2. Create service account
3. Download JSON key file
4. Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

#### AWS Polly
1. Create IAM user with Polly permissions
2. Get Access Key ID and Secret Access Key
3. Configure AWS SDK

---

## 📦 Building for Production

### Build Steps
```bash
# Install dependencies
pnpm install

# Build both client and server
pnpm build

# Type check
pnpm typecheck

# Run tests
pnpm test
```

### Output Files
- Client: `dist/spa/` - Static SPA files
- Server: `dist/server/` - Node.js server files

---

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend)

#### Frontend Deployment to Vercel

1. **Create Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Connect GitHub account

2. **Deploy**
   - Import project
   - Set framework to "Other"
   - Build command: `pnpm build:client`
   - Output directory: `dist/spa`

#### Backend Deployment to Render

1. **Create Render Account**
   - Sign up at [render.com](https://render.com)

2. **Create Web Service**
   - New → Web Service
   - Connect GitHub repository
   - Settings:
     - Build command: `pnpm install && pnpm build:server`
     - Start command: `node dist/server/node-build.mjs`
     - Environment variables: Add all from `.env`

3. **Update Frontend API URL**
   - In Vercel deployment:
   - `VITE_API_URL=https://your-render-backend.onrender.com`

---

### Option 2: Railway

Railway is simpler as it handles both frontend and backend.

1. **Connect Repository**
   - Sign up at [railway.app](https://railway.app)
   - Connect GitHub

2. **Configure Build**
   ```
   Build command: pnpm build
   Start command: pnpm start
   ```

3. **Add Environment Variables**
   - MongoDB URI
   - JWT Secret
   - API Keys
   - All from `.env.example`

4. **Add Plugins**
   - Add MongoDB database plugin
   - Or connect to MongoDB Atlas

---

### Option 3: Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy files
COPY . .

# Install dependencies
RUN pnpm install

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

#### Deploy to Any Host
```bash
# Build image
docker build -t talk-to-learn .

# Run
docker run -e MONGODB_URI=... -e JWT_SECRET=... -p 3000:3000 talk-to-learn
```

---

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB credentials are secure
- [ ] API keys are stored in environment variables
- [ ] CORS is configured properly
- [ ] HTTPS is enabled in production
- [ ] Rate limiting is enabled
- [ ] Input validation on all endpoints
- [ ] Password hashing with bcrypt
- [ ] No sensitive data in logs

---

## 📊 Monitoring & Logging

### Development
```bash
pnpm dev
# Logs appear in console
```

### Production Setup
Consider using:
- **Sentry** for error tracking
- **LogRocket** for user session replay
- **DataDog** or **New Relic** for performance
- **MongoDB Atlas** built-in monitoring

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB is running
mongo --eval "db.adminCommand('ping')"

# Check connection string format
# Remove spaces and special characters
```

### JWT Token Errors
- Ensure JWT_SECRET is set
- Check token expiration time
- Verify token format: "Bearer TOKEN"

### API Key Issues
- Verify API keys are correctly set
- Check API key quotas/limits
- Confirm key has required permissions

### Build Errors
```bash
# Clear cache
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

---

## 📞 Support

For issues or questions:
- Check `.env.example` for all available variables
- Review error logs carefully
- Verify all API keys are valid
- Check database connectivity

---

## 🔄 CI/CD Pipeline

Consider setting up with:
- **GitHub Actions** for automated testing
- **Husky** for pre-commit checks
- **ESLint** for code quality
- **TypeScript** for type safety

Example GitHub Actions workflow available in `.github/workflows/deploy.yml`
