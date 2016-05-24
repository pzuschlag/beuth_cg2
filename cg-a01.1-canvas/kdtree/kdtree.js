/*
 * JavaScript / Canvas teaching framwork
 * (C)opyright Kristian Hildebrand, khildebrand@beuth-hochschule.de
 *
 * Module: KdTree
 *
 *
 */


/* requireJS module definition */
define(["KdUtil", "KdNode", "vec2", "Scene", "BoundingBox"],
    (function(KdUtil, KdNode, vec2, Scene, BoundingBox) {

        "use strict";

        /**
         * Creates a kd-tree. The build function is directly called
         * on generation
         *
         * @param pointList
         * @constructor
         */
        var KdTree_Class = function(pointList) {

            //hier den Median suchen, aus der pointList holen...
            /**
             *
             * @param pointList - list of points
             * @param dim       - current axis
             * @param parent    - current parent (starts with root)
             * @param isLeft    - flag if node is left or right child of its parent
             * @returns returns root node after tree is build
             */
            this.build = function(pointList, dim, parent, isLeft) {
                /*if (parent) {
                    console.log("parent: " + parent.point.center[0] + " | " + parent.point.center[1]);
                };*/

                if (pointList.length === 0) return;

                var axis = dim === 0 ? 1 : 0;

                // Note: We need to compute the bounding box for EACH new 'node'
                //       to be able to query correctly

                //<Neuen Knoten im Baum erzeugen>
                var node = new KdNode(dim);
                var median = KdUtil.sortAndMedian(pointList, node.dim);
                //console.log("median: " + median);
                //console.log("median: " + median + " | pointList[median]: " + pointList[median].center[0]);
                /*
                 * xmin, ymin, xmax, ymax, point, dim
                 */
                var xMin, xMax, yMin, yMax;
                if (!parent) {
                    console.log("0, null", parent);
                    xMin = 0;
                    yMin = 0;
                    xMax = 500;
                    yMax = 400;
                } else {
                    if (dim === 0) {
                        if (isLeft) {
                            xMin = parent.bbox.xmin;
                            yMin = parent.bbox.ymin;
                            xMax = parent.bbox.xmax;
                            yMax = parent.point.center[1];
                        } else {
                            xMin = parent.bbox.xmin;
                            yMin = parent.point.center[1];
                            xMax = parent.bbox.xmax;
                            yMax = parent.bbox.ymax;
                        }
                    } else {
                        if (isLeft) {
                            xMin = parent.bbox.xmin;
                            yMin = parent.bbox.ymin;
                            xMax = parent.point.center[0];
                            yMax = parent.bbox.ymax;
                        } else {
                            xMin = parent.point.center[0];
                            yMin = parent.bbox.ymin;
                            xMax = parent.bbox.xmax;
                            yMax = parent.bbox.ymax;
                        }
                    }
                }

                node.bbox = new BoundingBox(xMin, yMin, xMax, yMax, pointList[median], dim);



                //<set node.point>
                node.point = pointList[median];


                //<Berechne Bounding Box des Unterbaumes / node.bbox >

                //<Extrahiere Punkte für die linke Unterbaumhälfte>
                node.leftChild = this.build(pointList.slice(0, median), axis, node, true);
                //<Extrahiere Punkte für die rechte Unterbaumhälfte>
                node.rightChild = this.build(pointList.slice(median + 1), axis, node, false);


                return node;

            };

            /**
             * Given a query point the function return its nearest neighbor by traversing
             * down the tree
             *
             * @param node - current tree node
             * @param query - query node
             * @param nearestDistance - current nearest distance to query node
             * @param currentBest - current best/nearest node to query node
             * @param dim - current axis (x or y)
             * @returns closest tree node to query node
             */
            this.findNearestNeighbor = function(node, query, currentBest, nearestDistance, dim) {

                if (!node) {
                    return currentBest;
                }

                var closest = currentBest;
                var closestDistance = nearestDistance;

                var dist = KdUtil.distance(node.point.center, query.center);
                if (dist < nearestDistance) {
                    closestDistance = dist;
                    closest = node;
                }

                var a, b;
                if (dim == 0) {
                    if (query.center[0] < node.point.center[0]) {
                        a = node.leftChild;
                        b = node.rightChild;
                    } else {
                        a = node.rightChild;
                        b = node.leftChild;
                    }
                } else {
                    if (query.center[1] < node.point.center[1]) {
                        a = node.leftChild;
                        b = node.rightChild;
                    } else {
                        a = node.rightChild;
                        b = node.leftChild;
                    }
                }

                var nextDim = (dim === 0) ? 1 : 0;
                if (a && a.bbox.distanceTo(query.center) < closestDistance) {
                    closest = this.findNearestNeighbor(a, query, closest, closestDistance, nextDim);
                    closestDistance = KdUtil.distance(closest.point.center, query.center);
                }

                if (b && b.bbox.distanceTo(query.center) < closestDistance) {
                    closest = this.findNearestNeighbor(b, query, closest, closestDistance, nextDim);
                }

                return closest;
            };


            //
            this.root = this.build(pointList, 0, null, undefined);
            console.log(" this is the root: ", this.root);

        };

        return KdTree_Class;


    })); // define
