const mongoose=require('mongoose');
const DB=process.env.MONGO_DB_URL;
mongoose.connect(DB,{
    useNewUrlParser:true,
    useUnifiedTopology:true
    
}).then(()=>{
    console.log("Database Connection Successfull !");
}).catch((err)=>console.log("Not Connected !" + err))