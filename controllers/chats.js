var express = require('express');
var router = express.Router();

router.get('/',(req,res,next)=>{
    //res.io.emit('new:message', 'chats');
    res.render('chats/index',{
        title:'chat'
    });

});


module.exports = router;