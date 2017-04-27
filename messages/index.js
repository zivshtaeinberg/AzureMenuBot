/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
"use strict";
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

function getMenuItem() {
    var docDbClient = new DocumentDBClient(process.env['documentdburi'], {
        masterKey: process.env['documentdbprimarykey']
    });
 
    var menuItem = new MenuItem(docDbClient, "menu", "menu");
    var menu = new Menu(menuItem);
    menuItem.init();

    return menu.getMenuItem();
}

var x = getMenuItem();

var menu = [
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

var bot = new builder.UniversalBot(connector);

bot.dialog('/', [
    function (session) {
        builder.Prompts.text(session, "אהלן אח שלי, איך אני יכול לעזור לך נשמה?");
    },
    function (session, results) {
        var userRequest = results.response;
        console.log(userRequest);
        for (var i=0; i < menu.length; i++){
            if(new RegExp(menu[i].regexp).exec(userRequest)) {
                session.userData.menuIndex = i;
                builder.Prompts.choice(session, 'אוקיי, תבחר מהאופציות הבאות:',
                    menu[i].menu);
                return;
            }
        }
        
        session.endDialog('מצטער אחי, לא תומך בך היום')
    },

function (session, results) {
        var userChoice = results.response.entity;
        
        session.send(menu[session.userData.menuIndex].menu[userChoice].link);
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
