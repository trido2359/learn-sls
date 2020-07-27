
module.exports.authorize =  (event, context, cb ) => {
    const check = true;
    if (check) {
        cb('Unauthorized11');
    }
    cb(null,'ok');
}