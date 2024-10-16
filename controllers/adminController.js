const express = require('express')
const router = express()
const Admin = require('../model/adminModel')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const bcrypt = require('bcrypt')
const user = require('../model/userModel')
const order = require('../model/orderModel')

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
        const totalData = await order.find({'products.ProductStatus':'Delivered'}).exec()
        
        // Best selling products
        const bestSellingProducts = await order.aggregate([{$match:{'products.ProductStatus':'Delivered'}},{$unwind:'$products'},{$group:{_id:'$products.productId',totalSold:{$sum:'$products.quantity'},soldCount:{$sum:1}}},{$sort:{totalSold:-1}},{$limit:10},{$lookup: {
            from: "products", 
            localField: "_id", 
            foreignField: "_id", 
            as: "productDetails" 
          }},
          {$unwind:'$productDetails'},
          {$project: {
            productName: "$productDetails.productName", 
            totalSold:1,
            soldCount:1,
            price: "$productDetails.price",
            offerPrice:'$productDetails.offerPrice',
            images: "$productDetails.images"
          }}
        ])
        
      console.log(bestSellingProducts,'.....................................bestSellingProducts');
      

      const bestSellingCategories = await order.aggregate([ { $match: { 'products.ProductStatus': 'Delivered' } },
        { $unwind: '$products' },
        {
          $lookup: {
            from: 'products',
            localField: 'products.productId',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        { $unwind: '$productDetails' },
        {
          $group: {
            _id: '$productDetails.categoryId',
            totalSold: { $sum: '$products.quantity' }, 
            soldCount: { $sum: 1 }, 
          },
        },
        { $sort: { totalSold: -1 } }, 
        { $limit: 10 }, 
        {
          $lookup: {
            from: 'categories', 
            localField: '_id',
            foreignField: '_id',
            as: 'categoryDetails',
          },
        },
        { $unwind: '$categoryDetails' },
        {
          $project: {
            categoryName: '$categoryDetails.catName',
            totalSold: 1,
            soldCount: 1,
            description: '$categoryDetails.description',
            image: '$categoryDetails.image',
          },
        }])

        console.log(bestSellingCategories,'.......................................bestSellingCategories');
        
        res.render('admin/home',{totalData,bestSellingProducts,bestSellingCategories})
    } catch (error) {
        console.log(error.message);
    }
}


