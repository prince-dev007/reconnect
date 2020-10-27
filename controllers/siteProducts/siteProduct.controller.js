const express = require('express');
const router = express.Router();
const eventService = require('./siteProduct.service');
var _ = require('lodash');

// routes

router.get('/getAll', getAll);
router.get('/detail', detail);
router.post('/add', add);
router.post('/edit', edit);
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

            eventService.getAll(req)
                .then(campaigns => res.status(campaigns.status).json(campaigns.response))
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
function detail(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid) && req.query.id != undefined) {
            eventService.detail(req)
                .then(campaignDetail => res.status(campaignDetail.status).json(campaignDetail.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(`Error(catch):::: `,e);
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}
/**
 * This function is used to add new meeting 
 * @param {*} req 
 * @param {*} res json body of meeting detail
 * @param {*} next 
 * @author Rohit Ramawat 
 * @since 12/17/2019
 * @version 1
 */
function add(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            eventService.add(req)
                .then(campaignDetail => res.status(campaignDetail.status).json(campaignDetail.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(`Error(catch):::: `,e);
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

function edit(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            eventService.edit(req)
                .then(campaignDetail => res.status(campaignDetail.status).json(campaignDetail.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(`Error(catch):::: `,e);
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

