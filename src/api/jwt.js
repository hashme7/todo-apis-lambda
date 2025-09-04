const jwt = require('jsonwebtoken');

const authenticate = (token) => {
    if(token){
        jwt.verify(token,"scrt",(err,user)=>{
            if(err){
                return;
            }
            return user;
        })
    }else{
        return
    }
}

module.exports = {
    authenticate
};