const allUsers = async (req, res) => {
    try {
        const limit = 7
        const page = parseInt(req.query.page)||1
        const skip = (page-1) * limit
        const allUsers = await user.countDocuments()
        const totalPages = Math.ceil(allUsers/limit)

        const userData = await user.find().sort({_id:-1}).skip(skip).limit(limit).exec()
        res.render('admin/userList', {totalPages,  currentPage :page, userData })
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



const loadSalesPage = async (req, res) => {
    try {
        const limit = 7
        const page = parseInt(req.query.page)||1
        const skip = (page-1) * limit
        const totlCount = await order.countDocuments()
        const totalPages = Math.ceil(totlCount/limit)

        const data = await order.find({'products.ProductStatus':'Delivered'}).sort({_id:-1}).skip(skip).limit(limit).exec()
        
        res.render('admin/salesReport',{data,totalPages,currentPage :page});

    } catch (error) {
        console.log(error.message);
    }
};


const salesReport = async(req,res)=>{
    try {
        
        switch (req.body.period){
            case 'all':
                const currentDate = new Date()
                const start=new Date(currentDate)
                start.setHours(0, 0, 0, 0)
                const end = new Date(currentDate)
                end.setHours(23, 59, 59, 999)
                const daily = await order.find({'products.ProductStatus':'Delivered',orderDate:{$gte:start,$lte:end}})
                
                res.send({data:daily})
                
                break;

            case 'weekly':
                    const day = new Date()
                    const weakStart= new Date(day)
                    weakStart.setDate(day.getDate()-7)
                    console.log(day , weakStart,'dat')
                    const weekly = await order.find({'products.ProductStatus':'Delivered',orderDate:{$gte:weakStart,$lte:day}})
                   
                    res.send({data:weekly})
                        break;

            case 'monthly':
                            const Day= new Date()
                            const monthStart = new Date(Day)
                            monthStart.setDate(Day.getDate()-30)
                            const monthly = await order.find({'products.ProductStatus':'Delivered',orderDate:{$gte:monthStart,$lte:Day}})
                            
                            res.send({data:monthly})
                            break;

            case 'yearly':
                                const date = new Date()
                                const yearStart = new Date(date)
                                yearStart.setFullYear(date.getFullYear()-1)
                                const yearly = await order.find({'products.ProductStatus':'Delivered',orderDate:{$gte:yearStart,$lte:date}})
                                
                                res.send({data:yearly})
                                break;
            default:
                                    console.log('cannot get the data');
                                    break;
                                    
            }
        
    } catch (error) {
        console.log(error.message);
        
    }
}


const custom = async (req,res)=>{
    try {
        const {start,end}=req.body
        const custom = await order.find({'products.productStatus':'Delivered',orderDate:{$gte:start,$lte:end}})
        
        
        res.render('admin/salesReport',{data:custom})
    } catch (error) {
        console.log(error.message);
        
    }
}



const loadReturnRequest = async (req, res) => {
    try {
        const orders = await order.aggregate([
            { $match: { 'products.ProductStatus': 'Return Requested' } },
            { $unwind: '$products' },
            { $match: { 'products.ProductStatus': 'Return Requested' } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $project: {
                    _id: 1,
                    orderAmount: 1,
                    orderDate: 1,
                    'products.productId': 1,
                    'products._id':1,
                    'products.quantity': 1,
                    'products.ProductStatus': 1,
                    'products.returnReason': 1,
                    'productDetails.name': 1,
                    'productDetails.images': 1,  
                    'productDetails.price': 1,
                    'productDetails.offerPrice':1
                }
            }
        ]);

        console.log(JSON.stringify(orders, null, 2)); 
        res.render('admin/returnRequest', { orders });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Error fetching return requested products");
    }
};


const monthlyChart = async (req, res) => {
    try {
        const monthName = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const curntYear = req.query.year || new Date().getFullYear();

        const salesData = await order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(`${curntYear}-01-01`),
                        $lt: new Date(`${curntYear}-12-31`)
                    },
                    'products.ProductStatus': 'Delivered'
                }
            },
            {
                $group: {
                    _id: { $month: "$orderDate" },
                    totalSales: { $sum: "$orderAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlySales = new Array(12).fill(0);

        salesData.forEach(sale => {
            monthlySales[sale._id - 1] = sale.totalSales;
        });

        res.json({
            labels: monthName,
            data: monthlySales
        });

    } catch (error) {
        console.error("Error fetching monthly sales data:", error.message);
        res.status(500).json({ error: "Failed to fetch monthly sales data" });
    }
};



const yearlyChart = async (req, res) => {
    try {
        const startYear = parseInt(req.query.startYear) || new Date().getFullYear() - 5;
        const endYear = parseInt(req.query.endYear) || new Date().getFullYear();

        const salesData = await order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(`${startYear}-01-01`), 
                        $lt: new Date(`${endYear}-12-31`),
                    },
                    'products.ProductStatus': 'Delivered',
                },
            },
            {
                $group: {
                    _id: { $year: "$orderDate" },
                    totalSales: { $sum: "$orderAmount" },
                },
            },
            {
                $sort: { _id: 1 }, 
            },
        ]);

        const yearRange = [];
        for (let year = startYear; year <= endYear; year++) {
            yearRange.push(year);
        }

        const yearlySales = yearRange.map(year => {
            const sale = salesData.find(s => s._id === year);
            return sale ? sale.totalSales : 0;
        });

        res.json({
            labels: yearRange,
            data: yearlySales,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");
    }
};



 
module.exports = {
    loginPage,
    verifyLogin,
    loadHome,
    allUsers,
    userBlock,
    logout,
    loadSalesPage,
    salesReport,
    custom,
    loadReturnRequest,
    monthlyChart,
    yearlyChart,
}