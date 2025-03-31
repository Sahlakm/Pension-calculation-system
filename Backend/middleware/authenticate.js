const {getUser}=require("../services/user");
const Userdata=require("../models/user")

async function auth(req,res,next){
    // console.log("Entered");
    const token=req.cookies?.uid;
    
    req.user=null;
    if(!token){
        return next();
    }
    try {
        const user=await getUser(token);
        
        req.user=await findUserByEmail(user.email);
        
    } catch (error) {
        console.error("Invalid token", error);
        res.clearCookie("uid");
    }
    
    return next();
}

async function findUserByEmail(email) {
    try {
        const user = await Userdata.findOne({ email: email });
        return user; // Return the found user
    } catch (error) {
        console.error("Error finding user by email:", error);
        return null; // Return null in case of error
    }
}
module.exports=auth;