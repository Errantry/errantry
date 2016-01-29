const readline = require('readline');
var phpServer = require('gulp-connect-php');

var port = 8081;

function main() {
  var appServer = phpServer.server({
    base: 'app',
    hostname: '127.0.0.1',
    open: false,
    port: port,
    keepalive: false,
    bin: 'php',
  });

  console.log('App web server running at localhost port', port);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Press return to quit\n', () => {
    console.log('Exiting app web server');
    rl.close();
    phpServer.closeServer((message) => {
      if (message) {
        console.log('While closing server: ', message);
      } else {
        console.log('Successfully closed app web server');
      }
    });
  });
}

main();

//  router: __dirname + '/server.php',
