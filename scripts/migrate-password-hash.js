require('dotenv/config');
const { randomBytes, scryptSync } = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const HASH_PREFIX = 'scrypt';
const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;

function isHashedPassword(value) {
  return typeof value === 'string' && value.startsWith(`${HASH_PREFIX}$`);
}

function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `${HASH_PREFIX}$${salt}$${hash}`;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      passwordHash: true,
    },
  });

  const targets = users.filter((user) => !isHashedPassword(user.passwordHash));

  console.log(`[password:migrate] total users: ${users.length}`);
  console.log(`[password:migrate] plain-text users: ${targets.length}`);

  if (targets.length === 0) {
    console.log('[password:migrate] nothing to migrate');
    return;
  }

  if (dryRun) {
    console.log('[password:migrate] dry-run mode enabled. No updates were made.');
    targets.slice(0, 10).forEach((user) => {
      console.log(`- ${user.email} (${user.id})`);
    });
    if (targets.length > 10) {
      console.log(`... and ${targets.length - 10} more`);
    }
    return;
  }

  for (const user of targets) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(user.passwordHash) },
    });
  }

  console.log(`[password:migrate] migrated users: ${targets.length}`);
}

main()
  .catch((error) => {
    console.error('[password:migrate] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
