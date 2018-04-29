// "jsonFormatter",
angular.module("framify.js", 
                            [
                                "ui.router"
                                ,"framify-paginate"
                                ,"ngStorage"
                                ,"chart.js"
                                ,"ngAria"
                                ,"ngMaterial"
                                ,"ngMessages"
                            ])
/**
 * Handles the injection of the Authentication Headers with each http call
 */
.factory("authIntercept",
                        [
                            "$localStorage"
                            ,($localStorage) =>
{
    return {

            request:  (config) => {

                //@ If the local user authentication object is defined
                if( $localStorage.framify_user  )
                {

                    
                    //@ If the authentication bypass is not set
                    if( $localStorage.framify_user.nullify != true )
                    {

                        //@ If the user details exist
                        if($localStorage.framify_user.me)
                        {
                            //@ Append them to the 'AuthData' Header
                            config.headers.AuthData = JSON.stringify( $localStorage.framify_user.me );
                        }

                        //@ If an application key is defined
                        if($localStorage.framify_user.key)
                        {
                            //@ Append the 'app_key' header
                            config.headers.App_Key  = $localStorage.framify_user.key;
                        }

                        //@ Append the 'Authorization' header
                        config.headers.Authorization = $localStorage.framify_user.token;

                        return config;

                    }
                    //@ If the credentials bypass is specified
                    else
                    {

                       //@ Pass the "authorization" header since others are not needed
                        config.headers.Authorization = $localStorage.framify_user.token
                        return config;

                    }  

                }
                //@ If the user isn't loged in, continue as is
                else
                {

                    return config;

                }
                
            }
        }
    }]
)

