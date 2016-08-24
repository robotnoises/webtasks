'use strict';

/**
 * Constants
 */

const TWILIO_PHONE = '+18508959825';
const MY_PHONE = '+8504912060';

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

/**
 * A Weather object constructor, which holds all of today's relevant weather data
 */

function Weather(w) {
  if (w) {
    this.tempHigh = w.temphigh || null;
    this.tempLow = w.templow || null;
    this.humidity = w.humidity || null;
    this.allergy = w.pollen || null;
    this.forecast = w.forecast || null;
    this.tooDamnHot = (this.tempHigh) ? parseInt(this.tempHigh, 10) >= HOT_THRESHOLD : true;
    this.tooDamnCold = (this.tempLow) ? parseInt(this.tempLow, 10) <= COLD_THRESHOLD : true;
    this.tooDamnSweaty = (this.humidity) ? parseInt(this.humidity) >= SWEATY_THRESHOLD : true;
    this.tooDamnSneezy = (this.allergy) ? parseFloat(this.allergy) >= SNEEZE_THRESHOLD : true;
    this.tooDamnCloudy = (this.forecast) ? (this.forecast !== 'Sunny' && this.forecast !== 'Mostly Sunny') : true;
  }
}

Weather.prototype.whatIsTodayGonnaBeLike = function () {
    let intro = 'Good morning. Today\'s temperature will be a high of ' + this.tempHigh + ' and a low of ' + this.tempLow + '. ';
    let allergies = (this.tooDamnSneezy) ? 'Make sure to take your meds, because there is a high pollen count, ' : 'Breathe easy today, ';
    let humidity = (this.tooDamnSweaty) ? 'and dress comfortably because it\'s going to be a sweaty one. ' : 'and wear some decent clothing, because it\'s going to be nice out. ';
    let forecast = 'The average condition is ' + this.forecast + '. ';   
    
    return intro + allergies + humidity + forecast;
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

  return 'Overall, today\'s gonna be ' + ADJECTIVES[calcDayScore.call(this)] + '. ';
};

/**
 * The Webtask
 */

module.exports = function (context, doneCallback) {
  let weather = new Weather(context.data);
  let sid = context.secrets.sid || '';
  let auth = context.secrets.auth || '';
  let twilio = require('twilio')(sid, auth);

  //Send an SMS text message to my phone
  twilio.sendMessage({
    'to': '+' + MY_PHONE,
    'from': '+' + TWILIO_PHONE, 
    'body': w.whatIsTodayGonnaBeLike() + w.justTellMe()
  }, function (err, responseData) {
    if (!err) { 
      doneCallback(null, 'OK');
    } else {
      console.error(err);
    }
  });
};