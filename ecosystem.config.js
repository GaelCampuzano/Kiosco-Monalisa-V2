module.exports = {
  apps: [
    {
      name: 'kiosco-monalisa',
      script: 'npm.cmd',
      args: 'start',
      interpreter: 'none', // Critical for Windows to handle .cmd files
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
