#!/usr/bin/env node

// Cross-platform script to run Next.js build with bundle analyzer
process.env.ANALYZE = 'true';

const { spawn } = require('node:child_process');

const child = spawn('next', ['build'], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
