var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login/login', { });
});



router.post('/login', function(req, res, next) {
  if(req.body.email!=undefined && req.body.password!=undefined){
      var sql = `Select id,email from users where email="$1" and password="$1"`;

      client.query(sql,[req.body.email,req.body.password],function(err,response){
        if(err){
          console.log('Error::::: err >> ', err);
          res.redirect('/');
        }else{
          if(response.length > 0 ){
            res.redirect('dashboard/index');
          }else{
            res.redirect('/');
          }
        }      
      })

  }
  
});
module.exports = router;
