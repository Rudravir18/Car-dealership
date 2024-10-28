// harsh made app.js

// prince did that only admin has access to some pages

// jass did that accesss denied for every rpute 
const mongoose = require('mongoose');
const express = require('express');
const ejs =require('ejs');
const bodyParser = require('body-parser')
const multer = require('multer');
const path = require('path');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const https = require('https');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const PORT_NUMBER = require('./modules/port');
const data = require('./modules/data_module');
const profile = require('./modules/profile_module');
const rental = require('./modules/rental_module');
const appointment = require('./modules/appointment_module');
const accessdenied = require('./modules/accessdenied_module');
const bookcar = require('./modules/bookcar_module');
const app = express();

// jasspreet middleware
app.set('view engine', 'ejs');
app.use(helmet()); // rudra
app.use(express.static('images'));
app.use('/images', express.static('images'));
app.use(bodyParser.urlencoded({ extended:false}));
app.use(bodyParser.json());
// app.use(cookieParser());
// prince 
app.use(session({
    secret: 'not_harsh',
    resave: false, 
    saveUninitialized: false,
    cookie: {
        secure: false, 
        maxAge: 3600000,
        httpOnly: true
    }
}));

// Date.now();
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now

mongoose.connect('mongodb://localhost:27017/project')
.then (() => console.log(' Mongoose Database is connected '))
.catch(err => console.log(err));

// files upload krn lyi 
// for now we are using it to upload files in the images directory 
// storage for image  https://www.freecodecamp.org/news/simplify-your-file-upload-process-in-express-js/
const storage = multer.diskStorage({ // harsh
    destination: (req, file, cb) => {
        cb(null,'images' );
        },
          
    filename:(req, file,cb)=> {
        cb(null, Date.now() + '-' + file.originalname);
    
}});
// creating a constant to be able to use multer in functions
const add = multer({ storage: storage });
// route '/' :- async means it will return during the occurance
// req. session. username  requesting the sesssion the attrihte username 
// req. session. role - requesting session the rote attribute 
// we are not storing all the values in the session , because we only need two value (username , role)
// use_data - mostly used to show some specific data  ( car inventory schema )
// use_profile using it to get all the information on a specific profile

// if(username ) it means if the user is logged in thenn we are showing it the page 
// else we are showing the same page just the attributes has our hardore values  bcz we cannt leave them alone

// we are going these lines everywhere so please read them and try to make yoursef comfortable with them 

