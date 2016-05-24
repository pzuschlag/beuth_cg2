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
    (function (util, vec2, Scene, PointDragger) {

        "use strict";

        /**
         *  A circle that can be dragged
         *  around by its center.
         *  Parameters:
         *  - point0 and point1: array objects representing [x,y] coordinates of start and end point
         *  - lineStyle: object defining width and color attributes for line drawing,
         *       begin of the form { width: 2, color: "#00FF00" }
         */

        var PointClass = function (point0, radius, lineStyle) {


            this.radius = radius || 7;
            // draw style for drawing the line
            this.lineStyle = lineStyle || {width: "8", color: "#0000AA"};

            // initial values in case either point is undefined
            this.center = point0 || [10, 10];
        };

        // draw this circle into the provided 2D rendering context
        PointClass.prototype.draw = function (context) {

            // draw actual circle
            context.beginPath();

            // set drawing style

            context.arc(this.center[0],this.center[1],this.radius,0,2*Math.PI);

            context.fillStyle = this.lineStyle.color;
            context.fill();
            context.lineWidth = this.lineStyle.width;
            context.strokeStyle = this.lineStyle.color;
            // actually start drawing
            context.stroke();

        };

        // test whether the mouse position is on this circle segment
        PointClass.prototype.isHit = function (context, pos) {

            // project point on circle, get parameter of that projection point
            var hit_status = vec2.projectPointOnPoint(pos, this.center, this.radius);
            console.log("hit_status:", hit_status);
            if(hit_status){
              return true;
            }
            return false;

        };



        // return list of draggers to manipulate this circle
        PointClass.prototype.createDraggers = function () {


            var draggers = [];
            //all style-settings need to be transfered to the point_dragger Class
            var draggerStyle = {radius: 4, color: this.lineStyle.color, width: 0, fill: true}

            // create closure and callbacks for dragger
            var _PointClass = this;
            //Just getP0, because we just handle the center of the circle
            var getP0 = function () {
                return _PointClass.center;
            };

            var setP0 = function (dragEvent) {
                _PointClass.center = dragEvent.position;
            };


            //------------ Methods for Color and StrokeWidth -----

            var setColor = function(color) {

              _PointClass.lineStyle.color = color;
            };


            // call the PointDragger-Constructor
            draggers.push(new PointDragger(getP0, setP0, draggerStyle));

            return draggers;

        };


        // this module only exports the constructor for Circle objects
        return PointClass;

    })); // define
