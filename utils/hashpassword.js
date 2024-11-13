const express = require ('express')
const bcrypt = require ('bcrypt')


const securePassword = async (password)=>{
    try{
    const passwordHashed = await bcrypt.hash(password,10)
    return passwordHashed
    }catch(error){
        throw error
    }
}

module.exports = securePassword;