//@ Basic Application Essentials
.service("app", [
                    "$http"
                    ,"remoteAuth"
                    ,"$q"
                    ,"pdfGen"
                    ,function($http, remoteAuth, $q, pdfGen)
{

    let app             = this;

    app.pdfGen         = pdfGen;

    //@ Add provided numbers
    app.add = ( a,b ) => !isNaN( (parseInt(a) + parseInt(b)) ) ? (parseInt(a) + parseInt(b)) : '...';

    //!SETUP THE APPLICATION BASICS
    const url           = window.location.href.split('/').filter( (urlPortion) => (urlPortion != '' && urlPortion != 'http:' && urlPortion != 'https:') );
    let pathPos         = window.location.href.split('/').filter( (urlPortion) => (urlPortion != '') );

    //! APP CONFIGURATIONS
    app.scheme         = pathPos[0];
    app.ip             = url[0].split(':')[0];
    app.port           = url[0].split(':')[1];
    app.hlink          = `${app.scheme}//${app.ip}${( ( app.port != undefined ) ? ":" + app.port : "" )}`;

    //!APPLICATION URL
    app.url            = app.hlink;

    const hlink         = app.hlink;

    app.nav            = [];

    app.logger         = (a) => {  console.dir(a); };

    //@Perform simple redirects
    app.redirect       = (loc) => 
    {
        if (loc) {
            window.location = loc
        } else {
            window.location = "/";
        }
        return $q.resolve(true)
            .catch((e) => 
            {
                console.log("Encountered an error when processing the redirect function.")
                console.dir(e)
            })
    };

    //@ Add a Key=>value pair to an object being careful to parse integers
    app.setVar         = (obj, key, val) => 
    {
        obj = (obj) ? obj : {};
        obj[key] = (!isNaN(val)) ? parseInt(val) : val;
        return obj;
    };

    //@ Add a key=>value pair to an object without type concerns
    app.setVarify        = (obj, key, val) => $q.resolve(app.setVar(obj,key,val));
   
    //@ Assign a key=>value pair to an object without creating one if not exists
    app.set            = (obj, key, value) =>  obj[key] = value;
    
    //@ Fetch the value at key {X} in an object
    app.getVal         = (obj, key) => obj[key];    
    app.getValify      = (obj,key) => $q.resolve( app.getval(obj,key) );

    //* CONDITIONALLY TRANSFORM TO STRING
    app.str            = (obj) => (typeof(obj) === "object") ? JSON.stringify(obj) : obj;
    app.stringify      = (obj) => $q.resolve(app.str(obj));

    //* CONDITIONALLY TRANSFORM TO JSON
    app.json           = (obj) => (typeof(obj) === "object") ? obj : JSON.parse(obj);
    app.jsonify        = (obj) => $q.resolve(app.json(obj))

    //* CONDITIONALLY RETURN AN MD5 HASH
    app.md5            = (str) => (/^[a-f0-9]{32}$/gm.test(str)) ? str : CryptoJS.MD5(str).toString();
    app.md5ify         = (str) => $q.resolve(app.md5(str));

    //BASE64 ENCODE A STRING
    app.base64_encode  = (string) => CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(string));
    app.base64_encodify= (string) => $q.resolve(app.base64_encode(string));

    //BASE64 DECODE A STRING
    app.base64_decode  = (encoded) => (CryptoJS.enc.Base64.parse(encoded)).toString(CryptoJS.enc.Utf8);
    app.base64_decodify= (encoded) => $q.resolve(app.base64_decode(encoded));

    //@ THE OFFICIAL FILE UPLOAD SERVICE
    app.upload         = (data, destination) => 
    {

        return $q((resolve, reject) => {

            //* create a formdata object
            let fd = new FormData();

            //* add the defined keys to the formdata object
            for (var key in data) {
                fd.append(key, data[key]);
            };

            //* post the data to the /upload route of the running server
            $http.post(`${hlink}/upload/${destination}`, fd, {

                transformRequest: angular.identity,

                //* ensure automatic content-type settng
                headers: { 'Content-Type': undefined }

            }).then(d => resolve(d));

        });

    };

    //@ GET A KEYS ARRAY FROM AN OBJECT
    app.keys           = obj => Object.keys(obj);

    //@ GET A VALUES ARRAY FROM AN OBJECT
    app.vals           = obj =>  Object.keys(obj).reduce((prev,curr,idx)=> { prev[idx] = curr;  return prev;  },[]);
    app.valsify        = obj => $q.resolve( app.vals(obj) );

    //@ CREATE A COPY OF AN OBJECT
    app.clone          = (obj) => 
    {

        //* ensure that the object is defined
        if (null == obj || "object" != typeof obj) return obj;

        //* call the object constructor prototype
        let copy = obj.constructor();

        //* clone all attributes of the parent object into a new object
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = (/^[0-9]+$/.test(obj[attr])) ? parseInt(obj[attr]) : obj[attr];
        }

        //* return the newly created object
        return copy;

    };
    app.clonify        = (obj) => $q.resolve( app.clone(obj) );


    //! PARSE TO AN INTEGER
    app.parseInt       = str => parseInt(str);
    app.parseIntify    = (str) => $q.resolve( app.parseInt(str) );

    //! EMPTY CALLBACK
    app.doNothing      = () => $q.resolve();

    //@ FIND NUMBERS IN A STRING
    app.getNumbers     = (str, firstOnly = true, numMatch = /\d+/g ) =>  (firstOnly) ? str.toString().match(numMatch)[0] : str.toString().match(numMatch);
    app.getNumbersify  = ( str, firstOnly =true, numMatch = /\d+/g ) => $q.resolve( app.getNumbers(( str, firstOnly =true, numMatch = /\d+/g )) );

    //! SET A NOTIFICATION 
    app.notify         = (notificationContent, notificationClass, notificationTimeout, position) => 
    {

        UIkit.notify({
            message: `<center>${( notificationContent || 'A blank notification was triggered.')}</center>`,
            status: notificationClass || 'info',
            timeout: notificationTimeout || 4000,
            pos: 'top-center' || position
        });

        return $q.resolve(true)
                .catch( (e) => 
                {
                    console.dir(e.message);
                });

    };

    const notify        = app.notify;

    app.countries      = [{ name: "Afghanistan", value: "1" }, { name: "Albania", value: "2" }, { name: "Algeria", value: "3" }, { name: "American Samoa", value: "4" }, { name: "Andorra", value: "5" }, { name: "Angola", value: "6" }, { name: "Anguilla", value: "7" }, { name: "Antarctica", value: "8" }, { name: "Antigua and Barbuda", value: "9" }, { name: "Argentina", value: "10" }, { name: "Armenia", value: "11" }, { name: "Aruba", value: "12" }, { name: "Australia", value: "13" }, { name: "Austria", value: "14" }, { name: "Azerbaijan", value: "15" }, { name: "Bahamas", value: "16" }, { name: "Bahrain", value: "17" }, { name: "Bangladesh", value: "18" }, { name: "Barbados", value: "19" }, { name: "Belarus", value: "20" }, { name: "Belgium", value: "21" }, { name: "Belize", value: "22" }, { name: "Benin", value: "23" }, { name: "Bermuda", value: "24" }, { name: "Bhutan", value: "25" }, { name: "Bolivia", value: "26" }, { name: "Bosnia and Herzegowina", value: "27" }, { name: "Botswana", value: "28" }, { name: "Bouvet Island", value: "29" }, { name: "Brazil", value: "30" }, { name: "British Indian Ocean Territory", value: "31" }, { name: "Brunei Darussalam", value: "32" }, { name: "Bulgaria", value: "33" }, { name: "Burkina Faso", value: "34" }, { name: "Burundi", value: "35" }, { name: "Cambodia", value: "36" }, { name: "Cameroon", value: "37" }, { name: "Canada", value: "38" }, { name: "Cape Verde", value: "39" }, { name: "Cayman Islands", value: "40" }, { name: "Central African Republic", value: "41" }, { name: "Chad", value: "42" }, { name: "Chile", value: "43" }, { name: "China", value: "44" }, { name: "Christmas Island", value: "45" }, { name: "Cocos (Keeling) Islands", value: "46" }, { name: "Colombia", value: "47" }, { name: "Comoros", value: "48" }, { name: "Congo", value: "49" }, { name: "Congo, the Democratic Republic of the", value: "50" }, { name: "Cook Islands", value: "51" }, { name: "Costa Rica", value: "52" }, { name: "Cote d\'Ivoire", value: "53" }, { name: "Croatia (Hrvatska)", value: "54" }, { name: "Cuba", value: "55" }, { name: "Cyprus", value: "56" }, { name: "Czech Republic", value: "57" }, { name: "Denmark", value: "58" }, { name: "Djibouti", value: "59" }, { name: "Dominica", value: "60" }, { name: "Dominican Republic", value: "61" }, { name: "East Timor", value: "62" }, { name: "Ecuador", value: "63" }, { name: "Egypt", value: "64" }, { name: "El Salvador", value: "65" }, { name: "Equatorial Guinea", value: "66" }, { name: "Eritrea", value: "67" }, { name: "Estonia", value: "68" }, { name: "Ethiopia", value: "69" }, { name: "Falkland Islands (Malvinas)", value: "70" }, { name: "Faroe Islands", value: "71" }, { name: "Fiji", value: "72" }, { name: "Finland", value: "73" }, { name: "France", value: "74" }, { name: "France Metropolitan", value: "75" }, { name: "French Guiana", value: "76" }, { name: "French Polynesia", value: "77" }, { name: "French Southern Territories", value: "78" }, { name: "Gabon", value: "79" }, { name: "Gambia", value: "80" }, { name: "Georgia", value: "81" }, { name: "Germany", value: "82" }, { name: "Ghana", value: "83" }, { name: "Gibraltar", value: "84" }, { name: "Greece", value: "85" }, { name: "Greenland", value: "86" }, { name: "Grenada", value: "87" }, { name: "Guadeloupe", value: "88" }, { name: "Guam", value: "89" }, { name: "Guatemala", value: "90" }, { name: "Guinea", value: "91" }, { name: "Guinea-Bissau", value: "92" }, { name: "Guyana", value: "93" }, { name: "Haiti", value: "94" }, { name: "Heard and Mc Donald Islands", value: "95" }, { name: "Holy See (Vatican City State)", value: "96" }, { name: "Honduras", value: "97" }, { name: "Hong Kong", value: "98" }, { name: "Hungary", value: "99" }, { name: "Iceland", value: "100" }, { name: "India", value: "101" }, { name: "Indonesia", value: "102" }, { name: "Iran (Islamic Republic of)", value: "103" }, { name: "Iraq", value: "104" }, { name: "Ireland", value: "105" }, { name: "Israel", value: "106" }, { name: "Italy", value: "107" }, { name: "Jamaica", value: "108" }, { name: "Japan", value: "109" }, { name: "Jordan", value: "110" }, { name: "Kazakhstan", value: "111" }, { name: "Kenya", value: "112" }, { name: "Kiribati", value: "113" }, { name: "Korea, Democratic People\'s Republic of", value: "114" }, { name: "Korea, Republic of", value: "115" }, { name: "Kuwait", value: "116" }, { name: "Kyrgyzstan", value: "117" }, { name: "Lao, People\'s Democratic Republic", value: "118" }, { name: "Latvia", value: "119" }, { name: "Lebanon", value: "120" }, { name: "Lesotho", value: "121" }, { name: "Liberia", value: "122" }, { name: "Libyan Arab Jamahiriya", value: "123" }, { name: "Liechtenstein", value: "124" }, { name: "Lithuania", value: "125" }, { name: "Luxembourg", value: "126" }, { name: "Macau", value: "127" }, { name: "Macedonia, The Former Yugoslav Republic of", value: "128" }, { name: "Madagascar", value: "129" }, { name: "Malawi", value: "130" }, { name: "Malaysia", value: "131" }, { name: "Maldives", value: "132" }, { name: "Mali", value: "133" }, { name: "Malta", value: "134" }, { name: "Marshall Islands", value: "135" }, { name: "Martinique", value: "136" }, { name: "Mauritania", value: "137" }, { name: "Mauritius", value: "138" }, { name: "Mayotte", value: "139" }, { name: "Mexico", value: "140" }, { name: "Micronesia, Federated States of", value: "141" }, { name: "Moldova, Republic of", value: "142" }, { name: "Monaco", value: "143" }, { name: "Mongolia", value: "144" }, { name: "Montserrat", value: "145" }, { name: "Morocco", value: "146" }, { name: "Mozambique", value: "147" }, { name: "Myanmar", value: "148" }, { name: "Namibia", value: "149" }, { name: "Nauru", value: "150" }, { name: "Nepal", value: "151" }, { name: "Netherlands", value: "152" }, { name: "Netherlands Antilles", value: "153" }, { name: "New Caledonia", value: "154" }, { name: "New Zealand", value: "155" }, { name: "Nicaragua", value: "156" }, { name: "Niger", value: "157" }, { name: "Nigeria", value: "158" }, { name: "Niue", value: "159" }, { name: "Norfolk Island", value: "160" }, { name: "Northern Mariana Islands", value: "161" }, { name: "Norway", value: "162" }, { name: "Oman", value: "163" }, { name: "Pakistan", value: "164" }, { name: "Palau", value: "165" }, { name: "Panama", value: "166" }, { name: "Papua New Guinea", value: "167" }, { name: "Paraguay", value: "168" }, { name: "Peru", value: "169" }, { name: "Philippines", value: "170" }, { name: "Pitcairn", value: "171" }, { name: "Poland", value: "172" }, { name: "Portugal", value: "173" }, { name: "Puerto Rico", value: "174" }, { name: "Qatar", value: "175" }, { name: "Reunion", value: "176" }, { name: "Romania", value: "177" }, { name: "Russian Federation", value: "178" }, { name: "Rwanda", value: "179" }, { name: "Saint Kitts and Nevis", value: "180" }, { name: "Saint Lucia", value: "181" }, { name: "Saint Vincent and the Grenadines", value: "182" }, { name: "Samoa", value: "183" }, { name: "San Marino", value: "184" }, { name: "Sao Tome and Principe", value: "185" }, { name: "Saudi Arabia", value: "186" }, { name: "Senegal", value: "187" }, { name: "Seychelles", value: "188" }, { name: "Sierra Leone", value: "189" }, { name: "Singapore", value: "190" }, { name: "Slovakia (Slovak Republic)", value: "191" }, { name: "Slovenia", value: "192" }, { name: "Solomon Islands", value: "193" }, { name: "Somalia", value: "194" }, { name: "South Africa", value: "195" }, { name: "South Georgia and the South Sandwich Islands", value: "196" }, { name: "South Sudan", value: "197" }, { name: "Spain", value: "198" }, { name: "Sri Lanka", value: "199" }, { name: "St. Helena", value: "200" }, { name: "St. Pierre and Miquelon", value: "201" }, { name: "Sudan", value: "202" }, { name: "Suriname", value: "203" }, { name: "Svalbard and Jan Mayen Islands", value: "204" }, { name: "Swaziland", value: "205" }, { name: "Sweden", value: "206" }, { name: "Switzerland", value: "207" }, { name: "Syrian Arab Republic", value: "208" }, { name: "Taiwan, Province of China", value: "209" }, { name: "Tajikistan", value: "210" }, { name: "Tanzania, United Republic of", value: "211" }, { name: "Thailand", value: "212" }, { name: "Togo", value: "213" }, { name: "Tokelau", value: "214" }, { name: "Tonga", value: "215" }, { name: "Trinidad and Tobago", value: "216" }, { name: "Tunisia", value: "217" }, { name: "Turkey", value: "218" }, { name: "Turkmenistan", value: "219" }, { name: "Turks and Caicos Islands", value: "220" }, { name: "Tuvalu", value: "221" }, { name: "Uganda", value: "222" }, { name: "Ukraine", value: "223" }, { name: "United Arab Emirates", value: "224" }, { name: "United Kingdom", value: "225" }, { name: "United States", value: "226" }, { name: "United States Minor Outlying Islands", value: "227" }, { name: "Uruguay", value: "228" }, { name: "Uzbekistan", value: "229" }, { name: "Vanuatu", value: "230" }, { name: "Venezuela", value: "231" }, { name: "Vietnam", value: "232" }, { name: "Virgin Islands (British)", value: "233" }, { name: "Virgin Islands (U.S.)", value: "234" }, { name: "Wallis and Futuna Islands", value: "235" }, { name: "Western Sahara", value: "236" }, { name: "Yemen", value: "237" }, { name: "Yugoslavia", value: "238" }, { name: "Zambia", value: "239" }, { name: "Zimbabwe", value: "240" }];


    //! BASIC FRAMIFY FORMAT RESPONSE FORMATTER
    app.makeResponse   = app.make_response = (response, message, command) => 
    {
        return {
            response,
            data: { message, command }
        };

    };

    //!DATE FORMATERS
    //* date object     
    app.date = () => new Date();

    //@ Convert to a date object
    app.toDate         = app.to_date = (d) => new Date(d);
           
    //* simple date
    app.newDate        = app.new_date = () => new Date().toDateString();

    //* isodate
    app.isoDate        = app.iso_date = () => new Date().format('isoDate');

    //* get the isoDate of the specified date
    app.getIsoDate     = app.get_iso_date = (d) => new Date(d).format('isoDate');

    //* get the isoDate of a date object
    app.toIsoDate      = app.to_iso_date = dObj => dObj.format('isoDate');

    //* get the isoString of a datestring
    app.getIsoString   = app.get_iso_string = (d) => new Date(d).toISOString();    

    //* custom datetime
    app.dateTime       = app.date_time = () => new Date().format('dateTime');

    //* set the date in the custom datetime format
    app.getDateTime    = app.get_date_time = d => new Date(d).format('dateTime');

    //* Convert a date to the dd-mm-yyyy hh:mm format
    app.toDateTime     = app.to_date_time = dObj => dObj.format('dateTime');

    //* month number
    app.monthNum       = app.month_num = () => new Date().format('monthNum');

    //* get month number of the specified date
    app.getMonthNum    = app.get_month_num = d => new Date(d).format('monthNum');

    //* get date objects' month number
    app.toMonthNum     = app.to_month_num = dObj => dObj.format('monthNum');

    //* MONTHS ARRAY
    const $month_array    = app.month_array = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    app.month_o_array  = [
        { id: 0, name: "January" }, { id: 1, name: "February" }, { id: 2, name: "March" }, { id: 3, name: "April" }, { id: 4, name: "May" }, { id: 5, name: "June" }, { id: 6, name: "July" }, { id: 7, name: "August" }, { id: 8, name: "September" }, { id: 9, name: "October" }, { id: 10, name: "November" }, { id: 11, name: "December" }
    ];

    app.printMonths = () =>  $month_o_array
                                .reduce((mobj,m)=>{ mobj[m] = m },{})
                                .filter(m=>m)

    //! HANDLE APPLICATION SERVICE REQUESTS
    app.ajax           = (method, target, data) => 
        $.ajax({
            method: method || "POST",
            url: target,
            data: data,
            dataType: 'jsonp',
            headers: { 'Access-Control-Allow-Origin': "*" }
        });

    //!HANDLE JSON REQUESTS 
    app.getJSON        = app.get_json = (target) => $.getJSON(target.replace(/callback=?/ig, "") + '?callback=?');

    //! HANDLE CORS CALLS WITH jsonp ENABLED
    app.cgi            = (method, url, data) => 
        $.ajax({
            method: method || "GET",
            url: url || app.hlink,
            data: data,
            dataType: 'jsonp',
            headers: { 'Access-Control-Allow-Origin': "*" }
        });

    //!HANDLE THE DISPLAY OF DIALOG BOXES

    //* SHOW A "LOADING" ELEMENT
    app.loadify        = (duration=6000, message) => 
        $q((resolve, reject) => 
        {
            let modal = UIkit.modal.blockUI('<center><i style="color:blue;" class="fa fa fa-spinner fa-pulse fa-5x fa-fw"></i></center>' + ((message) ? `<center><br>${message}</center>` : ""));
            if (duration && !isNaN(duration)) {
                setTimeout(() => {
                    modal.hide();
                    resolve(true);
                }, duration);
            } else {
                resolve(modal);
            }

        });

    //*GENERATE A CUSTOM ALERT DIALOG
    app.alert          = (title, message, cb) => 
    {

        UIkit.modal.alert(`<font color="#1976D2" style="font-weight:bold;text-transform:uppercase;">${title||'Notice'}</font>
            <hr>
            <center>${message||'</center><font color=red font-weight=bold; font-size=2em>Oops!</font><br>Something nasty happened!<center>'}</center>`);

        if (cb ) {
            if( typeof(cb) == "function")
            {
                return $q.resolve(cb(message))
                .catch(function(e) {
                    console.log("Encountered an error when processing the alert function.")
                    console.dir(e)
                });
            }
            else
            {
                return $q.resolve(true)
                .catch(function(e) {
                    console.log("Encountered an error when processing the alert2 function.")
                    console.dir(e)
                });
            }
            
        } else {
            return $q.resolve(true)
                .catch(function(e) {
                    console.log("Encountered an error when processing the alert2 function.")
                    console.dir(e)
                });
        }

    };

    //*GENERATE A CUSTOM CONFIRM DIALOG
    app.confirm        = (title, message, cb) => 
    {

        return $q((resolve) => {

            UIkit.modal.confirm(`<font color="#1976D2" style="font-weight:bold;text-transform:uppercase;">${title||'Confirmation required.'}</font>
                <hr>
                <center>${message}</center>`, () => {
                if (cb && typeof(cb) == "function") {
                    resolve(cb(message));
                } else {
                    resolve(true);
                }
            });

        });

    };

    //*GENERATE A CUSTOM PROMPT DIALOG
    app.prompt         = (title, label, placeholder, cb) => 
    {

        return $q((resolve) => {

            UIkit.modal.prompt(`<font color="#1976D2" style="font-weight:bold;text-transform:uppercase;">${title||'Info required'}</font>
            <hr>
            ${label||'email'} :`, (placeholder || ''), (userValue) => {
                if (cb && typeof(cb) == "function") {
                    resolve(cb(userValue))
                } else {
                    resolve(userValue);
                }
            });

        });

    };

    //!BASIC VALIDATION METHODS

    //*VALIDATE EMAIL ADDRESSES
    app.isemail        = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/;
    app.isEmail        = app.is_email = (prospective_email) => app.isemail.test(prospective_email);

    //*VALIDATE USERNAMES
    app.isusername     = /^[a-z0-9_-]{4,16}$/;
    app.isUsername     = app.is_username = (prospective_username) => app.isusername.test(prospective_username);

    //*VALIDATE PASSWORDS
    app.ispassword     = /^[-@./\!\$\%\^|#&,+\w\s]{6,50}$/;
    app.isPassword     = app.is_password = (prospective_password) => app.ispassword.test(prospective_password);

    //* VALIDATE NUMBERS
    app.isnumber       = /^-{0,1}\d*\.{0,1}\d+$/;
    app.isNumber       = app.is_number = prospective_number => app.isnumber.test(prospective_number);

    //*VALIDATE TELEPHONE NUMBERS
    app.istelephone      = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    app.ismultitelephone = /^([\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}(?:,|$))+$/im;
    app.isTelephone      = app.is_telephone = (prospective_telephone) => app.istelephone.test(prospective_telephone);
    app.isMultiTelephone = app.is_multi_telephone = (prospective_telephone) => app.ismultitelephone.test(prospective_telephone);

    //@ VALIDATE IMEI NUMBERS 
    app.isimei         = /^[0-9]{15}$/;
    app.isImei         = app.is_imei = prospective_imei => app.isimei.test(prospective_imei);

    //*VALIDATE DATETIME VALUES IN THE FORMAT  DD-MM-YYYY HH:MM e.g 29-02-2013 22:16
    app.isdateTime     = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(19|20)[0-9]{2} (2[0-3]|[0-1][0-9]):[0-5][0-9]$/;
    app.isDateTime     = app.is_date_time = prospective_date => app.isdateTime.test(prospective_date);

    //*VALIDATE WHETHER TWO GIVEN VALUES MATCH
    app.matches        = (val1, val2) => (val1 === val2);

    //*TRANFORM NUMBER TO MONTH
    app.num2month      = (month_number) => (!isNaN(month_number) && (month_number <= 11)) ? $month_array[month_number] : "Invalid Month Number";

    //*REMOVE DUPLICATES FROM ARRAY
    app.unique         = app.removeDuplicates = app.remove_duplicates = ( arr_init ) => ( Array.isArray(arr_init) ) ? arr_init.filter((elem, pos, arr) =>  arr.indexOf(elem) == pos ) : ['The  applied method only processes Arrays'];

 
    app.count = ( searchParam, arrayObject ) => 
    //@ Ensure that the provided 'arrayObject' parameter is an Array
    (!Array.isArray(arrayObject)) ? 
        app.notify("Failed to count occurances on a non array object.", "danger")
    : ( Array.isArray(searchParam) ) 
         ?   searchParam.reduce( ( count,search_term, idx ) => {
                 count[search_term] = arrayObject.filter(array_val => array_val == search_term ).length;
                 return count;
             },{}) 
         : arrayObject.filter( array_val => array_val == searchParam ).length;    

    //@ POST HTTP DATA HANDLER  
    app.post           = (destination, data) =>  
        $q((resolve, reject) => {

            $http.post(destination, data)
                .success(resolve)
                .error(reject)

        });

    //@ GET HTTP DATA HANDLER  
    app.get            = (destination, params) => 
        $q((resolve, reject) => {

            $http.get(destination, { params })
            .success(resolve)
            .error(reject)

        });

    //@ PUT HTTP DATA HANDLER 
    app.put            = (destination, data) => 
        $q((resolve, reject) => {

            $http.put(destination, data)
                .success(resolve)
                .error(reject)

        });

    //@ DELETE HTTP DATA HANDLER 
    app.delete         = (destination, params) => 
        $q((resolve, reject) => {

            $http.delete(destination, {params})
                .success(resolve)
                .error(reject)

        });

    //@ Handle background calls to the web server for database integration
    app.db             = (params, destination) =>
        $q((resolve, reject) => {

            destination = (destination) ? destination : `${hlink}/sms`;
            $http.get(destination, { params })
            .success(resolve)
            .error(reject)

        });
    
    //@ Handle email sending requests
    app.mail           = (data, destination) =>
        $q((resolve, reject) => {
            destination = (destination) ? destination : `${remoteAuth.url}/mail`;
            $http.post(destination, data)
            .success(resolve)
            .error(reject)
        });

    //@ Handle The sending of welcome messages
    app.welcomeMail    = (data,destination) =>
        $q((resolve,reject)=>{

            destination = (destination) ? destination : `/welcome`;

            $http.post(destination, data)
            .success(resolve)
            .error(reject)

        });

    //@ Generic Process Event Handler
    app.handler        = (response) => 
    {
        response = (response.response) ? response : response.data;

        if (response.response == 200) {
            app.alert("<font color=green>Done</font>", app.str(response.data.message));
        } else {
            app.alert(`<font color=red>Uh Oh!</font> ( ${response.response} Error )`, app.str(response.data.message));
        }

    };

    //@ Generic Error Handler
    app.errorHandler   = app.error_handler = app.e_handler = (response) =>
    {
        response = (response.response) ? response : response.data;
        app.alert(`<font color=red>Uh Oh!</font>`, app.str(response.data.message));
    };

    //@ Generic Process Remote Event Handler
    app.remote_handler = app.remoteHandler = (response) =>
    {
        app.alert("<font color=blue>Data Response</font>", app.str(app.str(response)));
    };

    //@ SMS FIGURE COUNTER
    app.countSMS       = app.count_sms = (data) => (Math.ceil(data.length / 160) == 0) ? 1 : Math.ceil((data.length) / 160);
    app.countSMSify    = app.count_smsify = (data) => $q.resolve( app.countSMS(data) );

    //@ CONVERT DATA TO A TABLE
    app.tabulate       = ( text, headers, data ) =>
    {
        UIkit.modal.alert('<font color="#1976D2" style="font-weight:bold;text-transform:uppercase;"> DOWNLOAD NOTICE</font> <hr> <center>The report is being generated.<center>');

        return $q( (resolve,reject) => 
        {
            //@ Start  an instance of the pdf generator
            let doc = new jsPDF('l', 'pt');

            //@ Add a simple title
            doc.autoTable( headers, data, {
                styles: {fillColor: [100, 175, 250], fontSize: 5},
                columnStyles: {
                    id: {fillColor: 255}
                },
                margin: {top: 60},
                addPageContent: function(data) {
                    doc.text(`${text} at ${new Date().format("yyyy/mm/dd HH:mm")}`, 40, 30);
                }
            });

            resolve( doc.save(`${text} ${new Date().format("yyyy/mm/dd HH:mm")}.pdf`) )

        })   

    };

    return app;

}])

