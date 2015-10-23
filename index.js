var devicejsRestApp = require('./devicejs-rest-app');




// if you wanted authentication, you would define a list of paths here
// to perform redirects on...
var authenticated = [
    { method: 'get', path: '/listInterfaces' }
];

var app = null;

log.debug("At devicejsRestApp.createApp()");

// goto: http://[devicejs-server]/CHAT after starting this App

module.exports = devicejsRestApp.createApp('CHAT', 
    undefined,  // no authentication...
//    authenticated,
    function(App,express,opts) {
        app = App;

        // redirect to the 'chat' app
        // based on: http://socket.io/get-started/chat/
        app.get('/',function(req,res){
            log.debug('redirect to --> /chat.html');
            res.redirect('/chat.html');
        });

        // show some deviceJS output
        app.get('/listInterfaces', function(req, res) {
            var ddb = req.ddb;
            var dev$ = req.dev$;

            dev$.listInterfaceTypes().then(function(interfaceTypes) {
                res.status(200).send(interfaceTypes);
            }, function(error) {
                res.status(500).send('A server error occurred');
            });
        });

        // server the static content
        app.use(express.static(__dirname+'/public'));

    },function(error,opts) { // runs once the App is up and socket.io is up
        if(!error) {
            log.debug("in appReadyCB");
            var io = opts.socketio;

            io.on('connection', function(socket){
                log.debug("Got a socket.io connection.")
                socket.on('chat message', function(msg){
                    log.debug("on chat message");
                    io.emit('chat message', msg);
                });
            });

        }
    },
    { // startup opts
        need_websocket: true
    }
);

