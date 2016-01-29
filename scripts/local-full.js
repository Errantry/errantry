const readline = require('readline');
const spawn = require('child_process').spawn;

function executeInBackground(cmd, args, cwd) {
  return spawn(cmd, args, {
    stdio: 'pipe',
    detached: true,
    cwd: cwd,
  })
    .on('error', error => {
      console.error('[%s] %s', new Date().toISOString(), error.message || error);
    });
}

function main() {
  console.log('Starting editor');
  var editorProcess = executeInBackground('npm', ['run', 'editor']);

  console.log('Starting app');
  var appProcess = executeInBackground('npm', ['run', 'app']);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Press return to quit\n', (answer) => {
    console.log('Bye!');
    editorProcess.stdio[0].write('\n');
    appProcess.stdio[0].write('\n');
    rl.close();
    process.exit();
  });
}

main();
