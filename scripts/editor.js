const readline = require('readline');
var phpServer = require('gulp-connect-php');

var port = 8080;

function main() {
  var editorServer = phpServer.server({
    base: 'editor',
    hostname: '127.0.0.1',
    open: false,
    port: port,
    keepalive: false,
    bin: 'php',
  });

  console.log('Editor web server running at localhost port', port);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Press return to quit\n', () => {
    console.log('Closing editor web server');
    rl.close();
    phpServer.closeServer((message) => {
      if (message) {
        console.log('While closing server: ', message);
      } else {
        console.log('Successfully closed editor web server');
      }
    });
  });
}

main();

//  router: __dirname + '/server.php',
