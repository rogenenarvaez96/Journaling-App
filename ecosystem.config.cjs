module.exports = {
  apps: [
    {
      name: "journal-api",
      script: "./server/index.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5001
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      merge_logs: true,
      max_memory_restart: "500M"
    }
  ]
};
