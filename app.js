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
  , sys = require('sys');

var app = express();

/*
 * Express configuration
 */
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
function timeJSON(request, result){
	// Define object for audio playing
	var object = {'wav':updateWaveform()};

	// Send object to client
	result.contentType('application/json');
	result.send(object);
}


var exec = require('child_process').exec;

function updateWaveform(){
  var timestamp = Math.round((new Date()).getTime() / 1000);
  var voicePath = "/Users/boyander/Desktop/tecno_parla/time_ldom";
  var currentWAV = "current" + timestamp + ".wav";
  var savePath = __dirname + "/public/" + currentWAV;
  var command = "pushd " + voicePath + "; festival -b saycurrent.scm \"(savetime '" + savePath + ")\"; popd;";
  console.log("Regenerate Wav audio:\"" + command + "\"");
  exec(command, puts);
  return currentWAV;
}

function puts(error, stdout, stderr){
  sys.puts(stderr);
  sys.puts(stdout);
}






