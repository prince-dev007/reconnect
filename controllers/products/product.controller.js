const express = require('express');
const router = express.Router();
const itemService = require('./product.service');
var _ = require('lodash');

// routes

router.get('/getAll', getAll);
router.get('/detail', detail);

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

            itemService.getAll(req)
                .then(orders => res.status(orders.status).json(orders.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}


function detail(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            itemService.detail(req)
                .then(orders => res.status(orders.status).json(orders.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}
