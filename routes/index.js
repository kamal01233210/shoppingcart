var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var Product = require('../models/product');
var Cart = require('../models/carts');
var Order = require('../models/order');
var csrfProtection = csrf();

router.use(csrfProtection);
/* GET home page. */
router.get('/', function(req, res) {
	var successMsg = req.flash('success')[0]; 
	var products = Product.find(function(err,docs){
		//console.log(products);
  	res.render('shop/index', { title: 'Shopping Cart',products:docs,successMsg:successMsg,noMessage:!successMsg });	
	});	
});

/*router.get('/user/signup',function(req,res,next){
	var messages = req.flash('error');
	res.render('/user/signup',{csrfToken:req.csrfToken(),messages:messages,hasError:messages.length>0});
}); */
router.get('/add-to-cart/:id',function(req,res,next){
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart:{});

	Product.findById(productId,function(err,product){
		if(err){
			return res.redirect('/');
		}
		cart.add(product,product.id);
		req.session.cart = cart;
		console.log(req.session.cart);
		res.redirect('/');
	});
});

router.get('/shopping-cart',function(req,res,next){
	if(!req.session.cart){
		return res.render('shop/shopping-cart',{products:null});
	}

	var cart = new Cart(req.session.cart);
	res.render('shop/shopping-cart',{products:cart.generateArray(),totalPrice:cart.totalPrice});
});

router.get('/checkout',function(req,res,next){
	if(!req.session.cart){
		return res.redirect('/shopping-cart');
	}
	var cart = new Cart(req.session.cart);
	var errorMsg = req.flash('error')[0];
	res.render('shop/checkout',{csrfToken:req.csrfToken(),total:cart.totalPrice,errorMsg:errorMsg,noError:!errorMsg})
});

router.post('/checkout',function(req,res,next){
	if(!req.session.cart){
		return res.redirect('/shopping-cart');
	}

	var cart = new Cart(req.session.cart);

	var stripe = require("stripe")(
  		"sk_test_Rs5OkDYuI3c0Ig2RI0NTwau9"
	);

	/*stripe.charger.create({
		amount: cart.totalPrice*100,
		currency: "usd",
		source: req.body.stripeToken,
		description: "Test Charge"*/
	stripeCharge(function(err,charge){
		if(err){
			req.flash('error',err.message);
			return res.redirect('/checkout');
		}
		var order = new Order({
			user: req.user,
			cart: cart,
			address: req.body.address,
			name:req.body.name,
			paymentId: '1324sddf_323445'
		});

		order.save(function(err,result){
			req.flash('success','Successfully bought product!');
			req.session.cart = null;
			res.redirect('/');	
		});		
	});
});

/*
//using local passport strategy to store password
router.post('/users/signup',passport.authenticate('local.signup',{
	successRedirect:'/user/profile',
	failureRedirect:'/user/signup',
	failureFlash: true
}));

router.get('user/profile',function(req,res,next){
	res.render('user/profile');
});

router.get('/user/signin',function(req,res,next){
	var messages = req.flash('error');
	res.render('/user/signin',{csrfToken:req.csrfToken(),messages:messages,hasError:messages.length>0});
});

router.post('/user/signin',passport.authenticate('local.signin',{
	successRedirect:'/user/profile',
	failureRedirect:'/user/signin',
	failureFlash: true
}));*/

module.exports = router;


function stripeCharge(){
	return true;
}