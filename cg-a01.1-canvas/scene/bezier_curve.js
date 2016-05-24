/* requireJS module definition */
define(["util", "vec2", "Scene", "PointDragger"],
    (function(util, vec2, Scene, PointDragger) {

        "use strict";

        var BezierCurve = function(point_0, point_1, point_2, point_3, line_segments, lineStyle) {

            this.point_0 = point_0 || [10, 10];
            this.point_1 = point_1 || [10, 250];
            this.point_2 = point_2 || [250, 10];
            this.point_3 = point_3 || [250, 250];

            this.line_segments = line_segments || 10;
            this.t_min = 0;
            this.t_max = 1;

            this.segmentsShown = undefined;
            this.isDragger = false;

            // draw style for drawing the line
            this.lineStyle = lineStyle || {
                width: "8",
                color: "#0000AA"
            };

            // bernstein polynoms
            this.bp_0 = function(t) {
                return Math.pow(1 - t, 3);
            };

            this.bp_1 = function(t) {
                return 3 * Math.pow(1 - t, 2) * t;
            };

            this.bp_2 = function(t) {
                return 3 * (1 - t) * Math.pow(t, 2);
            };

            this.bp_3 = function(t) {
                return Math.pow(t, 3);
            };

            //function of bezier curve with the polygon points and polynoms
            this.bezierCurve = function(coordinate, t) {
                return (this.bp_0(t) * this.point_0[coordinate]) +
                    (this.bp_1(t) * this.point_1[coordinate]) +
                    (this.bp_2(t) * this.point_2[coordinate]) +
                    (this.bp_3(t) * this.point_3[coordinate]);
            };

        };


        BezierCurve.prototype.draw = function(context) {
            //calculating the Points
            this.pointList = [];
            this.pointList.push([this.point_0[0], this.point_0[1]]);
            for (var i = 1; i <= this.line_segments; i++) {
                var t = 1 / this.line_segments * i;
                var px = this.bezierCurve(0, t);
                var py = this.bezierCurve(1, t);
                this.pointList.push([px, py]);
            }

            context.beginPath();
            var firstPoint = this.pointList[0];
            context.moveTo(firstPoint[0], firstPoint[1]);

            // draw curve
            for (var i = 1; i < this.pointList.length; i++) {
                context.lineTo(this.pointList[i][0], this.pointList[i][1]);
            }
            context.moveTo(this.point_0[0], this.point_0[1]);
            context.lineTo(this.point_1[0], this.point_1[1]);
            context.moveTo(this.point_1[0], this.point_1[1]);
            context.lineTo(this.point_2[0], this.point_2[1]);
            context.moveTo(this.point_2[0], this.point_2[1]);
            context.lineTo(this.point_3[0], this.point_3[1]);
            context.moveTo(this.point_3[0], this.point_3[1]);


            context.lineWidth = this.lineStyle.width;
            context.strokeStyle = this.lineStyle.color;
            context.stroke();

            if (this.segmentsShown) {
                context.beginPath();
                for (var i = 1; i < this.pointList.length - 1; i++) {
                    //vector between both neighbors of target-point
                    var n_vector = vec2.sub(this.pointList[(i + 1)], this.pointList[(i - 1)]);
                    console.log("n_vector: ", n_vector);
                    //normal to the n_vector
                    var normal = [n_vector[1] * (-1), n_vector[0]]; //normal of [x,y] = [-y, xs]

                    var normalized_normal = vec2.mult(normal, (1 / vec2.length(normal)));

                    var start_point = vec2.add(this.pointList[i], vec2.mult(normalized_normal, 7));
                    var end_point = vec2.sub(this.pointList[i], vec2.mult(normalized_normal, 7));

                    context.moveTo(start_point[0], start_point[1]);
                    context.lineTo(end_point[0], end_point[1]);
                }
                context.moveTo(firstPoint[0], firstPoint[1]);
                context.lineWidth = 1;
                context.strokeStyle = "red";
                context.stroke();
            }

        };

        // test whether the mouse position is on this circle segment
        BezierCurve.prototype.isHit = function(context, pos) {

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
        BezierCurve.prototype.createDraggers = function() {

            var draggerStyle = {
                radius: 4,
                color: this.lineStyle.color,
                width: 0,
                fill: true
            };
            var self = this;

            var getPoint0 = function() {
                return self.point_0;
            };
            var getPoint1 = function() {
                return self.point_1;
            };
            var getPoint2 = function() {
                return self.point_2;
            };
            var getPoint3 = function() {
                return self.point_3;
            };
            var setPoint0 = function(ev) {
                self.point_0 = ev.position;
            };
            var setPoint1 = function(ev) {
                self.point_1 = ev.position;
            };
            var setPoint2 = function(ev) {
                self.point_2 = ev.position;
            };
            var setPoint3 = function(ev) {
                self.point_3 = ev.position;
            };

            return [
                new PointDragger(getPoint0, setPoint0, draggerStyle),
                new PointDragger(getPoint1, setPoint1, draggerStyle),
                new PointDragger(getPoint2, setPoint2, draggerStyle),
                new PointDragger(getPoint3, setPoint3, draggerStyle)
            ];
        };

        // this module only exports the constructor for Circle objects
        return BezierCurve;

    })); // define
