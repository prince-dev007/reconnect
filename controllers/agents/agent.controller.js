const express = require('express');
const router = express.Router();
const agentService = require('./agent.service');
var _ = require('lodash');

// routes
router.post('/requestOTP', sendOTP);
router.post('/login', confirmOTP);
router.get('/getAllAsm', getAllAsm);
router.get('/getAllPsm', getAllPsm);
router.get('/detail', agentDetails);
router.post('/startDay', startDay);
router.post('/isAttMark', isAttMark);
router.post('/endDay', endDay);
router.get('/areas', areas);
router.get('/getServerTime', getServerTime);
router.post('/visitClose', visitClose);
router.post('/markAbsent', markAbsent); // TODO::Rohit
router.post('/setPassword', setPassword); // TODO::Rohit
module.exports = router;

function sendOTP(req, res, next) {
    try{ console.log(req.body);
        agentService.sendOTP(req.body)
        .then(data => res.json(data))
        .catch(err => next(err));

    }catch(e){
        res.status(400).json({ "success": false, "message": "Internal server error." });
    }
}

function confirmOTP(req, res, next) {
    console.log(req.body);
    agentService.confirmOTP(req.body)
        .then(data => res.status(data.status).json(data.response))
        .catch(err => next(err));
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
function agentDetails(req, res, next) {
    try {
               
        if (!_.isEmpty(req.headers.agentid)) {
           
            agentService.agentDetails(req)
                .then(users => res.status(users.status).json(users.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });

        }
    } catch (e) {
        res.status(500).json({ "success": false, "message": "Internal server error." });

    }
}

function getAllAsm(req, res, next) {
    console.log(req.headers);
    try {
               
        if (!_.isEmpty(req.headers.agentid)) {
           
            agentService.getAllAsm(req)
                .then(users => res.status(users.status).json(users.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });

        }
    } catch (e) {
        res.status(500).json({ "success": false, "message": "Internal server error." });

    }
}

function getAllPsm(req, res, next) {
    try {
               
        if (!_.isEmpty(req.headers.agentid)) {
           
            agentService.getAllPsm(req)
                .then(users => res.status(users.status).json(users.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });

        }
    } catch (e) {
        res.status(500).json({ "success": false, "message": "Internal server error." });

    }
}


function areas(req, res, next) {
    try {
        if (!_.isEmpty(req.headers.agentid)) {
            // Get details from database using agentId
            agentService.areas(req)
                .then(areas => res.status(areas.status).json(areas.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "message": "Internal server error." });
    }
}


function getServerTime(req, res, next) {
    try {
        if (!_.isEmpty(req.headers.agentid)) {
            // Get details from database using agentId
            agentService.getServerTime(req)
                .then(areas => res.status(areas.status).json(areas.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "message": "Internal server error." });
    }
}



/** Not delivered */
function visitClose(req, res, next) {
    try {
       
        if (!_.isEmpty(req.headers.agentId)) {
            agentService.visitClose(req)
                .then(detail => res.status(200).json(detail))
                .catch(err => next(err));
        } else {
            console.log(`Info:::  Invalid session id`);
            res.json({ 'success': false, 'error': 'Mandatory parameter(s) are missing.' });
        }
    } catch (e) {
        res.json({ 'success': false, 'error': e });
    }
}



function startDay(req, res, next) {
    try {
        
       if (!_.isEmpty(req.headers.agentid)) {
            agentService.startDay(req)
                .then(detail => res.status(detail.status).json(detail.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "message": "Internal server error." });
    }
}
function isAttMark(req, res, next) {
    try {
        
       if (!_.isEmpty(req.headers.agentid)) {
            agentService.isAttMark(req)
                .then(detail => res.status(detail.status).json(detail.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "message": "Internal server error." });
    }
}

function endDay(req, res, next) {
    try {
        
        req['session']['agentId'] = '1';// will be deleted in later phase

        if (!_.isEmpty(req.headers.agentid)) {
            agentService.endDay(req)
                .then(detail => res.status(detail.status).json(detail.response))
                .catch(err => next(err));
        } else {
            console.log(`Info:::  Invalid session id`);
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });

        }
    } catch (e) {
        res.status(500).json({ "success": false, "message": "Internal server error." });

    }
}


function markAbsent(req, res, next) {
    try {
        if (!_.isEmpty(req.headers.agentid)) {
            agentService.markAbsent(req)
                .then(detail => res.status(detail.status).json(detail.response))
                .catch(err => next(err));
        } else {
            console.log(`Info:::  Invalid session id`);
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "message": "Internal server error." });
    }
}




function setPassword(req, res, next) {
    try {
        if (!_.isEmpty(req.headers.agentid)) {
            agentService.setPassword(req)
                .then(detail => res.status(detail.status).json(detail.response))
                .catch(err => next(err));
        } else {
            console.log(`Info:::  Invalid session id`);
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ "success": false, "message": "Internal server error." });
    }
}





