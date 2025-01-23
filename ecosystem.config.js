export default {
  apps: [
    {
      name: 'green-identify-server',
      script: 'server/dist/server.js',
      env: {
        PORT: 3001,
        NODE_ENV: 'development'
      },
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 3000,
      watch: ['server/dist']
    },
    {
      name: 'green-identify-client',
      script: 'npm',
      args: 'run dev',
      env: {
        PORT: 3000
      },
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 3000,
      cwd: './'
    }
  ]
};
