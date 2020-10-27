const express = require('express');
const router = express.Router();
const orderLineService = require('./order-line.service');
var _ = require('lodash');

// routes

router.get('/getAll', getAll);

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

            orderLineService.getAll(req)
                .then(orders => res.status(orders.status).json(orders.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

