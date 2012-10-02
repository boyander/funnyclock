/**
 * Project Name: funny-clock
 * Author: Marc Pomar, Victor Hidalgo, Alguer Balanya
 * Contact: marc@faable.com or boyander@gmail.com
 * Description: Syntethized speech time based on festival TTS with node.js frontend
 */

/*
 * Required modules
 */
var express = require('express'),
  http = require('http'),
  fs = require('fs'),
  sys = require('sys'),
  exec = require('child_process').exec;

/*
 * Configuration (setup path to custom festival voice)
 */
// PRODUCTION
// var voicePath = "/home/mpomar/time_ldom";
// DEVELOPMENT
var voicePath = "/Users/boyander/Desktop/tecno_parla/time_ldom";

/*
 * Express configuration
 */
var app = express();
app.configure(function () {
  app.set('localrun', process.env.LOCAL || false);
  app.set('port', process.env.PORT || 8080);
  app.set('title', "FunnyClock - Alguer, Marc, Victor");
  app.set('views', __dirname + '/templates');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.favicon(__dirname + "/public/favicon.ico"));
  app.use(express.logger('dev'));
  app.use(express.limit('10mb'));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.errorHandler());
  app.use(require('connect-assets')({
    'src': 'assets'
  }));
  app.use(express.static(__dirname + '/public'));
});

/*
 * HTTP Server
 */
var server = http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});

/*
 * Page routing
 */
app.get('/', clock);
app.get('/gettime', timeJSON);

/*
 * Render main clock page
 */
function clock(request, result) {
  var parameters = {
    title: request.app.get("title"),
    port: request.app.get("port")
  };
  result.render("index", parameters);
}

/*
 * JSON response for time request (user clicks on speaker)
 */
function timeJSON(request, result) {

  // Current & last timestamps
  var currentTime = Math.round((new Date()).getTime() / 1000);
  var latestTime = request.app.get('latestTime') || 0;

  // Setup last file
  var currentWAV = "current" + latestTime + ".wav";

  // Regenerate WAV audio file if there's at least 1 minute from last generated
  if (currentTime - latestTime > 60) {
    // Update current timestamp & file first
    request.app.set('latestTime', currentTime);
    currentWAV = "current" + currentTime + ".wav";

    // Setup output file path & voice paths
    var savePath = __dirname + "/public/" + currentWAV;

    // Execute festival command to generate Waveform
    var command = "festival -b webservice_load.scm \"(savetime '" + savePath + ")\"";
    console.log("Regenerating Wav audio:\"" + command + "\"");

    // Executes festival asynchronously
    exec(command, {
      'cwd': voicePath
    }, function puts(error, stdout, stderr) {
      // View output from festival STDIO on node log
      sys.puts(stderr);
      sys.puts(stdout);
      console.log(error);

      // Remove previous generated WAV file
      if (latestTime !== 0) {
        var previousWAV = "public/current" + latestTime + ".wav";
        fs.unlink(previousWAV, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('Deleted ' + previousWAV);
          }
        });
      }
      // Send wav path to client
      result.contentType('application/json');
      result.send({
        'wav': currentWAV
      });
    });

  } else {
    // Send wav path as JSON to client
    console.log('Using pre syntetized time, regenerate on ' + Math.abs(currentTime - latestTime - 60) + ' seconds');
    result.contentType('application/json');
    result.send({
      'wav': currentWAV
    });
  }
}