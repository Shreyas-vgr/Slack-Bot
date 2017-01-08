'use strict';
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
let rtm = null;
let nlp = null;
let registry = null;
function handleOnAuthenticated(rtmStartData) {
		console.log('Logged in as '+ rtmStartData.self.name + ' of team ' + rtmStartData.team.name +' ,but not yet connected to a channel');
}

function addAuthenticatedHandler(rtm, handler){
	rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED,handler);
}

function handleOnMessage(message){
	
	if(message.text.toLowerCase().includes('iris')){
		nlp.ask(message.text,(err,res) => {
			if(err) {
					console.log(err);
					return;
			}
			
			try {
				if(!res.intent || !res.intent[0] || !res.intent[0].value){
						throw new Error("Could not extract intent");
				}
				
				const intent = require('./intents/' + res.intent[0].value + 'Intent');
				intent.process(res, registry,  function(err,response){
						if(err){
							console.log(err.message);
							}
						return rtm.sendMessage(response,message.channel);
					})
			}catch(err){
				console.log(err);
				console.log(res);
				rtm.sendMessage("Sorry, I dont know what youre talking about",message.channel);
			
			}
			/*if(!res.intent) { 
				return rtm.sendMessage("Sorry, I dont know what you're talking about",message.channel);
			}
			else if(res.intent[0].value == 'time' && res.location){
				return rtm.sendMessage("I dont know the time in " + res.location[0].value ,message.channel);	
				
			}
			else {
				console.log(res);
				return rtm.sendMessage("Sorry I didn't understand",message.channel);
			}*/
		});
		
	}
	
		
}
module.exports.init = function slackClient(token,logLevel,nlpClient, serviceRegistry) {
		rtm = new RtmClient(token, {logLevel : logLevel});	
		nlp = nlpClient;
		registry = serviceRegistry;
		addAuthenticatedHandler(rtm, handleOnAuthenticated);
		rtm.on(RTM_EVENTS.MESSAGE, handleOnMessage);
		return rtm;
}

module.exports.addAuthenticatedHandler = addAuthenticatedHandler;
