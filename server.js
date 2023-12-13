const express = require('express')
const multer = require("multer")
const storage = require("./middleware/multer_storage.js")
const upload  = multer({storage:storage});
let p=false
const app = express()
const port = 3000

app.use("/public",express.static(__dirname + "/public"));
const conn = require('./connectDB')
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:true}))
let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
app.get('/about', (req, res) => {
  res.send('<form action="/ankit"><button>Show data</button></from>')
})


app.get('/ankit', async (req, res) => {
  const html = await conn.connectionDB();
  res.send(html)
})
 app.get('/test', async (req, res) => {
  let limit = Number(req.query.limit)
  const connection = await conn.connectionDB();
  let query = `SELECT ename,empno,salary,pics FROM employee1`
  if (limit){
    query = query + `where rownum<=${limit}`
  }
  const result = await connection.execute(query);
   //console.log(result)
  // res.sendFile('/filename.html')
  if(p==true)
  res.render('test', { data: result.rows })
  else
  {
  res.render('login')
  }
  
  
})
app.get('/testreport', async (req, res) => {
  let limit = Number(req.query.limit)
  const connection = await conn.connectionDB();
  let query = `SELECT ename,empno,salary,pics
  FROM employee1`
  if (limit){
    query = query + ` where rownum<=${limit}`
  }
  const result = await connection.execute(query);
  // console.log(result)
  // res.sendFile('/filename.html')
  if(p==true)
  ejs.renderFile(path.join(__dirname, './views/', "test.ejs"), {data: result.rows}, (err, data) => {
    if (err) {
      res.send(err);
} else {
    let options = {
        "height": "11.25in",
        "width": "15.0in",
        "header": {
            "height": "20mm"
        },
        "footer": {
            "height": "20mm",
        },
    };
    pdf.create(data, options).toFile("showreport.pdf", function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send("show Pdf File created successfully");
        }
    });
}
});
  //res.render('test', { data: result.rows })
  else
  {
  res.render('login')
  }
  
})
app.get('/wod', async (req, res) => {
  let limit = Number(req.query.limit)
  const connection = await conn.connectionDB();
  let query = `SELECT ename,empno,salary,pics,operation,odate FROM employee2`
  if (limit){
    query = query + `where rownum<=${limit}`
  }
  const result = await connection.execute(query);
   //console.log(result)
  // res.sendFile('/filename.html')
  if(p==true)
  res.render('wod', { data: result.rows })
  else
  {
  res.render('login')
  }
})

let queryFirstTime =  false;

app.get('/search', async (req, res) => {
  queryFirstTime =  false;
  if(p==true)
    res.render('search', { data: [],isQueryFirstTime:queryFirstTime})
    else
    res.render('login')
    

})

app.get('/login', async (req, res) => {
  queryFirstTime =  false;
  p=false
    res.render('login', { data: [],isQueryFirstTime:queryFirstTime})
})
app.post('/login', async (req, res) => {
  
  const user = req.body.user
  const pass=req.body.password
  queryFirstTime = true;

  const connection = await conn.connectionDB();


  const result = await connection.execute(
    `SELECT count(*) 
     FROM password where upper(user_name) = '${user.toUpperCase()}' and upper(password)=('${pass.toUpperCase()}')`
     );
    // console.log(result)
    if(result.rows>0)
    {
      p=true
  res.render('home')
    }
  else
  res.send('invalid user name or password')
})



app.post('/search', async (req, res) => {
  
  const serachQuery = req.body.search
  queryFirstTime = true;

  const connection = await conn.connectionDB();


  const result = await connection.execute(
    `SELECT * 
     FROM employee1 where empno = '${serachQuery}'`
     );
    // console.log(result)
  
res.render('search', { data:result.rows,isQueryFirstTime:queryFirstTime})
})

app.get("/modify", (req, res) =>{
  if(p==true)
  res.render('modify', {data: [], isQueryFirstTime:false})
  else
  res.render('login')
})
app.post('/modify', async (req, res) => {
  
  const serachQuery = req.body.empno  
  const updateName = req.body.name
  const connection = await conn.connectionDB();
  await connection.execute(
    `update employee1 set ename='${updateName}' where empno = '${serachQuery}'`
  );

  connection.commit();

  const result = await connection.execute(
    `SELECT * 
     FROM employee1 where empno = '${serachQuery}'`
  );

  
  // res.render('test', { data:result.rows,isQueryFirstTime:true})
  if(p==true)
  res.redirect('/test')
    else
  res.render('login')

  //res.send('record modified successfully')
})

app.get("/save", (req, res) =>{
  if(p==true)
  res.render('save')
  else
  res.render('login')

})

app.post("/save",upload.single('pics'), async(req, res) =>{
  const data = req.body;
  const connection = await conn.connectionDB();
  await connection.execute(
    `insert into employee1 values('${data.name}','${data.empno}',${data.salary}, '${req.file.path}')`
  );
  connection.commit();
  res.redirect('/test')

  //res.send('<p>Record save successfully</p>')
})

app.get('/delete', async (req, res) => {

  const empid = req.query.empid
  const connection = await conn.connectionDB();
  await connection.execute(
    `delete from employee1 where empno = '${empid}'`
  );
  connection.commit();
  // res.render('test', { data:result.rows,isQueryFirstTime:true})
  if(p==true)
  res.redirect('/test')
  else
  res.render('login')
})
app.get("/home", (req, res) =>{
  if(p==true)
  res.render('home')
  else
  res.render('login')
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})