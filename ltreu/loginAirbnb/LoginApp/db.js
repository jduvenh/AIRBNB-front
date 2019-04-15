// local database 
//mongoose.connect('mongodb://127.0.0.1:20017/Dark', {
//    useNewUrlParser: true,
//    keepAlive: 1
//
//});


// web based database
mongoose.connect('mongodb+srv://test-user12:dbNomad.0@cluster0-trimp.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true,
    keepAlive: 1
});