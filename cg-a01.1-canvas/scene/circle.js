/*
 * JavaScript / Canvas teaching framwork
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 * changes by Kristian Hildebrand, khildebrand@beuth-hochschule.de
 *
 * Module: circle
 *
 * A StraighLine knows how to draw itself into a specified 2D context,
 * can tell whether a certain mouse position "hits" the object,
 * and implements the function createDraggers() to create a set of
 * draggers to manipulate itself.
 *
 */


/* requireJS module definition */
define(["util", "vec2", "Scene", "PointDragger"],
    (function(util, vec2, Scene, PointDragger) {

        "use strict";

        /**
         *  A circle that can be dragged
         *  around by its center.
         *  Parameters:
         *  - point0 and point1: array objects representing [x,y] coordinates of start and end point
         *  - lineStyle: object defining width and color attributes for line drawing,
         *       begin of the form { width: 2, color: "#00FF00" }
         */

        var Circle = function(point0, radius, lineStyle) {


            this.radius = radius || 50;

            // draw style for drawing the line
            this.lineStyle = lineStyle || {
                width: "2",
                color: "#0000AA"
            };

            // initial values in case either point is undefined
            this.p0 = point0 || [10, 10];
        };

        // draw this circle into the provided 2D rendering context
        Circle.prototype.draw = function(context) {

            // draw actual circle
            context.beginPath();

            // set drawing style
            context.lineWidth = this.lineStyle.width;
            context.strokeStyle = this.lineStyle.color;
            context.arc(this.p0[0], this.p0[1], this.radius, 0, 2 * Math.PI);
            // actually start drawing
            context.stroke();

        };

        // test whether the mouse position is on this circle segment
        Circle.prototype.isHit = function(context, pos) {
            // project point on circle, get parameter of that projection point
            var hit_status = vec2.projectPointOnCircle(pos, this.p0, this.radius);
            //console.log("hit_status:", hit_status);
            if (hit_status) {
                return true;
            }
            return false;
        };


        // return list of draggers to manipulate this circle
        Circle.prototype.createDraggers = function() {
            var draggers = [];
            //all style-settings need to be transfered to the point_dragger Class
            var draggerStyle = {
                radius: 4,
                color: this.lineStyle.color,
                width: 0,
                fill: true
            }

            // create closure and callbacks for dragger
            var _CircleClass = this;
            //Just getP0, because we just handle the center of the circle
            var getPos = function() {
                  //console.log("_CircleClass.p0: ", _CircleClass.p0);
                return _CircleClass.p0;

            };

            var setPos = function(dragEvent) {
                _CircleClass.p0 = dragEvent.position;
            };

            //returns position on circle-border
            var getBorder = function() {
              var borderPos = parseFloat(_CircleClass.p0[1]) + parseFloat(_CircleClass.radius);
                return [_CircleClass.p0[0], borderPos];
            };

            //calculates the radius
            var setRadius = function(dragEvent) {
                _CircleClass.radius = vec2.length(vec2.sub(dragEvent.position, _CircleClass.p0));
            };
            // call the PointDragger-Constructor
            var centerDragger = new PointDragger(getPos, setPos, draggerStyle);
            var borderDragger = new PointDragger(getBorder, setRadius, draggerStyle);
            //console.log("centerDragger: ", centerDragger, " | borderDragger: ", borderDragger);
            draggers.push(centerDragger);
            draggers.push(borderDragger); //neuer zweiter dragger

            return draggers;
        };

        // this module only exports the constructor for Circle objects

        return Circle;

    })); // define
