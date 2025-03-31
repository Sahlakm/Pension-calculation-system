const jwt=require("jsonwebtoken");

const secret="likhil@115";


 function getUser(id){
    if(!id)return null;
    
    return jwt.verify(id,secret);

}


 function setUser(user){ 
return jwt.sign({
_id:user._id,
name:user.name,
email:user.email,
role:user.role,
},secret)


}

module.exports={getUser,setUser};