/*
 * JavaScript / Canvas teaching framwork
 * (C)opyright Kristian Hildebrand, khildebrand@beuth-hochschule.de
 *
 * Module: KdUtil
 *
 * Loose collection of helper functions
 *
 */


/* requireJS module definition */
define([], (function() {

    "use strict";

    // start with an empty object
    var KdUtil = {};


    /**
     * traverses tree and and adds bounding boxes to scene
     * Note: licky hacky
     *
     * @param sceneController - just passed down the tree
     * @param scene - just passed down the tree
     * @param node
     * @param dim
     * @param start
     * @param end
     * @param left
     */
    KdUtil.visualizeKdTree = function(sceneController, scene, node, dim, start, end, left) {

        var style = {
            width: 1,
            color: "#0000ff"
        };

        scene.addObjects([node.bbox]);
        // deselect all objects, then select the newly created object
        sceneController.deselect();
        var nextDim = (dim === 0) ? 1 : 0;
        if (node.rightChild) {
            KdUtil.visualizeKdTree(sceneController, scene, node.rightChild, nextDim, node.point.center[dim], end, left);
        }
        if (node.leftChild) {
            KdUtil.visualizeKdTree(sceneController, scene, node.leftChild, nextDim, start, node.point.center[dim], left);
        }

    };

    /**
     * Linear search over all points
     *
     * @param pointList
     * @param queryPoint
     */
    KdUtil.linearSearch = function(pointList, queryPoint) {

      var minDistance = Number.MAX_VALUE;
             var minIdx = 0;
             for( var i=0; i<pointList.length; ++i) {
                 var distance = KdUtil.distance(pointList[i].center, queryPoint.center);
                 if( distance < minDistance ) {
                     minIdx = i;
                     minDistance = distance;
                 }
             }
             return minIdx;

    };


    /**
     * compute euclidean distance between two points
     *
     * @param p0
     * @param p1
     * @returns {number}
     */
    KdUtil.distance = function(p0, p1) {
        return Math.sqrt((p0[0] - p1[0]) * (p0[0] - p1[0]) + (p0[1] - p1[1]) * (p0[1] - p1[1]));
    };

    /**
     * computes median by sorting points along current axis
     * and returning the mid point index
     * IMPORTANT: values are sorted in place, so pointlist is
     *            unsorted on input (by reference) and sorted
     *            we work with the sorted list from the outside
     *
     * @param values - pointlist
     * @param dim - current axis
     * @returns int - index in array
     */
    KdUtil.sortAndMedian = function(values, dim) {
        // return a.center[dim] - b.center[dim]; heißt:
        //in absteigender Reihenfolge, dim ist immer 0 oder 1,
        //es wird also abwechselnd x und y verglichen
        values.sort(function(a, b) {
            return a.center[dim] - b.center[dim];
        });

        var half = Math.floor(values.length / 2);

        return half;
    };

    return KdUtil;

})); // require
