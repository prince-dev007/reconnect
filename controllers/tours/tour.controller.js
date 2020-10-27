const express = require('express');
const router = express.Router();
var _ = require('lodash');
const tourService = require('./tour.service');

// routes

router.get('/getAll', getAll);
router.post('/create', create);
router.post('/updateTour', updateTour);
router.post('/approveRejectTour', approveRejectTour);
router.post('/sendingForApproval', sendingForApproval);
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

            tourService.getAll(req)
                .then(tours => res.status(tours.status).json(tours.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}


/**
 * This function is used to disply meeting detail
 * @param {*} req meeting id
 * @param {*} res json body of meeting detail
 * @param {*} next 
 * @author Rohit Ramawat 
 * @since 12/17/2019
 * @version 1
 * @email rohit.ramawat@zoxima.com
 */
function updateTour(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid) && req.query.id != undefined) {
            tourService.updateTour(req)
                .then(tours => res.status(tours.status).json(tours.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(`Error(catch):::: `,e);
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}
function create(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            tourService.create(req)
                .then(tours => res.status(tours.status).json(tours.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(`Error(catch):::: `,e);
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

function approveRejectTour(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            tourService.approveRejectTour(req)
                .then(tours => res.status(tours.status).json(tours.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(`Error(catch):::: `,e);
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}
function sendingForApproval(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            tourService.sendingForApproval(req)
                .then(tours => res.status(tours.status).json(tours.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(`Error(catch):::: `,e);
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

