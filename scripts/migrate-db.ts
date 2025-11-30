/**
 * Database migration script
 * Runs schema.sql to create tables and indexes
 *
 * Usage: npx tsx scripts/migrate-db.ts
 */

import 'dotenv/config';
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

async function migrate() {
  try {
    console.log('🚀 Starting database migration...');

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing schema...');

    // Execute the entire schema as one transaction
    try {
      await sql.query(schema);
      console.log('✅ Schema executed successfully!');
    } catch (error: unknown) {
      const err = error as Error;
      // Check if error is about existing objects
      if (err.message.includes('already exists')) {
        console.log('⚠️  Some objects already exist, continuing...');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Database migration completed successfully!');

    // Display table list
    console.log('\n📊 Verifying tables...');
    const tables = await sql`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log('\nCreated tables:');
    tables.rows.forEach((table) => {
      console.log(`  - ${table.tablename}`);
    });

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