//@@ The Remote authentication service
.service("remoteAuth", [
                        "$http"
                        ,"$localStorage"
                        ,"$q"
                        ,function($http, $localStorage, $q) 
{
    
    let r_auth          = this;

    r_auth.url          = 'http://bixbyte.io'

    r_auth.setUrl       = r_auth.set_url = (accessUrl) =>
        $q((resolve, reject) => {
            r_auth.url = accessUrl;
            resolve(accessUrl);
        })

    r_auth.SetAuth      = r_auth.set_auth = (AuthToken) =>
        $q((resolve, reject) => {

            resolve($http.defaults.headers.common.Authorization = AuthToken || ($localStorage.framify_user) ? $localStorage.framify_user.token : undefined);

        });

    //@ Perform User Registration
    r_auth.Register     = r_auth.register =  (credentials) =>
        $q( (resolve, reject) =>
        {

            $http.post(`${r_auth.url}/auth/register`, credentials)
                .success((response) => 
                {

                    if (response.response == 200) 
                    {
                        resolve(credentials);
                    } 
                    else 
                    {
                        reject(response.data.message);
                    }

                })
                .error((response) =>
                {
                    reject(JSON.stringify(((response) ? ((response.data) ? response.data.message : response) : response) || "Could not obtain a response from the server."))
                })

        });

    //@ Perform a User Login
    r_auth.Login        = r_auth.login = (params) =>
        $q((resolve, reject) => 
        {

            //@ Append the auth command to the params [jp dash auth only]
            // params["action"] = "auth";
            // params["password"]     = (params["password"]);

            //@ Push the authentication request
            $http.get(`${r_auth.url}/auth/verify`, { params })
            .success( (response) => 
            {
                if (response.response == 200) 
                {
                    $localStorage.framify_user = response.data.message;
                    resolve(response.data.message);
                } 
                else 
                {
                    reject(response.data.message);
                }

            })
            .error( (response) => 
            {
                console.dir(response)
                reject(JSON.stringify(((response) ? ((response.data) ? response.data.message : response) : response) || "Could not obtain a response from the server."))
            })

        });

    //@ Perform A User Logout
    r_auth.Logout       = r_auth.logout = () =>
    {

        return $q( (resolve, reject) =>
        {

            //@ Clear the localstorage instance of the login data
            delete $localStorage.framify_user;
            
            //@ Clear all the existing session cookies
            document.cookie.split(";").forEach((c) => { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });

            // r_auth.SetAuth(undefined)
            //     .then(resolve)
            
            //@ Move on to the next task
            resolve();

        });

    };

    return r_auth;

}])

