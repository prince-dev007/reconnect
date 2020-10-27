var express = require('express');
var router = express.Router();

/* GET users listing. */
// router.get('/', function (req, res, next) {
//   res.send('respond with a resource');
// });


router.get('/list', function (req, res, next) {
  var sql = 'SELECT * from public."users"';
  client.query(sql, (err, data) => {
    if (err) {
      console.log(err.stack)
    } else {
      console.log(data.rows[0]);
      console.log('Data >>> ', data);
      res.render('users/list', {
        data: data
      });
    }
  })
});

router.get('/add', function (req, res, next) {
  res.render('users/add', {
    data: ''
  });
});

router.get('/edit', function (req, res, next) {
  
  var userId = req.query.userId;
  var sql = `SELECT * from public."users" where id=${userId} limit 1`;
  client.query(sql, (err, data) => {
    if (err) {
      console.log(err.stack)
    } else {
      if(data.rows.length > 0){
        console.log(data.rows[0]);
        res.render('users/edit', {
          data: data.rows[0]
        });
      }else{
        res.redirect('/users/list');
      }
     
    }
  })
});

module.exports = router;