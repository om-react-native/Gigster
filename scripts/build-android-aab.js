#!/usr/bin/env node
/**
 * Loads .env (so EXPO_PUBLIC_SUPABASE_* are set), then runs the Android release
 * AAB build. This ensures app.config.js sees the vars when Expo runs export:embed.
 */
require('dotenv').config();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error(
    'Missing Supabase env vars. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env (see .env.example if present).'
  );
  process.exit(1);
}

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const androidDir = path.join(projectRoot, 'android');
const isWin = process.platform === 'win32';
const gradlew = path.join(androidDir, isWin ? 'gradlew.bat' : 'gradlew');

const result = spawnSync(gradlew, ['bundleRelease'], {
  cwd: androidDir,
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
