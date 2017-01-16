var Botkit = require('./node_modules/botkit/lib/Botkit.js');
var MongoClient = require('mongodb').MongoClient;


var url = process.env.MONGO_URI;

var express = require('express');
var bodyParser = require('body-parser');
 
var app = express();
var port = process.env.PORT || 1337;
 
// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
 
// test route
app.get('/', function (req, res) { res.status(200).send('Hello world!'); });
 
app.listen(port, function () {
  console.log('Listening on port ' + port);
});

app.post('/keepalive', function (req, res, next) {
    var http = require("http");
    var trigger = req.body.trigger_word;
    var userName = req.body.user_name;
    if(trigger === "jarvis start"){
      var alive = setInterval(function() {
        http.get("http://team-bot.herokuapp.com/keepalive");
      }, 299990);
    }else{
      clearInterval(alive);
      var botPayload = {
        text : "Jarvis will shutdown after a while."
      };
      if (userName !== 'slackbot') {
        return res.status(200).json(botPayload);
      }else {
        return res.status(200).end();
      }
    }
    
});


var controller = Botkit.slackbot({
 debug: false
});

var AvailableUsers;

MongoClient.connect(url, function(err, database) {

    var db = database.collection("slackbot");

    controller.spawn({
        token: process.env.API_TOKEN
    }).startRTM(function(err) {
        if (err) {
            throw new Error(err);
        }
    });

    controller.hears(['hello','hi'],['direct_message','direct_mention','mention'],function(bot,message) {
        bot.reply(message,"Hello.");
    });
    controller.hears(['introduce yourself'],['direct_message','direct_mention','mention'],function(bot,message) {
        bot.reply(message,"Hello. I am Jarvis. I was created by Yash Patel.");
    });

    controller.hears(['available'],['direct_message','direct_mention','mention'],function(bot,message) {
        bot.api.users.info({user: message.user}, function(error, response) {
            if (error) {
                throw new Error(error);
            }
            var user = response.user.name;
            bot.reply(message,user + " has been added to list");
            db.update(
                { _id1: 1 },
                { $addToSet: { Users: user } }
            );
        });
    });    

    controller.hears(['list'],['direct_message','direct_mention','mention'],function(bot,message) {
        db.distinct("Users").then(function(users) {
            AvailableUsers = users;
            for(i=0; i < AvailableUsers.length;i++){
                var UserNames = "@" + AvailableUsers[i]
                bot.reply(message, UserNames);
            }
        })

        

    });


});
