const http=require('http');
const express=require('express');
const app=express();
const path=require('path');
const dateFormat=require('dateformat');
var mysql=require('mysql');
var nodemailer = require('nodemailer');
const bodyparser=require('body-parser');
var multer=require('multer');
const storage=multer.diskStorage({
    destination:'./suggestion/uploads/',
    filename:function(req,file,cb){
        cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname));
    }
});
const upload=multer({
    storage:storage

}).single('files')
app.use(express.static('../suggestion'));
app.use(bodyparser.urlencoded({extended:false}));
var connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:'',
    database:"sampledb1"
});
connection.connect((err)=>{
    if(err)
    console.log(err);
    else
    {
        console.log("connected");
    }
});
app.get('/',(req,res)=>{
    res.sendFile('main.html',{root:__dirname})
});
app.get('/login',(req,res)=>{
    res.sendFile('login.html',{root:__dirname})
})

app.get('/admin',(req,res)=>{
    connection.query( "select * from complaints",(err,rows)=>{
        if(err)
        throw err;
        else{
            // console.log(rows);
        rows.forEach(ele=>{
            var date1=new Date(ele.enterdate).toLocaleDateString("en-GB").split('/');
            ele.enterdate=[date1[1],date1[0],date1[2]].join('-');
            // console.log(ele.files)
        })}
        // console.log(file_name)
        res.render('admin',{title:'user',items:rows});
    })
})
app.get('/suggest',(req,res)=>{
    res.sendFile('suggest.html',{root:__dirname})
});
app.set('view engine','ejs');
app.post('/upload',(req,res)=>{
    upload(req,res,(err)=>{
        if(err)
        throw err;
        // console.log(req.file)
        let options ={year:'numeric',month:'2-digit',day:'2-digit'};
        var enterdate=new Date().toLocaleDateString("en-GB",options).split('/');
        enterdate=[enterdate[2],enterdate[0],enterdate[1]].join('-');
        if(!req.file)
        {
            var sql="insert into complaints values(null,'"+req.body.dept+"','"+req.body.category+"','"+req.body.problem_type+"','"+req.body.email+"',null,'"+req.body.description+"','"+enterdate+"')";
            var file_name=null;
        }
        else{
         var sql="insert into complaints values(null,'"+req.body.dept+"','"+req.body.category+"','"+req.body.problem_type+"','"+req.body.email+"','"+req.file.filename+"','"+req.body.description+"','"+enterdate+"')";
         var file_name=req.file.filename;
        }
        connection.query(sql,(err)=>{
            if(err)
           throw err;
           res.send("submitted successfully")
       })
       

    })
   
})

app.get('/responses',(req,res)=>{
    connection.query( "select * from respondedd",(err,rows)=>{
        if(err)
        throw err;
        else{
        rows.forEach(ele=>{
            var date1=new Date(ele.respondeddate).toLocaleDateString("en-GB").split('/');
            ele.respondeddate=[date1[1],date1[0],date1[2]].join('-');
        })}
        res.render('responses',{title:'user',items:rows});
    })
})
app.get('/responses/:emaili/:dept/:category/:problem_type/:description',(req,res)=>
{
    
    res.render('respond',{emailsi:[req.params.emaili],dept:[req.params.dept],category:[req.params.category],problem_type:[req.params.problem_type],description:[req.params.description]})
})
app.get('/delete/:id',(req,res)=>{
 connection.query('delete from complaints where id=?',[req.params.id],(err)=>{
     connection.query('select * from complaints',(err,rows,fields)=>{
        res.redirect('/admin')
     })

     
 })
})

app.post("/sendmail/:emaili/:dept/:category/:problem_type/:description",(req,res)=>{
var transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: 'karri.vijayalakshmi2101@gmail.com',
    pass: 'PINEAPPLE@666'
  }
});

var mailOptions = {
  from: 'karri.vijayalakshmi2101@gmail.com',
  to: req.body.toaddress,
  subject: req.body.subject,
  text: req.body.body
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
      res.send("sent successfully")
      let options ={year:'numeric',month:'2-digit',day:'2-digit'};
        var enterdate=new Date().toLocaleDateString("en-GB",options).split('/');
        enterdate=[enterdate[2],enterdate[0],enterdate[1]].join('-');
      sql="insert into respondedd values(null,'"+[req.params.dept]+"','"+[req.params.category]+"','"+[req.params.problem_type]+"','"+[req.params.emaili]+"','"+enterdate+"','"+req.params.description+"')";
      connection.query(sql,(err,rows,fields)=>{
          if(err)
          throw err;
      })
    console.log('Email sent: ' + info.response);
  }
})
})
app.listen(3000);