//@@ The Authentication service  
// ,$http,$localStorage,$q
.service('auth', [
                    "remoteAuth"
                    ,function(remoteAuth) 
{

    Object.assign(this,remoteAuth);
    return this;

}])

//@ The infobip SMS integration module
.service("iSMS", [
                    "$http"
                    ,"$q"
                    ,"app"
                    ,function($http, $q, app) 
{

    let isms              = this;

    isms.provider         = '/sms';

    isms.setProvider      = isms.set_provider = (providerURL) => {
        isms.provider = (providerURL.toString().includes('/sms')) ? providerURL : `${providerURL}/sms`;
        console.log(`All SMS requests via the i service will now be routed to ${isms.provider}`);
    };

    isms.one              = (data) => 
        $q((resolve, reject) => {

            $http.post(`${isms.provider}/one`, data)
                .success( (response) =>
                {
                    if (response.response == 200) 
                    {
                        resolve(response);
                    } 
                    else 
                    {
                        reject(response);
                    }
                })
                .error((response) =>
                {
                    reject(app.make_response(500, JSON.stringify(((response) ? ((response.data) ? response.data.ismsssage : response) : response) || "Could not obtain a response from the server.")))
                })
        });

    isms.many             = (data) => {

        return $q((resolve, reject) => {

            $http.post(`${isms.provider}/many`, data)
            .success(function(response) {

                if (response.response == 200) {

                    resolve(response)

                } else {

                    reject(response)

                }

            })
            .error(function(response) {
                reject(app.make_response(500, JSON.stringify(((response) ? ((response.data) ? response.data.ismsssage : response) : response) || "Could not obtain a response from the server.")))
            })

        })

    };

    isms.template         = (data) => {

        return $q((resolve, reject) => {

            $http.post(`${isms.provider}/template`, data)
            .success(function(response) {

                if (response.response == 200) {

                    resolve(response)

                } else {

                    reject(response)

                }

            })
            .error(function(response) {
                reject(app.make_response(500, JSON.stringify(((response) ? ((response.data) ? response.data.ismsssage : response) : response) || "Could not obtain a response from the server.")))
            })

        })

    };

    isms.test             = (data) => {

        return $q((resolve, reject) => {

            $http.post(`${isms.provider}`, data)
            .success(function(response) {

                if (response.response == 200) {

                    resolve(response)

                } else {

                    reject(response)

                }

            })
            .error(function(response) {
                reject(app.make_response(500, JSON.stringify(((response) ? ((response.data) ? response.data.ismsssage : response) : response) || "Could not obtain a response from the server.")))
            })

        })

    };

    isms.echo             = (data) => {

        return $q((resolve, reject) => {

            $http.post(`${isms.provider}/echo`, data)
            .success(function(response) {

                if (response.response == 200) {

                    app.alert("<font color=green>SMS ECHO</font>", app.str(response.data.message));
                    resolve(response)

                } else {

                    reject(response)

                }

            })
            .error(function(response) {
                reject(app.make_response(500, JSON.stringify(((response) ? ((response.data) ? response.data.message : response) : response) || "Could not obtain a response from the server.")))
            })

        })

    }

    isms.handler          = (responseData) => {

        return $q((resolve, reject) => {

            let resp = (responseData.response) ? app.clone(responseData) : app.clone(responseData.data);

            if (responseData.response == 200) {
                app.alert("<font color=green>SMS RESPONSE</font>", "The SMS messages have been queued for sending ");
                resolve(resp)
            } else {
                app.alert(`<font color=red>Uh Oh!</font> ( ${responseData.response} Error )`, app.str(responseData.data.message));
                reject(resp)
            }

        })

    };

    return isms;

}])

