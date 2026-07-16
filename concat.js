const fs = require('fs');
const schema = fs.readFileSync('supabase/migrations/20260714154200_initial_schema.sql', 'utf8');
const seed = fs.readFileSync('seed.sql', 'utf8');

const combined = schema + '\n\n' + seed;
fs.writeFileSync('init-db.sql', combined, 'utf8');
console.log('init-db.sql created successfully in utf8');
console.log('init-db.sql created successfully in utf8');
