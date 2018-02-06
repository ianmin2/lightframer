//@ +====================================================================================
//# Essential &  swichable application running

//@ Define the authentication database [sql]  -- at the verge of deprecation 
global.authMeth = "sql";

//@ Set the application's running port [the default port is 1357]
app.port =  1357;


//@ +====================================================================================
//# General configuration

//@ Import the main configuration file
Object.assign( global, { config: require(path.join(__dirname,'../config/config')) } );

//@ Avail encrypt/decrypt methods globally
Object.assign(global, require( path.join(__dirname, 'enc_dec.js') ) );

//@ Avail the "sms_actions" method globally
Object.assign(global, require(path.join(__dirname, 'sms_actions.js') ));

//@ Initialize the sms service


//@ Initialize the "mailer" service
Object.assign( global, { mailer: nodemailer.createTransport(config.email.connection) });

//@ Initialize the global "sendMail" method
require(path.join(__dirname,'mail.js'));


//@ +======================================================================================
//# Database connection Related configuration

//@ Initialize the database service [instantiates a global [sqldb]]
require(path.join(__dirname,"../db/db.js"))(config.sql);

//@ Load the global sql `$connection` object
require(path.join(__dirname,'../db/connection'));

//@ Load the express middleware for `n-frame` REST database API integration
Object.assign( global, { apify : require(path.join(__dirname,'../db/index')) } );