//@ Configure the application for execution
.run([
        "app"
        ,"$rootScope"
        ,"$state"
        ,"$localStorage"
        ,"auth"
        ,"remoteAuth"
        ,"$http"
        ,"iSMS"
        // ,"$templateCache"
        ,function(app, $rootScope, $state, $localStorage, auth, remoteAuth, $http, iSMS) 
{

    //@ Clear the application cache on page load [Breaks the datetime picker and framify pagination handler]
    // $rootScope.$on('$viewContentLoaded', function() {
    //     $templateCache.removeAll();
    // });    

    //! INJECT THE LOCATION SOURCE TO THE ROOT SCOPE
    $rootScope.location     = $state;

    //! INJECT THE $localStorage instance into the root scope
    $rootScope.storage      = $localStorage;

    //! INJECT THE APPLICATION'S MAIN SERVICE TO THE ROOT SCOPE SUCH THAT ALL SCOPES MAY INHERIT IT
    $rootScope.app          = app;

    //! SIMPLE APPLICATION BEHAVIOR SETUP
    $rootScope.frame        = {};

    //@ INJECT THE infobip SMS sender into the root scope
    $rootScope.iSMS         = iSMS;

    //@ INJECT THE AUTHENTICATION SERVICE
    $rootScope.auth         = auth;
    $rootScope.remoteAuth   = remoteAuth;

    //! IDENTIFY THE CURRENT PATH
    $rootScope.frame.path   = () => $state.absUrl().split("/#/")[0] + "/#/" + $state.absUrl().split("/#/")[1].split("#")[0];
    //p.split("/#/")[0]+"/#/"+p.split("/#/")[1].split("#")[0]


    //! RELOCATION HANDLING
    $rootScope.frame.relocate = (loc) => $rootScope.location.go(loc);

    //@ The global permissions definition object
    $rootScope.permissions  = {

        //@ ALLOW ONLY ADMIN USERS
        admin_only          : (user) =>  ((user.role) ? (( user.role == 'admin') ? true : false ) : false),
        
        //@! FROM MATCHING ORGANIZATIONS
        admin_only_org      : (user, item_org) => ((user.role) ? ((user.role == 'admin') && (user.organization == item_org) ? true : false) : false),

        //@ ALLOW ONLY CLIENT USERS
        client_only         : (user) => ((user.role) ? ((user.role == 'client') ? true : false) : false),

        //@! FROM MATCHING ORGANIZATIONS
        client_only_org     : (user, item_org) =>  ((user.role) ? (((user.role == 'client') && (user.organization == item_org)) ? true : false) : false),

        //@ ALLOW ONLY AUDIT USERS
        audit_only          : (user) => ((user.role) ? ((user.role == 'audit') ? true : false) : false),

        //@! FROM MATCHING ORGANIZATIONS        
        audit_only_org      : (user, item_org) => ((user.role) ? (((user.role == 'audit') && (user.organization == item_org)) ? true : false) : false),

        //@ ALLOW BOTH ADMIN AND CLIENT USERS
        admin_client        : (user) =>  ((user.role) ? ((user.role == 'admin' || user.role == 'client') ? true : false) : false),
            
        //@! FROM MATCHING ORGANIZATIONS
        admin_client_org    : (user, item_org) => ((user.role) ? (((user.role == 'admin' || user.role == 'client') && (user.organization == item_org)) ? true : false) : false),

        //@! FROM MATCHING ORGANIZATIONS WITH ADMIN EXEMPT
        any_admin_client_org: (user, item_org) => ((user.role) ? (((user.role == 'audit')) ? false : (user.role == 'admin') ? true : (user.organization == item_org) ? true : false) : false),

        //@ ALLOW ALL USERS 
        any                 : (user) => true,

        //@! FROM MATCHING ORGANIZATIONS
        any_org             : (user, item_org) => (user.organization == item_org) ? true : false,

        //@! EXCLUDE ADMINS FROM SCRUTINY
        any_admin_other_org : (user, item_org) =>  ((user.role == 'admin') ? true : ((user.organization == item_org) ? true : false))

    };

}])

