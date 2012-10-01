/**
 * Project Name: funny-clock
 * Author: Alguer Balanya, Marc Pomar, Victor Hidalgo
 * Contact: marc@faable.com
 * Description: Funny clock based on festival TTS with node.js frontend
 */

/*
 * Required modules
 */
var express = require('express')
  , http = require('http')
  , fs = require('fs')
  , sys = require('sys');


/*
 * Configuration (voice path)
 */

// PRODUCTION
//var voicePath = "/home/mpomar/time_ldom";

// DEVELOPMENT
var voicePath = "/Users/boyander/Desktop/tecno_parla/time_ldom";

// Works starting on version 0.9 of node
/*
console.log("Check audio path...");
try{
  stats = fs.lstatSync("/Users/boyander/9bZkp7q19f0.aac");
  if (!stats.isDirectory()) {
    throw ENOENT;
  }
} catch(err) {
  console.log("Voice dir not found, bye...");
  process.exit(1);
}
*/

/*
 * Express configuration
 */
var app = express(); 
app.configure(function(){
  app.set('localrun', process.env.LOCAL || false);
  app.set('port', process.env.PORT || 8080);
  app.set('title', "FunnyClock - Alguer, Marc, Victor")
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
  app.use(require('connect-assets')({'src':'assets'}));
  app.use(express.static(__dirname + '/public'));
});

/*
 * HTTP Server
 */
server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});



/*
 * Page routing
 */
 app.get('/', clock);
 app.get('/gettime',timeJSON);

/*
 * Render main clock page
 */
function clock(request, result){
	var parameters = {
		title: request.app.get("title"),
		port: request.app.get("port")
	}
	result.render("index", parameters)
}

/*
 * JSON response
 */

var exec = require('child_process').exec;

function timeJSON(request, result){
  // Current & last timestamps
  var currentTime = Math.round((new Date()).getTime() / 1000);
  var latestTime = request.app.get('latestTime') || 0;

  // Setup last file
  var currentWAV = "current" + latestTime + ".wav";

  // Regenerate at least every minute
  if (currentTime - latestTime > 60){
    // Update current timestamp
    request.app.set('latestTime', currentTime);

    // Setup output file path & voice paths
    currentWAV = "current" + currentTime + ".wav";
    var savePath = __dirname + "/public/" + currentWAV;

    // Execute festival command to generate Waveform
    var command = "festival -b webservice_load.scm \"(savetime '" + savePath + ")\"";
    console.log("Regenerating Wav audio:\"" + command + "\"");

    exec(command, {'cwd':voicePath}, function puts(error, stdout, stderr){
      // View standard outputs on node log
      sys.puts(stderr);
      sys.puts(stdout);
      console.log(error);

      // Remove previous generated
      if(latestTime != 0){
        var previousWAV = "public/current" + latestTime + ".wav";
        fs.unlink(previousWAV, function (err) {
          if (err) console.log(err);
          console.log('Deleted ' + previousWAV);
        });
      }
      // Send object to client
      result.contentType('application/json');
      result.send({'wav':currentWAV});
    });

  }else{
    console.log('Using pre syntetized time, regenerate on ' + Math.abs(currentTime - latestTime - 60) + ' seconds');
    // Send object to client
    result.contentType('application/json');
    result.send({'wav':currentWAV});
  }
}









