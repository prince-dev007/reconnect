const express = require('express');
const router = express.Router();
const productService = require('./productCategory.service');
var _ = require('lodash');

// routes
router.get('/getAll', getAll);
router.get('/getAllSubCategory', getAllSubCategory);
router.get('/getAllSubSubCategory', getAllSubSubCategory);


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
        
        if (!_.isEmpty(req.headers.agentid)) {
            // Get details from database using agentId
            productService.getAll(req)
                .then(pCat => res.status(pCat.status).json(pCat.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}

function getAllSubCategory(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            // Get details from database using agentId
            productService.getAllSubCategory(req)
                .then(pCat => res.status(pCat.status).json(pCat.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}
function getAllSubSubCategory(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            // Get details from database using agentId
            productService.getAllSubSubCategory(req)
                .then(pCat => res.status(pCat.status).json(pCat.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}

