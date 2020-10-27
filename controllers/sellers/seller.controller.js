const express = require('express');
const router = express.Router();
const sellerService = require('./seller.service');
var _ = require('lodash');
var validator = require('validator');




// routes
router.get('/getAll', getAll);
router.get('/detail', detail);
router.get('/searchByLocation', searchByLocation);

router.get('/search', search);
router.post('/add', add); //  add seller
router.post('/update', updateSeller);//  update seller
router.post('/updateLocation', updateLocation);

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
        // areaid
        // agent id  
        if (!_.isEmpty(req.headers.agentid)) {
            sellerService.getAll(req)
                .then(sellers => res.status(sellers.status).json(sellers.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });

        }
    } catch (e) {
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}
function searchByLocation(req, res, next) {
    try {
        if (!_.isEmpty(req.headers.agentid)) {
            sellerService.searchByLocation(req)
                .then(sellers => res.status(sellers.status).json(sellers.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
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
function search(req, res, next) {

    try {
        console.log(`req.query  =`, req.query);
        req['session']['agentId'] = '1';// will be deleted in later phase
        if (!_.isEmpty(req.session.agentId) && req.query.id != undefined) {
            var search = req.query.search;

            sellerService.search(search)
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
function add(req, res, next) {

    try {
        if (!_.isEmpty(req.headers.agentid)) {
            sellerService.add(req)
                .then(detail => res.status(detail.status).json(detail.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}


/** Update Seller */
function updateSeller(req, res, next) {

    try {
        if (!_.isEmpty(req.headers.agentid)) {
            sellerService.updateSellerInfo(req)
                .then(detail => res.status(detail.status).json(detail.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}
function updateLocation(req, res, next) {

    try {
        if (!_.isEmpty(req.headers.agentid)) {
            sellerService.updateLocation(req)
                .then(detail => res.status(detail.status).json(detail.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}
