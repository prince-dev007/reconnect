const express = require('express');
const router = express.Router();
const areaService = require('./area.service');
var _ = require('lodash');

// routes
router.get('/getAll', getAll);
router.get('/detail', detail);

module.exports = router;


/**
 * This function is used to disply all sellers
 * @param {*} req Blank
 * @param {*} res json body of agent details
 * @param {*} next 
 * @author Rohit Ramawat 
 * @since 12/17/2019
 * @version 1
 * @email rohit.ramawat@zoxima.com
 */
function getAll(req, res, next) {
    try {

        if (!_.isEmpty(req.headers.agentid)) {
            areaService.getAll(req)
                .then(sellers => res.status(sellers.status).json(sellers.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

/**
 * This function is used to get seller details
 * @param {*} req seller id
 * @param {*} res json body of seller details
 * @param {*} next 
 * @author Rohit Ramawat 
 * @since 12/17/2019
 * @version 1
 * @email rohit.ramawat@zoxima.com
 */
function detail(req, res, next) {

    try {
        console.log(`req.query  =`, req.query);
        req['session']['agentId'] = '1';// will be deleted in later phase
        if (!_.isEmpty(req.session.agentId) && req.query.id != undefined) {
            var sellerId = req.query.id;

            sellerService.detail(sellerId)
                .then(detail => res.json(detail))
                .catch(err => next(err));
        } else {
            console.log(`Info:::  Invalid session id`);
            res.json({ 'success': false, 'error': 'Mandatory parameter(s) are missing.' });
        }
    } catch (e) {
        res.json({ 'success': false, 'error': e });
    }


}
