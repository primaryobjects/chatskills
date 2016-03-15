var alexa = require('alexa-app');

var ChatSkillsManager = {
    verbose: true,
    apps: {},

    add: function(namespace) {
        // Add a new skill (app namespace).
        this.apps[namespace] = new alexa.app(namespace);

        var app = this.apps[namespace];
        app.slots = {};

        return app;
    },

    app: function(namespace) {
        return this.apps[namespace];
    },

    respond: function(input, app, callback) {
        var appList = [];

        if (typeof app == 'function') {
            // User is passing app as null.
            callback = app;
            app = null;
            appList.push(app);
        }
        else if (typeof app == 'object' && app.length > 0) {
            // User is passing an array of multiple skills.
            appList = app;
        }
        else {
            // User is passing a single skill.
            appList.push(app);
        }

        for (var index in appList) {
            app = appList[index];
            if (!app) {
                // Determine app namespace by input: "ask [namespace] ...".
                var matches = input.match(/ask ([a-zA-Z0-9]+)[,\. ](.*)/i);
                if (matches && matches.length == 3) {
                    var namespace = matches[1];
                    app = this.apps[namespace];
                    if (!app) {
                        if (this.verbose) {
                            console.log("Error - The skill '" + namespace + "' doesn't exist. Add one using: chatskills.add('" + namespace + "')");
                        }
                        return;
                    }
                    else {
                        // We found a skill. Now strip the skill part out of the input, for processing.
                        input = matches[2];
                    }
                }
                else {
                    if (this.verbose) {
                        console.log('Error - No skill specified. Ask for one using, "ask SKILL_NAME text" or use: chatskills.respond(text, skillName, callback)')
                    }
                    return;
                }
            }

            // Go through each intent in the skill to find a valid response.
            for (var i in Object.keys(app.intents)) {
                var key = Object.keys(app.intents)[i];

                // Get utterances for this intent.
                var utterances = [];
                app.utterances().split('\n').forEach(function(template) {
                    // Get the intent name from this template line.
                    var matches = template.match(/([a-zA-Z0-9]+)\t/);
                    if (matches && matches[1] == key) {
                        // The intent matches ours, let's use it. First, strip out intent name.
                        var start = template.indexOf('\t');
                        template = template.substring(start + 1);

                        // Add this utterance for processing.
                        utterances.push(template);
                    }
                });

                var result = ChatSkillsManager.parse(input, utterances);
                if (result.isValid) {
                    // This intent is valid for the input. Set slots.
                    for (var j in result.pairs) {
                        var pair = result.pairs[j];
                        app.slots[pair.name] = pair.value;
                    };

                    // Call intent.
                    app.intents[key]['function'](
                    {
                        // Request
                        input: input,
                        slots: app.slots,
                        variables: result.pairs,

                        get: function(key) {
                            return app.slots[key];
                        },

                        set: function(key, value) {
                            app.slots[key] = value;
                        }
                    },
                    {
                        // Response
                        say: function(text) {
                            if (callback) {
                                callback(text);
                            }
                        }
                    });

                    // We've already found a valid intent, skip processing the rest. This prevents multiple responses from the same text.
                    break;
                }
            }
        }
    },

    parse: function(text, utterances) {
        var result = { isValid: true, pairs: [] };

        for (var h in utterances) {
            var template = utterances[h];
            var regEx = /[ \n\r\t,\.\!`~@#\$%\^\&\*\(\)\[\]:;\"\?\/\\\<\_\-\+\=>]+/;

            result.isValid = true;

            if (template && template.length > 0) {
                //console.log('Template: ' + template);
                //console.log('Text: ' + text);

                // Find all variables and fill in values.
                var tokens = template.split(regEx);
                var words = text.split(regEx);

                if (tokens.length == words.length) {
                    for (var i = 0; i < tokens.length; i++) {
                        var token = tokens[i];
                        var word = words[i];

                        //console.log('Token: ' + token);
                        //console.log('Word: ' + word);

                        if (token.toLowerCase() != word.toLowerCase()) {
                            // A word doesn't match, but is it a variable?
                            var tokenParts = token.match(/{([a-zA-Z0-9]+)\|([a-zA-Z0-9]+)}/);
                            if (tokenParts && tokenParts.length == 3) {
                                //console.log(tokenParts[2] + ' = ' + word);
                                // Found a variable.
                                result.pairs.push({ name: tokenParts[2], value: word });
                            }
                            else {
                                result.isValid = false;
                                break;
                            }
                        }
                    }
                }
                else {
                    result.isValid = false;
                    continue;
                }
            }
            else {
                result.isValid = false;
            }

            if (result.isValid) {
                break;            
            }
        };

        return result;
    }
};

module.exports = ChatSkillsManager;