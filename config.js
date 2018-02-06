//@BASIC PROJECT REQUIREMENTS
require("bixbyte-frame-lite");

//# FETCH THE SCRIPT INSTALLATION DIRECTORY
app.vars.home 		= 	path.join( path.dirname( fs.realpathSync( __filename ) ) , '/');

//# FETCH THE CLI APP VARIABLES
app.vars.repository = ( process.argv[2] || "-h" ).replace(/ +/g, '_').toLowerCase();

//FETCH THE APPLICATION INFO OBJECT
app.vars.appInfo 	= require("./basics/appinfo.js")();
global.appInfo 		= app.vars.appInfo;

//# FETCH THE BASIC PROJECT DIRECTORY CREATOR
global.Framify 		= require("./framify.js")();
