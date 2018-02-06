var jwtStrategy     = passport_jwt.Strategy
var extractJwt      = passport_jwt.ExtractJwt


module.exports 	= ( passport ) => 
{

    var opts		= {};
    opts.jwtFromRequest	= extractJwt.fromAuthHeader();
    opts.secretOrKey 	= config.secret;

    passport.use( new jwtStrategy( opts, ( jwt_payload,done ) => 
    {	
        
        $connection.any('SELECT * FROM vw_members WHERE member_id=$1 AND email=$2 AND role=$3 AND telephone=$4 AND active=true',
        [jwt_payload.member_id,
        jwt_payload.email,
        jwt_payload.role,
        jwt_payload.telephone])
        .then(function(user) 
        {

            if(user)
            {
                done( null, user[0] );
            } 
            else 
            {
                done( null, false );
            }

        })
        .catch(function(err)
        {
            return done(err, false);
        });
        
    })) ;        

};

c_log(`\n✔`.succ +` Loaded the SQL driven member authentication handler.\n`.info);

