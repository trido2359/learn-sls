
module.exports.authorize =  (event, context, cb ) => {
    const check = true;
    if (check) {
        cb('Unauthorized');
    }
    cb(null,'ok');
}