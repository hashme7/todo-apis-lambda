import jwt from 'jsonwebtoken';

export const authenticate = (token)=>{
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