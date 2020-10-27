const express = require('express');
const router = express.Router();
const notificationService = require('./push-notification.service');
var _ = require('lodash');

// routes
router.post('/updateRegistrationToken', updateRegistrationToken);

module.exports = router;


function updateRegistrationToken(req, res, next) {
    try {
               
        if (!_.isEmpty(req.headers.agentid)) {
           
            notificationService.updateRegistrationToken(req)
                .then(users => res.status(users.status).json(users.response))
                .catch(err => next(err));
        } else {
            res.status(400).json({ "success": false, "message": "Mandatory parameter(s) are missing." });

        }
    } catch (e) {
        res.status(500).json({ "success": false, "message": "Internal server error." });

    }
}