const express = require('express');
const router = express.Router();
const meetingService = require('./meeting.service');
var _ = require('lodash');

// routes

// router.get('/meeting/type', getMeetingType);
router.get('/getAll', getAll);
router.get('/detail', detail);
router.post('/visitbytours', visitbytours);
router.post('/planVisit', planVisit);
router.post('/addVisitInfo', addVisitInfo);
router.post('/edit', editVisit);
router.post('/start', startVisit);
router.post('/close', closeVisit);
router.post('/cancel', cancelVisit);




router.get('/add', add);

router.get('/todayVisitCount', todayVisitCount);
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
            // Get details from database using agentId
            meetingService.getAll(req)
                .then(visits => res.status(visits.status).json(visits.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}


function detail(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            // Get details from database using agentId
            meetingService.detail(req)
                .then(visits => res.status(visits.status).json(visits.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}

function visitbytours(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            // Get details from database using agentId
            meetingService.visitbytours(req)
                .then(visits => res.status(visits.status).json(visits.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}


/**
 * FUnction is used to add planned visit
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function planVisit(req, res, next) {
    try {
        
        if (!_.isEmpty(req.headers.agentid)) {
            // Get details from database using agentId
            meetingService.planVisit(req)
                .then(visits => res.status(visits.status).json(visits.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}




function addVisitInfo(req, res, next) {
    try {
       
        if (!_.isEmpty(req.headers.agentid) && req.query.visit_id != undefined) {
            meetingService.addVisitInfo(req)
            .then(visits => res.status(visits.status).json(visits.response))
                .catch(err => next(err));
        } else {
            console.log('$00 Eror')
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}


function editVisit(req, res, next) {
    try {
       
        if (!_.isEmpty(req.headers.agentid) && req.query.visit_id != undefined) {
            meetingService.editVisit(req)
            .then(visit => res.status(visit.status).json(visit.response))
                .catch(err => next(err));
        } else {
            console.log('$00 Eror')
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}


function startVisit(req, res, next) {
    try {
       
        if (!_.isEmpty(req.headers.agentid) && req.query.visit_id != undefined) {
            meetingService.startVisit(req)
            .then(visit => res.status(visit.status).json(visit.response))
                .catch(err => next(err));
        } else {
            console.log('$00 Eror')
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}

function closeVisit(req, res, next) {
    try {
       
        if (!_.isEmpty(req.headers.agentid) && req.query.visit_id != undefined) {
            meetingService.cancelCloseVisit(req)
            .then(visit => res.status(visit.status).json(visit.response))
                .catch(err => next(err));
        } else {
            console.log('$00 Eror')
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}

function cancelVisit(req, res, next) {
    try {
       
        if (!_.isEmpty(req.headers.agentid) && req.query.visit_id != undefined) {
            meetingService.cancelCloseVisit(req)
            .then(visit => res.status(visit.status).json(visit.response))
                .catch(err => next(err));
        } else {
            console.log('$00 Eror')
            res.status(400).json({ 'success': false, 'message': "Mandatory parameter(s) are missing." });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ 'success': false, 'message': "Internal server error." });
    }
}






function todayVisitCount(req, res, next) {
    try {
        console.log(`req.query  =`, req.query);
        req['session']['agentId'] = '1';// will be deleted in later phase

        if (!_.isEmpty(req.session.agentId)) {
            // Get details from database using agentId
            meetingService.todayVisitCount(req)
                .then(meetings => res.json(meetings))
                .catch(err => next(err));
        } else {
            console.log(`Info:::  Invalid session id`);
        }
    } catch (e) {
        res.json({ 'success': false, 'error': e });
    }
}


/**
 * This function is used to add new meeting 
 * @param {*} req 
 * @param {*} res json body of meeting detail
 * @param {*} next 
 * @author Rohit Ramawat 
 * @since 12/17/2019
 * @version 1
 * @email rohit.ramawat@zoxima.com
 */
function add(req, res, next) {
    try {
        console.log(`req.body  =`, req.body);
        req['session']['agentId'] = '1';// will be deleted in later phase

        if (!_.isEmpty(req.session.agentId) && req.query.id != undefined) {
            meetingService.add(req.body)
                .then(result => res.json(result))
                .catch(err => next(err));
        } else {
            res.json({ 'success': false, 'error': '' });
        }
    } catch (e) {
        res.json({ 'success': false, 'error': e });
    }
}



