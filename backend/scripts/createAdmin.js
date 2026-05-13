import { supabase } from '../src/config/supabase.js';
import { validateEnv } from '../src/config/env.js';
import { hashPassword } from '../src/services/password.service.js';

validateEnv();

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error('Usage: npm run create-admin -- "Admin Name" admin@example.com StrongPassword');
  process.exit(1);
}

const { data, error } = await supabase
  .from('users')
  .insert({
    name,
    email: email.toLowerCase(),
    password: await hashPassword(password),
    role: 'admin'
  })
  .select('user_id,name,email,role,created_at')
  .single();

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Created admin: ${data.email}`);
