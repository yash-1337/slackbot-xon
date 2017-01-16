var Botkit = require('./node_modules/botkit/lib/Botkit.js');


var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 1337;
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
    res.status(200).send('Hello world!');
});

app.listen(port, function () {

    console.log('Listening on port ' + port);

});

var alive;

app.post('/keepalive', function (req, res, next) {

    var http = require("http");

    alive = setInterval(function () {
        http.get("http://team-bot.herokuapp.com/keepalive");
    }, 299990);
});

app.post('/shutdown', function (req, res, next) {

    var http = require("http");
    var userName = req.body.user_name;
    clearInterval(alive);

    var botPayload = {
        text: "Jarvis will shutdown after a while."
    };

    if (userName !== 'slackbot') {
        return res.status(200).json(botPayload);
    } else {
        return res.status(200).end();
    }
});

var controller = Botkit.slackbot({
    debug: false
});


controller.hears(['hello', 'hi'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, "Hello.");
});

controller.hears(['Introduce yourself'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, "I am X0N. I was created by Yash Patel.");
});

controller.hears(['How are you?'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, "I\'m fine, thanks for asking!");
});

controller.hears(['How was your day?'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, "It was great! What about you?");
});

controller.hears(['My day was', "It was"], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, "That\'s cool.");
});