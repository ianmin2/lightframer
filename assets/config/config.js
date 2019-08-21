const methods = { 
	//@ require();
	import: true, 
	//@ fs.readFileSync()
	read: false, 
};

let files = {
	jwt_secret 		: { 
		verb 			: `secret`,
		default			: 'ianmin2',
		method			: methods.import,
		file 			: path.join(__dirname,`jwt-secret.conf`),
		required 		: true,
		message 		: `A `.err + `jwt-secret.conf` + ` file containing a JWT signing key is required for your access tokens`.err +
	`\n\nPlease create a `.yell+`jwt-secret.conf`+` file in the config folder of your project.`.yell
	+`\n\nPlease add a strong and very lengthy random key into the `.info+`jwt-secret.conf`+` file to protect your login sessions`.info
	},
	sql_config		: {
		verb			: `sql`,
		method			: methods.read,
		default			: {},
		file			: path.join(__dirname,`sql.conf`),
		required		: true,
		message			: `\nAn sql configuration file is required so as to achieve a connection to an sql database.`.err
	+`\nTo do this, create an `.yell + `sql.conf` + ` file in the `.yell+`config`+` folder of your project with content in the following format.`.yell
	+`\n
module.exports = 
{
	user        : 'YOUR_SQL_DB_USERNAME',
	password    : 'YOUR_SQL_DB_PASSWORD',
	database    : 'YOUR_DATABSE_NAME',
	extras      : 
				{
					dialect     : 'postgres',   // mssql|postgres|mysql|sqlite
					dialectOptions: {
						encrypt: false
					},
					host        : 'localhost',
					logging     : console.dir,
					pool        :
								{
									max     : 100, 
									min     : 3, 
									acquire : 30000,  
									idle    : 10000 
								}
				}
};
/*# The "port" parameter can be added to the extras object for non default ports */
	`
	},
	sms_config		: {
		verb			: `sms`,
		method			: methods.read,
		default			: {},
		file			: path.join(__dirname,`sms.conf`),
		required		: true,
		message			: `\nAn SMS configuration file is required so as to send SMS messages`.err
	+`\nTo do this, create a `.yell + `sms.conf` + ` file in the `.yell+`config`+` folder of your project with the content:`.yell
	+`\n
module.exports = 
{
	key         : "SMS_DEVELOPER_KEY",
	password    : "SMS_ACCESS_PASSWORD",
	url         : "SMS_ACCESS_URL",
	queue       : 
	{
		interval : 10,
		send     : 4000,
		retries  : 10,
		reporting: 1
	}
}
`
	},
	email_config	: {
		verb			: `email`,
		method			: methods.read,
		default			: {},
		file			: path.join(__dirname,`email.conf`),
		required		: true,
		message			: `\nAn email configuration file is required so as to send email messages`.err
	+`\nTo do this, create a `.yell + `email.conf` + ` file in the `.yell+`config`+` folder of your project with the content:`.yell
	+`\ne.g. For mail via gmail, use:`.info
	+`\n
module.exports = 
{
	connection : 
	{
	service: 'gmail',
	auth: 
	{
		user: 'passwordreset@example.com',
		pass: 'YOUR_EMAIL_PASSWORD'
	}
	}
	,accounts : 
	{
	passwords:        "Password Recovery <passwordreset@example.com>",
	welcome:          "User Accounts <accounts@example.com>",
	errors:           "Framify Errors <errors@example.com>",
	notifications:    "Framify Notifications <noreply@example.com>",
	support:          "Framify Support <support@example.com>"   
	}
	, recipient : "administrator@example.com"   //@ The one that receives error messages
	
};
`
	+`\nPlease visit https://nodemailer.com/about/ for information on other email configuration options\n\n`.yell
	},
	mongo_config 	: {
		verb			: `mongo`,
		method			: methods.read,
		default			: {},
		file			: path.join(__dirname,`mongo.conf`),
		required		: false,
		message			: `\nA mongodb configuration file is required so as to queue and schedule SMS messages`.err
	+`\nTo do this, create a `.yell + `mongo.conf` + ` file in the `.yell+`config`+` folder of your project with the content:`.yell
	+`\n
module.exports = 
{
	"db"           : "DATABASE_NAME"
	,"authDB"	   : "admin"
	,"collection"   : "YOUR_COLLECTION_NAME"
	,"user"        : "YOUR_USERNAME"
	,"password"    : "YOUR_PASSWORD"
	,"host"        : 
	{
		"url"     : "localhost"
		,"port"   : 27017
		,"idle"   : 30
		,"max_connections": 100
	}
};
`
	+`\nPlease visit http://mongodb.github.io/node-mongodb-native for information on other mongodb configuration options\n\n`.yell

	},
	app_config 		: {
		verb			: `authtorized_apps`,
		method			: methods.import,
		default			: {},
		file			: path.join(__dirname,`apps.conf`),
		required		: false,
		message			: `\nAn application configuration file is required so as to allow for the sending of SMS messages from mobile applications`.err
+`\nTo do this, create an `.yell + `apps.conf` + ` file in the `.yell+`config`+` folder of your project in the format:`.yell
+`\n
module.exports = 
[
	"app.id"
	,"app.id.2"
]
`
	}
};


files.foreach((elem,idx) => 
{

	if(fs.existsSync(elem.file))
	{
		exports[elem.verb] = (elem.method) ? fs.readFileSync(elem.file,"utf8") : require(elem.file,"utf8");
		c_log(`\n✔\tSuccessfully loaded the ${elem.verb} configuration.`.succ);
	}
	else if(elem.required)
	{
		throw new Error(elem.message);
		process.exit(1);
	}
	else
	{
		c_log(`\nSkipped loading the ${elem.verb} file.`.yell);
	}
	
});