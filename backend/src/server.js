import { app } from './app.js';
import { env, validateEnv } from './config/env.js';

validateEnv();

app.listen(env.port, () => {
  console.log(`Dental AI backend running on http://localhost:${env.port}`);
});
