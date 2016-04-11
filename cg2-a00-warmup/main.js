
/*
* This is main.js which is referenced directly from within
* a <script> node in index.html
*/

// "use strict" means that some strange JavaScript things are forbidden
"use strict";

// this shall be the function that generates a new path object
var makePath = function(connector){
  var path = '';
  connector = connector ? ' ' + connector + ' ': ' ';

  return function(arg){ //diese funktion wird komplett in "makepath" gesteckt -
                        //sie ist also die, in der die komlette Logik passiert und
                        //und die, die das argument übergeben bekommen muss
    arg = arg ? arg + connector: '';
    return (path += arg);
  }
};



// the main() function is called when the HTML document is loaded
var main = function() {

  ////////////////////////////////////////////////////////////
  //create a path, add a few points on the path, and print it
  var path1 = makePath();

  path1("A");
  path1("B");
  path1("C");

  var path2 = makePath("-->");
  path2("Berlin");
  path2("San Francisco");
  path2("Vancouver");

  window.console.log("path 1 is " + path1() );
  window.console.log("path 2 is " + path2() );

  ////////////////////////////////////////////////////////////
  // second example
  window.console.log('This is the start.');

  // sets a timeout and calls the callbackFunction
  // after the timeout.
  // The specified callback is 0!!! milliseconds
  setTimeout(function callbackFunction() {
    window.console.log('This is a msg from call back.');
  }, 0);

  window.console.log('This is just a message.');


};
