var Botkit = require('./node_modules/botkit/lib/Botkit.js');
var request = require("request");

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 1337;
app.use(bodyParser.urlencoded({
    extended: true
}));

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
        http.get("https://giphy-slackbot.herokuapp.com/keepalive");
    }, 299990);
});

app.post('/shutdown', function (req, res, next) {

    var http = require("http");
    var userName = req.body.user_name;
    clearInterval(alive);

    var botPayload = {
        text: "Jarvis will shutdown after a while."
    };

    if (userName !== 'giphy') {
        return res.status(200).json(botPayload);
    } else {
        return res.status(200).end();
    }
});

var controller = Botkit.slackbot({
    debug: false
});

controller.spawn({
    token: process.env.API_TOKEN
}).startRTM(function (err) {
    if (err) {
        throw new Error(err);
    }
});



controller.hears([''], ['direct_message', 'direct_mention'], function (bot, message) {
    var query = message.text;
    var searchUrl = "http://api.giphy.com/v1/gifs/search?limit=1&rating=g&q=" + query + "&api_key=dc6zaTOxFJmzC";
    request(searchUrl, function (error, response, body) {
        var data = JSON.parse(body);
        bot.reply(message, data.data[0].url);
    });
});