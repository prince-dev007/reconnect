const express = require('express');
const router = express.Router();
const fileService = require('./file.service');
var _ = require('lodash');

// routes

router.get('/getVisitFiles', getVisitFiles);
router.get('/getExpenseItemFiles', getExpenseItemFiles);
router.get('/getExpenseFiles', getExpenseFiles);
router.post('/addAttachment', addAttachment);

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
function getVisitFiles(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            fileService.getVisitFiles(req)
                .then(campaigns => res.status(campaigns.status).json(campaigns.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

function getExpenseItemFiles(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            fileService.getExpenseItemFiles(req)
                .then(campaigns => res.status(campaigns.status).json(campaigns.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

function getExpenseFiles(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            fileService.getExpenseFiles(req)
                .then(campaigns => res.status(campaigns.status).json(campaigns.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

function addAttachment(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            fileService.addAttachment(req,res);
                // .then(campaigns => res.status(campaigns.status).json(campaigns.response))
                // .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}


