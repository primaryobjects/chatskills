var chatskills = require('./lib/chatskills');

// Create a new skill.
var favoritecolor = chatskills.add('favoritecolor');

favoritecolor.intent('run', {
        "slots": {},
        "utterances": ["{to|} {run|start|go|launch}"]
    }, function(req, res) {
        var prompt = "What is your favorite color?";
        res.say(prompt).reprompt(prompt).shouldEndSession(false);
    }
);

// Using the Custom Slot Type "ColorType".
favoritecolor.intent('color',{
        "slots":{"ColorType":"COLORTYPE"}
        ,"utterances":["my favorite color is {-|ColorType}",
                       "{-|ColorType}"]
    },
    function(req,res) {
        res.say("My favorite color is " + req.slot('ColorType') + ' too!');
        res.shouldEndSession(true);
    }
);