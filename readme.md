Chatskills
----------

Create a chatbot using [Alexa-style](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit) skills and intents.

```bash
$ npm install chatskills
```

Chatskills is a quick and easy way to create a conversational user-interface for applications and services. It uses a collection of skills and intents, styled after the [Alexa Skills Kit](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/getting-started-guide), to setup matching phrases and logic for responding to user requests.

Chatskills does not require a server and can run directly in the console. It can also run on the web. It handles requests from multiple users and maintains session memory. When a user starts a conversation with one of the skills, the skill continues to execute within a session context, until the skill terminates.

## Example

```
> chatskills, ask hello to say hi.
Hello, World!
> chatskills, ask horoscope for Scorpio.
Things are looking up today for Scorpio.
> chatskills, ask funny to tell me a joke
Knock knock.
> who's there?
Banana.
> banana who
Knock knock.
> whos there
Orange.
> orange who?
Orange you glad I didn't say banana?
```

In this example, the user accesses three different skills, [hello](), [funny](), and [horoscope]().

## Usage

Using chatskills is easy. Add a new skill, then create some intents. Here's a simple example.

```javascript
var chatskills = require('./lib/chatskills');

// Create a skill.
var hello = chatskills.add('hello');

// Create an intent.
hello.intent('helloWorld', {
    'slots': {},
    'utterances': [ '{to |}{say|speak|tell me} {hi|hello|howdy|hi there|hiya|hi ya|hey|hay|heya}' ]
    },
    function(req, res) {
        res.say('Hello, World!');
    }
);

// Respond to input.
chatskills.respond('chatskills, ask hello to say hi', function(response) {
    console.log(response);
});
```

In the above example, the utterances grammar automatically expands to match on the following phrases:

```
helloWorld      to say hi
helloWorld      say hi
helloWorld      to speak hi
helloWorld      speak hi
helloWorld      to tell me hi
helloWorld      tell me hi
helloWorld      to say hello
helloWorld      say hello
helloWorld      to speak hello
helloWorld      speak hello
helloWorld      to tell me hello
helloWorld      tell me hello
helloWorld      to say howdy
...
```

To interact with the chatbot using this skill, say any of the target phrases. In the above example, we've used the phrase "to say hi", but you can match against any of the generated phrases. For example:

```
> chatskills, ask hello to tell me hi
Hello, World!
> chatskills, ask hello to say hello
Hello, World!
> chatskills, ask hello to say howdy
Hello, World!
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

        // Respond to input, use author.name as the session id.
        chatskills.respond(message.text, author.name, function(response) {
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

Skills are programs that your chatbot can run. They consist of intents, which are composed of utterances (phrases to match from the user input), responses, and session memory. Each skill can access session memory, so you can store and retrieve variables to help with responding intelligently to the user.

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
    'utterances': [ 'for {signs|SIGN}' ]
    },
    function(req, res) {
        res.say('Things are looking up today for ' + req.get('SIGN') + '.');
    }
);
```

This intent can be interacted with like this:

```
> chatskills, ask horoscope for Scorpio
Things are looking up today for Scorpio.
```

## Starting and Ending a Session

When a user provides input, the input is matched against each skill's list of intents. When a match is found, a new session starts, and the skill's intent begins executing.

When a session has started for a user, the activated skill's intents can get/set variable values within the session. This allows you to not only store and retrieve data, but also to maintain state variables.

While a session is open for a user, all input from the user is directed to the activated skill. In this manner, the user does not need to re-request a skill ("chatskills, ask hello to say hi"). Instead, the user can simply provide text, which will be matched against the currently executing skill's intents.

An intent can keep a session open by returning true and end a session by returning false. An intent may also omit a return statement, which is the same as returning false.

Overall, while a session is open, all input from the user is directed to the skill. When a session is ended, input must be received in the format, "chatskills, ask [SKILL] text", to execute a new skill.

## Changing the Chatbot Name

The default chatbot name is "chatskills". All requests to execute a skill must begin with the chatbot name. For example, "chatskills, ask hello to say hi". To customize the chatbot name, use the following:

```javascript
chatskills.name('AwesomeBot');
```

## Verbose Output

To display warnings and errors, set ```chatskills.verbose = true```.

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

License
----

MIT

Author
----

Kory Becker
http://www.primaryobjects.com/kory-becker