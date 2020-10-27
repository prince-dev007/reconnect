const express = require('express');
const router = express.Router();
var _ = require('lodash');
const expenseService = require('./expense-item.service');

// routes

router.get('/getAll', getAll);
router.post('/getAll', getAll);

router.get('/getAllLocalExpenseItem', getAllLocalExpense);
router.get('/getAllOutstationExpenseItem', getAllOutstationExpense);

router.post('/updateExpense', updateExpense);
router.post('/addRemark', addRemark);

router.post('/addExpenseItem', addExpenseItem);
router.post('/addExpenseItemNew', addExpenseItemNew);
router.post('/updateExpenseItem', updateExpenseItem);
router.post('/delete', deleteExpenseItem);

router.post('/updateStatus', updateStatus);
router.post('/moveToLocalExpense', moveToLocalExpense);
router.post('/moveToOutstationExpense', moveToOutstationExpense);
router.get('/expenseItemByTour', expenseItemByTour);



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

function getAllLocalExpense(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            expenseService.getAllLocalExpense(req)
                .then(expenses => res.status(expenses.status).json(expenses.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "You do not have authorised access." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "error": "Internal server error." });
    }
}

function getAllOutstationExpense(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {

            expenseService.getAllOutstationExpense(req)
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
function updateExpense(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid) && req.query.id != undefined) {
            expenseService.updateExpense(req)
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
function addRemark(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid) && req.query.id != undefined) {
            expenseService.addRemark(req)
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

function addExpenseItem(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid) && req.query.id != undefined) {
            expenseService.addExpenseItem(req)
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

function addExpenseItemNew(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            expenseService.addExpenseItemNew(req)
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

function updateExpenseItem(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid) && req.query.id != undefined) {
            expenseService.updateExpenseItem(req)
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
function deleteExpenseItem(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid) && req.query.id != undefined) {
            expenseService.deleteExpenseItem(req)
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

function updateStatus(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            expenseService.updateStatus(req)
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



function moveToLocalExpense(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            expenseService.moveToLocalExpense(req)
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


function moveToOutstationExpense(req, res, next) {
    try {
        console.log('INFO::::   req.headers = ', req.headers);
        console.log('INFO::::   req.body = ', req.body);
        if (!_.isEmpty(req.headers.agentid)) {
            expenseService.moveToOutstationExpense(req)
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

function expenseItemByTour(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            expenseService.expenseItemByTour(req)
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