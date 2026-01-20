import { spawn } from 'child_process';
import chokidar from 'chokidar';

let serverProcess: any = null;

function startServer() {
  if (serverProcess) {
    serverProcess.kill();
  }

  console.log(' Démarrage du serveur...');

  serverProcess = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    shell: true,
  });

  serverProcess.on('error', (error: Error) => {
    console.error(' Erreur serveur:', error);
  });
}

startServer();

const watcher = chokidar.watch(['server/**/*.ts', 'lib/email.ts'], {
  persistent: true,
  ignoreInitial: true,
});

watcher.on('change', path => {
  console.log(`\n Fichier modifié: ${path}`);
  startServer();
});

process.on('SIGINT', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  watcher.close();
  process.exit(0);
});
