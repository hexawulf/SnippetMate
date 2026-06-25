module.exports = {
  apps: [
    {
      name: 'snippetmate',
      script: 'server.js',
      cwd: '/home/zk/projects/SnippetMate/backend',
      node_args: '',
      env: { NODE_ENV: 'production', PORT: 5010 },
      watch: false,
      max_memory_restart: '300M',
      restart_delay: 2000,
      max_restarts: 10,
      out_file: '/home/zk/logs/snippetmate-out.log',
      error_file: '/home/zk/logs/snippetmate-err.log',
      merge_logs: true
    }
  ]
};