app.get('/', async (req, res) => { // rudra and home ejs
    try {
        if(req.session.username){
            const use_profile = await profile.findOne({ username: req.session.username });
            const use_data = await data.find({});
            // console.log(req.session.username);

            res.render('home', { use_profile: use_profile, use_data: use_data , logged_in: req.session.username,role : req.session.role });
            const h = req.session.username;
            console.log(h);
        } else {
            const use_data = await data.find({});
            // console.log(req.session.user);
            res.render('home', { logged_in: req.session.username, use_data: use_data , role : req.session.role});
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});
//  '/inventory / : category ' in this route we are using logic to show the user inventory depending on specific category
// category can be model, fuel type , car type
//  req.params. category , in this one we are getting  the parameter named as category from the url/route 
// which we name as given_category for ease
//then we are using the if else to check which category type they fall under for ex the diesel fall under fuel type category
// if the category is avaible then the if is true
// after this it  will use find function to get all data for specifc model,fuel type , car type
// the we are checkin the user is logged in or not if yes then we are rrnder the ejs file with the  username and role , otherwise , hardcore values will be there
// same goes for every other if else
app.get('/inventory/:category', async (req, res) => { //harsh and prince
    const given_category = req.params.category;   
    if (given_category === "AWD" || given_category === "FWD" || given_category === "4x4" || given_category === "RWD" ) {
        const use_data = await data.find({ model: given_category }); 
        // console.log(use_data);
        // console.log(use_data.filename);
        // console.log(use_data.path);
        // // because use_data is now a array
        // console.log(use_data[0].filename);     
        if (req.session.username) {
            if (use_data) {
                
                res.render('category', { use_data: use_data,  logged_in: req.session.username,role : req.session.role });
            } else {
                res.send('No data found for the given type');
            }
        } else {
            res.render('category', { use_data: use_data, role: "random" , logged_in: req.session.username });
        }
    } 
    else if (given_category === "diesel" || given_category === "hybrid" || given_category === "plugin_hybrid" || given_category === "petrol" || given_category === "electric") {
        const use_data = await data.find({ fuel_type: given_category });  
        // console.log(use_data);
        // console.log(use_data.filename);
        // console.log(use_data.path);       
        if (req.session.username) {
            if (use_data) {
                res.render('category', { use_data: use_data, role:  req.session.role , logged_in: req.session.username,role : req.session.role   });
            } else {
                res.send('No data found for the given fuel type');
            }
        } else {
            res.render('category', { use_data: use_data, role: "random" ,  logged_in: req.session.username});
        }
    } 
    else if (given_category === "sedan" || given_category === "full_suv" || given_category === "mid_suv" || given_category === "compact_suv" || given_category === "coupe" || given_category === "station_wagon" || given_category === "hatchback") {
        const use_data = await data.find({ type: given_category });  
        console.log(use_data);
        console.log(use_data.filename);
        console.log(use_data.path);  
        if (req.session.username) {
            if (use_data) {
                res.render('category', { use_data: use_data, role:  req.session.role,  logged_in: req.session.username,role : req.session.role   });
            } else {
                res.send('No data found for the given type');
            }
        } else {
            res.render('category', { use_data: use_data, role: "random",  logged_in: req.session.username });
        }
    }
    else if(given_category == "pre_owned"){     // rudra
    const use_data = await data.find({ pre_owned: "yes" }); 
    if(req.session.username){
        res.render('category', { use_data : use_data, role : req.session.role , logged_in : req.session.username });
    }
    else{
    res.render('category', { use_data : use_data, role : "random" ,  logged_in: req.session.username});
    } 

    }
    else{
        res.send(' problem homie ')
    }


});
// ypour profile this route is only logged in users , who can see their onfo , like email id and contact number
// standard  if else protectes it from not logged user and other ways
app.get('/your_profile',async (req,res)=>{
    if(req.session.username){
        const your_profile = await profile.findOne({username: req.session.username });
        if(your_profile){
            res.render('your_profile', { your_profile : your_profile});
        }
        else{
           res.send(' it does not exist ');
        }
    }
    else{
        res.send(' please login ')
    }
});

// route for inventory , which contains all the cars , only admins can add and delete m, salesman can update and the user can only read the data
// using req.sesion to collect oifo abt the user logged in 
app.get('/inventory', async (req, res) => { // jass made inventory file  and route 
    const use_data = await data.find({});
    if(req.session.username){
    res.render('inventory', { use_data : use_data, role: req.session.role });
    }    

    else{
    res.render('inventory', { use_data : use_data, role: "random"});
    }
});

// this route gives a single page to evry car by requesting the id from url to the databsse then again fetching data
// in the starting we created this for every car name , but after having multiple cars with same name it gave us so we switched back to the id 
// 
app.get('/buycar/:_id',async (req,res)=>{  // harsh and rudra
    try{
    const specific_car =  await data.findOne({ _id : req.params._id});
    res.render('buycar', { specific_car:specific_car} ); // jass
    // console.log(path);
    console.log(specific_car.path);
    console.log(specific_car.filename);
    }
    catch{
        err => { console.log(err);}
    }
});
// this a route added to add to our cars inventory 
// using the standard practice of only admin having the accesss to be able to render the ejs file 
// if any other user try to acces this page then there username and the date and the page they tried to acces will be stored in the database in accesdenied schema
app.get('/add', async (req, res) => { // harsh
    if(req.session.username){
        if( req.session.role  == "admin"){   // prince
            res.render('add');
        }
        else{
            const newaccessdenied = new accessdenied({
                username: req.session.username,
                date : Date.now(),
                page : "add"
            });
            await newaccessdenied.save();
            res.send('Not authorized');
        }
        }
        else{ 
            res.send(' login required ');
        }
});
// it saves the data from the form with post method to add cars to our inventory
//add. single file is the middleware  for multer to save the image file 


app.post('/add',add.single('file'),(req,res) =>{
    const newdata = new data ({
       car_name : req.body.car_name,
       company : req.body.company,
       car_year: req.body.car_year,
       model: req.body.model,
       colour: req.body.colour,
       vin_no: req.body.vin_no,
       car_price: req.body.car_price,
       type: req.body.type,
       pre_owned: req.body.pre_owned,
       fuel_type: req.body.fuel_type,
       extra: req.body.extra,
       financing: req.body.financing,
       sale: req.body.sale,
       posted_by: req.session.username,
       updated_last: Date.now(),       
       filename: req.file.filename,
       originalname: req.file.originalname,
       path: req.file.path,

   });
       newdata.save();
       res.redirect('/');
});
// thi sroute can be used to update the existing cars inventory
// using the standard practice of only admin, salesman having the accesss to be able to render the ejs file 
// if any other user try to acces this page then there username and the date and the page they tried to acces will be stored in the database in accesdenied schema

app.get('/update/:id' ,async (req,res)=> { // prince
if(req.session.username){
if( req.session.role == "admin" ||  req.session.role  == "salesman" ){
    data.findById(req.params.id)
    .then(foundData => {
        res.render('update', { datas: foundData });
    })
    .catch(err => {
        console.log(err);
    });
}
else{
    const newaccessdenied = new accessdenied({
        username: req.session.username,
        date : Date.now(),
        page : "update"
    });
    await newaccessdenied.save();
    res.send('Not authorized');
}
}
else{ 
    res.send(' login required ')
}
});
// this route saves the updated information into the database 
//add. single file is the middleware  for multer to save the image file 
app.post('/update/:id', add.single('file'), async (req, res) => { // prince
    const updatedData = {
        car_name : req.body.car_name,
        company : req.body.company,
        car_year: req.body.car_year,
        model: req.body.model,
        colour: req.body.colour,
        vin_no: req.body.vin_no,
        car_price: req.body.car_price,
        type: req.body.type,
        pre_owned: req.body.pre_owned,
        fuel_type: req.body.fuel_type,
        extra: req.body.extra,
        sale :req.body.sale,
        financing:req.body.financing,
        updated_by: req.session.username,
        updated_last: Date.now(),
        filename : req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path 
    };

    try {
        await data.findByIdAndUpdate(req.params.id, updatedData);
        res.redirect('/inventory');
    } catch (err) {
        console.log(err);
        res.send('Problem homie, no update happening');
    }
});
// this ropute is used to delet the existing car data in the database
// using the standard practice of only admin having the accesss to be able to render the ejs file 
// if any other user try to acces this page then there username and the date and the page they tried to acces will be stored in the database in accesdenied schema

app.get('/delete/:id', async (req,res)=> {  //rudra
    if(req.session.username){
    const use_profile = await profile.findOne({ username : req.session.username});
    if(use_profile.role == "admin"){
        data.findByIdAndDelete(req.params.id)
        .then(()=> {
            res.redirect('/inventory');
        })
        .catch(err => {
            console.log(err);
        });
    }
    else{
        const newaccessdenied = new accessdenied({
            username: req.session.username,
            date : Date.now(),
            page : "delete"
        });
        await newaccessdenied.save();
        res.send('Not authorized');
    }
    }
    else{ 
        res.send(' login required ')
    }
});


// finance functionality
// imp things
 // https://www.scaler.com/topics/javascript-math-pow/
     // loan formula from  https://cleartax.in/s/car-loan-emi-calculator
// using math pow from https://www.scaler.com/topics/javascript-math-pow/

// this route is used to calculate the emi of the specifc car pric if avaiavle financing 
// using the standard practice of only admin, salesman having the accesss to be able to render the ejs file 
// if any other user try to acces this page then there username and the date and the page they tried to acces will be stored in the database in accesdenied schema

app.get('/finance/:id', (req, res) => { // prince and harsh updated
    data.findById(req.params.id)
        .then(foundData => { // rudra made calc ejs and updated it 
            res.render('calc', { datas: foundData , rate : "0", emi: "0" , time : "0"});
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error');
        });
});
// get the required data form the user and does mathematical operations to get the desired result 
// formulas used are mentioned 
app.post('/finance/:id', async (req, res) => { // harsh and jass and updated
    const { rate, time } = req.body;
    try {
        const datas = await data.findById(req.params.id);
        if(datas){
        const pamount = datas.car_price;
        const time_in_months = time * 12;
        const rate_normal = rate / 100;
        const rate_monthly = rate_normal / 12;

        const emi_upper = pamount * rate_monthly * Math.pow(1 + rate_monthly, time_in_months);
        const emi_down = Math.pow(1 + rate_monthly, time_in_months) - 1;
        const emi = emi_upper / emi_down;
// https://www.geeksforgeeks.org/how-to-parse-float-with-two-decimal-places-in-javascript/
        res.render('calc', { emi : emi.toFixed(2) , rate : req.body.rate , time : req.body.time , datas: datas});
        }
        else{
            res.render(' no data found ');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

// rental functionality
// standar if the user is logged in they will show your profile , otherwise no 
app.get('/rental',async (req,res)=>{ // principal 
    const use_rental = await rental.find({});
    if(req.session.username){
    const use_profile  = await profile.findOne({ username : req.session.username});    
    res.render('rental', { use_rental : use_rental, role: req.session.role ,logged_in : req.session.username , use_profile : use_profile});
    }   
    else{
    res.render('rental', { use_rental : use_rental, role: "random" ,logged_in : req.session.username , use_profile: "nope"});
    }
});

// this route gets the car from the id , the logic is same as the buycar in the inventory , just the collection name is different 

app.get('/rental_book/:id',async (req,res)=>{
    const given_car_name = req.params.id;
    const specific_car = await rental.findOne({id: given_car_name});
    res.render('rental_book', { specific_car: specific_car ,  logged_in: req.session.username,role : req.session.role });

});

// this post route saves the data from the booking form
// we are using this one post for two form in rental and inventory 
// we have added extra logic to save which type of booking it is , inventory or rental 
// which helps us use one collection to store data
app.post('/book', async(req,res)=>{ // jass and rudra
    try{
const newbookcar = new bookcar({
    car_name : req.body.car_name,
    company:req.body.company,
    car_year: req.body.car_year,
    model : req.body.model,
    colour :req.body.colour,
    rent_per_hour  : req.body.rent_per_hour,
    engine: req.body.engine,
    type : req.body.type,
    fuel_type :req.body.fuel_type,
    extra : req.body.extra,
    booked_by: req.body.booked_by,
    phone_no : req.body.phone_no,
    rent_or_inventory: req.body.rent_or_inventory
});
newbookcar.save();
if(newbookcar.rent_or_inventory == "rent"){
    res.redirect('/rental');
}
else if(newbookcar.rent_or_inventory == "inventory"){
    res.redirect('/');
}
    }
    catch{
        err => { console.log(err);}
    }
});
// this a route added to add to our rental inventory 
// using the standard practice of only admin having the accesss to be able to render the ejs file 
// if any other user try to acces this page then there username and the date and the page they tried to acces will be stored in the database in accesdenied schema
app.get('/rental_add', async (req,res)=>{  // jass and rudra
    if(req.session.username){
        if( req.session.role  == "admin"){
            res.render('rental_add'); // prince
        }
        else{
            const newaccessdenied = new accessdenied({
                username: req.session.username,
                date : Date.now(),
                page : "rental_add"
            });
            await newaccessdenied.save();
            res.send('Not authorized');
        }
        }
        else{ 
            res.send(' login required ')
        }
});
// this a route saves rental data  to  our rental inventory 

app.post('/rental_add',add.single('file'), async (req,res)=>{ // jass and rudra
try {
                    const newrental = new rental ({
                        car_name : req.body.car_name,
                        company:req.body.company,
                        car_year: req.body.car_year,
                        model : req.body.model,
                        colour :req.body.colour,
                        rent_per_hour  : req.body.rent_per_hour,
                        engine: req.body.engine,
                        type : req.body.type,
                        fuel_type :req.body.fuel_type,
                        extra : req.body.extra,
                    
                        filename: req.file.filename,
                        originalname: req.file.originalname,
                        path: req.file.path,
                    });
                  
                        newrental.save();
                        res.redirect('/rental')
                    }
                    catch{
                        err => { console.log(err);}
                    }
                });
// this a route is used to  update our rental inventory 
// using the standard practice of only admin, salesman having the accesss to be able to render the ejs file 
// if any other user try to acces this page then there username and the date and the page they tried to acces will be stored in the database in accesdenied schema
app.get('/rental_update/:id', async (req, res) => { // rudra and jass
    if(req.session.username){ 
        if( req.session.role  == "admin"){
            rental.findById(req.params.id)
            .then(rentals => {
                res.render('rental_update', { rentals: rentals }); // harsh
            })
            .catch(err => {
                console.log(err);
            });
        }
        else{
            res.send(' authorisation failed ')
            const newaccessdenied = new accessdenied({
                username: req.session.username,
                date : Date.now(),
                page : "rental_add"
            });
            await newaccessdenied.save();
        }
        }
        else{ 
            res.send(' login required ')
        }
});
// this route saves the data from the update form
app.post('/rental_update/:id', add.single('file'),async (req,res)=>{ // rudra and jass
    try {
    const updatedRental = {
        car_name : req.body.car_name,
        company:req.body.company,
        car_year: req.body.car_year,
        model : req.body.model,
        colour :req.body.colour,
        rent_per_hour  : req.body.rent_per_hour,
        engine: req.body.engine,
        type : req.body.type,
        fuel_type :req.body.fuel_type,
        extra : req.body.extra,


    };
         
    if (req.file) {
        updatedRental.filename = req.file.filename;
        updatedRental.originalname = req.file.originalname;
        updatedRental.path = req.file.path;
    }
   
        await rental.findByIdAndUpdate(req.params.id, updatedRental, { new: true });
        res.redirect('/rental');
    } catch (err) {
        console.log(err);
        res.send('Problem homie, no update happening');
    }
});
// this route is used to delte the existing rental cars form inventory
// using the standard practice of only admin having the accesss to be able to render the ejs file 
// if any other user try to acces this page then there username and the date and the page they tried to acces will be stored in the database in accesdenied schema
app.get('/rental_delete/:id', async (req,res)=> { // harsh
    if(req.session.username){
    if( req.session.role  == "admin"){
        rental.findByIdAndDelete(req.params.id)
        .then(()=> {
            res.redirect('/rental');
        })
        .catch(err => {
            console.log(err);
        });
    }
    else{
        const newaccessdenied = new accessdenied({
            username: req.session.username,
            date : Date.now(),
            page : "rental delete"
        });
        await newaccessdenied.save();
        res.send('Not authorized');
    }
    }
    else{ 
        res.send(' login required ')
    }
});

// this i=route is used to render signup ejs file
// sign up 
app.get('/signup', (req,res)=> { // rudra made signup file and route
    res.render('signup');
});
// this page saves the signup data into the database and encrypts the password
// it also checks if the username, contact , email , already exits or not 
// using  collation method to check in both lower case and upper case
// with collation Harsh and harsh , both will be smae , otherwise harsh and Harsh are different for compyter

app.post('/signup', async (req, res) => { // jass
    const newprofile = new profile({
      username: req.body.username,
      password: req.body.password,
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      contact : req.body.contact,
      role: req.body.role,
    });
    try {
        // using to check if the same username with the same letters but in upper or lower case exists
        // https://youtu.be/YX2mqib4wOI?si=nAoucRZ_Ti6jmS1R
      const checkUser = await profile.findOne({ username: newprofile.username })
      .collation({ locale:"en", strength: 2})
      .exec();
      const check_email = await profile.findOne({ email: newprofile.email })
      .collation({ locale:"en", strength: 2})
      .exec();
      const check_contact = await profile.findOne({ contact : newprofile.contact })
      .collation({ locale:"en", strength: 2})
      .exec();
       if(checkUser){
          res.send('username already exits ');
      }
      else if(check_email){
          res.send(' email already in use ');
      }
      else if(check_contact){
          res.send(' contact already in use ');
      }
      else {
        const hash_password = await bcrypt.hash(newprofile.password, 10);
        newprofile.password = hash_password;
        await newprofile.save();
        res.redirect('/login');
      }
    }
    catch{
      err => console.log(err);
    }
});
// login 
// this route is used to login into the website , as a user , salesman, or admin
app.get('/login', (req,res)=> { // harsh
    res.render('login' ); // prince
});
// this post route checks if the username exits or not , then compares the encrypted password with the password given by the user during login process

app.post('/login', async (req, res) => { // rudra and jass
    try {
        const { check_username, check_pwd } = req.body;
        const user = await profile.findOne({ username: check_username });
     
        if (!user) {
            return res.send('Username not found. Please check your username.');
        }
        const passwordMatch =  bcrypt.compare(check_pwd, user.password);
        if (!passwordMatch) {
            return res.send('Incorrect password. Please check your password.');
        }
        else {
            const login_username =  check_username;
            req.session.username = login_username;
            req.session.role = user.role;
        res.redirect('/');
        }
    }
    catch{
        err => console.log(err)
    }
});

// this route destroys / clears out the session storage and eventually log out the user 
// logout 
// rudra
app.get('/logout', (req, res) => {
if(req.session.username){
    req.session.destroy(err => { // Destroy session
     if (err) {
        res.status(500).send('Logout failed!');
        console.log(err); // Send error response if logout failed
      } else {
        res.redirect('/'); // Redirect to the home page after logout
      }
  
    });
}
    else{
    res.send(' you are not logged in ')
    }
});
// this post route is used to search in the cars inventory 
// this is different from /inventory/:category
// car name , company , model , color ,
// it uses collation here to check any similar data existas or not
//if yes then then it render the file
// search functionality 
app.post('/search', async (req, res) => { // prince , updated
    const givenSearch = req.body.search;
    try {
        // https://youtu.be/YX2mqib4wOI?si=nAoucRZ_Ti6jmS1R
        // https://www.mongodb.com/docs/manual/reference/collation/
    const searchdata0 = await data.find({ car_name: givenSearch})
    .collation({ locale:"en", strength: 2})
    .exec();
    const searchdata1 = await data.find({ company: givenSearch})
    .collation({ locale:"en", strength: 2})
    .exec();
    const searchdata2 = await data.find({ model: givenSearch })
    .collation({ locale:"en", strength: 2})
    .exec();
    const searchdata3 = await data.find({ colour: givenSearch })
    .collation({ locale:"en", strength: 2})
    .exec();

    if (searchdata0) {
        res.render('inventory', { use_data: searchdata0  , role: req.params.role ,  logged_in: req.session.username}); 
    } 
    else if (searchdata1) {
        res.render('inventory', { use_data :searchdata1  , role: req.params.role, logged_in: req.session.username }); 
    } 
    else if (searchdata2) {
        res.render('inventory', { use_data:searchdata2 , role: req.params.role , logged_in: req.session.username }); 
    } 
    else if (searchdata3) {
        res.render('inventory', { use_data:searchdata3  , role: req.params.role , logged_in: req.session.username}); 
    } 
    else {
        res.send('no data');
    }
} catch (err) {
    console.log(err);
}
});

// does the same as /search but for rental inventpry
app.post('/search_rental', async (req,res)=>{ // prince 
    const givenSearch = req.body.search;
    try {
        // https://youtu.be/YX2mqib4wOI?si=nAoucRZ_Ti6jmS1R
        // https://www.mongodb.com/docs/manual/reference/collation/
    const searchdata0 = await rental.find({ car_name: givenSearch})
    .collation({ locale:"en", strength: 2})
    .exec();
    const searchdata1 = await rental.find({ company: givenSearch})
    .collation({ locale:"en", strength: 2})
    .exec();
    const searchdata2 = await rental.find({ model: givenSearch })
    .collation({ locale:"en", strength: 2})
    .exec();
    const searchdata3 = await rental.find({ colour: givenSearch })
    .collation({ locale:"en", strength: 2})
    .exec();

    if (searchdata0) {
        res.render('rental', { use_rental: searchdata0  , role: req.params.role,  logged_in: req.session.username}); 
    } 
    else if (searchdata1) {
        res.render('rental', { use_rental :searchdata1  , role: req.params.role, logged_in: req.session.username }); 
    } 
    else if (searchdata2) {
        res.render('rental', { use_rental:searchdata2 , role: req.params.role,  logged_in: req.session.username }); 
    } 
    else if (searchdata3) {
        res.render('rental', { use_rental:searchdata3  , role: req.params.role, logged_in: req.session.username }); 
    } 
    else {
        res.send('no data');
    }
} catch (err) {
    console.log(err);
}
});



// filter by price range 

// this post method return data according to the condition gives by the user , filter price
// special note ⭐
// named it inventory as the url shows inventory -- did it to make website look clean 
// https://gist.github.com/madaf/b37ccbc5176172763ccfb8187ef02993
app.post('/inventory',async (req,res)=>{  // rudra and harsh
    try{ 
const givenprice = req.body.price;
 if(givenprice == "under 5000"){
    const use_data = await data.find({ car_price: { $lte: 5000 }});
    res.render('inventory',{ use_data : use_data , role : req.session.role , car_under : givenprice,  logged_in: req.session.username });
    // console.log(req.session.role);
}
else if(givenprice == "5000 - 10000"){
    const use_data = await data.find({ car_price: { $gte: 5000, $lte: 10000 }});
    res.render('inventory',{ use_data : use_data , role : req.session.role  , car_under : givenprice,  logged_in: req.session.username});
}
else if(givenprice == "10000 - 20000"){
    const use_data = await data.find({ car_price: { $gte: 10000, $lte: 20000 }});
    res.render('inventory',{ use_data : use_data , role : req.session.role  , car_under : givenprice, logged_in: req.session.username});
}
else if(givenprice == "20000 - 30000"){
    const use_data = await data.find({ car_price: { $gte: 20000, $lte: 30000 }});
    res.render('inventory',{ use_data : use_data , role : req.session.role  , car_under : givenprice,  logged_in: req.session.username});
}
else if(givenprice == "30000 - 40000"){
    const use_data = await data.find({ car_price: { $gte: 30000, $lte: 40000 }});
    res.render('inventory',{ use_data : use_data , role : req.session.role  , car_under : givenprice,  logged_in: req.session.username});
}
else if(givenprice == "40000 - 50000"){
    const use_data = await data.find({ car_price: { $gte: 40000, $lte: 50000 }});
    res.render('inventory',{ use_data : use_data , role : req.session.role  , car_under : givenprice,  logged_in: req.session.username});
}
else if(givenprice == "50000 - 60000"){
    const use_data = await data.find({ car_price: { $gte: 50000, $lte: 60000 }});
    res.render('inventory',{ use_data : use_data , role : req.session.role  , car_under : givenprice,  logged_in: req.session.username});
}
else if(givenprice == "60000 - 100000"){
    const use_data = await data.find({ car_price: { $gte: 60000, $lte: 100000 }});
    res.render('inventory',{ use_data : use_data , role : req.session.role  , car_under : givenprice,  logged_in: req.session.username});
}
else if(givenprice == "100000 ++"){
    const use_data = await data.find({ car_price: { $gte: 100000}});
    res.render('inventory',{ use_data : use_data , role : req.session.role  , car_under : givenprice,  logged_in: req.session.username});
}
else{
    res.send(' problem bro ')
}
    }
    catch{
        err => { console.log(err);}
    }
});
// for to filter rental proice 
// this post method return data according to the condition gives by the user , filter price
// special note ⭐
// named it rental as the url shows inventory -- did it to make website look clean 
app.post('/rental', async(req,res)=>{  // rudra and prince
    try{ 
        const givenprice = req.body.price;
         if(givenprice == "under 20"){
            const use_rental = await rental.find({ car_price: { $lte: 20 }});
            res.render('rental',{ use_rental : use_rental , role : req.session.role , car_under : givenprice });
            // console.log(req.session.role);
        }
        else if(givenprice == "20 - 50"){
            const use_rental = await rental.find({ car_price: { $gte: 20, $lte: 50 }});
            res.render('rental',{ use_rental : use_rental , role : req.session.role  , car_under : givenprice});
        }
        else if(givenprice == "50 - 70"){
            const use_rental = await rental.find({ car_price: { $gte: 50, $lte: 70 }});
            res.render('rental',{ use_rental : use_rental , role : req.session.role  , car_under : givenprice});
        }
        else if(givenprice == "70 - 100"){
            const use_rental = await rental.find({ car_price: { $gte: 70, $lte: 100 }});
            res.render('rental',{ use_rental : use_rental , role : req.session.role  , car_under : givenprice});
        }
        else if(givenprice == "100++"){
            const use_rental = await rental.find({ car_price: { $gte: 100 }});
            res.render('rental',{ use_rental : use_rental , role : req.session.role  , car_under : givenprice});
        }
        else{
            res.send(' problem bro ')
        }
            }
            catch{
                err => { console.log(err);}
            }
});
// https://gist.github.com/madaf/b37ccbc5176172763ccfb8187ef02993


// this route renders the ejs file named as services
// service functionality
app.get('/services', (req,res)=>{ // principal made ejs and route
    res.render('services' , { logged_in: req.session.username,role : req.session.role });
    console.log(req.session.role);
});
//  '/services / : category ' in this route we are using logic to show the user services depending on specific category
// category can be oil ,  tire , safety inspection 
//  req.params. category , in this one we are getting  the parameter named as category from the url/route 
// which we name as given_category for ease
//then we are using the if else to check which category type they fall under for example oil change  category
// if the category is avaible then the if is true
// the we are checkin the user is logged in or not if yes then we are rrnder the ejs file with the  username and role , otherwise , hardcore values will be there
// same goes for every other if else
// they actullay return to the same form for booking appoointment
app.get('/services/:category', async (req,res)=>{  // jass and prince
    try{
const given_category = req.params.category;
if(given_category == "oil_change"){
    res.render('maintenance', {given_category: given_category , logged_in: req.session.username,role : req.session.role });
}
else if(given_category == "tire_change"){
    res.render('maintenance', {given_category: given_category , logged_in: req.session.username,role : req.session.role });
}
else if(given_category == "safety_inspection"){
    res.render('maintenance', {given_category: given_category, logged_in: req.session.username,role : req.session.role });
}
else{
    res.send(' no-data found ');
}
    }
    catch{
        err => { console.log(err);}
    }
});

// route saves ths  data given  from the form and saves the type of apointment 
// it also has a logic by which it added a 10% discount to the user , if the user is logged in 
app.post('/services/:category', async (req,res)=>{ // harsh and rudra
    try{
        const newappointment = new appointment({
        car_name : req.body.car_name,
        car_year: req.body.car_year,
        model: req.body.model,
        fuel_type: req.body.fuel_type,
        booked_by: req.body.booked_by,
        phone_no : req.body.phone_no,
        category:req.body.category

        });

        if(req.session.role == "user"){
            const newappointment = new appointment ({
                discount_app : "10%"
            });
        newappointment.save();
        res.redirect('/services');
    }
    else{
      await   newappointment.save();
        res.redirect('/services');
        }
    }
    catch{
        err=> { console.log(err);}
    }

    });
app.get('/support',(req,res)=>{
    res.render('support');
});
app.get('/parts', (req,res)=>{
    res.render('parts')
});

// this route is used to show all the profiles of users in the databse , 
// currently we have set it to only show the users and salesman , not admin as per current 
// using the standard practice of only admin having the accesss to be able to render the ejs file 
// if any other user try to acces this page then there username and the date and the page they tried to acces will be stored in the database in accesdenied schema

// mangement only 
app.get('/profile', async (req, res) => { /// harsh
    try {
        if (req.session.username) { // Checking if the user is logged in
            const use_profile = await profile.findOne({ username: req.session.username });
            if (use_profile) { // User profile exists
                if ( req.session.role === "admin") { // If user is admin  
                    const profiles = await profile.find({ role: { $in: ["user", "salesman"] } });
                    res.render('profiles', { profiles: profiles }); // harsh                    
                } else { // If user is not admin
                    const newaccessdenied = new accessdenied({
                        username: req.session.username,
                        date : Date.now(),
                        page : "profile"
                    });
                    await newaccessdenied.save();
                    res.send('Not authorized');
                }
            } else {
                // User profile does not exist
                res.send('Profile not found');
            }
        } else {
            // User is not logged in
            res.send('Login required');
        }
    } catch (err) {
        console.error('Error in /profile route:', err);
        res.status(500).send('An error occurred');
    }
});

// this route is used to updated the role of a profile's data saved in the database 
// using the standard practice of only admin having the accesss to be able to render the ejs file 
// if any other user try to acces this page then there username and the date and the page they tried to acces will be stored in the database in accesdenied schema

app.get('/update_role/:id',async (req,res)=>{ // prince
    try {
        if (req.session.username) { // Checking if the user is logged in
                if (req.session.role === "admin") { // If user is admin
                    profile.findById(req.params.id)
                    .then(found_profile => { // prince
                        res.render('update_role', {profile: found_profile});
                    })
                    .catch(err=> {
                        console.log(err);
                    });                   
                } else { // If user is not admin
                    const newaccessdenied = new accessdenied({
                        username: req.session.username,
                        date : Date.now(),
                        page : "update role "
                    });
                    await newaccessdenied.save();
                    res.send('Not authorized');
                }
        } else {
            // User is not logged in
            res.send('Login required');
        }
    } catch {
        err => {console.log(err);}

    }

});

// thi sroute saves the updated role
// / if the new role is admin , it is redirected to check _ admin for second verification
// otherwise the role is set
app.post('/update_role/:id',async (req, res) => { // rudra and jass
const{role} = req.body
 try{
     if(role =="admin"){
         res.render('check_admin')
     }
     else{
         await profile.findByIdAndUpdate(req.params.id, {role:role} );
         res.redirect('/profile');
     }
 }
 catch{ err=> {
     console.log(err);
 }}
 });

 // this a route added to add to our cars inventory 
// using the standard practice of only admin having the accesss to be able to render the ejs file 
// if any other user try to acces this page then there username and the date and the page they tried to acces will be stored in the database in accesdenied schema
app.post('/check_admin', async (req, res) => {  // harsh
    const { username, admin_code } = req.body;
    try {
        if (req.session.username) { // Checking if the user is logged in
            if (req.session.role === "admin") { // If user is admin
                if (admin_code == "notadmin") {
                    const new_role = "admin";
                    const use_profile = await profile.findOne({ username: username });
                    // to check if the user exists in our database
                    if (use_profile) {
                        await profile.updateOne({ username: username }, { $set: { role: new_role } });
                        res.redirect('/profile');
                    } else {
                        res.send('The username you are trying to give authorization does not exist');
                    }
                } else { // If user is not admin
                    const newaccessdenied = new accessdenied({
                        username: req.session.username,
                        date: Date.now(),
                        page: "check admin "
                    });
                    await newaccessdenied.save();
                    res.send('Not authorized');
                }
            } else {
                // User is not logged in
                res.send('Login required');
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

// uses key and certificate . pem file for the https 

const options={ // rudra
    key:fs.readFileSync('key.pem'),
    cert: fs.readFileSync('certificate.pem')
};
// jass
https.createServer(options,app).listen(PORT_NUMBER,()=>{
    console.log(`Server running on ${PORT_NUMBER}`);
});
// app.listen(PORT_NUMBER,()=>{
//         console.log(`Server running on ${PORT_NUMBER}`);
// });