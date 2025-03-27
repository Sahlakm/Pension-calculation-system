const mongoose=require('mongoose');
const express=require('express');
const {createHmac,randomBytes}=require("crypto");
const jwt=require("jsonwebtoken");
const {setUser}=require("../services/user")


const userschema=mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    salt:{
        type:String,
        
    },
    
    password:{     
       type:String,
        required:true
    },
    userType:{
        type:String,
        enum:["Employee","Admin"],
        default:"Employee",
    }

},{timestamps:true});

userschema.static("matchpasswordandreturntoken",async function(email,password){
    const User=await this.findOne({email});

    if(!User){
        return res.redirect("/user/signup");
    }

    const hashedpassword=createHmac("sha256",User.salt)
    .update(password)
    .digest("hex");

    if(hashedpassword!==User.password){
         throw new Error("Incorrect password");
    }

    const token= setUser(User);
    return token;
   
})


const user=mongoose.model("user",userschema);

module.exports=user;