//@ The main controller
.controller("framifyController",[
                                    "$scope"
                                    ,"$state"
                                    ,"$rootScope"
                                    ,"$http"
                                    ,"$q"                                 
                                    ,function($scope, $state, $rootScope, $http, $q) 
{

    //!APPLICATION GLOBAL SCOPE COMPONENTS
    $scope.current              = {};
    $scope.ui                   = {};

    // $scope.urlParams = $stateParams;

    $rootScope.nav              = [];
    $rootScope.nav.search;

    $scope.nav.hasFilters       = false;


    //** MANAGE THE NAVIGATION SEARCH STATUS
    $scope.openFilters          = (hasFilters) => {
        $scope.nav.hasFilters =  (hasFilters === true) ? true : false;
    };

    //!RE-INITIALIZE APPLICATION DATA
    $rootScope.app.reinit       = () => $scope.location.path("/");

    /** 
     * ++LATER++
     */
    //@ CHECK IF OBJECT EXISTS IN ARRAY
    $scope.objectInArray        =  $scope.object_in_array = $scope.obj_in_array = (list, item)=> 
    {
        var len = list.length;
    
        for (var i = 0; i < len; i++) {
            var keys = Object.keys(list[i]);
            var flg = true;
            for (var j = 0; j < keys.length; j++) {
                var value = list[i][keys[j]];
                if (item[keys[j]] !== value) {
                    flg = false;
                }
            }
            if (flg == true) {
                return i;
            }
        }
        return -1;
    };
 
    //@ FUNCTION EXECUTOR
    $rootScope.exec             = f => f();

    //@ VARIABLE SETTER
    $rootScope.setVar           = $rootScope.set_var = (obj, keys, v) => {

        if (keys.length === 1) 
        {
            obj[keys[0]] = v;
        } 
        else 
        {
            let key  = keys.shift();
            obj[key] = $rootScope.setVar(typeof(obj[key]) === 'undefined' ? {} : obj[key], keys, v);
        }

        return obj;

    };

  
    //@ PUSH TO ARRAY
    $scope.arrayPush            = $scope.array_push = ( arr,valu ) =>
        ( !Array.isArray(arr) ) 
            ? []
            : ( Array.isArray(valu) )
                ?  arr.concat(valu) 
                : (function(){ 
                    let myarr = JSON.parse( JSON.stringify( arr ) );
                    myarr.push(valu);
                    return myarr;
                })();

    /**
     * DATABASE CENTRIC ADDITION AND DELETION
     */

    //Define the main application objects
    $scope.add                  = {};
    $scope.fetch                = {};
    $scope.fetched              = {};
    $scope.counted              = {};
    $scope.data                 = {};
    $scope.actions              = { prequeue: [] };

    $scope.data.login           = {};
    $scope.data.admin           = {};

    //@ Add an action to the actions holder
    $scope.addAction            = $scope.add_action = ( ky,val ) => $scope.actions[ky]  = val;

    // $rootScope.frame.changeAdmin(false);
    $scope.logedin              = false;

    //@ Redirect to a given sub-state in the pre-defined 'app' main state
    $scope.appRedirect          = $scope.app_redirect = (partialState) => $state.go("app." + partialState);

    //@ Redirect to the specified state
    $scope.goTo                 = $scope.go_to = (completeState) => $state.go(completeState);

    //@ UNWANTED ANGULAR JS OBJECTS
    $scope.unwanted             = ["$$hashKey", "$index","$$state"];

    //@ Remove the unwanted keys
    $scope.removeUnwanted       = $scope.remove_unwanted = (insertObj) => 
    {
        Object.keys(insertObj)
            .forEach(insertKey => 
            {
                if ($scope.unwanted.indexOf(insertKey) != -1) 
                {
                    insertObj[insertKey] = undefined;
                    delete insertObj[insertKey];
                }
            });
        return insertObj;
    };
    $scope.removeUnwantedify    = $scope.remove_unwantedify = (insertObj) =>  $q.resolve($scope.removeUnwanted(insertObj));     

    //@ Generate an MD5 checksum from the specified fields
    $scope.encryptFields = $scope.encrypt_fields = ( fields_to_encrypt, data_to_encrypt ) => 
        fields_to_encrypt
        .split(",")
        .reduce((previous,cryptField) => 
        {

            if (previous[cryptField]) 
            {
                previous[cryptField] = $scope.app.md5(previous[cryptField]);
            }

            return previous;

        },data_to_encrypt);

    $scope.encryptFieldsify = $scope.encrypt_fieldsify = ( fields_to_encrypt, data_to_encrypt ) => $q.resolve( $scope.encrypt_fields( fields_to_encrypt, data_to_encrypt ) );


    //@ HANDLE GENERIC DB REQUEST RESPONSES
    $scope.generic_db_request_handler = ( method, table, responseData, data ) => 
        $q((resolve,reject) => 
        {    
            let r = $scope.app.json(responseData);

            // console.log(`The relevant app data is: `)
            // console.dir(r)

            if (r.response == 200) 
            {
            
                if( typeof(r.data.message) == "string" )
                {
                    $scope.app.notify(`<center> ${r.data.message}</center>`, "success");
                }
                

                if( method == "custom")
                {
                    $scope.cFetched[table.toString()] = r.data.message;
                    // $scope.$apply();
                }
                else if( method == "count" )
                {
                    $scope.counted[table.toString()] = r.data.message;
                    // $scope.$apply();
                }
                else if( method != "fetch" )
                {
                    $scope.fetch(table, { specifics: data.specifics });
                }
                else
                {
                    $scope.fetched[table.toString()] = r.data.message;
                    // $scope.$apply();
                }            

                $scope.data[table.toString().replace(/vw_/ig, '')] = {};

                resolve(r.data.message);

            } 
            else 
            {
                // POSTGRESQL ERROR FORMAT MATCHING
                if (Array.isArray(r.data.message)) 
                {

                    let v = r.data.message[2].match(/DETAIL:(.*)/);

                    if (v != undefined || v != null) 
                    {
                        r.data.message = v[1];
                    } 
                    else 
                    {
                        r.data.message = r.data.message[2];
                    }

                    resolve(r.data.message);

                }

                $scope.app.notify(`<center>${ r.data.message }</center>`, 'danger');
                reject($scope.app.makeResponse(500, v[1]))

            }

        });


    //! BASIC ADDITION
    $scope.add                  = (table, data, cryptFields, cb) => 
        $q((resolve, reject) => 
        {
            //* populate the data object 
            data            = (data) ? $scope.app.json(data) : {};
            data.command    = "add";
            data.table      = (table != undefined) ? table.toString().replace(/vw_/ig, '') : "";
            data.extras     = (data) ? ((data.extras) ? data.extras.replace(/LIMIT 1/ig, '') : undefined) : undefined;

            //* Encrypt the specified cryptFields
            if (cryptFields) 
            {
                data =  $scope.encrypt_fields(cryptFields,data);
            }

            //* Perform the actual addition
            $scope.app.db($scope.removeUnwanted(data))
            .then((r) => 
            {

                $scope.generic_db_request_handler( "add", table, r, data )
                .then( d => 
                {
                    if( cb )
                    {
                        cb(d);
                    }
                    else
                    {
                        resolve(d)
                    }
                })
                .catch(reject);

            });

        });

    //! BASIC UPDATING
    $scope.update               = (table, data, cryptFields, cb) => 
        $q((resolve, reject) => 
        {

            //* pack the relevant info into the data object
            data            = (data) ? $scope.app.json(data) : {};
            data.command    = "update";
            data.table      = (table != undefined) ? table.toString().replace(/vw_/ig, '') : "";
            data.extras     = (data) ? ((data.extras) ? data.extras.replace(/LIMIT 1/ig, '') : undefined) : undefined;

            //* Encrypt the specified cryptFields
            if (cryptFields) 
            {
               
                data =  $scope.encrypt_fields(cryptFields,data);

                // cryptFields.split(",")
                //     .forEach((cryptField) => 
                //     {
                //         if (data[cryptField]) 
                //         {
                //             data[cryptField] = $scope.app.md5(data[cryptField])
                //         }
                //     });
            }

            //* perform the actual update
            $scope.app.db($scope.removeUnwanted(data))
            .then((r) => 
            {

                $scope.generic_db_request_handler( "update", table, r, data )
                .then( d => 
                {
                    if( cb )
                    {
                        cb(d);
                    }
                    else
                    {
                        resolve(d)
                    }
                })
                .catch(reject);
                
            })

        });

    //! BASIC DATA FETCHING
    var do_fetch                = (table, data, cryptFields) => 
        $q((resolve, reject) => 
        {

            //* populate the "data" object
            data            = (data) ? $scope.app.json(data) : {};
            data.command    = "get";
            data.table      = table;

            //* Encrypt the specified cryptFields
            if (cryptFields) 
            {
                data =  $scope.encrypt_fields(cryptFields,data);
            }

            //* perform the actual data fetching
            $scope.app.db($scope.removeUnwanted(data))
            .then((r) => 
            {

                $scope.generic_db_request_handler( "fetch", table, r, data )
                .then( d => 
                {
                    resolve(d);
                })
                .catch(reject);                

            })

        });

    $scope.fetch                = (table, data, cryptFields, cb) => 
    {

        if (Array.isArray(table)) 
        {

            let promiseArr = new Array();

            table
            .filter(e => typeof(e[0]) != 'undefined')
            .forEach((tData, tkey) => 
            {
                promiseArr.push(do_fetch(tData[0], (tData[1] || {})), cryptFields)
            });

            promiseArr = promiseArr.filter(e => typeof(e) != 'undefined');

            return $q.all(promiseArr);

        } else {
            return $q.resolve(do_fetch(table, data, cryptFields))
            .catch(function(e) {
                // console.log("Encountered an error when processing the fetch function.")
                // console.dir(e)
            });
        }

    };

    //! BASIC DELETION  
    $scope.del                  = (table, data, cryptFields, cb) => 
        $q((reject, resolve) => 
        {

            //* populate the data object
            data            = (data) ? $scope.app.json(data) : {};
            data.command    = "del";
            data.table      = (table != undefined) ? table.toString().replace(/vw_/ig, '') : "";

            //* Encrypt the specified cryptFields
            if (cryptFields) 
            {
                data =  $scope.encrypt_fields(cryptFields,data);
            }

            $scope.app.db($scope.removeUnwanted(data))
            .then((r) => 
            {

                $scope.generic_db_request_handler( "del", table, r, data )
                .then( d => 
                {
                    if( cb )
                    {
                        cb(d);
                    }
                    else
                    {
                        resolve(d)
                    }
                })
                .catch(reject);

            })

        });


    //@ Handle basic application redirection
    $scope.redirect             = (loc) => 
    {

        if (loc) 
        {
            window.location = loc
        } else {
            window.location = "/#/framify";
        }
        return $q.resolve(true)
        .catch( (e) =>
        {
            console.log("Encountered an error when processing the redirect function.")
            console.dir(e)
        })

    };

    // BASIC Custom Queries
    $scope.custom               = (table, data, cryptFields, cb) => 
    {

        return $q((resolve, reject) => 
        {

            //* initialize the data object
            data            = (data) ? $scope.app.json(data) : {};
            data.command    = "custom";

            //* Encrypt the specified cryptFields
            if (cryptFields) 
            {
                data =  $scope.encrypt_fields(cryptFields,data);
            }

            //* Perform the actual custom query
            $scope.app.db($scope.removeUnwanted(data))
            .then((r) => 
            {

                $scope.generic_db_request_handler( "add", table, r, data )
                .then( d => 
                {
                    if( cb )
                    {
                        cb(d);
                    }
                    else
                    {
                        resolve(d)
                    }
                })
                .catch(reject);
               
            })

        });

    };

    //BASIC DATABASE INSTANCEOF COUNTER
    $scope.count                = (table, data, cryptFields, cb) =>
        $q((resolve, reject) => {

            data            = (data) ? $scope.app.json(data) : {};
            data.table      = table;
            data.command    = "count";
            data.token      = data.token || {};

            //* Encrypt the specified cryptFields
            if (cryptFields) 
            {
                data =  $scope.encrypt_fields(cryptFields,data);
            }

            //* perform the actual count
            $scope.app.db($scope.removeUnwanted(data))
            .then((r) => {

                $scope.generic_db_request_handler( "add", table, r, data )
                .then( d => 
                {
                    if( cb )
                    {
                        cb(d);
                    }
                    else
                    {
                        resolve(d)
                    }
                })
                .catch(reject);

            })

        });

    /**
     * TABLE SORTER
     */
    $scope.sort                 = function(keyname) {
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }


    /**
     *  DELETE UNWANTED FIELDS
     */
    $scope.sanitize             = (data, keys) => 
    {        
        if (keys) 
        {

            keys.split(",").forEach((key) => 
            {
                delete data[key];
            });

            return $q.resolve(data)
            .catch( (e) => 
            {
                console.log("Encountered an error when processing the sanitize function.")
                console.dir(e)
            });

        }

    };

    /**
     * PUSH DATA TO OBJECT
     */
    $scope.dPush                = $scope.d_push = (obj, key, val) => 
    {
        obj[key] = val;
        return obj;
    };

    $scope.dPushify             = $scope.d_pushify = (obj, key, val) => $q.resolve($scope.dPush(obj, key, val));
  
    /**
     * @ MONTH REGULATION
     */
    $scope.currmoin             = $scope.app.monthNum();
    $scope.setMoin              = $scope.set_moin = (moin) => { $scope.currmoin = moin; };

    //@ DELETE UNWANTED PARAMETERS
    $scope.delParams            = $scope.del_params = (mainObj, removeKeys) => 
    {
        // $scope.app.clone
        mainObj = (mainObj) || {};
        removeKeys = (removeKeys) ? removeKeys.split(',') : [];

        removeKeys.forEach(e => {
            mainObj[e] = null;
            delete mainObj[e];
        });

        return mainObj;

    };

    //@ INJECT A STANDARD WHERE "Extras" OBJECT
    // addExtras(data.my_services,{username: storage.user.username},'username:WHERE owner','password,name,email,telephone,account_number,entity,active'),' ' )
    $scope.addExtras            = (targetObj, extrasObj, subStrings, removeKeys) => 
        $q((resolve, reject) => 
        {

            targetObj   = targetObj || {};
            extrasObj   = extrasObj || {};
            subStrings  = subStrings || '';
            removeKeys  = removeKeys || '';

            var extras = '';

            var k = [],
                v = [];

            //@ CAPTURE THE REMOVE KEYS
            removeKeys  = removeKeys.split(',').filter(e => e);

            removeKeys.forEach(e => {
                extrasObj[e] = null;
                delete extrasObj[e];
            });

            //@ CAPTURE REPLACE STRINGS
            subStrings
            .split(',')
            .forEach((e, i) => {
                let x = e.split(':');
                k[i] = (x[0]);
                v[i] = (x[1]);
            })

            //@ GET THE DEFINED KEYS
            var keys = Object.keys(extrasObj);

            //@ REPLACE THE DEFINED WITH THE DESIRED REPLACE KEYS
            k.forEach((e, i) => {

                if (keys.indexOf(e) != -1) {

                    extrasObj[v[i]] = extrasObj[e];
                    extrasObj[e] = null;
                    delete extrasObj[e];

                }

            });

            k = Object.keys(extrasObj);
            v = null;

            k.forEach((e, i) => {

                var fg = (!isNaN(extrasObj[e])) ? parseInt(extrasObj[e]) : "'" + extrasObj[e] + "'";
                extras += ' ' + e + "=" + fg + " AND";

            });

            k = null;

            targetObj.extras = extras.replace(/AND+$/, '');

            resolve(targetObj);

        });


    $scope.add_extras           = (targetObj, extrasObj, subStrings, removeKeys) => 
        $q((resolve, reject) => 
        {

            targetObj   = targetObj || {};
            extrasObj   = extrasObj || {};
            subStrings  = subStrings || ['', ''];
            removeKeys  = removeKeys || ['', ''];

            var target  = '';
            var extras  = '';

            var target_k = [],
                extras_k = [],
                target_v = [],
                extras_v = [];

            //@ Ensure that the substitution and removal parameters are arrays 
            if (!Array.isArray(subStrings) || !Array.isArray(removeKeys)) {
                reject('This Method only allows substitution and removal Arrays, <br> please consider using the <b><i>addExtras</i></b> object instead.');
            } else {

                //@ CAPTURE THE REMOVE KEYS
                let target_removeKeys = removeKeys[0].split(',').filter(e => e);
                let extras_removeKeys = removeKeys[1].split(',').filter(e => e);

                //@ Remove specified keys from the target object
                target_removeKeys.forEach(e => {
                    targetObj[e] = null;
                    delete targetObj[e];
                });

                //@ Remove specified keys from the extras object
                extras_removeKeys.forEach(e => {
                    extrasObj[e] = null;
                    delete extrasObj[e];
                });

                //@ CAPTURE REPLACE STRINGS
                let target_subStrings = subStrings[0].split(',');
                let extras_subStrings = subStrings[1].split(',');

                //@ Specify target key-value pairs
                target_subStrings.forEach((e, i) => {
                    let x = e.split(':');
                    target_k[i] = (x[0]);
                    target_v[i] = (x[1]);
                });

                //@ Specify extras key-value pairs
                extras_subStrings.forEach((e, i) => {
                    let x = e.split(':');
                    extras_k[i] = (x[0]);
                    extras_v[i] = (x[1]);
                });

                //@ GET THE DEFINED KEYS
                var extras_keys = Object.keys(extrasObj);
                var target_keys = Object.keys(targetObj);

                //@ TARGET - REPLACE THE DEFINED WITH THE DESIRED REPLACE KEYS
                target_k.forEach((e, i) => {

                    if (target_keys.indexOf(e) != -1) {

                        // // console.log( `Renaming the target ${e} to ${target_v[i]}` )

                        targetObj[target_v[i]] = targetObj[e];
                        targetObj[e] = null;
                        delete targetObj[e];

                    }

                });

                //@ EXTRAS - REPLACE THE DEFINED WITH THE DESIRED REPLACE KEYS
                extras_k.forEach((e, i) => {

                    if (extras_keys.indexOf(e) != -1) {

                        // // console.log( `Renaming the extras ${e} to ${extras_v[i]}` )
                        extrasObj[extras_v[i]] = extrasObj[e];
                        extrasObj[e] = null;
                        delete extrasObj[e];

                    }

                });

                //@ SQLify the extras object
                extras_k = null;

                extras_k = Object.keys(extrasObj);
                extras_v = null;

                extras_k.forEach((e, i) => {

                    var fg = (!isNaN(extrasObj[e])) ? parseInt(extrasObj[e]) : "'" + extrasObj[e] + "'";
                    extras += ' ' + e + "=" + fg + " AND";

                });

                extras_k = null;

                targetObj.extras = extras.replace(/AND+$/, '');

                resolve(targetObj);


            }

        });

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // ADDITIONS ON PROBATION
    // ----

    //@ LOAD A SERVICE ONTO THE STAGE
    $scope.service              = {};
    $scope.entity               = {};

    $scope.showService          = (serviceData) => 
    {
        $scope.service.available = true;
        $scope.service.current = serviceData;
        //$scope.$apply();
    };

    $scope.showEntity           = (serviceData) => 
    {        
        $scope.entity.available = true;
        $scope.entity.current = serviceData;
        //$scope.$apply();
    };

    //@ Count my entities
    $scope.howMany              = (table, data) => 
    {
        var data = data || { owner: $scope.storage.user.username };
        data = (data) ? $scope.app.json(data) : {};
        data.table = table || 'entities';
        data.command = "count";
        data.token = {};

        $scope.app.db($scope.removeUnwanted(data))
        .then((r) => 
        {

            $scope.generic_db_request_handler( "count", table, r, data )
            .then( d => 
            {
                    resolve(d)                
            })
            .catch(reject);

        })

    };

    // ----

    //@ FRAMIFY HANDLERS

    $scope.data.login           = $scope.data.login || {};

    $scope.data.me              = $scope.data.me || {};

    $scope.setData;

    //@ Initialize the handlers object
    $scope.handlers             = {};
    $scope.r_handlers           = $scope.handlers;

    //@ The registration success handler
    $scope.handlers.regSuccess  = $scope.r_handlers.regSuccess= $scope.handlers.reg_success = $scope.r_handlers.reg_success = 
    (message) =>
    {
        $scope.app.notify("The user has been registered");
        $state.go("app.login");
    };
    
     
    //@ The successful login handler
    $scope.handlers.loginSuccess = $scope.r_handlers.loginSuccess= $scope.handlers.login_success = $scope.r_handlers.login_success= 
    (message) =>
    {
        $scope.app.notify("<i class='fa fa-2x fa-spin fa-circle-o-notch'></i> Processing your login data", 'success', 4000);
        $state.go("app.panel");
    };

    //@ The registration error handler
    $scope.handlers.regError     = $scope.r_handlers.regError  = $scope.handlers.reg_error = $scope.r_handlers.reg_error =
    (message) =>
    {
        $scope.app.alert("<font color='red'>Signup Error</font>", message);
    };    

    //@ The login error handler
    $scope.handlers.loginError  = $scope.r_handlers.loginError= $scope.handlers.login_error = $scope.r_handlers.login_error= 
    (message) =>
    {
        $scope.app.alert("<font color='red'>Login Error</font>", message);
    };
    
    //@ The identity check verification handler
    $scope.handlers.identity    = $scope.r_handlers.identity = ()  =>
        $q( (reject, resolve) =>
        {

            $http( { 
                method: "GET", 
                url: `${$scope.app.hlink.replace(/:2433/ig,'')}:2433/auth/me`,  //`${$scope.remoteAuth}:2433/auth/me`, 
                headers : { Authorization: $scope.storage.framify_user.token  } 
            })
            .success( (response) => 
            {
                resolve($scope.data.me = response.data.message);
            })
            .error( (error) => 
            {
                console.dir(error);
                $scope.auth.Logout()
                .then( () => 
                {                    
                    $scope.data.me = undefined;
                    $scope.app.notify("<i class='fa  fa-exclamation-triangle'></i>&nbsp;&nbsp;Your lease has expired <br>Please Login to continue.", 'danger');
                    reject($state.go("app.login"));
                });

            })

        });

    //@ The login status check handler
    $scope.handlers.isLogedIn   = $scope.handlers.is_loged_in  = () =>
        $q( (resolve, reject) =>
        {
            if (!$scope.storage.framify_user) 
            {
                $scope.data.me = undefined;
                // console.log("\nNo localstorage value is defined\n")

                if ($state.current.name != "app.login") 
                {
                    $scope.app.notify("<i class='fa  fa-exclamation-triangle'></i>&nbsp;&nbsp;Please Login to continue.", 'danger');
                    reject($state.go("app.login"));
                }

            } 
            else if (!$http.defaults.headers.common.Authorization || $http.defaults.headers.common.Authorization == undefined || $http.defaults.headers.common.Authorization == '') 
            {

                // console.log("\nThe authentication header is not yet defined\n")
                $scope.auth.SetAuth(undefined)
                .then( () => 
                {
                    // console.log(`\nThe authentication header has been set to ${$http.defaults.headers.common.Authorization}\n`)

                    if ($state.current.name == "app.login") 
                    {
                        resolve($state.go("app.panel"));
                    } 
                    else 
                    {
                        resolve();
                    }

                })

            } 
            else 
            {

                if ($state.current.name == "app.login") 
                {
                    resolve($state.go("app.panel"));
                } 
                else 
                {
                    resolve();
                }

            }

        });
    

    $scope.r_handlers.isLogedIn = $scope.r_handlers.is_loged_in = () => 
        $q(function(resolve, reject) 
        {
            if (!$scope.storage.framify_user) 
            {
                $scope.data.me = undefined;

                if ($state.current.name != "app.login") 
                {
                    $scope.app.notify("<i class='fa  fa-exclamation-triangle'></i>&nbsp;&nbsp;Please Login to continue.", 'danger');
                    reject($state.go("app.login"));
                }
            } 
            else if (!$http.defaults.headers.common.Authorization || $http.defaults.headers.common.Authorization == undefined || $http.defaults.headers.common.Authorization == '') 
            {
                $scope.remoteAuth.SetAuth(undefined)
                .then(function() 
                {

                    if ($state.current.name == "app.login") 
                    {
                        resolve($state.go("app.panel"));
                    } 
                    else 
                    {
                        resolve();
                    }
                })
            } 
            else 
            {
                if ($state.current.name == "app.login") 
                {
                    resolve($state.go("app.panel"));
                } 
                else 
                {
                    resolve();
                }
            }

        });
    

    $scope.data.recovery        = {};
    $scope.data.queued          = [];
    
    //@ The recovery attempt function
    $scope.recover_password     = (email) =>
    {
        
        $scope.data.recovery.response = "Loading ...";

        $http({
            method: "POST",
            url: `${$scope.remoteAuth.url}/passwords/forgot`,
            data: {
                email: email
            }
        })
        .then(function(response) {
            $scope.data.recovery.response = response.data.data.message;
            $scope.app.alert('Password Recovery',response.data.data.message)
            $scope.data.recovery.email = "";
        })

    };

    //@ iNITIATE THE SENDING OF A WELCOME EMAIL UPON SIGNUP
    $scope.isSignedUp           = (obj) => 
        $q( (resolve,reject) => 
        {
            $scope.app.welcomeMail({
                from :      "Framify Accounts <accounts@bixbyte.io>"
                ,to :       obj.email
                ,subject:   "Welcome to our platform"
                ,data : {  name: obj["name.first"], telephone: obj.telephone , username: obj["account.name"] }
            },`${$scope.remoteAuth.url}/welcome`)                               
            .then((r)=>
            {                
                $scope.app.alert("User Added","<center style='font-size:1.4em;'>The user <font color='green'>"+obj['name.first'] + "</font>.<br><br> has successfully been registered.</center>");                    // window.location = "http://admin.infomed.co.ke";
                resolve(true);
            })
            .catch((e)=>
            {
                $scope.app.alert("User Added","<center style='font-size:1.4em;'>The user <font color='green'>"+obj['name.first'] + "</font>.<br><br> has successfully been registered.</center>"); 
                resolve(true);
            })
        });

    $scope.SmsSuccess = (response) => 
    {
        delete $scope.storage.framify_user["nullify"];
        $scope.app.alert('SMS REQUEUE RESPONSE', "Message(s) successfuly requeued!" );
    };

    $scope.SmsError = (response) => 
    {
        delete $scope.storage.framify_user["nullify"];
        $scope.app.alert('<font color="red">SMS REQUEUE RESPONSE</font>', $scope.app.str(response.data || response));
    };


}])

