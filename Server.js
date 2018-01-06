var wifi = require('Wifi');
var http = require('http');

var ssid = 'Vitaly';
var password = 'password1';

var port = 80;

var page = '<h1>Hello World!</h1>';

function onPageRequest (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(page);
}
var server = require('ws').createServer(onPageRequest);

wifi.connect(ssid, {password: password}, function() {

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
});

function setColor(color){
    var lengthStrip = 21;
    var dataPin = D17;
    var pixels = new Uint8ClampedArray(lengthStrip * 3);
    for (var i=0;i<pixels.length; i+=3) {
        pixels[i] = color[1];//ws2812 has GRB nor RGB
        pixels[i+1] = color[0];
        pixels[i+2] = color[2];
    }
    require("neopixel").write(dataPin, pixels);
}
