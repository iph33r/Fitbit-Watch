import document from "document";
import clock from "clock";
import * as util from "../common/utils";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";
import * as messaging from "messaging";
import * as scientific from "scientific";




//Begin Date Stuff
var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
var days = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19",
            "20","21","22","23","24","25","26","27","28","29","30","31"];

let date = document.getElementById("date");
let month = months[new Date().getMonth()];
let day = days[new Date().getDate()]-1;
date.text = `${month} ${day}`;


//Begin Clock Stuff
clock.granularity = "seconds";

const myClock = document.getElementById("myClock");

clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  let mins = util.zeroPad(today.getMinutes());

  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  myClock.text = `${hours}:${mins}`;
}


// Begin Nutrition Stuff. Message is received from Companion.
let myWater = document.getElementById("myWater");
let myCalories = document.getElementById("myCalories");
let myCalorieGoal = document.getElementById("myCalorieGoal")
let protein = document.getElementById("Protein");
let carb = document.getElementById("Carb");
let fat = document.getElementById("Fat");
let proteinLine = document.getElementById("proteinLine");
let proteinBlock = document.getElementById("proteinBlock");
let carbLine = document.getElementById("carbLine");
let carbBlock = document.getElementById("carbBlock");
let fatLine = document.getElementById("fatLine");
let fatBlock = document.getElementById("fatBlock");
let proteinAngle;
let carbAngle;
let fatAngle;


messaging.peerSocket.onmessage = evt => {
  //Displaying digits from Nutrition database.
    myWater.text = `${Math.ceil(evt.data.summary.water/29.574)} oz`;
    myCalories.text = `${evt.data.summary.calories}`;
    myCalorieGoal.text = `${evt.data.goals.calories}`;
    protein.text = `${evt.data.summary.protein} g`;
    carb.text = `${evt.data.summary.carbs} g`;
    fat.text = `${evt.data.summary.fat} g`;
  //Begin Line Slope Stuff. first number is the starting angle, subtract it by the degree you want it to stop and use that to multiply.
    proteinAngle = -10-((evt.data.summary.protein/375)*25); //stop at 35 degrees. 10+25=35
    proteinLine.groupTransform.rotate.angle = proteinAngle;
    proteinBlock.groupTransform.rotate.angle = proteinAngle;
    carbAngle = -7.5-((evt.data.summary.carbs/437)*27.5); //stop at 35 degrees. 7.5+27.5=35
    carbLine.groupTransform.rotate.angle = carbAngle;
    carbBlock.groupTransform.rotate.angle = carbAngle;
    fatAngle = -5-((evt.data.summary.fat/100)*30); //stop at 35 degrees. 5+30=35
    fatLine.groupTransform.rotate.angle = fatAngle;
    fatBlock.groupTransform.rotate.angle = fatAngle;
};


//Begin Macros Goals Stuff. Values is received from text input in Settings.



//Begin Heart Rate Sensor Stuff
const sensors = [];
const hrmData = document.getElementById("hrm-data");

if (HeartRateSensor) {
  const hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", () => {
    hrmData.text = hrm.heartRate;
  });
  sensors.push(hrm);
  hrm.start();
  } 
else {
   hrmData.style.display = "N/A";
  }

display.addEventListener("change", () => {
  // Automatically stop all sensors when the screen is off to conserve battery
  display.on ? sensors.map(sensor => sensor.start()) : sensors.map(sensor => sensor.stop());
});

