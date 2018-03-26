var fs = require("fs");
var http = require("http");

try {
  fs.readdirSync();
 } catch (e) { //'Uncaught Error: Unable to mount media : NO_FILESYSTEM'
  console.log('Formatting FS - only need to do once');
  E.flashFatFS({ format: true });
}

var createUrl = (protocol, host, path) =>{
  var url = protocol + host + path;
  return url;
};

var getFile = (url, localPath) => {
  http.get(url, function(res) {
    res.on('data', function(data) {
      fs.appendFileSync(localPath, data);
      console.log(data);
    });
    res.on('close', function(data) {
      console.log(`File: ${localPath} is downloaded`);
    });
  });
};

var getFileWithPathEqual = (urlAbsolute, gz) => {
    var gzipped = gz ? '.gz' : '';
    urlAbsolute += gzipped;
    var localPath = url.parse(urlAbsolute, true).pathname;
    getFile(urlAbsolute, localPath);
};

var getFiles = (protocol, host, paths) => {
  for(var path in paths){
    var url = createUrl(protocol, host, paths[path]);
    getFile(url, paths[path]);
  }
};




var protocol = 'http://';
var host = 'test.onplay.me:5000';
getFileWithPathEqual("http://test.onplay.me:5000/static/js/main.add3e2a5.js", true);
//getFile('http://test.onplay.me:5000/manifest.json.gz', 'manifest.json.gz');
//var paths = ['/index.html.gz', '/static/js/main.add3e2a5.js.gz', '/static/css/main.022a5582.css.gz', '/favicon.ico.gz'];

//getFiles(protocol, host, paths);

/*var path0 = 'index.html.gz';
var path1 = '/static/js/main.98cb8dd3.js.gz';
var path2 = '/static/css/main.0257576c.css.gz';
var path3 = '/favicon.ico';*/




