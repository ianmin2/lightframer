//@ UNCOMMENT TO RUN THE APPLICATION IN CLUSTER MODE
/*
(function() {
    var childProcess = require("child_process");
    var oldSpawn = childProcess.spawn;

    function mySpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    childProcess.spawn = mySpawn;
})();
*/

require('liteframe');

//@ Load the basic server configurations
require(path.join(__dirname,'configuration.es6'));

//@ THE PREVENT UNAUTHORIZED TASKS MIDDLEWARE
global.adminOnly = function(req,res,next){
    
    let token = req.headers.authorization;

    if( token ){               
        token = token.toString().replace( /JWT /ig, '').replace(/\s/ig, '')
    }

    //@ Ensure that the provided jwt is valid

    try{
        
        verifiedJwt = nJwt.verify(token,config.secret);

        //@ Ensure that the trying party is also an administrator
        if( json( crypt.base64_decode( token.replace(/JWT /ig, '').split(".")[1] ) ).role === "admin" ){
            next();
        }else{
            res.status(401).json( make_response(  500, "You do not meet the minimum requirements to perform this action." ) );
        }

    }catch(e){

        console.log(e);
        res.send( make_response( 500, "Please login to continue" ) )

    }

};

//@ Framify Security Middleware Definition
var framifySecurity = function(req, res, next) {
    
        let payload = req.headers.authorization
        req.whoami  = (payload) ? json(crypt.base64_decode(payload.replace(/JWT /ig, '').split(".")[1])) : {};
        req.role    = (payload) ? req.whoami.role : "guest";
    
        //@ JS configuration file filter
        let isConfig = /^\/config\/[A-Za-z0-9\*\!\-\_\%]+(.conf|.config|.js|.ts|.es6)$/ //.*\/(.*)\.(.*)
        let isSchema = /^\/schema\/*/;
        let isRoutes = /^\/routes\/*/;
        let isServer = /^\/server\/*/;
    
        let isDb = /^\/db\/*/;
        let isPhp = /^\/php\/*/;
    
        // console.dir(`${req.path}  == ${isConfig.test(req.path)}`)
    
        // console.dir(req.path)
    
        //@ HANDLE SPECIAL PATHS
        if ((isDb.test(req.path) || isPhp.test(req.path))) {
    
            let pars = get_params(req);
    
            //@ ENSURE THAT THE REQUIRED PARAMETERS ARE DEFINED
            if (isDefined(pars, ["command", "table"])) {
    
                //@ DON'T SCRUTINIZE BACKUP REQUESTS
                if (pars.command == "backup") {
                    next();
                } else {
    
                    //@ CONSTRUCT A PATH FORBIDDER
                    let forbidden = {
                        add: /logs|password_recovery|^members$|aud_./ig,
                        update: /password_recovery|payments|^members$|aud_./ig,
                        get: /^members$|password_recovery|vw_members|aud_./ig,
                        del: /^(?!.*(group_members))|^members$|aud_./ig,
                        count: /aud_./ig,
                        truncate: /./ig,
                        drop: /./ig,
                        custom: /./ig,
                        getAll: /./ig
                    };
    
                    let administrative_privilege = ['vw_member_info','members'];
                    let administrative_paths = ["update","get","getAll"];
    
                    //@ Grant the Administrative user all the power within the defined bounds                    
                    if(req.role=='admin' && (administrative_paths.indexOf(pars.command) != -1) && (administrative_privilege.indexOf(pars.table) != -1) ){
                        
                        next();
    
                    }
    
                    //@ ENSURE THAT THE REQUESTED COMMAND HAS A DEFINED BARRIER 
                    else if ( forbidden[pars.command]) {
    
                        //@ TEST THE PARAMETERS FOR FORBIDDEN PATHS
                        if (forbidden[pars.command].test(pars.table)) {
                            res.json(make_response(403, 'Permission to perform the database action was denied.'));
                        }else {
                            next()
                        }
    
                    } else {
    
                        c_log(`${pars.command} is not defined`)
                        c_log(forbidden[pars.command])
                        res.json(make_response(501, `The path you requested has not been implemented.`))
                    }
    
    
    
                    // j_log(pars)
    
                    // // console.log( payload )
                    // // console.dir( req.path )
                    // // console.dir( req._parsedUrl.path )
    
    
                }
    
    
            } else {
    
                next()
    
            }
        
            //@ Prevent rendering of unauthorized files in the project
        } else if (isConfig.test(req.path) || isSchema.test(req.path) || isRoutes.test(req.path) || isServer.test(req.path)) {
            res.status(401).json(make_response(401, 'Unauthorized'))
            console.log("Prevented access to unauthorized file".yell)
        } else {
    
            next()
    
        }
    
};

//@ Inject the security middleware
app.use( framifySecurity );

// //@ SAMPLE SERVER STARTUP MONITORING MAIL TEMPLATE
// var mailData = {
//     from: connection.email.accounts.notifications,
//     to: [], // Define the main recipient of the message
//     bcc: [], //You can BCC someone here
//     subject: `Framify Service Started at http://${myAddr}:${app.port} `,
//     text: `Hello,\n\nYour service running on ${myAddr} port ${app.port} has just been started.\n\nWe hope that you are enjoying the framify experience.\n\nSincerely:\n\tThe Framify team. `,
//     html: `<font color="gray"><u><h2>YOUR SERVICE IS UP!</u></font></h2>
//                                 <br>
//                                 Hello,<br><br>
//                                 Your service running on  <a href="http://${myAddr}:${app.port}"> http://<b>${myAddr}</b>:<b>${app.port}</b> </a> has just been started.
//                                 <br><br>
//                                 We hope that you are enjoying the framify experience.
//                                 <br>
//                                 <h4>Sincerely:</h4>
//                                 <br>
//                                 <i><u>The framify team.</u></i>
//                                 <br><br><br>
//                                 `,
//     attachment: path.join(__dirname,'../favicon.ico')
// };

//@ SEND A SAMPLE SERVICE STARTUP NOTIFICATION EMAIL BY UNCOMMENTING THE IMMEDIATE BLOCK COMMENT
/* 
    sendMail(mailData)
    .then(d=>c_log(d))
    .catch(e=>c_log(e));
*/

//@ Initialize passport for use
app.use( passport.initialize() );

//@ Alter the passport strategy for JWT
require("../config/passport")( passport );

//@ SETUP BODY PARSER MIDDLEWARE 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//@ SETUP THE VIEWS STATIC DIRECTORY
app.use("/views", express.static(path.join(__dirname,'../views')));

//@ SET THE BASIC DIRECTORY MIDDLEWARE
app.use(express.static(path.join(__dirname,'../')));

//@ LOAD THE ROUTING FILE
app.use("/" , require(path.join(__dirname,'../routes/main')));

//@ LOAD THE AUTHENTICATION ROUTES
app.use("/auth", require(path.join(__dirname,'../routes/auth')));

//@ LOAD THE FILE UPLOAD SERVICE
app.use("/upload" ,passport.authenticate('jwt', { session: false }) , require(path.join(__dirname,'../routes/upload')) );

// ,passport.authenticate('jwt', {session: false}) 
//@ LOAD THE SQL DATABASE HANDLER
app.use("/db" ,require(path.join(__dirname,'../routes/db')) );

//@ THE PASSWORD RECOVERY HANDLER
app.use("/passwords", require(path.join(__dirname,'../routes/passwords')) );

//@ THE SMS SENDING ROUTE 
app.use("/sms", require( path.join(__dirname,'../routes/sms') ));

//@ Handle the primitive little payments module
app.use("/payments" ,require(path.join(__dirname,'../routes/payments')) );

//@ LISTEN  FOR EMAILS
app.route("/mail")
.post(passport.authenticate('jwt', { session: false }), (req, res) => 
{

    let params = get_params(req);
    if (params.from) 
    {

        if (params.to) 
        {

            params.to = (params.to) ? params.to.split(',') : undefined;

            if (params.bcc) 
            {
                params.bcc = (params.bcc) ? params.bcc.split(',') : undefined;
            }

            sendMail(params)
            .then(resp => 
            {
                log(`Successfully sent an email to ${params.to}.`.succ);
                res.send(make_response(200, resp));
            })
            .catch(err => 
            {
                log(`Failed to send an email to ${params.to}\nReason:\n`.err);
                log(err);
                res.status(500).json(make_response(500, err.message || err));
            });


        } else {

            res.send(make_response(500, "Please provide a recipient's email address"));

        }

    } 
    else 
    {
        res.send(make_response(500, "Please provide a sender's  address"));
    }

});

app.route("/welcome")
.post((req,res) => 
{

    let params = get_params(req);
    if (params.to) 
    {
        
        params.to = (params.to) ? params.to.split(',') : undefined;

        if (params.bcc) 
        {
            params.bcc = (params.bcc) ? params.bcc.split(',') : undefined;
        }

         //@ Fetch the user welcome html template 
         let template = fs.readFileSync( path.join( __dirname,`../routes/templates/welcome/welcome.html`), 'utf8');
         
        //@ Replace the template strings with the proper fetched data
        template = template.replace(/{{user}}/ig, `${params.data.name}`)
            .replace(/{{user_account}}/ig, `${params.data.username}`)
            .replace(/{{user_email}}/ig, `${params.to}`)
            .replace(/{{user_telephone}}/ig, `${params.data.telephone}`)
            .replace(/{{portal_url}}/ig, `http://${myAddr}:${app.port}`);
            

        sendMail({
            from: config.email.accounts.welcome,
            to : params.to,
            subject: "Welcome to Framify",
            html: template,
            text: `Hello ${params.data.name},\n\nWe are glad that you have chosen to use the framify platform.\n\nYou have been recorded under the account name "${params.data.username}".\n\nYou can access the administrative portal at http://${myAddr}:${app.port}\n\nFor any assistance, feel free to write to us at support@bixbyte.io.\n\nSincerely,\nThe Framify Team.`
        })
        .then(resp => 
        {
            log(`Successfully sent an email to ${params.to}.`.succ);
            res.send(make_response(200, resp));
        })
        .catch(err => 
        {
            log(`Failed to send an email to ${params.to}\nReason:\n`.err);
            log(err);
            res.status(500).json(make_response(500, err.message || err));
        });

    } 
    else 
    {

        res.send(make_response(500, "Please provide a recipient's email address"));

    }

});



/**
* THIS FRAMEWORK SUPPPORTS GOOGLE CLOUD MESSAGING
* DEFINE YOUR API CREDENTIALS IN A FILE NAMED gcm.conf in the config directory
* 
* the gcm.conf file in the config directory should look like :
* 
* module.exports = `YOUR_GCM_API_KEY`;
* 
* FOR MORE INFO, PLEASE VISIT https://console.developers.google.com
**/
//@ LOAD THE GCM SERVICE
// app.use("/gcm" ,passport.authenticate('jwt', { session: false }) , require(path.join(__dirname,'gcm') ) );

//@ START THE SERVER
server.listen(app.port, function(err) {
    if (!err) {
        log(`Running server on `.success + `http://${myAddr}:${app.port}`.err);
    }
});

//@ Handle application exits gracefully
require(path.join(__dirname,'server_cleanup'))();


// Handle 404
app.use(function(req, res) {
    res.status(404).json(make_response(404,'404: Page not Found'));
});

// Handle 401
app.use(function(req, res) {
    res.status(401).json(make_response(401,'401: Unauthorized'));
});

// //@ Handle file changes for the SMS sender
// require(path.join(__dirname,'watcher.js'));