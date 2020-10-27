const express = require('express');
const router = express.Router();
const dashboardService = require('./dashboard.service');
var _ = require('lodash');

// routes

// router.get('/getAll', getAll);
// router.get('/psm',psmDetail);
router.get('/getOrderValue',getOrderValue);
router.get('/getCounters',getCounters);
router.get('/getVisitCount',getVisitCount);
router.get('/getSiteCount',getSiteCount);
router.get('/getEventCount',getEventCount);

module.exports = router;

/**
 * This function is used to disply all meetings
 * @param {*} req Blank
 * @param {*} res json body of meeting list
 * @param {*} next 
 * @author Rohit Ramawat 
 * @since 12/17/2019
 * @version 1
 * @email rohit.ramawat@zoxima.com
 */
function getAll(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            dashboardService.getAll(req)
                .then(response => res.status(response.status).json(response.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

function psmDetail(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            dashboardService.psmDetail(req)
                .then(response => res.status(response.status).json(response.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}
function getOrderValue(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            dashboardService.getOrderValue(req)
                .then(response => res.status(response.status).json(response.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

function getCounters(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            dashboardService.getCounters(req)
                .then(response => res.status(response.status).json(response.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}
function getVisitCount(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            dashboardService.getVisitCount(req)
                .then(response => res.status(response.status).json(response.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

function getSiteCount(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            dashboardService.getSiteCount(req)
                .then(response => res.status(response.status).json(response.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}


function getEventCount(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            dashboardService.getEventCount(req)
                .then(response => res.status(response.status).json(response.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

