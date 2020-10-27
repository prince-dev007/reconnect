const express = require('express');
const router = express.Router();
const cityService = require('./city.service');
var _ = require('lodash');

// routes

router.get('/getAll', getAll);

module.exports = router;

/**
 * This function is used to disply all cities
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

            cityService.getAll(req)
                .then(cities => res.status(cities.status).json(cities.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}
