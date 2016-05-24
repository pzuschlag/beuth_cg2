/* requireJS module definition */
define(["util", "vec2", "Scene"],
    (function(util, vec2, Scene) {

        "use strict";

        var ParametricCurve = function(fx, fy, t_min, t_max, line_segments, lineStyle) {

            this.fx = fx || "150+150*Math.sin(t)";
            this.fy = fy || "150+150*Math.cos(t)";
            this.t_min = t_min || "0";
            this.t_max = t_max || "6.28";
            this.line_segments = line_segments || "10";

            this.segmentsShown = undefined;
            this.isDragger = false;
            // draw style for drawing the line
            this.lineStyle = lineStyle || {
                width: "8",
                color: "#0000AA"
            };
        };


        ParametricCurve.prototype.draw = function(context, segmentsShown) {
            this.pointList = [];
            var step = (this.t_max - this.t_min) / this.line_segments;
            //console.log("step: ", step);
            for (var i = 0; i < this.line_segments; i++) {
                var t = this.t_min + i * step;
                try {
                    this.pointList.push([eval(this.fx), eval(this.fy)]);
                } catch (e) {
                    alert(e);
                }
            }

            context.beginPath();
            var firstPoint = this.pointList[0];
            context.moveTo(firstPoint[0], firstPoint[1]); //x and y of the first point in the pointlist

            for (var i = 1; i < this.pointList.length; i++) {
                context.lineTo(this.pointList[i][0], this.pointList[i][1]);
            }
            context.lineWidth = this.lineStyle.width;
            context.strokeStyle = this.lineStyle.color;
            context.moveTo(firstPoint[0], firstPoint[1]);
            context.stroke();


            if (this.segmentsShown) {
                context.beginPath();
                for (var i = 1; i < this.pointList.length - 1; i++) { //vector between both neighbors of target-point
                    var n_vector = vec2.sub(this.pointList[(i + 1)], this.pointList[(i - 1)]);
                    //normal to the n_vector
                    var normal = [n_vector[1] * (-1), n_vector[0]]; //normal of [x,y] = [-y, xs]
                    //direction of normal
                    var normalized_normal = vec2.mult(normal, (1 / vec2.length(normal)));
                    var start_point = vec2.add(this.pointList[i], vec2.mult(normalized_normal, 7));
                    var end_point = vec2.sub(this.pointList[i], vec2.mult(normalized_normal, 7));
                    context.moveTo(start_point[0], start_point[1]);
                    context.lineTo(end_point[0], end_point[1]);
                }
                context.lineWidth = 1;
                context.strokeStyle = "red";
                context.stroke();
            }
        };

        // test whether the mouse position is on this circle segment
        ParametricCurve.prototype.isHit = function(context, pos) {

            // project point on circle, get parameter of that projection point
            var t = 0;
            for (var i = 0; i < this.pointList.length - 1; i++) {
                // project point on line, get parameter of that projection point
                t = vec2.projectPointOnLine(pos, this.pointList[i], this.pointList[i + 1]);

                // inside the line segment?
                if (t >= 0 && t <= 1) {
                    // coordinates of the projected point
                    var p = vec2.add(this.pointList[i], vec2.mult(vec2.sub(this.pointList[i + 1], this.pointList[i]), t));

                    // distance of the point from the line
                    var distance = vec2.length(vec2.sub(p, pos));

                    // allow 2 pixels extra "sensitivity"
                    if (distance <= (this.lineStyle.width / 2) + 2) {
                        return true;
                    }
                }
            }
            // if no segment matches, return false
            return false;
        };


        // return list of draggers to manipulate this circle
        ParametricCurve.prototype.createDraggers = function() {
            var draggers = [];
            return draggers;
        };
        // this module only exports the constructor for Circle objects
        return ParametricCurve;

    })); // define