//@ A DIRECTIVE THAT ALLOWS THE EDITING OF DATA IN A MODEL
.directive("contenteditable", [
                                function() 
{
    return {
        restrict: "A",
        require: "ngModel",
        link: (scope, element, attrs, ngModel) =>
        {

            function read() 
            {
                ngModel.$setViewValue(element.html());
            }

            ngModel.$render = function() 
            {
                element.html(ngModel.$viewValue || "");
            };

            element.bind("blur keyup change", function() 
            {
                scope.$apply(read);
            });
        }
    };

}])

//@ Handle the upload of files in angular
.directive("fileModel", [
                            "$parse"
                            ,function($parse) 
{
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function() {
                scope.$apply(function() {
                    if (attrs.multiple) {
                        modelSetter(scope, element[0].files);
                    } else {
                        modelSetter(scope, element[0].files[0]);
                    }
                });
            });
        }
    };

}])


//!CONFIGURE THE BNASIC PRE-RUNTIME STATES OF THE APPLICATION
.config([
            "ChartJsProvider"
            ,"$httpProvider"
            ,(ChartJsProvider,$httpProvider) =>
{

    //@ Set the authentication header for each request
    $httpProvider.interceptors.push('authIntercept');

    //@SET THE DEFAULT CHART COLORS
    // ChartJsProvider.setOptions({ colors: ['#FF0000', '#FF00FF', '#00FFFF', '#00FF00', '#0000FF', '#FF00FF', '#4D5360'] });

}])


//@ Allow ng-bind-html with directives
.directive("compile", [
                        "$compile"
                        ,function ($compile) 
{
    return function(scope, element, attrs) 
    {
        scope.$watch(
            function(scope) 
            {
                // watch the 'compile' expression for changes
                return scope.$eval(attrs.compile);
            },
            function(value) 
            {
                // when the 'compile' expression changes
                // assign it into the current DOM
                element.html(value);

                // compile the new DOM and link it to the current
                // scope.
                // NOTE: we only compile .childNodes so that
                // we don't get into infinite loop compiling ourselves
                $compile(element.contents())(scope);
            }
        );
    };
}])