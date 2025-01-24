export default {
  apps: [
    {
      name: 'backend',
      script: 'server/dist/server.js',
      env: {
        PORT: 3001,
        NODE_ENV: 'production'
      },
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 3000
    },
    {
      name: 'frontend',
      script: 'node_modules/.bin/vite',
      args: '--host 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'production'
      },
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 3000
    }
  ]
};
