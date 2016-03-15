Chatskills
----------

Create a chatbot using [Alexa-style](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/getting-started-guide) skills and intents.

Example chat

```
> hello
Hi!
> ask names My name is Kory.
Nice to meet you, Kory.
> ask names My last name is Smith.
Gotcha.
> ask names Whats my name?
Your name is Kory Smith.
```

```bash
$ npm install chatskills
```

## Usage

```javascript
var chatskills = require('./lib/chatskills');

// Create a skill.
var hello = chatskills.add('hello');

// Create an intent.
hello.intent('sayHello', {
    'slots': {},
    'utterances': [ '{hi|hello|howdy|hi there|hiya|hi ya|hey|hay}' ]
    },
    function(req, res) {
        res.say('Hi!');
    }
);

// Respond to input.
chatskills.respond('howdy', function(response) {
    console.log(response);
});
```

## Reading from the Console

To create a chatbot that runs locally on the console, just include a loop for reading input.

```javascript
var readlineSync = require('readline-sync');

// Console client.
var text = ' ';
while (text.length > 0 && text != 'quit') {
    text = readlineSync.question('> ');

    // Respond to input.
    chatskills.respond(text, function(response) {
        console.log(response);
    });
}
```

## Reading from Slack

You don't have to use just the console! You can run your chatbot anywhere, like Slack.

```javascript
var SlackBot = require('slackbots')
var bot = new SlackBot({ token: token, name: 'MyAwesomeBot' });

// Listen to slack messages.
bot.on('message', function(message) {
    // Reply to humans.
    if (message.type == 'message' && message.text && message.subtype != 'bot_message') {
        var author = getUserById(message.user);
        var channel = getChannelById(message.channel);

        // Respond to input.
        chatskills.respond(message.text, function(response) {
            if (channel) {
                // Public channel message.
                bot.postMessageToChannel(channel.name, response);
            }
            else {
                // Private message.
                bot.postMessageToUser(author.name, response);
            }
        });
    }
});
```

## Creating a Skill

Skills are programs that your chatbot can run. They consist of intents, which are composed of utterances (phrases to match from the user input), responses, and session memory. Each skill holds its own memory space, so you can store and retrieve variables, to help with responding intelligently to the user.

Here's an example of creating a new skill, named "horoscope".

```javascript
var horoscope = chatskills.add('horoscope');
```

## Create an Intent

Skills are made up of intents. This is where input from the user is matched against an array of utterances. When a match is found, that intent is executed. The intent usually results in a response, although it can also result in storing data in a variable.

Here's an example of creating a new intent, named "predict".

```javascript
horoscope.intent('predict', {
    'slots': {'SIGN':'LITERAL'},
    'utterances': [ 'to predict {sign|SIGN}' ]
    },
    function(req, res) {
        res.say('Things are looking up today for ' + req.get('SIGN') + '.');
    }
);
```

This intent can be interacted with like this:

```
> ask horoscope to predict Scorpio
Things are looking up today for Scorpio.
```

## Respond

Chatskills.respond can be used in 3 different ways to respond to input text. In this manner, you can programmatically select which skills to execute or allow all skills to have a chance at running.

#### Run against all skills.

```javascript
chatskills.respond(text, function(response) {
    console.log(response);
});
```

#### Run against a specific skill.

```javascript
chatskills.respond(text, hello, function(response) {
    console.log(response);
});
```

#### Run against multiple specific skills.

```javascript
chatskills.respond(text, [ hello, goodbye ], function(response) {
    console.log(response);
});
```

## Schema and Utterances

Chatskills uses [alexa-app](https://www.npmjs.com/package/alexa-app) to generate many sample utterances from your intents. For a more detailed description of utterances, see [here](https://www.npmjs.com/package/alexa-app#schema-and-utterances).

### Schema Syntax

Pass an object with two properties: slots and utterances.

```javascript
app.intent('sampleIntent',
    {
        "slots":{"NAME":"LITERAL","AGE":"NUMBER"}, 
        "utterances":[ "my {name is|name's} {names|NAME} and {I am|I'm} {1-100|AGE}{ years old|}" ]
    },
    function(request,response) { ... }
);
```

#### slots

The slots object is a simple Name:Type mapping. The type must be one of Amazon's supported slot types: LITERAL, NUMBER, DATE, TIME, DURATION

#### utterances

The utterances syntax allows you to generate many (hundreds or even thousands) of sample utterances using just a few samples that get auto-expanded. Any number of sample utterances may be passed in the utterances array. Below are some sample utterances macros and what they will be expanded to.

#### Multiple Options mapped to a Slot

```
"my favorite color is {red|green|blue|NAME}"
=>
"my favorite color is {red|NAME}"
"my favorite color is {green|NAME}"
"my favorite color is {blue|NAME}"
```

#### Generate Multiple Versions of Static Text

This lets you define multiple ways to say a phrase, but combined into a single sample utterance

```
"{what is the|what's the|check the} status"
=>
"what is the status"
"what's the status"
"check the status"
```

#### Auto-Generated Number Ranges

When capturing a numeric slot value, it's helpful to generate many sample utterances with different number values

```
"buy {2-5|NUMBER} items"
=>
"buy {two|NUMBER} items"
"buy {three|NUMBER} items"
"buy {four|NUMBER} items"
"buy {five|NUMBER} items"
```

Number ranges can also increment in steps

```
"buy {5-20 by 5|NUMBER} items"
=>
"buy {five|NUMBER} items"
"buy {ten|NUMBER} items"
"buy {fifteen|NUMBER} items"
"buy {twenty|NUMBER} items"
```

#### Optional Words

```
"what is your {favorite |}color"
=>
"what is your color"
"what is your favorite color"
```

#### Using a Dictionary

Several intents may use the same list of possible values, so you want to define them in one place, not in each intent schema. Use the app's dictionary.

```
app.dictionary = {"colors":["red","green","blue"]};
...
"my favorite color is {colors|FAVEORITE_COLOR}"
"I like {colors|COLOR}"
```