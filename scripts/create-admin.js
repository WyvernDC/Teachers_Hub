/**
 * Create Admin Account Script
 * 
 * Run this script to create an admin account
 * Usage: node scripts/create-admin.js
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

async function createAdmin() {
  // Get database configuration
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'teachers_hub',
    port: parseInt(process.env.DB_PORT || '3306'),
  };

  // Admin account details
  const adminEmail = process.argv[2] || 'admin@teachershub.com';
  const adminPassword = process.argv[3] || 'admin123';
  const adminName = process.argv[4] || 'Admin User';

  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);

    // Check if admin already exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existing.length > 0) {
      console.log(`❌ Admin with email ${adminEmail} already exists!`);
      await connection.end();
      return;
    }

    // Hash the password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Insert admin user
    console.log('Creating admin account...');
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [adminName, adminEmail, passwordHash, 'admin']
    );

    console.log('\n✅ Admin account created successfully!');
    console.log('\nLogin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now login at http://localhost:3000/login');

    await connection.end();
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    process.exit(1);
  }
}

createAdmin();

