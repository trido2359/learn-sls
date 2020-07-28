
module.exports.authorize =  (event, context, cb ) => {
    const check = false;
    console.log('authorize');
    
    if (check) {
        cb('Unauthorized11');
    }
    cb(null,'ok');
}