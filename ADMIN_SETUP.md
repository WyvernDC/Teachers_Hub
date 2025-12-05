# How to Create an Admin Account

Since public registration only allows creating **teacher** accounts, you need to create an admin account manually. Here are the easiest ways:

## Method 1: Using the Node.js Script (Easiest) ⭐

1. **Make sure you've installed dependencies:**
   ```bash
   npm install
   ```

2. **Run the admin creation script:**
   ```bash
   node scripts/create-admin.js
   ```
   
   This will create an admin with default credentials:
   - Email: `admin@teachershub.com`
   - Password: `admin123`

3. **Or create with custom credentials:**
   ```bash
   node scripts/create-admin.js your-email@example.com yourpassword "Your Name"
   ```

4. **The script will display the login credentials.** Copy them and use them to log in at `http://localhost:3000/login`

## Method 2: Direct MySQL Insert

If you prefer to create the admin directly in MySQL:

1. **Open MySQL Workbench** and connect to your database

2. **Generate a password hash** using one of these methods:
   - Run: `node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('yourpassword', 10).then(h=>console.log(h))"`
   - Or use an online bcrypt generator: https://bcrypt-generator.com/ (use 10 rounds)

3. **Run this SQL query** (replace the hash with your generated hash):
   ```sql
   INSERT INTO users (name, email, password_hash, role) 
   VALUES (
     'Admin User',
     'admin@teachershub.com',
     '$2a$10$YOUR_GENERATED_HASH_HERE',
     'admin'
   );
   ```

## After Creating Admin Account

1. **Start your development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Go to:** http://localhost:3000/login

3. **Login with your admin credentials**

4. **You'll be redirected to:** `/admin/dashboard`

## Troubleshooting

- **"Cannot find module 'bcryptjs'"**: Run `npm install` first
- **"Cannot connect to database"**: Check your `.env` file has correct database credentials
- **"User already exists"**: The email is already registered. Use a different email or delete the existing user from the database

## Security Note

⚠️ **Important**: After creating your admin account, consider changing the default password if you used the default credentials. You can do this by:
- Logging in as admin
- Or updating the password_hash directly in the database

