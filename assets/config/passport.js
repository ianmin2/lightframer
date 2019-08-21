var extractJwt   = passport_jwt.ExtractJwt;
var jwtStrategy  = passport_jwt.Strategy;

console.dir( passport_jwt )

if( global.authMeth == "mongo" )
{

    module.exports = ( passport ) => {

        var opts    = {};
        opts.jwtFromRequest     = extractJwt.fromAuthHeader();
        opts.secretOrKey        = config.secret;

        passport.use( new jwtStrategy( opts, (jwt_payload,done) => {

            member.findOne( { id: jwt_payload.id }, ( err, user ) => { 
                
                if(err){
                    return done(err, false);
                }

                // console.dir( user )

                if(user){
                    done( null, user );
                } else {
                    done( null, false );
                }

            });

        }));

    };

    c_log(`\nâœ”`.succ +` Loaded member authentication via mongodb.\n`.info);

//@ The sql fallback method
}else{ 


    module.exports 	= ( passport ) => {

        var opts		= {};
        opts.jwtFromRequest	= extractJwt.fromAuthHeader();
        opts.secretOrKey 	= config.secret;

        passport.use( new jwtStrategy( opts, ( jwt_payload,done ) => {	

            // console.log("Using sql ".succ)

            // c_log( jwt_payload );
            
            $connection.query('SELECT * FROM vw_members WHERE member_id=$1 AND email=$2 AND role=$3 AND telephone=$4 AND active=$5',
            [jwt_payload.member_id,
            jwt_payload.email,
            jwt_payload.role,
            jwt_payload.telephone,
            1])
            .then(function(user) {
                                   
                if(user){
                    done( null, user[0] );
                } else {
                    done( null, false );
                }

            })
            .catch(function(err){
                return done(err, false);
            })
            
            

        })) ;
        

    };
 
    c_log(`\nâœ”`.succ +` Loaded member authentication via sql.\n`.info);


};
