const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Bootstrapping ProjectPair...');

const rootDir = __dirname;
const backendPath = path.join(rootDir, 'project-pair-backend');
const frontendPath = path.join(rootDir, 'project-pair-frontend');

// 1. Backend Setup
console.log('\n📦 Checking backend dependencies...');
execSync('npm install', { cwd: backendPath, stdio: 'inherit' });

const backendEnvPath = path.join(backendPath, '.env');
if (!fs.existsSync(backendEnvPath)) {
  console.log('⚙️  Creating default backend .env file...');
  // Note: update DB_PASS if your MySQL password is not "root"
  fs.writeFileSync(backendEnvPath, `PORT=5000\nDB_HOST=localhost\nDB_NAME=projectpair\nDB_USER=root\nDB_PASS=root\nJWT_SECRET=super_secret_jwt_key_123\nCLIENT_URL=http://localhost:5173\n`);
  console.log('⚠️  NOTE: Check project-pair-backend/.env to ensure your DB_PASS matches your MySQL root password!');
}

// 2. Frontend Setup
console.log('\n📦 Checking frontend dependencies...');
execSync('npm install', { cwd: frontendPath, stdio: 'inherit' });

const frontendEnvPath = path.join(frontendPath, '.env');
if (!fs.existsSync(frontendEnvPath)) {
  console.log('⚙️  Creating default frontend .env file...');
  fs.writeFileSync(frontendEnvPath, `VITE_API_URL=http://localhost:5000/api\n`);
}

// 3. Start Both Servers
console.log('\n🚀 Starting Frontend and Backend servers concurrently...\n');
console.log('⚠️  Please ensure you have created the MySQL database by running:');
console.log('   CREATE DATABASE projectpair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n');

const backend = spawn('node', ['src/server.js'], { cwd: backendPath, stdio: 'inherit', shell: true });
const frontend = spawn('npm', ['run', 'dev'], { cwd: frontendPath, stdio: 'inherit', shell: true });

// Handle process exit to cleanup child processes
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping servers...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit();
});