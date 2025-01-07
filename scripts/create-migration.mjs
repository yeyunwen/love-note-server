// @ts-check
import { execSync } from 'child_process';

const name = process.argv[2];
if (!name) {
  console.error('Please provide a migration name');
  process.exit(1);
}

try {
  execSync(`typeorm migration:create src/database/migrations/${name}`, {
    stdio: 'inherit',
  });
} catch (error) {
  process.exit(1);
}
