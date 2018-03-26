var wifi = require('Wifi');
var http = require('http');
var fs = require("fs");

var ssid = 'Vitaly';
var password = 'password1';
var port = 80;

var chunksize = 2048;

var lengthStrip = 21;
var dataPin = D13;


try {
    fs.readdirSync();
} catch (e) { //'Uncaught Error: Unable to mount media : NO_FILESYSTEM'
    console.log('Formatting FS - only need to do once');
    E.flashFatFS({ format: true });
}
E.on('init', function() {startDevice();});


function startDevice(){
  startWifi();
  startServer();
}
function startWifi(){
  wifi.connect(ssid, {password: password}, function() {
    console.log(`IP address: ${wifi.getIP().ip}`);
});
}
function onPageRequest (req, res) {
    var a = url.parse(req.url, true);
    var pathname = a.pathname;
    if(pathname == '/'){
        pathname = 'index.html';
    }
    var typeFile = pathname.split('/').pop().split(".").pop();
    var contentType = '';
    switch (typeFile) {
        case 'css':
            contentType = 'text/css; charset=UTF-8';
            break;
        case 'js':
            contentType = 'application/javascript; charset=UTF-8';
            break;
        case 'json':
            contentType = 'application/json; charset=UTF-8';
            break;
        case 'ico':
            contentType = 'image/x-icon';
            break;
        case 'html':
            contentType = 'text/html; charset=UTF-8';
            break;
        default:
            contentType = 'text/plain; charset=UTF-8';
            break;
    }
    pathname += '.gz';
    try{
        var f = E.openFile(pathname, "r");
        var options = { chunkSize : int=chunksize };
        res.writeHead(200, {'Content-Type': contentType, 'Content-Encoding': 'gzip'});
        f.pipe(res, options); // streams the file to the HTTP response

    } catch (err) {
        // else not found - send a 404 message
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end("404: Page "+pathname+" not found");
    }
}

function startServer(){
var server = require('ws').createServer(onPageRequest);
server.listen(port);

    server.on("websocket", function(ws) {

        console.log('Client connected');

        ws.on('message', msg => {
            console.log('Meassage got: ' + msg);
            try{
                let parsedMsg = JSON.parse(msg);
                let method = parsedMsg.method;
                if(method){
                    switch(method){
                        case 'changeColorAll':
                            if(parsedMsg.color){
                                setColor(parsedMsg.color);
                                ws.send('Color changed!');
                                break;
                            }
                        case 'setChunkSize':
                            if(parsedMsg.chunkSize){
                                chunksize = parsedMsg.chunkSize;
                                var resMsg = {method: 'setChunkSize', status: 'success'};
                                var resMsgJson = JSON.stringify(resMsg);
                                ws.send(resMsgJson);
                                console.log('chunkSize modified');
                                break;
                            }
                        case 'setLengthStrip':
                            if(parsedMsg.lengthStrip){
                                lengthStrip = parsedMsg.lengthStrip;
                                var resMsg = {method: 'lengthStrip', status: 'success'};
                                var resMsgJson = JSON.stringify(resMsg);
                                ws.send(resMsgJson);
                                console.log('lengthStrip modified');
                                break;
                            }
                        default:
                            let error = new Error("Method unknown", 501); //Тут метод и правда неизвестен
                            let jsonError = JSON.stringify(error);
                            ws.send(jsonError);
                    }
                }
                else if (!parsedMsg.method) {
                    let error = new Error("Method unknown", 501); //Тут отсутствует метод
                    let jsonError = JSON.stringify(error);
                    ws.send(jsonError);
                }
                else{
                    let error = new Error("Internal Server Error", 500);
                    let jsonError = JSON.stringify(error);
                    ws.send(jsonError);
                }
            }
            catch (errorParse){
                let error = new Error("Method unknown", 501); //Надо поменять на неферный вормат данных или что-то вроде
                let jsonError = JSON.stringify(error);
                ws.send(jsonError);
                console.log('Unknow user testing our service. Thats bad.');
                console.log(msg);
                console.log(errorParse.name);
                console.log(errorParse.message);
            }
        });

    });

    console.log(`Web server running at http://${wifi.getIP().ip}:${port}`);
}

function setColor(color){
    var pixels = new Uint8ClampedArray(lengthStrip * 3);
    for (var i=0;i<pixels.length; i+=3) {
        pixels[i] = color[1];//ws2812 has GRB nor RGB
        pixels[i+1] = color[0];
        pixels[i+2] = color[2];
    }
    require("neopixel").write(dataPin, pixels);
}


