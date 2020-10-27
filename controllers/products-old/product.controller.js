const express = require('express');
const router = express.Router();
const productService = require('./product.service');
var _ = require('lodash');

// routes
router.get('/getAllProductCat', getAllProductCat);

router.get('/getAll', getAll);
router.get('/getAllProductGroup', getAllProductGroup);
router.get('/product', productDetail);
router.get('/search', search);

module.exports = router;


/**
 * This function is used to disply all products
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
        console.log(`req.query  =`, req.query);
        req['session']['agentId'] = '1';// will be deleted in later phase
        
        if (!_.isEmpty(req.session.agentId)) {
            // Get details from database using agentId
            productService.getAll(req)
                .then(users => res.json(users))
                .catch(err => next(err));
        } else {
            console.log(`Info:::  Invalid session id`);
        }
    } catch (e) {
        res.json({ 'success': false, 'error': e });
    }
}
function getAllProductCat(req, res, next) {
    try {
        console.log(`req.query  =`, req.query);
        req['session']['agentId'] = '1';// will be deleted in later phase
        
        if (!_.isEmpty(req.session.agentId)) {
            // Get details from database using agentId
            productService.getAll(req)
                .then(users => res.json(users))
                .catch(err => next(err));
        } else {
            console.log(`Info:::  Invalid session id`);
        }
    } catch (e) {
        res.json({ 'success': false, 'error': e });
    }
}

function getAllProductGroup(req, res, next) {
    try {
        req['session']['agentId'] = '1';// will be deleted in later phase
        
        if (!_.isEmpty(req.session.agentId)) {
            // Get details from database using agentId
            productService.getAllProductGroup(req)
                .then(productGroups => res.json(productGroups))
                .catch(err => next(err));
        } else {
            console.log(`Info:::  Invalid session id`);
        }
    } catch (e) {
        res.json({ 'success': false, 'error': e });
    }
}
/**
 * This function is used to disply agent details using agent id
 * @param {*} req agentId
 * @param {*} res json body of agent details
 * @param {*} next 
 * @author Rohit Ramawat 
 * @since 12/17/2019
 * @version 1
 * @email rohit.ramawat@zoxima.com
 */
function productDetail(req, res, next) {
    try {
        console.log(`req.query  =`, req.query);
        req['session']['agentId'] = '1';// will be deleted in later phase
        if (!_.isEmpty(req.session.agentId)) {
            var productId = '';
            if (req.query.id != undefined)
                productId = req.query.productId;
            productService.productDetail(productId)
                .then(products => res.json(products))
                .catch(err => next(err));
        } else {
            console.log(`Info:::  Invalid session id`);
        }
    } catch (e) {
        res.json({ 'success': false, 'error': e });
    }


}



function search(req, res, next) {
    try {
        console.log(`req.query  =`, req.query);
        req['session']['agentId'] = '1';// will be deleted in later phase
        if (!_.isEmpty(req.session.agentId)) {
            var search = '';
            if (req.query.search != undefined)
                search = req.query.search;
            productService.search(search)
                .then(products => res.json(products))
                .catch(err => next(err));
        } else {
            console.log(`Info:::  Invalid session id`);
        }
    } catch (e) {
        res.json({ 'success': false, 'error': e });
    }


}
