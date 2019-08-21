class SMS {

    constructor( authorization, senderID, prefix="254" )
    {

        if( !authorization )
        {
            throw new Error("The SMS method requires an application developer key.");
        }

        this.prefix   = prefix;

        this.options = 
        {
            method:     'POST'
            ,headers: 
                        { 
                            "DeveloperKey"  :  authorization.key //"084049D0-AB72-4EE2-9EDE-0C25C1D1268C" 
                            ,"Password"     :  authorization.password
                            ,'content-type' :  'application/x-www-form-urlencoded'
                        }
            ,url:       config.sms.url
            ,json:      false
        }

    }

    //@ Add the phone number prefix and split phone numbers where multiple exist
    formatTelephone ( telephoneArray, whoami )
    {
        let ftel = this;

        //@ /,(?=(?:[^"]*"[^"]*")*[^"]*$)/
        telephoneArray = ( Array.isArray(telephoneArray) ) ? telephoneArray : telephoneArray.trim().replace(/^"/ig,'').replace(/"$/,'').split(",").map(a=>a.replace(/\s/ig,''));        

        let rejected_numbers = [];
        return { 
            numbers : telephoneArray
                        .map(a => a.toString().replace(/\(/ig,'').replace(/\)/ig,'').replace(/\s/ig,''))
                        .map(val => (val.length <=10 && val[0] != 0 ) ? `0${val}` : val )
                        .map(bVal => bVal.trim() )
                        .filter(aVal => 
                        {           
                            let tels =  aVal.match(telRegex);
                            if( !tels )
                            {
                                rejected_numbers.push(aVal);                                   
                            }                       
                            return tels;
                        })        
                        .map((cVal) => ( cVal.length <= 10 || (!cVal.includes('+') && cVal.length <= 10 ) ) ? ( (cVal.startsWith(0)) ? `${ftel.prefix}${cVal.replace(/^0/i,'')}` : `${ftel.prefix}${cVal}` ) : cVal )
                        .filter(e=>e)
            ,length : telephoneArray.length
            ,failed : rejected_numbers
          }

    };

    //@ {to,text}, [DECODED JWT INSTANCE]
    one( msg ,whoami,senderID )
    {
        
        //@ Assign the currentSender to the identifier object
        Object.assign(whoami,{ currentSender : senderID } );

        // log(`Sending of one triggered.`.yell)
        let singl = this;

        if( !senderID )
        {
            return Promise.reject( make_response(412, `Please define the message initiator.<br>In the event that you are not an initiator, please inform your service provider of the above error.`) );
        }
        else
        {
            singl.senderID = senderID;
        }

        // log(`Basic setup completed`.yell)

        return new Promise((resolve,reject) => 
        {

            const batch_number = `${senderID}-${new Date().getTime()}`;
            
            // log(`Running in promise`.yell)

            if( !isDefined(msg, ["to","text"]) )
            {
                log(`SMS queueing for one failed at validation for ${senderID}.\nReason:\tDefine the to and text parameters to continue`.yell)
                reject( make_response(500 ,"At least an SMS message and a recipient number must be defined.") )
            }
            else
            {

                //@ Declare the error placeholder object
                let invalid_number_data = { failed: [], length: 0 };

                //@ format the telephone numbers to the appropriate international format
                let telReference =  singl.formatTelephone( msg.to );
                invalid_number_data.failed.concat(telReference.failed);
                invalid_number_data.length += parseInt(telReference.length) || 0;
                msg.to  = telReference['numbers'];

                //@ The SMS promise placeholder array
                let sms_array   = [];
                let error_array = [];
               
                //@ Construct the message body
                singl.options.body          = 
                { 
                    SenderName  : senderID
                    ,Mobile     : msg.to
                    ,Message    : msg.text
                };
                //@ {to,text}
            
               

                if( singl.options.body.Mobile[0] )
                {

                    const page_length =  Math.ceil(msg.text.length/160) || 1;

                    let  summary = 
                    {
                        numbers     : msg.to.length
                        ,pages      : page_length
                        ,epitomal   : 1
                        ,cost       : ( Math.ceil(( msg.to.length/1) )*page_length )
                    };     

                    //@ CACULATE THE PROJECTED COST VERSUS THE AVAILABLE BALANCE
                    sms_balance( whoami, summary )
                    .then( go_ahead => 
                    {

                       

                        if( whoami && invalid_number_data.failed[0])
                        {

                            c_log(`At one SMS promise; Sending a failed recipient list to sender.`.yell);
                            resolve(make_response(200,'DONE', { whoami, invalid_number_data }));

                            sendMail({
                                from: config.email.accounts.errors,
                                to: [whoami.email], // Define the main recipient of the message
                                // bcc: [], //You can BCC someone here
                                subject: `JamboPay SMS | Faulty phone Number List`,
                                text: `Hello,
    We encountered a challenge when attempting to process your previous request with ${invalid_number_data.length} phone numbers.
    Below is a list of phone numbers that failed our validity criteria.

    ${invalid_number_data.failed.split('\n\t- ')}

    Please edit them and initiate a new SMS campaign that targets the edited numbers.

    The SMS Campaign will cost approximately ${summary.cost||0} units.

    In case we wrongly marked a phone number as incorrect, 
    please contact us with the specific information at support@jambopay.com.

    We value your continued allegiance.`
                            });

                        }

                        //@Loop through each contact while sending the same message
                        msg.to.forEach((phone_number) => 
                        {                            
                            //@ Queue the SMS 
                            sms_array.push( 
                                new _SMS_QUEUE( 
                                {
                                    initiator: whoami.email,
                                    batch: batch_number,
                                    senderID,
                                    complete_by: (msg.complete_by)?msg.complete_by:undefined,
                                    initiate: (msg.initiate)?msg.initiate:undefined,
                                    payload: {
                                        SenderName : senderID
                                        ,Mobile    : phone_number
                                        ,Message   : msg.text
                                    }
                                }) 
                            );

                        });
                        
                        //@ Queue the message[s] for sending
                        _SMS_QUEUE.insertMany(sms_array,(err,resp)=>{
                            
                            update_balance(whoami,resp,summary);
                            
                            

                            if( whoami && invalid_number_data.failed[0])
                            {
                                sendMail({
                                    from: config.email.accounts.errors,
                                    to: [whoami.email], // Define the main recipient of the message
                                    // bcc: [], //You can BCC someone here
                                    subject: `JamboPay SMS | SMS Batch Summary`,
                                    text: `Hello,
    We encountered a challenge when attempting to process your previous request with ${invalid_number_data.length} phone number(s).
    Below is a list of phone numbers that failed our validity criteria.

    ${invalid_number_data.failed.split('\n\t- ')}

    Please edit them and initiate a new SMS campaign that targets the edited numbers.

    The SMS Campaign will cost approximately ${summary.cost||0} units.

    In case we wrongly marked a phone number as incorrect, 
    please contact us with the specific information at support@jambopay.com.

    We value your continued allegiance.`
                                });
                            }
                            resolve( make_response( (!err) ? 200: 400 , (err)?err.message :`Queued <code>${sms_array.length}</code> messages for sending.<br>We will shortly mail you a summary at <code>${whoami.email}</code>.`, {  errors: invalid_number_data })  );
                        });
            
                    })
                    .catch( err => 
                    {                    
                        //@ INFORM THE USER OF THEIR MISFORTUNE
                        j_log(err)
                        reject( (err.response) ? err : make_response( 500, err.message || err ) );
                    })  


                }
                else
                {
                    reject( make_response(500,"At least one valid SMS recipient is required. Please ensure that the provided numbers are valid.") );
                }

            }

           

        })

    }
    //@ {to,text}, [DECODED JWT INSTANCE]
   apps( msg ,whoami,senderID )
    {
        
        //@ Assign the currentSender to the identifier object
        Object.assign(whoami,{ currentSender : senderID } );

        // log(`Sending of one triggered.`.yell)
        let singl = this;

        if( !senderID )
        {
            return Promise.reject( make_response(412, `Failed to send an SMS because a sender ID could not be identified.`) );
        }
        else
        {
            singl.senderID = senderID;
        }

        // log(`Basic setup completed`.yell)

        return new Promise((resolve,reject) => 
        {

            const batch_number = `${senderID}-${new Date().getTime()}`;
            
            // log(`Running in promise`.yell)

            if( !isDefined(msg, ["to","text"]) )
            {
                log(`SMS queueing for one failed at validation for ${senderID}.\nReason:\tDefine the to and text parameters to continue`.yell)
                reject( make_response(500 ,"At least an SMS message and a recipient number must be defined.") )
            }
            else
            {

                //@ Declare the error placeholder object
                let invalid_number_data = { failed: [], length: 0 };

                //@ format the telephone numbers to the appropriate international format
                let telReference =  singl.formatTelephone( msg.to );
                invalid_number_data.failed.concat(telReference.failed);
                invalid_number_data.length += parseInt(telReference.length) || 0;
                msg.to  = telReference['numbers'];

                //@ The SMS promise placeholder array
                let sms_array   = [];
                let error_array = [];
               
                //@ Construct the message body
                singl.options.body          = 
                { 
                    SenderName  : senderID
                    ,Mobile     : msg.to
                    ,Message    : msg.text
                };
                //@ {to,text}
            
               

                if( singl.options.body.Mobile[0] )
                {

                    const page_length =  Math.ceil(msg.text.length/160) || 1;

                    let  summary = 
                    {
                        numbers     : msg.to.length
                        ,pages      : page_length
                        ,epitomal   : 1
                        ,cost       : ( Math.ceil(( msg.to.length/1) )*page_length )
                    };     

                    // //@ CACULATE THE PROJECTED COST VERSUS THE AVAILABLE BALANCE
                    // sms_balance( whoami, summary )
                    // .then( go_ahead => 
                    // {

                       

                        if( whoami && invalid_number_data.failed[0])
                        {

                            c_log(`At one SMS promise; Sending a failed recipient list to sender.`.yell);
                            resolve(make_response(200,'DONE', { whoami, invalid_number_data }));

                        }

                        //@Loop through each contact while sending the same message
                        msg.to.forEach((phone_number) => 
                        {                            
                            //@ Queue the SMS 
                            sms_array.push( 
                                new _SMS_QUEUE( 
                                {
                                    initiator: whoami.email,
                                    batch: batch_number,
                                    senderID,
                                    complete_by: (msg.complete_by)?msg.complete_by:undefined,
                                    initiate: (msg.initiate)?msg.initiate:undefined,
                                    payload: {
                                        SenderName : senderID
                                        ,Mobile    : phone_number
                                        ,Message   : msg.text
                                    }
                                }) 
                            );

                        });
                        
                        //@ Queue the message[s] for sending
                        _SMS_QUEUE.insertMany(sms_array,(err,resp)=>{
                            
                            // update_balance(whoami,resp,summary);

                            if( whoami && invalid_number_data.failed[0])
                            {
                                sendMail({
                                    from: config.email.accounts.errors,
                                    to: [whoami.email], // Define the main recipient of the message
                                    // bcc: [], //You can BCC someone here
                                    subject: `JamboPay SMS | SMS Batch Summary`,
                                    text: `Hello,
    We encountered a challenge when attempting to process your previous request with ${invalid_number_data.length} phone number(s).
    Below is a list of phone numbers that failed our validity criteria.

    ${invalid_number_data.failed.split('\n\t- ')}

    Please edit them and initiate a new SMS campaign that targets the edited numbers.

    The SMS Campaign will cost approximately ${summary.cost||0} units.

    In case we wrongly marked a phone number as incorrect, 
    please contact us with the specific information at support@jambopay.com.

    We value your continued allegiance.`
                                });
                            }
                            resolve( make_response( (!err) ? 200: 400 , (err)?err.message :`Queued <code>${sms_array.length}</code> messages for sending.<br>We will shortly mail you a summary at <code>${whoami.email}</code>.`, {  errors: invalid_number_data })  );
                        });
            
                    // })
                    // .catch( err => 
                    // {                    
                    //     //@ INFORM THE USER OF THEIR MISFORTUNE
                    //     j_log(err)
                    //     reject( (err.response) ? err : make_response( 500, err.message || err ) );
                    // })  


                }
                else
                {
                    reject( make_response(500,"At least one valid SMS recipient is required. Please ensure that the provided numbers are valid.") );
                }

            }

        })

    }

    //@ [{to,text},{to,text}],[JWT AUTH CONTENT],"senderID"
    many( msgArr, whoami, senderID )
    {   

        //@ Assign the currentSender to the identifier object
        Object.assign(whoami,{ currentSender : senderID } );

        let multi = this;

        if( !senderID )
        {
            return Promise.reject(make_response(401,`Please define the senderid to continue`));
        }
        else
        {
            multi.senderID = senderID;
        }
               
        return new Promise( (resolve,reject) => 
        {

            const batch_number = `${senderID}-${new Date().getTime()}`;

            let  summary = 
            {
                numbers : 0
                ,pages  : 0
            };

            if(  Array.isArray(msgArr) )
            {

                //@ Placeholder Arrays
                let ErrorArray = [];
                let invalid_number_data = { failed: [], length: 0 };
                let multi_sms_array = [];


                msgArr = msgArr
                //@Filter to ensure that the provided telephone number per record is in a valid format
                .filter( msg =>
                {
                    //@ Handle the contact array            
                    let telReference =  multi.formatTelephone( msg.to );
                    invalid_number_data.failed.concat(telReference.failed);
                    invalid_number_data.length += parseInt(telReference.length) || 0;
                    msg.to  = telReference['numbers'];
                
                    

                    //@ Allow the messages with properly formatted numbers
                    if( msg.to[0] && isDefined(msg,["text"]) )
                    {                        
                        summary.numbers += msg.to.length;
                        summary.pages += ( Math.ceil(msg.text.length/160)) || 1;
                        return true
                    }
                    else
                    {
                        ErrorArray.push(msg)
                        return false                        
                    } 

                });

                multi.options.body   =  { messages :  msgArr };
                //@ [{[to],text}]

                // log(str(multi.options.body))

                //@ If an initial message is defined
                if( multi.options.body.messages[0] )
                {

                    //@ UPDATE THE COST SUMMARY OBJECT
                    summary.epitomal    = multi.options.body.messages.length;
                    summary.cost        = Math.ceil(( summary.numbers/summary.epitomal ))*summary.pages;

                    //@ CACULATE THE PROJECTED COST VERSUS THE AVAILABLE BALANCE
                    sms_balance( whoami, summary )
                    .then( go_ahead => 
                    {

                        //@ QUEUE EACH OF THE MESSAGES
                        multi.options.body.messages
                        .forEach((msg_data) => {

                            //@ Loop through the contact Array [Queuing each message]
                            if( msg_data.to[0] )
                            {

                                //@ Loop through each defined contact 
                                msg_data.to
                                .forEach(  phone_number =>
                                {

                                    multi_sms_array.push(
                                        new _SMS_QUEUE( 
                                        {
                                            initiator: whoami.email,
                                            batch: batch_number,
                                            senderID,
                                            complete_by: (msg_data.complete_by)?msg_data.complete_by:undefined,
                                            initiate: (msg_data.initiate)?msg_data.initiate:undefined,
                                            payload: {
                                                SenderName : senderID
                                                ,Mobile    : phone_number
                                                ,Message   : msg_data.text
                                            }
                                        })                                        
                                    )
                                })

                            }
                            else
                            {
                                ErrorArray.push(msg_data)
                            }

                        })

                        //@ Queue the message[s] for sending
                        _SMS_QUEUE.insertMany(multi_sms_array,(err,resp)=>
                        {

                            update_balance(whoami,resp,summary);                            
                            if( whoami && invalid_number_data.failed[0])
                            {

                                c_log(`At multi SMS; Sending a failed numbers uploaded list to uploader`);

                                sendMail({
                                    from: config.email.accounts.errors,
                                    to: [whoami.email], // Define the main recipient of the message
                                    // bcc: [], //You can BCC someone here
                                    subject: `JamboPay SMS | Faulty phone Number List`,
                                    text: `Hello,
We encountered a challenge when attempting to process your previous request with ${invalid_number_data.length} phone numberlength} phone number(s).
Below is a list of phone numbers that failed our validity criteria.

${invalid_number_data.failed.split('\n\t- ')}

Please edit them and initiate a new SMS campaign that targets the edited numbers.

The SMS Campaign will cost approximately ${summary.cost||0} units.

In case we wrongly marked a phone number as incorrect, 
please contact us with the specific information at support@jambopay.com.

We value your continued allegiance.`
                                });
                            }
                            resolve( make_response( (!err) ? 200: 400 , (err)?err.message:`Queued <code>${multi_sms_array.length}</code> messages for sending.<br>We will shortly mail you a summary at <code>${whoami.email}</code>.`, {  errors: invalid_number_data })  )

                        });                        
                            
                    })
                    .catch( err => 
                    {
                        
                        //@ INFORM THE USER OF THEIR MISFORTUNE
                        j_log(err)
                        reject( (err.response) ? err : make_response( 500, err.message || err, ErrorArray ) )

                    })  

                }
                else
                {
                    j_log(msgArr)
                    reject( make_response(500,"Please provide the data in the required format", ErrorArray) )
                }

            }
            else
            {                
                reject( make_response(500, "An array of messages is required when using this mode") );
            }

        })

    }

    //@ Options {senderID,data,template,starts,ends,days}, [JWT TOKEN DATA]
    schedule( msgOptions, whoami )
    {

        return new Promise( (resolve,reject) =>
        {
            
            if( isDefined(msgOptions,["senderID","data","template","starts","ends","days"]) )
            {

                //@ Assemble the Sender Object
                resolve(make_response(501,'NOT YET IMPLEMENTED!'))
                
            }
            else
            {
                reject( make_response(400, "Not all required SMS information was provided.<br><br>Expected <code>{senderID,data,template,starts,ends,days}</code>") );
            }

        });

    }

}

module.exports = SMS;