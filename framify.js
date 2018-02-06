var Framify = function(){

	//WRENCH COPY CONFIGURATION
	var copy_config = {
						forceDelete: 		false,	//force file deletion
						excludeHiddenUnix: 	true,	//exclude hidden *nix files
						preserveFiles: 		true,	//preserve already existing files
						preserveTimestamps: true,	//Keep the original file timestamps
						inflateSymlinks: 	true,	//Translate symbolic links into files
						//exclude: 			/\.(*~|git)$/i		//Exclusion filter ( regex || function )
						//filter: 			"",   	//Filter against an expression such that if( filter == true ){ do nothing; }
						//whitelist: 			false,	//if( whitelist == true && ( filter != true ) ) { ignore file }
						//include: 			"",		//Include filter ( regex || function )						
				  };

	//!THE BASIC DIRECTORY STRUCTURE CREATOR
	this.mkdirs = function ( homedir ){
		
		//@ Specify a default application name or format the specified one that has been provided
		homedir = ( homedir || "framify_lite_sample_app" ).replace(/ +/g, '_').toLowerCase();
		
		//# ONLY CREATE A DIRECTORY WHERE NECESSARY 	
		fs.exists( homedir, function name(exists) {
		
			if(!exists){				
				
				mkdir(homedir);				
			}else{
				//INFORM THE USER THAT THE DIRECTORY ALREADY EXISTS 
				console.log("\n@framify-lite\n\t\t".succ + "Failed to initialize project: ".err + "A directory by that name already exists in the current path.\n" + "Please try another".info + "\n");				
			};
            
		});
		
		//# THE ACTUAL DIRECTORY CREATION EVALUATOR
		var mkdir = function (homedir){
			
			
			console.log("\n@framify-lite\n\t\t".success + "Initializing Project ".info + homedir + "\n");
			
			//@ Ensure that the target directory exists
			fse.ensureDirSync(homedir);

			//@ Populate the application
			fse.copy(path.join(__dirname, "/assets"), homedir)
			.then(() => {

				c_log(`\n@framify-lite\n\t\t`.success + `A new project '`+ `${homedir}`.yell+`' has been initialized. `);

			})
			.catch(err => console.error(err))
			
		};
			
		
	};
	
};

//# EXPOSE THE PROJECT INITIATOR 
module.exports = () => {
	return new Framify().mkdirs;
};