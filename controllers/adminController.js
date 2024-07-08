const express = require('express')
const router = express()
const Admin = require('../model/adminModel')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const bcrypt = require('bcrypt')
const user = require('../model/userModel')

const securePassword = async (password) => {

    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}

const loginPage = async (req, res) => {
    try {
        console.log('loading the admin login')
        res.render('admin/login')
    } catch (error) {
        console.log(error.message);
    }

}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        console.log('email', email);
        console.log('password', password);


        const adminData = await Admin.findOne({ email: email })
        console.log('adminData', adminData);
        if (adminData) {

            const passwordMatch = await bcrypt.compare(password, adminData.password);

            console.log('passwordMatch', passwordMatch);

            if (passwordMatch) {
                return res.redirect('/admin/home')
            } else {
                res.redirect('/admin/login', { message: 'Email or Password is incorrect' })
            }
        } else {
            res.redirect('/admin/login', { message: 'Email or password is incorrect' })
        }

    } catch (error) {
        console.log(error.message)
    }
}


const loadHome = async (req, res) => {
    try {
        
        res.render('admin/home')
    } catch (error) {
        console.log(error.message);
    }

}

const allUsers = async (req, res) => {
    try {
        const userData = await user.find()
        res.render('admin/userList', { userData })
    } catch (error) {
        console.log(error.message);
    }

}


const userBlock = async (req, res) => {
    try {
        const userId = await user.findOne({ _id: req.body.id })
        userId.is_blocked = !userId.is_blocked
        const userh = await userId.save();
        res.status(200).send({ user: userh.is_blocked })



    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

const logout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin/login')
    } catch (error) {
        console.log(error.message);
    }
}








module.exports = {
    loginPage,
    verifyLogin,
    loadHome,
    allUsers,
    userBlock,
    logout,
    

}