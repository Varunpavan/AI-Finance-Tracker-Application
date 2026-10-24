module.exports = {
  apps: [
    {
      name: 'finance-tracker-api',
      script: './server.js',
      cwd: './server',
      instances: 'max', // Automatically spin up one process per CPU core
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
