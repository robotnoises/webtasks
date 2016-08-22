'use strict';

function Event(matchedPhrase) {
  if (matchedPhrase) {
    this.who = matchedPhrase[1];
    this.what = matchedPhrase[2];
    this.when = new Date(matchedPhrase[3]);
    this.valid = !!this.who && !!this.what && !!this.when;
  }
}

function Chat(messageBody) {
  if (messageBody) {
    this.messageBody = messageBody;
    this.events = [];
  } else {
    throw new Error('messageBody is required.');
  }
}

Chat.prototype.getMatches = function () {
  // Matches (someone) needs to "(some action)" on "(some date)" at "(time)"
  var taskMatcher = /(\w+)\s\bneeds\b\s\bto\b\s"([\w\s]+)"\s\bon\b\s"([a-z\s0-9,]+)"\s\bat\b\s"([amp\s0-9:]+)"/;
  var matcher = new RegExp(taskMatcher, 'gi');
  
  this.messageBody.replace(matcher, function (match) {
    this.events.push(new Event(matcher.exec(match)));
    matcher.lastIndex = 0;
  }.bind(this));

  return this.events;
};
