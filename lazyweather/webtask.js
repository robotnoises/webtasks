'use strict';

const TWILIO_SID = process.env.TWILIO_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE = process.env.TWILIO_PHONE || '';
const MY_PHONE = process.env.MY_PHONE || '';

const twilio = require('twilio')(TWILIO_SID, TWILIO_AUTH_TOKEN);

const ADJECTIVES = {
  0: 'really, really bad',
  1: 'forgettable',
  2: 'okay',
  3: 'pretty darn nice',
  4: 'incredible'
};

const HOT_THRESHOLD = 85;     // High temperature
const COLD_THRESHOLD = 40;    // Low temperature 
const SWEATY_THRESHOLD = 65;  // Humidity
const SNEEZE_THRESHOLD = 6;   // Pollen Count 

function Weather(w) {
  if (w) {
    this.tempHigh = w.temphigh || null;
    this.tempLow = w.templow || null;
    this.humidity = w.humidity || null;
    this.allergy = w.pollen || null;
    this.condition = w.condition.toLowerCase() || null;
    this.tooDamnHot = (this.tempHigh) ? parseInt(this.tempHigh, 10) >= HOT_THRESHOLD : true;
    this.tooDamnCold = (this.tempLow) ? parseInt(this.tempLow, 10) <= COLD_THRESHOLD : true;
    this.tooDamnSweaty = (this.humidity) ? parseInt(this.humidity) >= SWEATY_THRESHOLD : true;
    this.tooDamnSneezy = (this.allergy) ? parseFloat(this.allergy) >= SNEEZE_THRESHOLD : true;
    this.tooDamnCloudy = (this.condition) ? (this.condition !== 'sunny' && this.condition !== 'mostly sunny') : true;
  }
}

Weather.prototype.whatIsTodayGonnaBeLike = function () {
    let intro = 'Good morning. Today\'s temperature will be a high of ' + this.tempHigh + ' and a low of ' + this.tempLow + '. ';
    let allergies = (this.tooDamnSneezy) ? 'Make sure to take your meds, because there is a high pollen count, ' : 'Breathe easy today, ';
    let humidity = (this.tooDamnSweaty) ? 'and dress comfortably because it\'s going to be a sweaty one. ' : 'and wear some decent clothing, because it\'s going to be nice out. ';
    let condition = 'The average condition is ' + this.condition + '.';   
    
    return intro + allergies + humidity + condition;
};

Weather.prototype.justTellMe = function () {
  
  function calcDayScore() {
    let dayScore = 4;

    if (this.tooDamnHot)    dayScore--;
    if (this.tooDamnCold)   dayScore--;
    if (this.tooDamnSweaty) dayScore--;
    if (this.tooDamnSneezy) dayScore--;
    if (this.tooDamnCloudy) dayScore--;
    
    return (dayScore >= 0) ? dayScore : 0;
  }

  return 'Overall, today\'s gonna be ' + ADJECTIVES[calcDayScore.call(this)] + '.';
};

/**
 * The Webtask
 */
modules.export = function (context, doneCallback) {
  let weather = new Weather(context.data);

  //Send an SMS text message to my phone
  twilio.sendMessage({
    'to': '+' + MY_PHONE,
    'from': '+' + TWILIO_PHONE, 
    'body': w.justTellMe()
  }, function (err, responseData) {
    if (!err) { 
      doneCallback();
    } else {
      // Todo log the error in Webtask storage
    }
  });
};