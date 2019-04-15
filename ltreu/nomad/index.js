var express=require('express');
var exphbs=require('express-handlebars');
var path=require('path');
 
var app=express();
 
// Set View Folder
app.set('views', path.join(__dirname, 'views'));
 
// Set up View engine
app.engine('handlebars', exphbs.create({
    defaultLayout: 'main',
    layoutsDir: app.get('views') + '/layouts'
}).engine);
app.set('view engine', 'handlebars');
 
// Set Static Path
app.use(express.static(path.join(__dirname, 'public')));
 
// ToDo App Start
app.get('/add-task',function(req,res){
    res.render('add-task');
});

// ToDo App End
 
// Run the Server
app.listen('3000',function(){
    console.log('Server is running at PORT '+3000);
});

//server.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
    var taskModel={
        taskList:[
            {
                title:'Task 1',
            },
            {
                title:'Task 2'
            },
            {
                title:'Task 3'
            },
            {
                title:'Task 4'
            },
            {
                title:'Task 5'
            }
        ],
        lastAdded:Date()
    };
    res.render('index',taskModel);
});