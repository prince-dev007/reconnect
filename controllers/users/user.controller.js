const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.post('/authenticate', authenticate);
router.get('/', getAll);
router.get('/myDetails', myDetails);

module.exports = router;

function authenticate(req, res, next) {
    
    console.log(req.body);
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        // .then(users => res.json(users))
        .then(users => res.render('login/login',{data: users}))
        .catch(err => next(err));
        
}

function myDetails(req, res, next) {
    userService.myDetails()
        // .then(users => res.json(users))
        .then(users => res.render('login/myDetails',{data: users}))
        .catch(err => next(err));
}