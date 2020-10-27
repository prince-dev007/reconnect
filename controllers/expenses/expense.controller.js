const express = require('express');
const router = express.Router();
var _ = require('lodash');
const expenseService = require('./expense.service');

// routes

router.get('/getAll', getAll);
router.post('/add', addExpense);
// router.post('/updateExpense', updateExpense);
router.post('/approveRejectExpence', approveRejectExpence);
router.post('/sendingForApproval', sendingForApproval);
router.post('/updateEmailStatus', updateEmailStatus);
// router.post('/placeOrder', placeOrder);
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

            expenseService.getAll(req)
                .then(expenses => res.status(expenses.status).json(expenses.response))
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
// function updateExpense(req, res, next) {
//     try {
        
//         if (!_.isEmpty(req.headers.agentid) && req.query.id != undefined) {
//             expenseService.updateExpense(req)
//                 .then(expenses => res.status(expenses.status).json(expenses.response))
//                 .catch(err => next(err));
//         } else {
//             res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
//         }
//     } catch (e) {
//         console.log(`Error(catch):::: `,e);
//         res.status(500).json({ "success": false, "error": "Internal server error." });
//     }
// }

function addExpense(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            expenseService.addExpense(req)
                .then(expenses => res.status(expenses.status).json(expenses.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(`Error(catch):::: `,e);
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

function approveRejectExpence(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            expenseService.approveRejectExpence(req)
                .then(expenses => res.status(expenses.status).json(expenses.response))
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
            expenseService.sendingForApproval(req)
                .then(expenses => res.status(expenses.status).json(expenses.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(`Error(catch):::: `,e);
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}



function updateEmailStatus(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            expenseService.updateEmailStatus(req)
                .then(expenses => res.status(expenses.status).json(expenses.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(`Error(catch):::: `,e);
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

