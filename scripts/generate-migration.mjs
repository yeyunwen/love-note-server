// @ts-check
import { execSync } from 'child_process';

const name = process.argv[2];
if (!name) {
  console.error('Please provide a migration name');
  process.exit(1);
}

try {
  execSync(
    `typeorm migration:generate src/database/migrations/${name} -d ./dist/database/typeorm.config.js`,
    { stdio: 'inherit' },
  );
} catch (error) {
  process.exit(1);
}
