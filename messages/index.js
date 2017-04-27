/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
"use strict";
var self = this;

var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var DocumentDBClient = require('documentdb').DocumentClient;
var Menu = require('./Menu');
var MenuItem = require('./MenuItem');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});
var mainMenu = [];
/*
var mainMenu = [
     {
	id: 'id',
	regexp : /(תעודת זהות)|(תז)/g,
	menu: {
		    'בקשה לתעודת זהות' : {
		    	link: 'https://www.gov.il/he/service/new_id'
		    },
		    'ספח חדש לתעודת זהות': {
		    	link: 'https://www.gov.il/he/service/renew_id_appendix'
		    },
		    'ספח לתעודת זהות בעקבות שינויים בפרטים האישיים': {
		    	link: 'https://www.gov.il/he/service/id_stub_following_personal_change'
		    },
		    'תעודת זהות חכמה' :{
		    	link: 'https://www.gov.il/he/service/biometric_smart_id_request'
		    }
		}
	},
     {
	id: 'passport',
	regexp : /(passport)|(דרכון)/g,
	menu: {
		    'a' : {
		    	link: 'https://www.gov.il/he/service/new_id'
		    },
		    'b': {
		    	link: 'https://www.gov.il/he/service/renew_id_appendix'
		    }    
		}
	}
    ];
*/

var docDbClient = new DocumentDBClient(process.env['documentdburi'], {
    masterKey: process.env['documentdbprimarykey']
});

var menuItem = new MenuItem(docDbClient, "menudb", "menucollection");
var menu = new Menu(menuItem);

menu.init(function(err) {
     if(err) {
        throw err;
     }
     else {
        menu.getMenuItems(function(menuItems) {
            self.mainMenu = menuItems;
        });
     }
});

var bot = new builder.UniversalBot(connector);

bot.dialog('/', [
    function (session) {
        builder.Prompts.text(session, "אהלן אח שלי, איך אני יכול לעזור לך נשמה?");
    },
    function (session, results) {
        var userRequest = results.response;
        if (userRequest == 'תמונה') {
            var msg = new builder.Message(session)
                .attachments([{
                    contentType: "image/jpeg",
                    contentUrl: "http://www.theoldrobots.com/images62/Bender-18.JPG"
                }]);
            session.endDialog(msg);
        }
        else if (userRequest == 'סרטון') {
            var msg = new builder.Message(session)
                .attachments([{
                    contentType: "video/mp4",
                    contentUrl: "http://techslides.com/demos/sample-videos/small.mp4"
                }]);
            session.endDialog(msg);
        }
        else {

            for (var i=0; i < self.mainMenu.length; i++){
                if(new RegExp(self.mainMenu[i].regexp,"g").exec(userRequest)) {
                    session.userData.menuIndex = i;
                    builder.Prompts.choice(session, 'אוקיי, תבחר מהאופציות הבאות:\n',
                        self.mainMenu[i].menu);
                    return;
                }
            }
        
            session.endDialog('מצטער אחי, לא תומך בך היום')
        }
    },

function (session, results) {
        var userChoice = results.response.entity;
        
        session.send(self.mainMenu[session.userData.menuIndex].menu[userChoice].link);

        
    }
]);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
