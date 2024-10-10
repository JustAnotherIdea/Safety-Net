// dev.js
const concurrently = require('concurrently');

concurrently([
  { command: 'npm run start', name: 'SERVER' },
  { command: 'cd client && npm run tailwind', name: 'TAILWIND' },
  { command: 'cd client && npm run start -y', name: 'CLIENT' },
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
});