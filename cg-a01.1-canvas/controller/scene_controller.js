/*
 * JavaScript / Canvas teaching framwork
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 * changes by Kristian Hildebrand, khildebrand@beuth-hochschule.de
 *
 * Module: scene_controller
 *
 * This module defines a constructor function SceneController.
 *
 * A SceneController object takes events on the canvas object
 * and maps them to events for the scene objects. The controller
 * takes the drawing/depth order into account, defines
 * high-level events like "mouse drag", and handles the selection
 * and deselection of objects.
 *
 * The SceneController requires objects to be rendered to
 * have the following attributes:
 *
 * - isDragger [Boolean attribute]
 *     distinguish normal objects from draggers
 *
 * - isHit(pos) [returns Boolean, optional]
 *     tell whether the object is "hit" by the provided mouse position.
 *
 * - createDraggers() [returns array of dragger objects]
 *     creates a set of draggers that can control the object
 *
 * - mouseDown(clickEvent) [optional event handler]
 *
 * - mouseDrag(dragEvent)  [optional event handler]
 *
 * - mouseUp(clickEvent)   [optional event handler]
 *
 *
 */


/* requireJS module definition */
define(["util", "Scene", "jquery", "Circle", "Line", "Point", "ParametricCurve", "BezierCurve"],
    (function(util, Scene, $, Circle, Line, PointClass, ParametricCurve, BezierCurve) {

        "use strict";

        /*
         * A SceneController handles events on the canvas and triggers
         * the respective actions on objects in the scene.
         *
         * Parameters:
         * - context:
         *        the canvas' 2D rendering context
         * - scene:
         *        an object with a draw() method used to trigger a redraw
         */

        var SceneController = function(context, scene) {

            this.context = context || util.fatalError("Dragger: no context");
            this.canvas = context.canvas || util.fatalError("Dragger: no canvas");
            this.scene = scene || util.fatalError("Dragger: no scene");
            this.isDragging = false; // are we currently in dragging mode?
            this.dragObj = null; // which object is currently active?
            this.dragStartPos = [0, 0]; // position when dragging was started
            this.dragLastPos = [0, 0]; // last position used in dragging
            this.selected = []; // list of selected objects and their draggers
            this.selectCallback = null; // function to be called with currently selected obj
            this.changeCallback = null; // function to be called with currently selected obj

            // create event handlers with a closure containing
            // "tool" as a reference to this dragger
            var _controller = this;
            this.canvas.addEventListener('mousedown', (function(ev) {
                ev.preventDefault();
                _controller.mousedown(ev);
            }), false);
            this.canvas.addEventListener('mousemove', (function(ev) {
                ev.preventDefault();
                _controller.mousemove(ev);
            }), false);
            this.canvas.addEventListener('mouseup', (function(ev) {
                ev.preventDefault();
                _controller.mouseup(ev);
            }), false);
        };

        /*
         *  Register a callback function for whenever the selection changes,
         *  The callback function will be called with one parameter,
         *  which is the currently selected object.
         *
         */
        SceneController.prototype.onSelection = function(func) {
            this.selectCallback = func;
        };

        /*
         *  Register a callback for whenever an object is manipulated,
         *  The callback function will be called with one parameter,
         *  which is the currently selected object.
         *
         */
        SceneController.prototype.onObjChange = function(func) {
            this.changeCallback = func;
        };

        /*
         * return currently selected object or null
         */
        SceneController.prototype.getSelectedObject = function() {

            var selected_obj = this.selected[0];

            if (selected_obj) {
                return selected_obj.obj;
            } else {
                return null;
            }
        };


        /*
         * select an object by creating its draggers
         * and adding them to the scene
         */
        SceneController.prototype.select = function(obj) {

            if (!obj) {
                throw new Error("SceneController.select(): no object provided");
            }
            this.onSelection(this.get_values_of_obj);
            this.onObjChange(this.get_values_of_obj);

            if (obj instanceof Circle) {

                $('#circle_radius_wrapper').show();
            } else {
                $('#circle_radius_wrapper').hide();
            }
            //onSelect
            // let the object create its draggers
            var draggers = obj.createDraggers();


            // store object and its draggers in an internal list
            this.selected.push({
                "obj": obj,
                "draggers": draggers
            });

            // add draggers as scene objects so they get rendered
            this.scene.addObjects(draggers);

            // if it exists, trigger onSelection callback
            this.selectCallback && this.selectCallback(obj);

            // redraw
            this.scene.draw(this.context);

        };


        /*
         * deselect an object by destroying its draggers and
         * removing them from the scene
         * obj is optional: if undefined/null, deselect all objects
         */
        SceneController.prototype.deselect = function(obj) {

            // go backwards through list of currently selected objects
            for (var i = this.selected.length - 1; i >= 0; i -= 1) {

                // if no obj is specified, or if this object matches...
                if (!obj || this.selected[i].obj == obj) {

                    // remove draggers from scene
                    this.scene.removeObjects(this.selected[i].draggers);
                    // remove object from list
                    this.selected.splice(i, 1);
                }
            }

            // redraw
            this.scene.draw(this.context);
        };

        /*
         * Event handler: mouse button is pressed down.
         * --> determine which object is hit,
         *     remember it as the currently active object,
         *     and remember mouse position
         */
        SceneController.prototype.mousedown = function(event) {

            // get relative mouse position within canvas
            var pos = util.canvasPosition(event);


            // go through all scene elements in front-to-back order
            var objs = this.scene.getObjects("front-to-back");
            for (var i = 0; i < objs.length; i += 1) {

                // determine if object is right under the mouse cursor
                var obj = objs[i];
                if (obj.isHit && obj.isHit(this.context, pos)) {

                    // if so, the first object wins
                    this.dragObj = obj;
                    this.dragStartPos = pos;
                    this.dragLastPos = pos;

                    // if the object is not a dragger, then select it
                    if (!obj.isDragger) {
                        // select the object, deselect others
                        this.deselect();
                        this.select(obj);
                    }

                    // call the object's handler function, if existing
                    var clickEvent = {
                        "position": pos
                    };
                    this.isDragging = true;
                    obj.mouseDown && obj.mouseDown(clickEvent);

                    // redraw the scene
                    this.scene.draw(this.context);
                    return;
                }
            }

            // no foreground element was hit
            this.dragObj = null;

            // note: if you want the background of the scene to be clickable,
            // simply add a scene-filling rectangle.

        };

        /*
         * Event handler: called whenever mouse is moving
         * (with buttons up or down, regardless)
         */
        SceneController.prototype.mousemove = function(event) {

            // get relative mouse position within canvas
            var pos = util.canvasPosition(event);

            // only do something if the mouse was previously pressed down
            if (this.isDragging) {

                // difference of current and last position
                var deltax = pos[0] - this.dragLastPos[0];
                var deltay = pos[1] - this.dragLastPos[1];


                // call the object's handler function, if existing
                var dragEvent = {
                    "position": pos,
                    "delta": [deltax, deltay]
                };
                this.dragObj.mouseDrag && this.dragObj.mouseDrag(dragEvent);

                // remember current position
                this.dragLastPos = pos;

                // some parameter of the object may have changed...
                this.changeCallback && this.changeCallback(this.getSelectedObject());

                // redraw the scene
                this.scene.draw(this.context);
                return;

            } else {

                // if mouse is hovering: do nothing
                // note: should add active mouse cursors here!!!
            }

        };

        // Event handler: called when mouse button is released
        SceneController.prototype.mouseup = function(event) {

            // call one last mouse move in case the position has changed
            this.mousemove(event);

            // get relative mouse position within canvas
            var pos = util.canvasPosition(event);

            // call mouseUp event handler of object
            var clickEvent = {
                "position": pos
            };
            this.dragObj && this.dragObj.mouseUp && this.dragObj.mouseUp(clickEvent);

            // reset dragging status
            this.isDragging = false;
        };


        SceneController.prototype.get_values_of_obj = function(obj) {

            //prevent entrys in the fields that are only to show the values
            $('#p0_div, #p1_div, #length_div').keydown(function(e) {
                e.preventDefault();
                return false;
            });

            // values every object has in common
            var values = {

                width: obj.lineStyle.width,
                color: obj.lineStyle.color
            };

            //values only in Line
            if (obj instanceof Line) {
                values.p0 = obj.p0,
                    values.p1 = obj.p1;
                values.length = obj.length; //ggf hier nochmal berechnen - vec2 importieren!!!!!
                $('#p1_div').show();
                $('#length_div').show();
                $('#p1_div').val("p1: " + values.p1[0] + " | " + values.p1[1]);
                $('#length_div').val("length: " + values.length);
                $('#p0_div').val("p0: " + values.p0[0] + " | " + values.p0[1]);
            }
            //values only in CircleClass
            else if (obj instanceof Circle) {
                values.p0 = obj.p0,
                    values.radius = obj.radius;
                $('#p1_div').hide();
                $('#length_div').hide();
                $('#circle_radius_input').val(values.radius);
                $('#p0_div').val("p0: " + values.p0[0] + " | " + values.p0[1]);
            }
            //values in PointClass..
            else if (obj instanceof PointClass) {
                values.p0 = obj.center,
                    $('#p1_div').hide();
                $('#length_div').hide();
                $('#p0_div').val("p0: " + values.p0[0] + " | " + values.p0[1]);
            }
            //set values to the entry-fields
            $('#stroke_input').val(values.width);
            $('#color_input').val(values.color);

            return values;
        };

        // this module exposes only the constructor function
        return SceneController;

    })); // define
