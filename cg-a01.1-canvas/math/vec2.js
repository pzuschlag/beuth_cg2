/*
 * JavaScript / Canvas teaching framwork
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 *
 * Module: vec2
 *
 * Some simple 2D vector operations based on [x,y] arrays
 *
 */


/* requireJS module definition */
define([],
       (function() {

    "use strict";

    var vec2 = {};

    // add two vectors, return new vector
    vec2.add = function(v0,v1) {
        return [v0[0] + v1[0], v0[1] + v1[1] ];
    };

    // subtract two vectors, return new vector
    vec2.sub = function(v0,v1) {
        return [v0[0] - v1[0], v0[1] - v1[1] ];
    };

    // dot product / scalar product of two vectors, return scalar value
    vec2.dot = function(v0,v1) {
        return v0[0] * v1[0] + v0[1] * v1[1];
    };

    // multiply vector by scalar, return new vector
    vec2.mult = function(v,s) {
        return [ v[0]*s, v[1]*s ];
    };

    // return squared length of a vector
    vec2.length2 = function(v) {
        return vec2.dot(v,v);
    };

    // length of a vector
    vec2.length = function(v) {
        return Math.sqrt(vec2.dot(v,v));
    };

    // project a point onto a line defined by two points.
    // return scalar parameter of where point p is projected
    // onto the line. the line segment between p0 and 01
    // corresponds to the value range [0:1]
    vec2.projectPointOnLine = function(p, p0,p1) {

        var dp = vec2.sub(p,p0);
        var dv = vec2.sub(p1,p0);
        var t  = vec2.dot(dp,dv)/vec2.dot(dv,dv);
        return t;

    };

    //check, if mouse is on circle-border
    vec2.projectPointOnCircle = function(p, p0,radius) {
        // subtract current mouse-position from the center of the CircleClass
        var subtracted_vector = vec2.sub(p0,p);
        //get length of subtracted_vector
        var dist_to_point = vec2.length(subtracted_vector);
        console.log("p0: " + p0 + "| p: " + p + "| dist_to_point: " + dist_to_point + "| radius: " + radius);
        // check, if dist_to_point is on the circles border (+ - 5 px)
        if(dist_to_point < radius+5 && dist_to_point > radius-5){
          return true;
        }
        return false;
    };


        //check, if mouse is on point
        vec2.projectPointOnPoint = function(p, p0,radius) {
            // subtract current mouse-position from the center of the CircleClass
            var subtracted_vector = vec2.sub(p0,p);
            //get length of subtracted_vector
            var dist_to_point = vec2.length(subtracted_vector);
            console.log("p0: " + p0 + "| p: " + p + "| dist_to_point: " + dist_to_point + "| radius: " + radius);
            // check, if dist_to_point is on the circles border (+ - 5 px)
            if(dist_to_point < radius+7){
              return true;
            }
            return false;
        };

    // this module exports an object defining a number of functions
    return vec2;

})); // define
