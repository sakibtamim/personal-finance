/** @type {{ apps: import('pm2').StartOptions[] }} */
module.exports = {
  apps: [
    {
      name: "personal-finance",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 7931,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
