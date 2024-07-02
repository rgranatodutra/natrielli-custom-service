module.exports = {
  apps: [
    {
      name: 'next-app',
      script: 'npm',
      args: 'start -p 7001',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};