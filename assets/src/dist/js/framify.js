"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// "jsonFormatter",
angular.module("framify.js", ["ui.router", "framify-paginate", "ngStorage", "chart.js", "ngAria", "ngMaterial", "ngMessages", "jsonFormatter"])
/**
 * Handles the injection of the Authentication Headers with each http call
 */
.factory("authIntercept", ["$localStorage", function ($localStorage) {
    return {

        request: function request(config) {

            //@ If the local user authentication object is defined
            if ($localStorage.framify_user) {

                //@ If the authentication bypass is not set
                if ($localStorage.framify_user.nullify != true) {

                    //@ If the user details exist
                    if ($localStorage.framify_user.me) {
                        //@ Append them to the 'AuthData' Header
                        config.headers.AuthData = JSON.stringify($localStorage.framify_user.me);
                    }

                    //@ If an application key is defined
                    if ($localStorage.framify_user.key) {
                        //@ Append the 'app_key' header
                        config.headers.App_Key = $localStorage.framify_user.key;
                    }

                    //@ Append the 'Authorization' header
                    config.headers.Authorization = $localStorage.framify_user.token;

                    // console.log(`Authorization header+++ set for the request`)
                    return config;
                }
                //@ If the credentials bypass is specified
                else {

                        //@ Pass the "authorization" header since others are not needed
                        config.headers.Authorization = $localStorage.framify_user.token;
                        // console.log(`Authorization __ header set for the request`);
                        return config;
                    }
            }
            //@ If the user isn't loged in, continue as is
            else {

                    return config;
                }
        }
    };
}])

//@ Basic Application Essentials
.service("app", ["$http", "remoteAuth", "$q", "pdfGen", "$localStorage", function ($http, remoteAuth, $q, pdfGen, $localStorage) {

    var app = this;

    app.pdfGen = pdfGen;

    //@ Add provided numbers
    app.add = function (a, b) {
        return !isNaN(parseInt(a) + parseInt(b)) ? parseInt(a) + parseInt(b) : '...';
    };

    //!SETUP THE APPLICATION BASICS
    var url = window.location.href.split('/').filter(function (urlPortion) {
        return urlPortion != '' && urlPortion != 'http:' && urlPortion != 'https:';
    });
    var pathPos = window.location.href.split('/').filter(function (urlPortion) {
        return urlPortion != '';
    });

    //! APP CONFIGURATIONS
    app.scheme = pathPos[0];
    app.ip = url[0].split(':')[0];
    app.port = url[0].split(':')[1];
    app.hlink = app.scheme + "//" + app.ip + (app.port != undefined ? ":" + app.port : "");

    //!APPLICATION URL
    app.url = app.hlink;

    var hlink = app.hlink;

    app.nav = [];

    app.logger = function (a) {
        console.dir(a);
    };

    //@Perform simple redirects
    app.redirect = function (loc) {
        if (loc) {
            window.location = loc;
        } else {
            window.location = "/";
        }
        return $q.resolve(true).catch(function (e) {
            console.log("Encountered an error when processing the redirect function.");
            console.dir(e);
        });
    };

    //@ Add a Key=>value pair to an object being careful to parse integers
    app.setVar = function (obj, key, val) {
        obj = obj ? obj : {};
        obj[key] = !isNaN(val) ? parseInt(val) : val;
        return obj;
    };

    //@ Add a key=>value pair to an object without type concerns
    app.setVarify = function (obj, key, val) {
        return $q.resolve(app.setVar(obj, key, val));
    };

    //@ Assign a key=>value pair to an object without creating one if not exists
    app.set = function (obj, key, value) {
        return obj[key] = value;
    };

    //@ Fetch the value at key {X} in an object
    app.getVal = function (obj, key) {
        return obj[key];
    };
    app.getValify = function (obj, key) {
        return $q.resolve(app.getval(obj, key));
    };

    //* CONDITIONALLY TRANSFORM TO STRING
    app.str = function (obj) {
        return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" ? JSON.stringify(obj) : obj;
    };
    app.stringify = function (obj) {
        return $q.resolve(app.str(obj));
    };

    //* CONDITIONALLY TRANSFORM TO JSON
    app.json = function (obj) {
        return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" ? obj : JSON.parse(obj);
    };
    app.jsonify = function (obj) {
        return $q.resolve(app.json(obj));
    };

    //* CONDITIONALLY RETURN AN MD5 HASH
    app.md5 = function (str) {
        return (/^[a-f0-9]{32}$/gm.test(str) ? str : CryptoJS.MD5(str).toString()
        );
    };
    app.md5ify = function (str) {
        return $q.resolve(app.md5(str));
    };

    //BASE64 ENCODE A STRING
    app.base64_encode = function (string) {
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(string));
    };
    app.base64_encodify = function (string) {
        return $q.resolve(app.base64_encode(string));
    };

    //BASE64 DECODE A STRING
    app.base64_decode = function (encoded) {
        return CryptoJS.enc.Base64.parse(encoded).toString(CryptoJS.enc.Utf8);
    };
    app.base64_decodify = function (encoded) {
        return $q.resolve(app.base64_decode(encoded));
    };

    //@ THE OFFICIAL FILE UPLOAD SERVICE
    app.upload = function (data, destination) {

        return $q(function (resolve, reject) {

            //* create a formdata object
            var fd = new FormData();

            //* add the defined keys to the formdata object
            for (var key in data) {
                fd.append(key, data[key]);
            };

            //* post the data to the /upload route of the running server
            $http.post(hlink + "/upload/" + destination, fd, {

                transformRequest: angular.identity,

                //* ensure automatic content-type setting
                headers: { 'Content-Type': undefined, 'Authorization': $localStorage.framify_user.token }

            }).then(function (d) {
                return resolve(d);
            });
        });
    };

    //@ CUSTOM FILE UPLOAD SERVICE
    app.custom_upload = function (data, destination) {

        return $q(function (resolve, reject) {

            //* create a formdata object
            var fd = new FormData();

            //* add the defined keys to the formdata object
            for (var key in data) {
                fd.append(key, data[key]);
            };

            //* post the data to the /upload route of the running server
            $http.post(hlink + "/" + destination, fd, {

                transformRequest: angular.identity,

                //* ensure automatic content-type setting
                headers: { 'Content-Type': undefined, 'Authorization': $localStorage.framify_user.token }

            }).then(function (d) {
                return resolve(d);
            });
        });
    };

    //@ GET A KEYS ARRAY FROM AN OBJECT
    app.keys = function (obj) {
        return Object.keys(obj);
    };

    //@ GET A VALUES ARRAY FROM AN OBJECT
    app.vals = function (obj) {
        return Object.keys(obj).reduce(function (prev, curr, idx) {
            prev[idx] = curr;return prev;
        }, []);
    };
    app.valsify = function (obj) {
        return $q.resolve(app.vals(obj));
    };

    //@ CREATE A COPY OF AN OBJECT
    app.clone = function (obj) {

        //* ensure that the object is defined
        if (null == obj || "object" != (typeof obj === "undefined" ? "undefined" : _typeof(obj))) return obj;

        //* call the object constructor prototype
        var copy = obj.constructor();

        //* clone all attributes of the parent object into a new object
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = /^[0-9]+$/.test(obj[attr]) ? parseInt(obj[attr]) : obj[attr];
        }

        //* return the newly created object
        return copy;
    };
    app.clonify = function (obj) {
        return $q.resolve(app.clone(obj));
    };

    //! PARSE TO AN INTEGER
    app.parseInt = function (str) {
        return parseInt(str);
    };
    app.parseIntify = function (str) {
        return $q.resolve(app.parseInt(str));
    };

    app.parseFloat = function (str) {
        return parseFloat(str);
    };
    app.parseFloatify = function (str) {
        return $q.resolve(app.parseFloat(str));
    };

    //! EMPTY CALLBACK
    app.doNothing = function () {
        return $q.resolve();
    };

    //@ FIND NUMBERS IN A STRING
    app.getNumbers = function (str) {
        var firstOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var numMatch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : /\d+/g;
        return firstOnly ? str.toString().match(numMatch)[0] : str.toString().match(numMatch);
    };
    app.getNumbersify = function (str) {
        var firstOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var numMatch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : /\d+/g;
        return $q.resolve(app.getNumbers((str, firstOnly = true, numMatch = /\d+/g)));
    };

    //! SET A NOTIFICATION 
    app.notify = function (notificationContent, notificationClass, notificationTimeout, position) {

        UIkit.notify({
            message: "<center>" + (notificationContent || 'A blank notification was triggered.') + "</center>",
            status: notificationClass || 'info',
            timeout: notificationTimeout || 4000,
            pos: 'top-center' || position
        });

        return $q.resolve(true).catch(function (e) {
            console.dir(e.message);
        });
    };

    var notify = app.notify;

    app.countries = [{ name: "Afghanistan", value: "1" }, { name: "Albania", value: "2" }, { name: "Algeria", value: "3" }, { name: "American Samoa", value: "4" }, { name: "Andorra", value: "5" }, { name: "Angola", value: "6" }, { name: "Anguilla", value: "7" }, { name: "Antarctica", value: "8" }, { name: "Antigua and Barbuda", value: "9" }, { name: "Argentina", value: "10" }, { name: "Armenia", value: "11" }, { name: "Aruba", value: "12" }, { name: "Australia", value: "13" }, { name: "Austria", value: "14" }, { name: "Azerbaijan", value: "15" }, { name: "Bahamas", value: "16" }, { name: "Bahrain", value: "17" }, { name: "Bangladesh", value: "18" }, { name: "Barbados", value: "19" }, { name: "Belarus", value: "20" }, { name: "Belgium", value: "21" }, { name: "Belize", value: "22" }, { name: "Benin", value: "23" }, { name: "Bermuda", value: "24" }, { name: "Bhutan", value: "25" }, { name: "Bolivia", value: "26" }, { name: "Bosnia and Herzegowina", value: "27" }, { name: "Botswana", value: "28" }, { name: "Bouvet Island", value: "29" }, { name: "Brazil", value: "30" }, { name: "British Indian Ocean Territory", value: "31" }, { name: "Brunei Darussalam", value: "32" }, { name: "Bulgaria", value: "33" }, { name: "Burkina Faso", value: "34" }, { name: "Burundi", value: "35" }, { name: "Cambodia", value: "36" }, { name: "Cameroon", value: "37" }, { name: "Canada", value: "38" }, { name: "Cape Verde", value: "39" }, { name: "Cayman Islands", value: "40" }, { name: "Central African Republic", value: "41" }, { name: "Chad", value: "42" }, { name: "Chile", value: "43" }, { name: "China", value: "44" }, { name: "Christmas Island", value: "45" }, { name: "Cocos (Keeling) Islands", value: "46" }, { name: "Colombia", value: "47" }, { name: "Comoros", value: "48" }, { name: "Congo", value: "49" }, { name: "Congo, the Democratic Republic of the", value: "50" }, { name: "Cook Islands", value: "51" }, { name: "Costa Rica", value: "52" }, { name: "Cote d\'Ivoire", value: "53" }, { name: "Croatia (Hrvatska)", value: "54" }, { name: "Cuba", value: "55" }, { name: "Cyprus", value: "56" }, { name: "Czech Republic", value: "57" }, { name: "Denmark", value: "58" }, { name: "Djibouti", value: "59" }, { name: "Dominica", value: "60" }, { name: "Dominican Republic", value: "61" }, { name: "East Timor", value: "62" }, { name: "Ecuador", value: "63" }, { name: "Egypt", value: "64" }, { name: "El Salvador", value: "65" }, { name: "Equatorial Guinea", value: "66" }, { name: "Eritrea", value: "67" }, { name: "Estonia", value: "68" }, { name: "Ethiopia", value: "69" }, { name: "Falkland Islands (Malvinas)", value: "70" }, { name: "Faroe Islands", value: "71" }, { name: "Fiji", value: "72" }, { name: "Finland", value: "73" }, { name: "France", value: "74" }, { name: "France Metropolitan", value: "75" }, { name: "French Guiana", value: "76" }, { name: "French Polynesia", value: "77" }, { name: "French Southern Territories", value: "78" }, { name: "Gabon", value: "79" }, { name: "Gambia", value: "80" }, { name: "Georgia", value: "81" }, { name: "Germany", value: "82" }, { name: "Ghana", value: "83" }, { name: "Gibraltar", value: "84" }, { name: "Greece", value: "85" }, { name: "Greenland", value: "86" }, { name: "Grenada", value: "87" }, { name: "Guadeloupe", value: "88" }, { name: "Guam", value: "89" }, { name: "Guatemala", value: "90" }, { name: "Guinea", value: "91" }, { name: "Guinea-Bissau", value: "92" }, { name: "Guyana", value: "93" }, { name: "Haiti", value: "94" }, { name: "Heard and Mc Donald Islands", value: "95" }, { name: "Holy See (Vatican City State)", value: "96" }, { name: "Honduras", value: "97" }, { name: "Hong Kong", value: "98" }, { name: "Hungary", value: "99" }, { name: "Iceland", value: "100" }, { name: "India", value: "101" }, { name: "Indonesia", value: "102" }, { name: "Iran (Islamic Republic of)", value: "103" }, { name: "Iraq", value: "104" }, { name: "Ireland", value: "105" }, { name: "Israel", value: "106" }, { name: "Italy", value: "107" }, { name: "Jamaica", value: "108" }, { name: "Japan", value: "109" }, { name: "Jordan", value: "110" }, { name: "Kazakhstan", value: "111" }, { name: "Kenya", value: "112" }, { name: "Kiribati", value: "113" }, { name: "Korea, Democratic People\'s Republic of", value: "114" }, { name: "Korea, Republic of", value: "115" }, { name: "Kuwait", value: "116" }, { name: "Kyrgyzstan", value: "117" }, { name: "Lao, People\'s Democratic Republic", value: "118" }, { name: "Latvia", value: "119" }, { name: "Lebanon", value: "120" }, { name: "Lesotho", value: "121" }, { name: "Liberia", value: "122" }, { name: "Libyan Arab Jamahiriya", value: "123" }, { name: "Liechtenstein", value: "124" }, { name: "Lithuania", value: "125" }, { name: "Luxembourg", value: "126" }, { name: "Macau", value: "127" }, { name: "Macedonia, The Former Yugoslav Republic of", value: "128" }, { name: "Madagascar", value: "129" }, { name: "Malawi", value: "130" }, { name: "Malaysia", value: "131" }, { name: "Maldives", value: "132" }, { name: "Mali", value: "133" }, { name: "Malta", value: "134" }, { name: "Marshall Islands", value: "135" }, { name: "Martinique", value: "136" }, { name: "Mauritania", value: "137" }, { name: "Mauritius", value: "138" }, { name: "Mayotte", value: "139" }, { name: "Mexico", value: "140" }, { name: "Micronesia, Federated States of", value: "141" }, { name: "Moldova, Republic of", value: "142" }, { name: "Monaco", value: "143" }, { name: "Mongolia", value: "144" }, { name: "Montserrat", value: "145" }, { name: "Morocco", value: "146" }, { name: "Mozambique", value: "147" }, { name: "Myanmar", value: "148" }, { name: "Namibia", value: "149" }, { name: "Nauru", value: "150" }, { name: "Nepal", value: "151" }, { name: "Netherlands", value: "152" }, { name: "Netherlands Antilles", value: "153" }, { name: "New Caledonia", value: "154" }, { name: "New Zealand", value: "155" }, { name: "Nicaragua", value: "156" }, { name: "Niger", value: "157" }, { name: "Nigeria", value: "158" }, { name: "Niue", value: "159" }, { name: "Norfolk Island", value: "160" }, { name: "Northern Mariana Islands", value: "161" }, { name: "Norway", value: "162" }, { name: "Oman", value: "163" }, { name: "Pakistan", value: "164" }, { name: "Palau", value: "165" }, { name: "Panama", value: "166" }, { name: "Papua New Guinea", value: "167" }, { name: "Paraguay", value: "168" }, { name: "Peru", value: "169" }, { name: "Philippines", value: "170" }, { name: "Pitcairn", value: "171" }, { name: "Poland", value: "172" }, { name: "Portugal", value: "173" }, { name: "Puerto Rico", value: "174" }, { name: "Qatar", value: "175" }, { name: "Reunion", value: "176" }, { name: "Romania", value: "177" }, { name: "Russian Federation", value: "178" }, { name: "Rwanda", value: "179" }, { name: "Saint Kitts and Nevis", value: "180" }, { name: "Saint Lucia", value: "181" }, { name: "Saint Vincent and the Grenadines", value: "182" }, { name: "Samoa", value: "183" }, { name: "San Marino", value: "184" }, { name: "Sao Tome and Principe", value: "185" }, { name: "Saudi Arabia", value: "186" }, { name: "Senegal", value: "187" }, { name: "Seychelles", value: "188" }, { name: "Sierra Leone", value: "189" }, { name: "Singapore", value: "190" }, { name: "Slovakia (Slovak Republic)", value: "191" }, { name: "Slovenia", value: "192" }, { name: "Solomon Islands", value: "193" }, { name: "Somalia", value: "194" }, { name: "South Africa", value: "195" }, { name: "South Georgia and the South Sandwich Islands", value: "196" }, { name: "South Sudan", value: "197" }, { name: "Spain", value: "198" }, { name: "Sri Lanka", value: "199" }, { name: "St. Helena", value: "200" }, { name: "St. Pierre and Miquelon", value: "201" }, { name: "Sudan", value: "202" }, { name: "Suriname", value: "203" }, { name: "Svalbard and Jan Mayen Islands", value: "204" }, { name: "Swaziland", value: "205" }, { name: "Sweden", value: "206" }, { name: "Switzerland", value: "207" }, { name: "Syrian Arab Republic", value: "208" }, { name: "Taiwan, Province of China", value: "209" }, { name: "Tajikistan", value: "210" }, { name: "Tanzania, United Republic of", value: "211" }, { name: "Thailand", value: "212" }, { name: "Togo", value: "213" }, { name: "Tokelau", value: "214" }, { name: "Tonga", value: "215" }, { name: "Trinidad and Tobago", value: "216" }, { name: "Tunisia", value: "217" }, { name: "Turkey", value: "218" }, { name: "Turkmenistan", value: "219" }, { name: "Turks and Caicos Islands", value: "220" }, { name: "Tuvalu", value: "221" }, { name: "Uganda", value: "222" }, { name: "Ukraine", value: "223" }, { name: "United Arab Emirates", value: "224" }, { name: "United Kingdom", value: "225" }, { name: "United States", value: "226" }, { name: "United States Minor Outlying Islands", value: "227" }, { name: "Uruguay", value: "228" }, { name: "Uzbekistan", value: "229" }, { name: "Vanuatu", value: "230" }, { name: "Venezuela", value: "231" }, { name: "Vietnam", value: "232" }, { name: "Virgin Islands (British)", value: "233" }, { name: "Virgin Islands (U.S.)", value: "234" }, { name: "Wallis and Futuna Islands", value: "235" }, { name: "Western Sahara", value: "236" }, { name: "Yemen", value: "237" }, { name: "Yugoslavia", value: "238" }, { name: "Zambia", value: "239" }, { name: "Zimbabwe", value: "240" }];

    //! BASIC FRAMIFY FORMAT RESPONSE FORMATTER
    app.makeResponse = app.make_response = function (response, message, command) {
        return {
            response: response,
            data: { message: message, command: command }
        };
    };

    //!DATE FORMATERS
    //* date object     
    app.date = function () {
        return new Date();
    };

    //@ Convert to a date object
    app.toDate = app.to_date = function (d) {
        return new Date(d);
    };

    //* simple date
    app.newDate = app.new_date = function () {
        return new Date().toDateString();
    };

    //* isodate
    app.isoDate = app.iso_date = function () {
        return new Date().format('isoDate');
    };

    //* get the isoDate of the specified date
    app.getIsoDate = app.get_iso_date = function (d) {
        return new Date(d).format('isoDate');
    };

    //* get the isoDate of a date object
    app.toIsoDate = app.to_iso_date = function (dObj) {
        return dObj.format('isoDate');
    };

    //* get the isoString of a datestring
    app.getIsoString = app.get_iso_string = function (d) {
        return new Date(d).toISOString();
    };

    //* custom datetime
    app.dateTime = app.date_time = function () {
        return new Date().format('dateTime');
    };

    //* set the date in the custom datetime format
    app.getDateTime = app.get_date_time = function (d) {
        return new Date(d).format('dateTime');
    };

    //* Convert a date to the dd-mm-yyyy hh:mm format
    app.toDateTime = app.to_date_time = function (dObj) {
        return dObj.format('dateTime');
    };

    //* month number
    app.monthNum = app.month_num = function () {
        return new Date().format('monthNum');
    };

    //* get month number of the specified date
    app.getMonthNum = app.get_month_num = function (d) {
        return new Date(d).format('monthNum');
    };

    //* get date objects' month number
    app.toMonthNum = app.to_month_num = function (dObj) {
        return dObj.format('monthNum');
    };

    //* MONTHS ARRAY
    var $month_array = app.month_array = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    app.month_o_array = [{ id: 0, name: "January" }, { id: 1, name: "February" }, { id: 2, name: "March" }, { id: 3, name: "April" }, { id: 4, name: "May" }, { id: 5, name: "June" }, { id: 6, name: "July" }, { id: 7, name: "August" }, { id: 8, name: "September" }, { id: 9, name: "October" }, { id: 10, name: "November" }, { id: 11, name: "December" }];

    app.printMonths = function () {
        return $month_o_array.reduce(function (mobj, m) {
            mobj[m] = m;
        }, {}).filter(function (m) {
            return m;
        });
    };

    //! HANDLE APPLICATION SERVICE REQUESTS
    app.ajax = function (method, target, data) {
        return $.ajax({
            method: method || "POST",
            url: target,
            data: data,
            dataType: 'jsonp',
            headers: { 'Access-Control-Allow-Origin': "*" }
        });
    };

    //!HANDLE JSON REQUESTS 
    app.getJSON = app.get_json = function (target) {
        return $.getJSON(target.replace(/callback=?/ig, "") + '?callback=?');
    };

    //! HANDLE CORS CALLS WITH jsonp ENABLED
    app.cgi = function (method, url, data) {
        return $.ajax({
            method: method || "GET",
            url: url || app.hlink,
            data: data,
            dataType: 'jsonp',
            headers: { 'Access-Control-Allow-Origin': "*" }
        });
    };

    //!HANDLE THE DISPLAY OF DIALOG BOXES

    //* SHOW A "LOADING" ELEMENT
    app.loadify = function () {
        var duration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 6000;
        var message = arguments[1];
        return $q(function (resolve, reject) {
            var modal = UIkit.modal.blockUI('<center><i style="color:blue;" class="fa fa fa-spinner fa-pulse fa-5x fa-fw"></i></center>' + (message ? "<center><br>" + message + "</center>" : ""));
            if (duration && !isNaN(duration)) {
                setTimeout(function () {
                    modal.hide();
                    resolve(true);
                }, duration);
            } else {
                resolve(modal);
            }
        });
    };

    //*GENERATE A CUSTOM ALERT DIALOG
    app.alert = function (title, message, cb) {

        UIkit.modal.alert("<font color=\"#1976D2\" style=\"font-weight:bold;text-transform:uppercase;\">" + (title || 'Notice') + "</font>\n            <hr>\n            <center>" + (message || '</center><font color=red font-weight=bold; font-size=2em>Oops!</font><br>Something nasty happened!<center>') + "</center>");

        if (cb) {
            if (typeof cb == "function") {
                return $q.resolve(cb(message)).catch(function (e) {
                    console.log("Encountered an error when processing the alert function.");
                    console.dir(e);
                });
            } else {
                return $q.resolve(true).catch(function (e) {
                    console.log("Encountered an error when processing the alert2 function.");
                    console.dir(e);
                });
            }
        } else {
            return $q.resolve(true).catch(function (e) {
                console.log("Encountered an error when processing the alert2 function.");
                console.dir(e);
            });
        }
    };

    //*GENERATE A CUSTOM CONFIRM DIALOG
    app.confirm = function (title, message, cb) {

        return $q(function (resolve) {

            UIkit.modal.confirm("<font color=\"#1976D2\" style=\"font-weight:bold;text-transform:uppercase;\">" + (title || 'Confirmation required.') + "</font>\n                <hr>\n                <center>" + message + "</center>", function () {
                if (cb && typeof cb == "function") {
                    resolve(cb(message));
                } else {
                    resolve(true);
                }
            });
        });
    };

    //*GENERATE A CUSTOM PROMPT DIALOG
    app.prompt = function (title, label, placeholder, cb) {

        return $q(function (resolve) {

            UIkit.modal.prompt("<font color=\"#1976D2\" style=\"font-weight:bold;text-transform:uppercase;\">" + (title || 'Info required') + "</font>\n            <hr>\n            " + (label || 'email') + " :", placeholder || '', function (userValue) {
                if (cb && typeof cb == "function") {
                    resolve(cb(userValue));
                } else {
                    resolve(userValue);
                }
            });
        });
    };

    //!BASIC VALIDATION METHODS

    //*VALIDATE EMAIL ADDRESSES
    app.isemail = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/;
    app.isEmail = app.is_email = function (prospective_email) {
        return app.isemail.test(prospective_email);
    };

    //*VALIDATE USERNAMES
    app.isusername = /^[a-z0-9_-]{4,16}$/;
    app.isUsername = app.is_username = function (prospective_username) {
        return app.isusername.test(prospective_username);
    };

    //*VALIDATE PASSWORDS
    app.ispassword = /^[-@./\!\$\%\^|#&,+\w\s]{6,50}$/;
    app.isPassword = app.is_password = function (prospective_password) {
        return app.ispassword.test(prospective_password);
    };

    //* VALIDATE NUMBERS
    app.isnumber = /^-{0,1}\d*\.{0,1}\d+$/;
    app.isNumber = app.is_number = function (prospective_number) {
        return app.isnumber.test(prospective_number);
    };

    //*VALIDATE TELEPHONE NUMBERS
    app.istelephone = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    app.ismultitelephone = /^([\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}(?:,|$))+$/im;
    app.isTelephone = app.is_telephone = function (prospective_telephone) {
        return app.istelephone.test(prospective_telephone);
    };
    app.isMultiTelephone = app.is_multi_telephone = function (prospective_telephone) {
        return app.ismultitelephone.test(prospective_telephone);
    };

    //@ VALIDATE IMEI NUMBERS 
    app.isimei = /^[0-9]{15}$/;
    app.isImei = app.is_imei = function (prospective_imei) {
        return app.isimei.test(prospective_imei);
    };

    //*VALIDATE DATETIME VALUES IN THE FORMAT  DD-MM-YYYY HH:MM e.g 29-02-2013 22:16
    app.isdateTime = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(19|20)[0-9]{2} (2[0-3]|[0-1][0-9]):[0-5][0-9]$/;
    app.isDateTime = app.is_date_time = function (prospective_date) {
        return app.isdateTime.test(prospective_date);
    };

    //*VALIDATE WHETHER TWO GIVEN VALUES MATCH
    app.matches = function (val1, val2) {
        return val1 === val2;
    };

    //*TRANFORM NUMBER TO MONTH
    app.num2month = function (month_number) {
        return !isNaN(month_number) && month_number <= 11 ? $month_array[month_number] : "Invalid Month Number";
    };

    //*REMOVE DUPLICATES FROM ARRAY
    app.unique = app.removeDuplicates = app.remove_duplicates = function (arr_init) {
        return Array.isArray(arr_init) ? arr_init.filter(function (elem, pos, arr) {
            return arr.indexOf(elem) == pos;
        }) : ['The  applied method only processes Arrays'];
    };

    app.count = function (searchParam, arrayObject) {
        return (
            //@ Ensure that the provided 'arrayObject' parameter is an Array
            !Array.isArray(arrayObject) ? app.notify("Failed to count occurances on a non array object.", "danger") : Array.isArray(searchParam) ? searchParam.reduce(function (count, search_term, idx) {
                count[search_term] = arrayObject.filter(function (array_val) {
                    return array_val == search_term;
                }).length;
                return count;
            }, {}) : arrayObject.filter(function (array_val) {
                return array_val == searchParam;
            }).length
        );
    };

    //@ POST HTTP DATA HANDLER  
    app.post = function (destination, data) {
        return $q(function (resolve, reject) {

            $http.post(destination, data).success(resolve).error(reject);
        });
    };

    //@ GET HTTP DATA HANDLER  
    app.get = function (destination, params) {
        return $q(function (resolve, reject) {

            $http.get(destination, { params: params }).success(resolve).error(reject);
        });
    };

    //@ PUT HTTP DATA HANDLER 
    app.put = function (destination, data) {
        return $q(function (resolve, reject) {

            $http.put(destination, data).success(resolve).error(reject);
        });
    };

    //@ DELETE HTTP DATA HANDLER 
    app.delete = function (destination, params) {
        return $q(function (resolve, reject) {

            $http.delete(destination, { params: params }).success(resolve).error(reject);
        });
    };

    //@ Handle background calls to the web server for database integration
    app.db = function (params, destination) {
        return $q(function (resolve, reject) {

            destination = destination ? destination : hlink + "/sms/";
            $http.get(destination, { params: params }).success(resolve).error(reject);
        });
    };

    //@ Handle email sending requests
    app.mail = function (data, destination) {
        return $q(function (resolve, reject) {
            destination = destination ? destination : remoteAuth.url + "/mail";
            $http.post(destination, data).success(resolve).error(reject);
        });
    };

    //@ Handle The sending of welcome messages
    app.welcomeMail = function (data, destination) {
        return $q(function (resolve, reject) {

            destination = destination ? destination : "/welcome";

            $http.post(destination, data).success(resolve).error(reject);
        });
    };

    //@ Generic Process Event Handler
    app.handler = function (response) {
        response = response.response ? response : response.data;

        if (response.response == 200) {
            app.alert("<font color=green>Done</font>", app.str(response.data.message));
        } else {
            app.alert("<font color=red>Uh Oh!</font> ( " + response.response + " Error )", app.str(response.data.message));
        }
    };

    //@ Generic Error Handler
    app.errorHandler = app.error_handler = app.e_handler = function (response) {
        response = response.response ? response : response.data;
        app.alert("<font color=red>Uh Oh!</font>", app.str(response.data.message));
    };

    //@ Generic Process Remote Event Handler
    app.remote_handler = app.remoteHandler = function (response) {
        app.alert("<font color=blue>Data Response</font>", app.str(app.str(response)));
    };

    //@ SMS FIGURE COUNTER
    app.countSMS = app.count_sms = function (data) {
        return Math.ceil(data.length / 160) == 0 ? 1 : Math.ceil(data.length / 160);
    };
    app.countSMSify = app.count_smsify = function (data) {
        return $q.resolve(app.countSMS(data));
    };

    //@ CONVERT DATA TO A TABLE
    app.tabulate = function (text, headers, data) {
        UIkit.modal.alert('<font color="#1976D2" style="font-weight:bold;text-transform:uppercase;"> DOWNLOAD NOTICE</font> <hr> <center>The report is being generated.<center>');

        return $q(function (resolve, reject) {
            //@ Start  an instance of the pdf generator
            var doc = new jsPDF('l', 'pt');

            //@ Add a simple title
            doc.autoTable(headers, data, {
                styles: { fillColor: [100, 175, 250], fontSize: 5 },
                columnStyles: {
                    id: { fillColor: 255 }
                },
                margin: { top: 60 },
                addPageContent: function addPageContent(data) {
                    doc.text(text + " at " + new Date().format("yyyy/mm/dd HH:mm"), 40, 30);
                }
            });

            resolve(doc.save(text + " " + new Date().format("yyyy/mm/dd HH:mm") + ".pdf"));
        });
    };

    return app;
}])

//@@ The Remote authentication service
.service("remoteAuth", ["$http", "$localStorage", "$q", function ($http, $localStorage, $q) {

    var r_auth = this;

    r_auth.url = 'http://bixbyte.io';

    r_auth.setUrl = r_auth.set_url = function (accessUrl) {
        return $q(function (resolve, reject) {
            r_auth.url = accessUrl;
            resolve(accessUrl);
        });
    };

    r_auth.SetAuth = r_auth.set_auth = function (AuthToken) {
        return $q(function (resolve, reject) {

            resolve($http.defaults.headers.common.Authorization = AuthToken || $localStorage.framify_user ? $localStorage.framify_user.token : undefined);
        });
    };

    //@ Perform User Registration
    r_auth.Register = r_auth.register = function (credentials) {
        return $q(function (resolve, reject) {

            $http.post(r_auth.url + "/auth/register", credentials).success(function (response) {

                if (response.response == 200) {
                    resolve(credentials);
                } else {
                    reject(response.data.message);
                }
            }).error(function (response) {
                reject(JSON.stringify((response ? response.data ? response.data.message : response : response) || "Could not obtain a response from the server."));
            });
        });
    };

    //@ Perform a User Login
    r_auth.Login = r_auth.login = function (params) {
        return $q(function (resolve, reject) {

            //@ Append the auth command to the params [jp dash auth only]
            // params["action"] = "auth";
            // params["password"]     = (params["password"]);
            console.log(r_auth.url);
            //@ Push the authentication request
            $http.get(r_auth.url + "/auth/verify", { params: params }).success(function (response) {
                if (response.response == 200) {
                    $localStorage.framify_user = response.data.message;
                    resolve(response.data.message);
                } else {
                    reject(response.data.message);
                }
            }).error(function (response) {
                console.dir(response);
                reject(JSON.stringify((response ? response.data ? response.data.message : response : response) || "Could not obtain a response from the server."));
            });
        });
    };

    //@ Perform A User Logout
    r_auth.Logout = r_auth.logout = function () {

        return $q(function (resolve, reject) {

            //@ Clear the localstorage instance of the login data
            delete $localStorage.framify_user;

            //@ Clear all the existing session cookies
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

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
.service('auth', ["remoteAuth", function (remoteAuth) {

    Object.assign(this, remoteAuth);
    return this;
}])

//@ The infobip SMS integration module
.service("iSMS", ["$http", "$q", "app", function ($http, $q, app) {

    var url = window.location.href.split('/').filter(function (urlPortion) {
        return urlPortion != '' && urlPortion != 'http:' && urlPortion != 'https:';
    });
    var pathPos = window.location.href.split('/').filter(function (urlPortion) {
        return urlPortion != '';
    });

    var isms = this;

    isms.provider = pathPos[0] + "//" + url[0].split(':')[0] + (url[0].split(':')[1] != undefined ? ":" + url[0].split(':')[1] : "") + "/sms";

    isms.setProvider = isms.set_provider = function (providerURL) {
        isms.provider = providerURL.toString().includes('/sms') ? providerURL : providerURL + "/sms";
        console.log("All SMS requests via the i service will now be routed to " + isms.provider);
    };

    isms.one = function (data) {
        return $q(function (resolve, reject) {

            $http.post(isms.provider + "/one", data).success(function (response) {
                if (response.response == 200) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }).error(function (response) {
                reject(app.make_response(500, JSON.stringify((response ? response.data ? response.data.ismsssage : response : response) || "Could not obtain a response from the server.")));
            });
        });
    };

    isms.many = function (data) {

        return $q(function (resolve, reject) {

            $http.post(isms.provider + "/many", data).success(function (response) {

                if (response.response == 200) {

                    resolve(response);
                } else {

                    reject(response);
                }
            }).error(function (response) {
                reject(app.make_response(500, JSON.stringify((response ? response.data ? response.data.ismsssage : response : response) || "Could not obtain a response from the server.")));
            });
        });
    };

    isms.template = function (data) {

        return $q(function (resolve, reject) {

            $http.post(isms.provider + "/template", data).success(function (response) {

                if (response.response == 200) {

                    resolve(response);
                } else {

                    reject(response);
                }
            }).error(function (response) {
                reject(app.make_response(500, JSON.stringify((response ? response.data ? response.data.ismsssage : response : response) || "Could not obtain a response from the server.")));
            });
        });
    };

    isms.test = function (data) {

        return $q(function (resolve, reject) {

            $http.post("" + isms.provider, data).success(function (response) {

                if (response.response == 200) {

                    resolve(response);
                } else {

                    reject(response);
                }
            }).error(function (response) {
                reject(app.make_response(500, JSON.stringify((response ? response.data ? response.data.ismsssage : response : response) || "Could not obtain a response from the server.")));
            });
        });
    };

    isms.echo = function (data) {

        return $q(function (resolve, reject) {

            $http.post(isms.provider + "/echo", data).success(function (response) {

                if (response.response == 200) {

                    app.alert("<font color=green>SMS ECHO</font>", app.str(response.data.message));
                    resolve(response);
                } else {

                    reject(response);
                }
            }).error(function (response) {
                reject(app.make_response(500, JSON.stringify((response ? response.data ? response.data.message : response : response) || "Could not obtain a response from the server.")));
            });
        });
    };

    isms.handler = function (responseData) {

        return $q(function (resolve, reject) {

            var resp = responseData.response ? app.clone(responseData) : app.clone(responseData.data);

            if (responseData.response == 200) {
                app.alert("<font color=green>SMS RESPONSE</font>", app.str(responseData.data.message));
                resolve(resp);
            } else {
                app.alert("<font color=red>SMS Sending</font> ( " + responseData.response + " Error )", app.str(responseData.data.message));
                reject(resp);
            }
        });
    };

    return isms;
}])

//@ Configure the application for execution
.run(["app", "$rootScope", "$state", "$localStorage", "auth", "remoteAuth", "$http", "iSMS"
// ,"$templateCache"
, function (app, $rootScope, $state, $localStorage, auth, remoteAuth, $http, iSMS) {

    //@ Clear the application cache on page load [Breaks the datetime picker and framify pagination handler]
    // $rootScope.$on('$viewContentLoaded', function() {
    //     $templateCache.removeAll();
    // });    

    //! INJECT THE LOCATION SOURCE TO THE ROOT SCOPE
    $rootScope.location = $state;

    //! INJECT THE $localStorage instance into the root scope
    $rootScope.storage = $localStorage;

    //! INJECT THE APPLICATION'S MAIN SERVICE TO THE ROOT SCOPE SUCH THAT ALL SCOPES MAY INHERIT IT
    $rootScope.app = app;

    //! SIMPLE APPLICATION BEHAVIOR SETUP
    $rootScope.frame = {};

    //@ INJECT THE infobip SMS sender into the root scope
    $rootScope.iSMS = iSMS;

    //@ INJECT THE AUTHENTICATION SERVICE
    $rootScope.auth = auth;
    $rootScope.remoteAuth = remoteAuth;

    //! IDENTIFY THE CURRENT PATH
    $rootScope.frame.path = function () {
        return $state.absUrl().split("/#/")[0] + "/#/" + $state.absUrl().split("/#/")[1].split("#")[0];
    };
    //p.split("/#/")[0]+"/#/"+p.split("/#/")[1].split("#")[0]


    //! RELOCATION HANDLING
    $rootScope.frame.relocate = function (loc) {
        return $rootScope.location.go(loc);
    };

    //@ The global permissions definition object
    $rootScope.permissions = {

        //@ ALLOW ONLY ADMIN USERS
        admin_only: function admin_only() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return user.role ? user.role == 'admin' ? true : false : false;
        },

        //@! FROM MATCHING ORGANIZATIONS
        admin_only_org: function admin_only_org() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var item_org = arguments[1];
            return user.role ? user.role == 'admin' && user.organization == item_org ? true : false : false;
        },

        //@ ALLOW ONLY CLIENT USERS
        client_only: function client_only() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return user.role ? user.role == 'client' ? true : false : false;
        },

        //@! FROM MATCHING ORGANIZATIONS
        client_only_org: function client_only_org() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var item_org = arguments[1];
            return user.role ? user.role == 'client' && user.organization == item_org ? true : false : false;
        },

        //@ ALLOW ONLY AUDIT USERS
        audit_only: function audit_only() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return user.role ? user.role == 'audit' ? true : false : false;
        },

        //@! FROM MATCHING ORGANIZATIONS        
        audit_only_org: function audit_only_org() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var item_org = arguments[1];
            return user.role ? user.role == 'audit' && user.organization == item_org ? true : false : false;
        },

        //@ ALLOW BOTH ADMIN AND CLIENT USERS
        admin_client: function admin_client() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return user.role ? user.role == 'admin' || user.role == 'client' ? true : false : false;
        },

        //@! FROM MATCHING ORGANIZATIONS
        admin_client_org: function admin_client_org() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var item_org = arguments[1];
            return user.role ? (user.role == 'admin' || user.role == 'client') && user.organization == item_org ? true : false : false;
        },

        //@! FROM MATCHING ORGANIZATIONS WITH ADMIN EXEMPT
        any_admin_client_org: function any_admin_client_org() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var item_org = arguments[1];
            return user.role ? user.role == 'audit' ? false : user.role == 'admin' ? true : user.organization == item_org ? true : false : false;
        },

        //@ ALLOW ALL USERS 
        any: function any() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return true;
        },

        //@! FROM MATCHING ORGANIZATIONS
        any_org: function any_org() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var item_org = arguments[1];
            return user.organization == item_org ? true : false;
        },

        //@! EXCLUDE ADMINS FROM SCRUTINY
        any_admin_other_org: function any_admin_other_org() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var item_org = arguments[1];
            return user.role == 'admin' ? true : user.organization == item_org ? true : false;
        }

    };

    //@ Get the roles assigned to the current user
    $rootScope.getRoles = function () {

        if ($localStorage["framify_user"]) {
            var roles = $localStorage["framify_user"].me.roles ? $localStorage["framify_user"].me.roles.split(',').map(function (e) {
                return e.replace(/^\s/ig, '').replace(/\s$/ig, '');
            }) : [];
            roles.push($localStorage["framify_user"].me.organization_name);
            return roles;
        } else {
            $rootScope.auth.Logout();
        }
    };
}])

//@ The main controller
.controller("framifyController", ["$scope", "$state", "$rootScope", "$http", "$q", function ($scope, $state, $rootScope, $http, $q) {

    //!APPLICATION GLOBAL SCOPE COMPONENTS
    $scope.current = {};
    $scope.ui = {};

    // $scope.urlParams = $stateParams;

    $rootScope.nav = [];
    $rootScope.nav.search;

    $scope.nav.hasFilters = false;

    //** MANAGE THE NAVIGATION SEARCH STATUS
    $scope.openFilters = function (hasFilters) {
        $scope.nav.hasFilters = hasFilters === true ? true : false;
    };

    //!RE-INITIALIZE APPLICATION DATA
    $rootScope.app.reinit = function () {
        return $scope.location.path("/");
    };

    /** 
     * ++LATER++
     */
    //@ CHECK IF OBJECT EXISTS IN ARRAY
    $scope.objectInArray = $scope.object_in_array = $scope.obj_in_array = function (list, item) {
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
    $rootScope.exec = function (f) {
        return f();
    };

    //@ VARIABLE SETTER
    $rootScope.setVar = $rootScope.set_var = function (obj, keys, v) {

        if (keys.length === 1) {
            obj[keys[0]] = v;
        } else {
            var key = keys.shift();
            obj[key] = $rootScope.setVar(typeof obj[key] === 'undefined' ? {} : obj[key], keys, v);
        }

        return obj;
    };

    //@ PUSH TO ARRAY
    $scope.arrayPush = $scope.array_push = function (arr, valu) {
        return !Array.isArray(arr) ? [] : Array.isArray(valu) ? arr.concat(valu) : function () {
            var myarr = JSON.parse(JSON.stringify(arr));
            myarr.push(valu);
            return myarr;
        }();
    };

    /**
     * DATABASE CENTRIC ADDITION AND DELETION
     */

    //Define the main application objects
    $scope.add = {};
    $scope.fetch = {};
    $scope.fetched = {};
    $scope.counted = {};
    $scope.data = {};
    $scope.actions = { prequeue: [] };

    $scope.data.login = {};
    $scope.data.admin = {};

    //@ Add an action to the actions holder
    $scope.addAction = $scope.add_action = function (ky, val) {
        return $scope.actions[ky] = val;
    };

    // $rootScope.frame.changeAdmin(false);
    $scope.logedin = false;

    //@ Redirect to a given sub-state in the pre-defined 'app' main state
    $scope.appRedirect = $scope.app_redirect = function (partialState) {
        return $state.go("app." + partialState);
    };

    //@ Redirect to the specified state
    $scope.goTo = $scope.go_to = function (completeState) {
        return $state.go(completeState);
    };

    //@ UNWANTED ANGULAR JS OBJECTS
    $scope.unwanted = ["$$hashKey", "$index", "$$state"];

    //@ Remove the unwanted keys
    $scope.removeUnwanted = $scope.remove_unwanted = function (insertObj) {
        Object.keys(insertObj).forEach(function (insertKey) {
            if ($scope.unwanted.indexOf(insertKey) != -1) {
                insertObj[insertKey] = undefined;
                delete insertObj[insertKey];
            }
        });
        return insertObj;
    };
    $scope.removeUnwantedify = $scope.remove_unwantedify = function (insertObj) {
        return $q.resolve($scope.removeUnwanted(insertObj));
    };

    //@ Generate an MD5 checksum from the specified fields
    $scope.encryptFields = $scope.encrypt_fields = function (fields_to_encrypt, data_to_encrypt) {
        return fields_to_encrypt.split(",").reduce(function (previous, cryptField) {

            if (previous[cryptField]) {
                previous[cryptField] = $scope.app.md5(previous[cryptField]);
            }

            return previous;
        }, data_to_encrypt);
    };

    $scope.encryptFieldsify = $scope.encrypt_fieldsify = function (fields_to_encrypt, data_to_encrypt) {
        return $q.resolve($scope.encrypt_fields(fields_to_encrypt, data_to_encrypt));
    };

    //@ HANDLE GENERIC DB REQUEST RESPONSES
    $scope.generic_db_request_handler = function (method, table, responseData, data) {
        return $q(function (resolve, reject) {
            var r = $scope.app.json(responseData);

            // console.log(`The relevant app data is: `)
            // console.dir(r)

            if (r.response == 200) {

                if (typeof r.data.message == "string") {
                    $scope.app.notify("<center> " + r.data.message + "</center>", "success");
                }

                if (method == "custom") {
                    $scope.cFetched[table.toString()] = r.data.message;
                    // $scope.$apply();
                } else if (method == "count") {
                    $scope.counted[table.toString()] = r.data.message;
                    // $scope.$apply();
                } else if (method != "fetch") {
                    $scope.fetch(table, { specifics: data.specifics });
                } else {
                    $scope.fetched[table.toString()] = r.data.message;
                    // $scope.$apply();
                }

                $scope.data[table.toString().replace(/vw_/ig, '')] = {};

                resolve(r.data.message);
            } else {
                // POSTGRESQL ERROR FORMAT MATCHING
                if (Array.isArray(r.data.message)) {

                    var _v = r.data.message[2].match(/DETAIL:(.*)/);

                    if (_v != undefined || _v != null) {
                        r.data.message = _v[1];
                    } else {
                        r.data.message = r.data.message[2];
                    }

                    resolve(r.data.message);
                }

                $scope.app.notify("<center>" + r.data.message + "</center>", 'danger');
                reject($scope.app.makeResponse(500, v[1]));
            }
        });
    };

    //! BASIC ADDITION
    $scope.add = function (table, data, cryptFields, cb) {
        return $q(function (resolve, reject) {
            //* populate the data object 
            data = data ? $scope.app.json(data) : {};
            data.command = "add";
            data.table = table != undefined ? table.toString().replace(/vw_/ig, '') : "";
            data.extras = data ? data.extras ? data.extras.replace(/LIMIT 1/ig, '') : undefined : undefined;

            //* Encrypt the specified cryptFields
            if (cryptFields) {
                data = $scope.encrypt_fields(cryptFields, data);
            }

            //* Perform the actual addition
            $scope.app.db($scope.removeUnwanted(data)).then(function (r) {

                $scope.generic_db_request_handler("add", table, r, data).then(function (d) {
                    if (cb) {
                        cb(d);
                    } else {
                        resolve(d);
                    }
                }).catch(reject);
            });
        });
    };

    //! BASIC UPDATING
    $scope.update = function (table, data, cryptFields, cb) {
        return $q(function (resolve, reject) {

            //* pack the relevant info into the data object
            data = data ? $scope.app.json(data) : {};
            data.command = "update";
            data.table = table != undefined ? table.toString().replace(/vw_/ig, '') : "";
            data.extras = data ? data.extras ? data.extras.replace(/LIMIT 1/ig, '') : undefined : undefined;

            //* Encrypt the specified cryptFields
            if (cryptFields) {

                data = $scope.encrypt_fields(cryptFields, data);

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
            $scope.app.db($scope.removeUnwanted(data)).then(function (r) {

                $scope.generic_db_request_handler("update", table, r, data).then(function (d) {
                    if (cb) {
                        cb(d);
                    } else {
                        resolve(d);
                    }
                }).catch(reject);
            });
        });
    };

    //! BASIC DATA FETCHING
    var do_fetch = function do_fetch(table, data, cryptFields) {
        return $q(function (resolve, reject) {

            //* populate the "data" object
            data = data ? $scope.app.json(data) : {};
            data.command = "get";
            data.table = table;

            //* Encrypt the specified cryptFields
            if (cryptFields) {
                data = $scope.encrypt_fields(cryptFields, data);
            }

            //* perform the actual data fetching
            $scope.app.db($scope.removeUnwanted(data)).then(function (r) {

                $scope.generic_db_request_handler("fetch", table, r, data).then(function (d) {
                    resolve(d);
                }).catch(reject);
            });
        });
    };

    $scope.fetch = function (table, data, cryptFields, cb) {

        if (Array.isArray(table)) {

            var promiseArr = table.filter(function (e) {
                return typeof e[0] != 'undefined';
            }).reduce(function (cumulative, tData, tkey) {
                cumulative[tkey] = do_fetch(tData[0], tData[1] || [], cryptFields);
                return cumulative;
            }, []).filter(function (e) {
                return typeof e != 'undefined';
            });

            return $q.all(promiseArr);
        } else {
            return $q.resolve(do_fetch(table, data, cryptFields)).catch(function (e) {
                // console.log("Encountered an error when processing the fetch function.")
                // console.dir(e)
            });
        }
    };

    //! BASIC DELETION  
    $scope.del = function (table, data, cryptFields, cb) {
        return $q(function (reject, resolve) {

            //* populate the data object
            data = data ? $scope.app.json(data) : {};
            data.command = "del";
            data.table = table != undefined ? table.toString().replace(/vw_/ig, '') : "";

            //* Encrypt the specified cryptFields
            if (cryptFields) {
                data = $scope.encrypt_fields(cryptFields, data);
            }

            $scope.app.db($scope.removeUnwanted(data)).then(function (r) {

                $scope.generic_db_request_handler("del", table, r, data).then(function (d) {
                    if (cb) {
                        cb(d);
                    } else {
                        resolve(d);
                    }
                }).catch(reject);
            });
        });
    };

    //@ Handle basic application redirection
    $scope.redirect = function (loc) {

        if (loc) {
            window.location = loc;
        } else {
            window.location = "/#/framify";
        }
        return $q.resolve(true).catch(function (e) {
            console.log("Encountered an error when processing the redirect function.");
            console.dir(e);
        });
    };

    // BASIC Custom Queries
    $scope.custom = function (table, data, cryptFields, cb) {

        return $q(function (resolve, reject) {

            //* initialize the data object
            data = data ? $scope.app.json(data) : {};
            data.command = "custom";

            //* Encrypt the specified cryptFields
            if (cryptFields) {
                data = $scope.encrypt_fields(cryptFields, data);
            }

            //* Perform the actual custom query
            $scope.app.db($scope.removeUnwanted(data)).then(function (r) {

                $scope.generic_db_request_handler("add", table, r, data).then(function (d) {
                    if (cb) {
                        cb(d);
                    } else {
                        resolve(d);
                    }
                }).catch(reject);
            });
        });
    };

    //BASIC DATABASE INSTANCEOF COUNTER
    $scope.count = function (table, data, cryptFields, cb) {
        return $q(function (resolve, reject) {

            data = data ? $scope.app.json(data) : {};
            data.table = table;
            data.command = "count";
            data.token = data.token || {};

            //* Encrypt the specified cryptFields
            if (cryptFields) {
                data = $scope.encrypt_fields(cryptFields, data);
            }

            //* perform the actual count
            $scope.app.db($scope.removeUnwanted(data)).then(function (r) {

                $scope.generic_db_request_handler("add", table, r, data).then(function (d) {
                    if (cb) {
                        cb(d);
                    } else {
                        resolve(d);
                    }
                }).catch(reject);
            });
        });
    };

    /**
     * TABLE SORTER
     */
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };

    /**
     *  DELETE UNWANTED FIELDS
     */
    $scope.sanitize = function (data, keys) {
        if (keys) {

            keys.split(",").forEach(function (key) {
                delete data[key];
            });

            return $q.resolve(data).catch(function (e) {
                console.log("Encountered an error when processing the sanitize function.");
                console.dir(e);
            });
        }
    };

    /**
     * PUSH DATA TO OBJECT
     */
    $scope.dPush = $scope.d_push = function (obj, key, val) {
        obj[key] = val;
        return obj;
    };

    $scope.dPushify = $scope.d_pushify = function (obj, key, val) {
        return $q.resolve($scope.dPush(obj, key, val));
    };

    /**
     * @ MONTH REGULATION
     */
    $scope.currmoin = $scope.app.monthNum();
    $scope.setMoin = $scope.set_moin = function (moin) {
        $scope.currmoin = moin;
    };

    //@ DELETE UNWANTED PARAMETERS
    $scope.delParams = $scope.del_params = function (mainObj, removeKeys) {
        // $scope.app.clone
        var newObj = mainObj ? $scope.app.clone(mainObj) : {};
        removeKeys = removeKeys ? Array.isArray(removeKeys) ? removeKeys : removeKeys.split(',') : [];

        removeKeys.forEach(function (e) {
            newObj[e] = null;
            delete newObj[e];
        });

        return newObj;
    };

    //@ INJECT A STANDARD WHERE "Extras" OBJECT
    // addExtras(data.my_services,{username: storage.user.username},'username:WHERE owner','password,name,email,telephone,account_number,entity,active'),' ' )
    $scope.addExtras = function (targetObj, extrasObj, subStrings, removeKeys) {
        return $q(function (resolve, reject) {

            targetObj = targetObj || {};
            extrasObj = extrasObj || {};
            subStrings = subStrings || '';
            removeKeys = removeKeys || '';

            var extras = '';

            var k = [],
                v = [];

            //@ CAPTURE THE REMOVE KEYS
            removeKeys = removeKeys.split(',').filter(function (e) {
                return e;
            });

            removeKeys.forEach(function (e) {
                extrasObj[e] = null;
                delete extrasObj[e];
            });

            //@ CAPTURE REPLACE STRINGS
            subStrings.split(',').forEach(function (e, i) {
                var x = e.split(':');
                k[i] = x[0];
                v[i] = x[1];
            });

            //@ GET THE DEFINED KEYS
            var keys = Object.keys(extrasObj);

            //@ REPLACE THE DEFINED WITH THE DESIRED REPLACE KEYS
            k.forEach(function (e, i) {

                if (keys.indexOf(e) != -1) {

                    extrasObj[v[i]] = extrasObj[e];
                    extrasObj[e] = null;
                    delete extrasObj[e];
                }
            });

            k = Object.keys(extrasObj);
            v = null;

            k.forEach(function (e, i) {

                var fg = !isNaN(extrasObj[e]) ? parseInt(extrasObj[e]) : "'" + extrasObj[e] + "'";
                extras += ' ' + e + "=" + fg + " AND";
            });

            k = null;

            targetObj.extras = extras.replace(/AND+$/, '');

            resolve(targetObj);
        });
    };

    $scope.add_extras = function (targetObj, extrasObj, subStrings, removeKeys) {
        return $q(function (resolve, reject) {

            targetObj = targetObj || {};
            extrasObj = extrasObj || {};
            subStrings = subStrings || ['', ''];
            removeKeys = removeKeys || ['', ''];

            var target = '';
            var extras = '';

            var target_k = [],
                extras_k = [],
                target_v = [],
                extras_v = [];

            //@ Ensure that the substitution and removal parameters are arrays 
            if (!Array.isArray(subStrings) || !Array.isArray(removeKeys)) {
                reject('This Method only allows substitution and removal Arrays, <br> please consider using the <b><i>addExtras</i></b> object instead.');
            } else {

                //@ CAPTURE THE REMOVE KEYS
                var target_removeKeys = removeKeys[0].split(',').filter(function (e) {
                    return e;
                });
                var extras_removeKeys = removeKeys[1].split(',').filter(function (e) {
                    return e;
                });

                //@ Remove specified keys from the target object
                target_removeKeys.forEach(function (e) {
                    targetObj[e] = null;
                    delete targetObj[e];
                });

                //@ Remove specified keys from the extras object
                extras_removeKeys.forEach(function (e) {
                    extrasObj[e] = null;
                    delete extrasObj[e];
                });

                //@ CAPTURE REPLACE STRINGS
                var target_subStrings = subStrings[0].split(',');
                var extras_subStrings = subStrings[1].split(',');

                //@ Specify target key-value pairs
                target_subStrings.forEach(function (e, i) {
                    var x = e.split(':');
                    target_k[i] = x[0];
                    target_v[i] = x[1];
                });

                //@ Specify extras key-value pairs
                extras_subStrings.forEach(function (e, i) {
                    var x = e.split(':');
                    extras_k[i] = x[0];
                    extras_v[i] = x[1];
                });

                //@ GET THE DEFINED KEYS
                var extras_keys = Object.keys(extrasObj);
                var target_keys = Object.keys(targetObj);

                //@ TARGET - REPLACE THE DEFINED WITH THE DESIRED REPLACE KEYS
                target_k.forEach(function (e, i) {

                    if (target_keys.indexOf(e) != -1) {

                        // // console.log( `Renaming the target ${e} to ${target_v[i]}` )

                        targetObj[target_v[i]] = targetObj[e];
                        targetObj[e] = null;
                        delete targetObj[e];
                    }
                });

                //@ EXTRAS - REPLACE THE DEFINED WITH THE DESIRED REPLACE KEYS
                extras_k.forEach(function (e, i) {

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

                extras_k.forEach(function (e, i) {

                    var fg = !isNaN(extrasObj[e]) ? parseInt(extrasObj[e]) : "'" + extrasObj[e] + "'";
                    extras += ' ' + e + "=" + fg + " AND";
                });

                extras_k = null;

                targetObj.extras = extras.replace(/AND+$/, '');

                resolve(targetObj);
            }
        });
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // ADDITIONS ON PROBATION
    // ----

    //@ LOAD A SERVICE ONTO THE STAGE
    $scope.service = {};
    $scope.entity = {};

    $scope.showService = function (serviceData) {
        $scope.service.available = true;
        $scope.service.current = serviceData;
        //$scope.$apply();
    };

    $scope.showEntity = function (serviceData) {
        $scope.entity.available = true;
        $scope.entity.current = serviceData;
        //$scope.$apply();
    };

    //@ Count my entities
    $scope.howMany = function (table, data) {
        var data = data || { owner: $scope.storage.user.username };
        data = data ? $scope.app.json(data) : {};
        data.table = table || 'entities';
        data.command = "count";
        data.token = {};

        $scope.app.db($scope.removeUnwanted(data)).then(function (r) {

            $scope.generic_db_request_handler("count", table, r, data).then(function (d) {
                resolve(d);
            }).catch(reject);
        });
    };

    // ----

    //@ FRAMIFY HANDLERS

    $scope.data.login = $scope.data.login || {};

    $scope.data.me = $scope.data.me || {};

    $scope.setData;

    //@ Initialize the handlers object
    $scope.handlers = {};
    $scope.r_handlers = $scope.handlers;

    //@ The registration success handler
    $scope.handlers.regSuccess = $scope.r_handlers.regSuccess = $scope.handlers.reg_success = $scope.r_handlers.reg_success = function (message) {
        $scope.app.notify("The user has been registered");
        $state.go("app.login");
    };

    //@ The successful login handler
    $scope.handlers.loginSuccess = $scope.r_handlers.loginSuccess = $scope.handlers.login_success = $scope.r_handlers.login_success = function (message) {
        $scope.app.notify("<i class='fa fa-2x fa-spin fa-circle-o-notch'></i> Processing your login data", 'success', 4000);
        $state.go("app.index");
    };

    //@ The registration error handler
    $scope.handlers.regError = $scope.r_handlers.regError = $scope.handlers.reg_error = $scope.r_handlers.reg_error = function (message) {
        $scope.app.alert("<font color='red'>Signup Error</font>", message);
    };

    //@ The login error handler
    $scope.handlers.loginError = $scope.r_handlers.loginError = $scope.handlers.login_error = $scope.r_handlers.login_error = function (message) {
        $scope.app.alert("<font color='red'>Login Error</font>", message);
    };

    //@ The identity check verification handler
    $scope.handlers.identity = $scope.r_handlers.identity = function () {
        return $q(function (reject, resolve) {

            $http({
                method: "GET",
                url: $scope.app.hlink.replace(/auth/ig, '') + "/auth/me", ///auth/ //`${$scope.remoteAuth}/auth/auth/me`, 
                headers: { Authorization: $scope.storage.framify_user.token }
            }).success(function (response) {
                resolve($scope.data.me = response.data.message);
            }).error(function (error) {
                console.dir(error);
                $scope.auth.Logout().then(function () {
                    $scope.data.me = undefined;
                    $scope.app.notify("<i class='fa  fa-exclamation-triangle'></i>&nbsp;&nbsp;Your lease has expired <br>Please Login to continue.", 'danger');
                    reject($state.go("app.login"));
                });
            });
        });
    };

    //@ The login status check handler
    $scope.handlers.isLogedIn = $scope.handlers.is_loged_in = function () {
        return $q(function (resolve, reject) {
            if (!$scope.storage.framify_user) {
                $scope.data.me = undefined;
                // console.log("\nNo localstorage value is defined\n")

                if ($state.current.name != "app.login") {
                    $scope.app.notify("<i class='fa  fa-exclamation-triangle'></i>&nbsp;&nbsp;Please Login to continue.", 'danger');
                    reject($state.go("app.login"));
                }
            } else if (!$http.defaults.headers.common.Authorization || $http.defaults.headers.common.Authorization == undefined || $http.defaults.headers.common.Authorization == '') {

                // console.log("\nThe authentication header is not yet defined\n")
                $scope.auth.SetAuth(undefined).then(function () {
                    // console.log(`\nThe authentication header has been set to ${$http.defaults.headers.common.Authorization}\n`)

                    if ($state.current.name == "app.login") {
                        resolve($state.go("app.index"));
                    } else {
                        resolve();
                    }
                });
            } else {

                if ($state.current.name == "app.login") {
                    resolve($state.go("app.index"));
                } else {
                    resolve();
                }
            }
        });
    };

    $scope.r_handlers.isLogedIn = $scope.r_handlers.is_loged_in = function () {
        return $q(function (resolve, reject) {
            if (!$scope.storage.framify_user) {
                $scope.data.me = undefined;

                if ($state.current.name != "app.login") {
                    $scope.app.notify("<i class='fa  fa-exclamation-triangle'></i>&nbsp;&nbsp;Please Login to continue.", 'danger');
                    reject($state.go("app.login"));
                }
            } else if (!$http.defaults.headers.common.Authorization || $http.defaults.headers.common.Authorization == undefined || $http.defaults.headers.common.Authorization == '') {
                $scope.remoteAuth.SetAuth(undefined).then(function () {

                    if ($state.current.name == "app.login") {
                        resolve($state.go("app.index"));
                    } else {
                        resolve();
                    }
                });
            } else {
                if ($state.current.name == "app.login") {
                    resolve($state.go("app.index"));
                } else {
                    resolve();
                }
            }
        });
    };

    $scope.data.recovery = {};
    $scope.data.queued = [];

    //@ The recovery attempt function
    $scope.recover_password = function (email) {

        $scope.data.recovery.response = "Loading ...";

        $http({
            method: "POST",
            url: $scope.remoteAuth.url + "/passwords/forgot",
            data: {
                email: email
            }
        }).then(function (response) {
            $scope.data.recovery.response = response.data.data.message;
            $scope.app.alert('Password Recovery', response.data.data.message);
            $scope.data.recovery.email = "";
        });
    };

    //@ iNITIATE THE SENDING OF A WELCOME EMAIL UPON SIGNUP
    $scope.isSignedUp = function (obj) {
        return $q(function (resolve, reject) {
            $scope.app.welcomeMail({
                from: "Jambopay SMS Dashboard <smsdashboard@jambopay.com>",
                to: obj.email,
                subject: "Welcome to our platform",
                data: { name: obj["name.first"], telephone: obj.telephone, username: obj["account.name"] }
            }, $scope.remoteAuth.url + "/welcome").then(function (r) {
                $scope.app.alert("User Added", "<center style='font-size:1.4em;'>The user <font color='green'>" + obj['name.first'] + "</font>.<br><br> has successfully been registered.</center>"); // window.location = "http://admin.infomed.co.ke";
                resolve(true);
            }).catch(function (e) {
                $scope.app.alert("User Added", "<center style='font-size:1.4em;'>The user <font color='green'>" + obj['name.first'] + "</font>.<br><br> has successfully been registered.</center>");
                resolve(true);
            });
        });
    };

    $scope.SmsSuccess = function (response) {
        delete $scope.storage.framify_user["nullify"];
        $scope.app.alert('SMS REQUEUE RESPONSE', "Message(s) successfuly requeued!");
    };

    $scope.SmsError = function (response) {
        delete $scope.storage.framify_user["nullify"];
        $scope.app.alert('<font color="red">SMS REQUEUE RESPONSE</font>', $scope.app.str(response.data || response));
    };

    //@ Handle the requeue of SMS messages
    $scope.requeue = function () {
        var sms_object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return $q(function (resolve, reject) {
            //@ Prevent the automatic setting of headers
            $scope.storage.framify_user['nullify'] = true;

            //@ Alert the client of the ongoing process
            $scope.app.notify("Requeueing the SMS message", "warning");

            $http({
                url: "http://sms.jambopay.co.ke/SMSService/Api/SMS",
                method: "POST",
                data: $.param({
                    SenderName: sms_object.Sender_Name || "",
                    Mobile: sms_object.Phone || "",
                    Message: sms_object.Message || ""
                }),

                headers: {
                    DeveloperKey: "084049D0-AB72-4EE2-9EDE-0C25C1D1268C",
                    Password: "1d95a4c6d681ede5b18c89b21ceb46bfea7b8e4d8f824107615a2ee297493710",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).success(resolve).error(reject);
        });
    };

    //@ Handle the prequeueing of SMS messages
    $scope.prequeue = function () {
        var sms_object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
        return $q(function (resolve, reject) {
            //@ Ensure that the provided object exists
            if (sms_object) {
                if ($scope.actions.prequeue) {
                    var obj_pos = $scope.obj_in_array($scope.actions.prequeue, sms_object);

                    //@ Remove the object if it exists 
                    if (obj_pos != -1) {
                        $scope.actions.prequeue.splice(obj_pos, 1);
                        // console.log("\n\nPrequeue Removed!")
                        // console.dir($scope.actions.prequeue)
                        resolve();
                    } else
                        //@ Add the object into the Array
                        {
                            $scope.actions.prequeue.push(sms_object);
                            // console.log("\n\nPrequeue Added!")
                            // console.dir($scope.actions.prequeue)
                            resolve();
                        }
                } else {
                    reject();
                }
            }
            //@  Otherwise Fail silently
            else {
                    reject();
                }
        });
    };

    //@ Process the sending of the queued up messages
    $scope.processQueue = function () {
        return $q(function (resolve, reject) {

            //@ Create a placeholder array for the promises
            //@ Iterate through each of the queued messages
            var sms_queue = $scope.actions.prequeue.reduce(function (cumulative, val, idx) {
                cumulative[idx] = $scope.requeue(val);
                return cumulative;
            }, []).filter(function (a) {
                return a;
            });

            //@ Process the bulk queue
            $q.all(sms_queue).then(function (i) {
                delete $scope.storage.framify_user["nullify"];
                $scope.actions.prequeue = [];
                resolve(i);
            }).catch(function (e) {
                delete $scope.storage.framify_user["nullify"];
                $scope.actions.prequeue = [];
                reject(e);
            });
        });
    };

    //!!! SMS DASH SPECIFIC ENTRIES
    $scope.topup_handler = function (d) {
        d = $scope.app.json(d);

        if (d.response == 200) {
            $scope.data.topup = {};
            $scope.fetch('vw_organization_balances');
            $scope.app.alert("TOPUP RESPONSE", d.data.message);
        } else {
            $scope.data.topup = {};
            $scope.app.alert("<font color=red>TOPUP RESPONSE</font>", d.data.message || "There was no response from the topup server.");
        }
    };

    //@ Produce a list to remove extra assigned shortcodes from a user
    $scope.removify_roles = function (shortcodes, member_id) {

        // console.log(`Received some shortcodes to remove for ${member_id}:`);
        // console.dir(shortcodes);

        if (member_id) {
            return shortcodes.reduce(function (prev, shortcode, pos) {
                return prev + "<button  ng-click=\" (permissions.admin_only_org(data.me,1)) ? ( [del('permissions',{member_id: " + member_id + ", shortcode: '" + shortcode.replace(/\s/ig, '') + "' }),fetch_user_assignments(" + member_id + ")] ) : app.doNothing() \" class=\"md-btn uk-width-1-5\" style=\"margin-bottom:1em;\">" + shortcode + " <i class=\"uk-icon uk-icon-times uk-text-muted col-red pull-right\" ng-show=\"permissions.admin_only_org(data.me,1)\" ></i></button>";
            }, "");
        }
    };

    //@ Produce a list to remove extra assigned shortcodes from a user    
    $scope.assignify_roles = function (shortcodes, member_id) {
        if (member_id) {
            shortcodes = shortcodes.reduce(function (prev, scd, idx) {
                prev[idx] = scd.org.replace(/\s/ig, '');return prev;
            }, []);

            if ($scope.fetched.vw_user_permissions) {

                var existing = $scope.fetched.vw_user_permissions[0] ? $scope.fetched.vw_user_permissions[0].roles.split(',').filter(function (e) {
                    return e;
                }).map(function (f) {
                    return f.replace(/ /ig, '');
                }) : [$scope.fetched.vw_members[0].organization_name];

                var resp = shortcodes.filter(function (role) {
                    return existing.indexOf(role) == -1;
                }).reduce(function (prev, shortcode, pos) {
                    return prev + "<button ng-click=\"add('permissions',{ member_id: " + member_id + ", shortcode: '" + shortcode + "' });fetch_user_assignments(" + member_id + ");\" class=\"md-btn uk-width-1-5\" style=\"margin-bottom:1em !important;\">" + shortcode + " <i class=\"fa fa-plus uk-text-muted col-green pull-right\" ng-if=\"permissions.admin_only_org(data.me,1)\"></i></button>";
                }, "");

                return resp != "" ? resp : "<div class=\"uk-alert uk-text-center\">THERE ARE NO MORE SHORTCODES TO ASSIGN TO THIS USER</div>";
            } else {

                // console.log("LOADING OPTION 2")

                return shortcodes.reduce(function (prev, shortcode, pos) {
                    return prev + "<button ng-click=\"add('permissions',{ member_id: " + member_id + ", shortcode: '" + shortcode + "' });fetch_user_assignments(" + member_id + ");\" class=\"md-btn uk-width-1-5\" style=\"margin-bottom:1em !important;\">" + shortcode + " <i class=\"uk-icon uk-icon-plus uk-text-muted col-green\" ng-if=\"permissions.admin_only_org(data.me,1)\"></i></button> &nbsp;";
                }, "");
                // onClick="assignify_proxy('${shortcode.org}',${member});"
            }
        }
    };

    $scope.fetch_user_assignments = function (member_id) {
        setTimeout(function () {
            $scope.fetch('vw_user_permissions', { member_id: member_id });
        }, 300);
    };

    $scope.data.pass_recovery = {};
    $scope.data.current_user = {};

    //@ -- SMS MANAGEMENT ISSUES
    $scope.modaler = function (modal_identifier) {

        console.log("Performing changes for " + modal_identifier);

        var modal = UIkit.modal(modal_identifier);

        console.dir(modal.isActive());

        if (modal.isActive()) {
            modal.hide();
        } else {
            modal.show();
        }
    };

    //@ CONTACT TEMPLATE RELATED DATA
    $scope.contact_placeholders = ["{{contact_first_name}}", "{{contact_middle_name}}", "{{contact_last_name}}", "{{contact_phone_number}}", "{{contact_owner}}", "{{contact_identification}}", "{{contact_gender}}", "{{contact_county}}", "{{contact_address}}", "{{contact_birthday}}"];
    $scope.appendText = function (txt, scope) {
        return (scope ? scope : '') + " " + txt;
    };

    //@ CONTACT EDITING FACILITATOR
    $scope.current_contact = {};
    $scope.setContact = function (from_obj) {
        $scope.current_contact = $scope.app.clone(from_obj);
    };

    //@ Parse xml where is
    $scope.fromXML = function (network_response) {
        return network_response = network_response ? network_response.includes('<?xml version') ? network_response.match(/<faultstring>(.*?)<\/faultstring>/ig)[0].replace(/<.?faultstring>/ig, '') : network_response : '';
    };

    //@ Transform Relevant tags in the provided mapping_array
    // [{contact_id,contact_tag_id,"contact_owner","t,a,g,s"}]
    $scope.myTags = function () {
        var mapArr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var contact_id = arguments[1];
        return contact_id ? mapArr.filter(function (mp) {
            return mp.contact_id == contact_id;
        }) : [];
    };
    $scope.unusedTags = function () {
        var fetched_tags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var alloted_tags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];


        return $q(function (resolve) {

            $scope.fetched.tags = $scope.fetched.tags ? $scope.fetched.tags : [];
            $scope.fetched.vw_contact_grouping = $scope.fetched.vw_contact_grouping ? $scope.fetched.vw_contact_grouping : [];

            var used_tags = $scope.fetched.vw_contact_grouping.reduce(function (cumulative, tag_info, idx) {
                cumulative.push(tag_info.tag_id);
                return cumulative;
            }, []) || [];

            $scope.fetched.applicable_tags = $scope.fetched.tags.filter(function (fetched_tag_info) {
                return used_tags.indexOf(fetched_tag_info.tag_id) == -1;
            });
            resolve();
        });

        // let unique_tags = (alloted_tags[0]) ? [] :fetched_tags;
        // all_tags.forEach( unused_tag  => {
        //     alloted_tags
        //     .forEach( used_tag => {
        //         if( used_tag.tag_id != unused_tag.tag_id )
        //         {
        //             unique_tags.push( unused_tag )
        //         }
        //     })
        // })
        // return $scope.app.remove_duplicates(unique_tags);
    };

    $scope.update_joined_groups = function () {

        $scope.fetch([['vw_contact_grouping', { contact_id: $scope.current_contact.contact_id }], ['tags']]).then(function () {
            $scope.unusedTags();
        }).catch(function () {
            $scope.unusedTags();
        });
    };

    $scope.update_grouping_data = function (tag_id) {

        $scope.data.current_tag = tag_id ? tag_id : $scope.data.current_tag;

        var applicable_contacts = [];

        $scope.fetch([['vw_contacts_with_tags', { contact_tag: $scope.data.current_tag }]]).then(function () {
            $scope.contacts_fetched = true;
        }).catch(function () {
            $scope.contacts_fetched = true;
        });
    };

    $scope.login_status = function () {
        return $scope.storage.framify_user ? true : false;
    };

    //@ Handle Password Recovery Requests
    $scope.password_recover = function (url_tail, recovery_data) {
        $scope.app.post($scope.app.hlink + "/" + url_tail, recovery_data).then($scope.app.handler).catch($scope.app.handler);
    };

    //@ Handle SMS Unit Balance Requests
    $scope.get_sms_balance = function () {
        $scope.fetch('vw_organization_balances');
    };
}])

//@ A DIRECTIVE THAT ALLOWS THE EDITING OF DATA IN A MODEL
.directive("contenteditable", [function () {
    return {
        restrict: "A",
        require: "ngModel",
        link: function link(scope, element, attrs, ngModel) {

            function read() {
                ngModel.$setViewValue(element.html());
            }

            ngModel.$render = function () {
                element.html(ngModel.$viewValue || 0);
            };

            element.bind("blur keyup change", function () {
                scope.$apply(read);
            });
        }
    };
}])

//@ Handle the upload of files in angular
.directive("fileModel", ["$parse", function ($parse) {
    return {
        restrict: 'A',
        link: function link(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
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

// .directive('showTab',[ function () {
//     return {
//         link: function (scope, element, attrs) {
//             // console.dir(element);
//             element.on('click',function (e) 
//             {
//                 e.preventDefault();
//                 jQuery(element).tab('show');
//             });
//         }
//     };
// }])

//!CONFIGURE THE BNASIC PRE-RUNTIME STATES OF THE APPLICATION
.config(["ChartJsProvider", "$httpProvider", function (ChartJsProvider, $httpProvider) {

    //@ Set the authentication header for each request
    $httpProvider.interceptors.push('authIntercept');

    //@SET THE DEFAULT CHART COLORS
    ChartJsProvider.setOptions({ colors: ['#1976D2', '#292955', '#7CB342', '#FB8C39', '#d81b60', '#2196f3', '#cddc39', '#00897b', '#5d4037', '#212121', '#9c27b0'] });
}]).controller("chartcontroller", ["$scope", "$q", "app", "worker", function ($scope, $q, app, worker) {

    // $scope.webWorker = worker;

    // let eventListener;

    $scope.charts = { type: "line" };

    $scope.fetched = $scope.fetched || {};
    $scope.showCharts = false;
    $scope.show_charts = function () {
        return $scope.showCharts;
    };

    $scope.labels2 = ['total_delivered', 'total_pending', 'total_failed', 'total_requeued'];
    $scope.labels = [];

    $scope.app = app;

    $scope.getData = function (obj, nom) {

        // if(typeof(Worker) == "undefined")
        // {

        if (Array.isArray(obj) && obj[0]) {
            var enumerable_data = obj.filter(function (e) {
                return e.sender && e.sender != 'null' && e.sender != null;
            });

            // console.log(`Attempting to populate data for ${nom}`)
            // console.dir(enumerable_data)

            var chart_data_template = {
                data: [],
                labels: [],
                series: ['Delivered', 'Pending', 'Failed', 'Requeued'],
                total: [],
                requeue: [],
                total_series: ['Received'],
                options: {
                    colors: ['#FF0000', '#00FF00', '#0000FF', '#aaaaaa', '#00CCFF', '#FFCCFF', '#000000'],
                    title: {
                        display: true,
                        text: nom.replace(/\_/ig, ' ').toUpperCase()
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            };

            $scope.charts["" + nom] = enumerable_data.reduce(function (cumulative, vl, idx) {

                cumulative.chart.labels.push(vl.sender + " (" + vl['total_received'] + ")");
                cumulative.data.delivered.push(vl['total_delivered']);
                cumulative.data.pending.push(vl['total_pending']);
                cumulative.data.failed.push(vl['total_failed']);
                cumulative.data.requeued.push(vl['total_requeued']);
                cumulative.chart.requeue.push([vl['total_requeue_failed'], vl['total_requeue_sent']]);
                cumulative.chart.total.push(vl['total_received']);

                //@ Format to the final form at the end of the iterations
                if (idx == enumerable_data.length - 1) {
                    cumulative.chart.data = Array(cumulative.data.delivered, cumulative.data.pending, cumulative.data.failed, cumulative.data.requeued);

                    return cumulative.chart;
                } else {
                    return cumulative;
                }
            }, { chart: $scope.app.clone(chart_data_template),
                data: {
                    delivered: [],
                    pending: [],
                    failed: [],
                    requeued: []
                }
            });
        } else {
            $scope.app.alert("<font color=red>CHART DRAW ERROR</font>", "<center>Failed to draw the required charts<br><br>Please ensure that you are loged in then continue.</center>");
            // .then( a => $scope.app.redirect('/#/app/login') )
        }

        // }
        // else
        // {

        //     console.log(`Using web workers for performance optimization.`);
        //     let callID = $scope.webWorker.genCharts({ obj,nom });
        //     eventListener = $scope.$on(callID, onMessageReceived);

        // }
    };

    // function onMessageReceived( Event, args )
    // {

    //     console.dir(args);

    //     if(args != undefined)
    //     {
    //         $scope.charts[args.title] = args.data;
    //     }
    //     else
    //     {
    //         $scope.app.alert(`<font color=red>CHART DRAW ERROR</font>`,`<center>Failed to draw the required charts<br><br>Please ensure that you are loged in then continue.</center>`)
    //     }

    //     eventListener();

    // }

    //@ Fetch the specified data
    $scope.promisify = function () {
        var process_data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];


        return $q(function (resolve, reject) {

            // $scope.app.alert("Promisify Triggered","The promisify method has been called.<br><br>Please check the logs to see what is going on")
            // console.dir(process_data)

            //@ ensure that the provided data is an array
            if (Array.isArray(process_data)) {

                //@ Construct an array of promises
                var fetch_arr = process_data.reduce(function (cumulative, curr, indx) {
                    cumulative[indx] = $scope.app.db({ command: "get", table: curr[0] || curr });
                    return cumulative;
                }, []);

                //@ Wait for all the requests to resolve
                $q.all(fetch_arr).then(function (d) {

                    //@ Add/replace the data in the scope's "fetched" placeholder
                    Object.assign($scope.fetched, d.reduce(function (cumulative, el, pos) {
                        cumulative[process_data[pos][0]] = el.data ? el.data.message : el || [];
                        return cumulative;
                    }, {}));

                    //@ Draw the charts
                    resolve();
                }).catch(function (e) {
                    //@ Show an error message
                    $scope.app.logger(e);
                }).then(resolve);
            } else {
                //@ Show an error message
                $scope.app.alert("Promisify Error", "Failed to capture the indices required for this request to terminate.");
                reject();
            }
        });
    };

    //@ prepare the charts
    $scope.draw_charts = function () {

        //@ Ensure that we have at least fetched some database items
        if ($scope.fetched == {}) {
            $scope.app.alert("<font color='red'>Chart Drawing Failure</font>", "Please fetch the required data before initiating a chart draw!");
        } else {
            $scope.showCharts = true;
            // $scope.$apply( );
            $scope.getWeekData([$scope.fetched.vw_sms_one_day, $scope.fetched.vw_sms_two_day, $scope.fetched.vw_sms_three_day, $scope.fetched.vw_sms_four_day, $scope.fetched.vw_sms_five_day, $scope.fetched.vw_sms_six_day, $scope.fetched.vw_sms_seven_day], 'seven_day_summary');
        }
    };

    // $scope.generate_days

    $scope.getWeekData = function (obj, nom, days) {
        return $q(function (resolve, reject) {

            if (Array.isArray(obj) && obj[0]) {

                //@ Check to see if the length of any of the objects is available
                var enumerable_data = obj.filter(function (e) {
                    return e.length > 0;
                });
                // const enumerable_data = obj.filter(e=> ( e.sender && e.sender != 'null' && e.sender != null ) )        


                if (enumerable_data.length > 0) {

                    //@ The chart structure object
                    $scope.charts["" + nom] = {
                        data: [],
                        labels: days || $scope.getDays(),
                        series: $scope.getSeries(enumerable_data),
                        total: [],
                        requeue: [],
                        total_series: [],
                        options: {
                            colors: ['#1976D2', '#292955', '#7CB342', '#FB8C39', 'rgba(99,0,0,.9)', '#2196f3', '#cddc39', '#00897b', '#5d4037', '#212121', '#9c27b0'],
                            title: {
                                display: true,
                                text: nom.replace(/\_/ig, ' ').toUpperCase()
                            },
                            legend: {
                                display: true,
                                position: 'bottom'
                            }
                        }
                    };
                    // console.dir($scope.charts[`${nom}`])

                    //@ Define and inject the category placeholders for the specified chart                
                    var d = $scope.charts["" + nom].series.reduce(function (cumulative, vl, idx) {
                        cumulative["delivered"][vl] = [];
                        cumulative["failed"][vl] = [];
                        cumulative["pending"][vl] = [];
                        cumulative["requeued"][vl] = [];
                        cumulative["requeue"][vl] = [];
                        cumulative["total"][vl] = [];
                        return cumulative;
                    }, { delivered: {}, failed: {}, pending: {}, requeued: {}, requeue: {}, total: {} });

                    // console.dir(d)
                    // console.dir(obj)


                    // .filter(ojx => ojx.reduce( (prv,oj) => { if( oj.sender && oj.sender != 'null' && oj.sender != null && oj.sender != undefined && oj.sender != 'undefined') { prv.push(oj) };return prv; },[]))

                    obj.forEach(function (a) {

                        a = a.filter(function (b) {
                            return b.sender;
                        });
                        // console.log(`\n=========================================================>\n`)
                        // console.dir(a)
                        // console.log(`\nTags\n`)
                        // console.dir($scope.getSeries(enumerable_data));
                        // console.log(`\n\n`);

                        if (a.length == 0 || !Array.isArray(a)) {
                            //@ Manually indicate that the transactions for this period were not found
                            d = Object.keys(d.delivered).reduce(function (cumulative, v, pos) {

                                //@ Ensure that the elements exist and populate them with a placeholder z ero
                                cumulative.delivered[v] = cumulative.delivered[v] || [];
                                cumulative.delivered[v].push(0);

                                cumulative.pending[v] = cumulative.pending[v] || [];
                                cumulative.pending[v].push(0);

                                cumulative.failed[v] = cumulative.failed[v] || [];
                                cumulative.failed[v].push(0);

                                cumulative.requeued[v] = cumulative.requeued[v] || [];
                                cumulative.requeued[v].push(0);

                                cumulative.requeue[v] = cumulative.requeue[v] || [];
                                cumulative.requeue[v].push([0, 0]);

                                cumulative.total[v] = cumulative.total[v] || [];
                                cumulative.total[v].push(0);

                                return cumulative;
                            }, $scope.app.clone(d));
                        } else {

                            //@ LOOP THROUGH EACH OF THE DEFINED SENDERS
                            d = $scope.getSeries(enumerable_data).reduce(function (totld, curob, curinx) {
                                // console.log(`\n\n===============================>\nServing ${curob}\n\n`)

                                //@ The "is value defined" watcher
                                var logd = false;

                                //@ LOOP THROUGH EACH OF THE PROVIDED DATA OBJECTS
                                return a.reduce(function (cumulative, vl, idx) {

                                    // console.log(`Dealing with\n____________________________`)
                                    // console.dir( vl)
                                    // console.log(`____________________________`)

                                    //@ Define the object or maintain it where necessary
                                    if (idx == 0) {
                                        //@ delivered
                                        cumulative.delivered[curob] = cumulative.delivered[curob] || [];

                                        //@ pending
                                        cumulative.pending[curob] = cumulative.pending[curob] || [];

                                        //@ failed
                                        cumulative.failed[curob] = cumulative.failed[curob] || [];

                                        //@ requeued
                                        cumulative.requeued[curob] = cumulative.requeued[curob] || [];

                                        //@ requeue
                                        cumulative.requeue[curob] = cumulative.requeue[curob] || [];

                                        //@ total
                                        cumulative.total[curob] = cumulative.total[curob] || [];
                                    }

                                    //@ ADD DATA WHERE APPLICABLE
                                    if (vl["sender"] == curob) {
                                        logd = true;
                                        //@ delivered
                                        cumulative.delivered[curob].push(parseInt(vl['total_delivered']) || 0);

                                        //@ pending
                                        cumulative.pending[curob].push(parseInt(vl['total_pending']) || 0);

                                        //@ failed
                                        cumulative.failed[curob].push(parseInt(vl['total_failed']) || 0);

                                        //@ requeued
                                        cumulative.requeued[curob].push(parseInt(vl['total_requeued']) || 0);

                                        //@ requeue
                                        cumulative.requeue[curob].push([parseInt(vl['total_requeue_failed']) || 0, parseInt(vl['total_requeue_sent']) || 0]);

                                        //@ total
                                        cumulative.total[curob].push(parseInt(vl['total_received']) || 0);
                                    }

                                    //@ PUSH A ZERO WHERE NO DATA FOR THE CURRENT SENDER EXISTS
                                    if (idx == a.length - 1 && logd == false) {

                                        //@ delivered
                                        cumulative.delivered[curob].push(0);

                                        //@ pending
                                        cumulative.pending[curob].push(0);

                                        //@ failed
                                        cumulative.failed[curob].push(0);

                                        //@ requeued
                                        cumulative.requeued[curob].push(0);

                                        //@ requeue
                                        cumulative.requeue[curob].push([0, 0]);

                                        //@ total
                                        cumulative.total[curob].push(0);
                                    }

                                    // console.dir(cumulative)

                                    return cumulative;
                                }, $scope.app.clone(totld));
                            }, $scope.app.clone(d));
                        }
                    });

                    // console.dir( Object.keys(d.delivered).map(k=>d.delivered[k]) );

                    resolve($scope.charts[nom].data = {
                        delivered: Object.keys(d.delivered).map(function (k) {
                            return d.delivered[k] || 0;
                        }),
                        failed: Object.keys(d.failed).map(function (k) {
                            return d.failed[k] || 0;
                        }),
                        pending: Object.keys(d.pending).map(function (k) {
                            return d.pending[k] || 0;
                        }),
                        requeued: Object.keys(d.requeued).map(function (k) {
                            return d.requeued[k] || 0;
                        }),
                        requeue: Object.keys(d.requeue).map(function (k) {
                            return d.requeue[k] || 0;
                        }),
                        total: Object.keys(d.total).map(function (k) {
                            return d.total[k] || 0;
                        })
                    });

                    // console.dir($scope.charts[nom])

                    // $scope.charts[nom] = [obj['total_delivered'],obj['total_pending'],obj['total_failed'],obj['total_requeued']];
                    // $scope.$apply();
                } else {
                    resolve($scope.app.alert("<font color='red'>CHART GENERATOR ERROR</font>", "<center>It seems like there are no records to display for this week.</center>"));
                }
            } else {
                resolve($scope.app.alert("<font color=red>CHART DRAW ERROR</font>", "<center>Failed to draw the required charts<br><br>Please ensure that you are loged in then continue.</center>"));
                // .then( a => $scope.app.redirect('/#/app/login') )        
            }
        });
    };

    //@ The past seven day's day names
    $scope.getDays = function () {

        var dayhold = 86400000;
        var now = new Date();
        var labels = [];

        for (var i = 0; i <= 6; i++) {
            labels.push(new Date(now - i * dayhold).format("ddd < hh:mm TT"));
        }

        return labels;
    };

    //@ Get the series Labels
    $scope.getSeries = function (chart_obj) {

        if (Array.isArray(chart_obj)) {
            var series_labels = void 0;

            if (Array.isArray(chart_obj[0])) {

                return $scope.app.unique(chart_obj.reduce(function (cumulative, chart_entry, pos) {
                    cumulative = chart_entry.reduce(function (cum, vl, idx) {
                        // cum[idx] = (vl.sender);
                        cum.push(vl.sender);
                        return cum;
                    }, app.clone(cumulative));

                    return cumulative;
                }, [])).filter(function (e) {
                    return e != null && e != undefined && e != 'undefined' && e != 'null';
                });
            } else {

                return $scope.app.unique(chart_obj.reduce(function (cumulative, chart_data, idx) {
                    cumulative[idx] = chart_data.sender;
                    return cumulative;
                }, []));
            }
        } else {
            $scope.app.alert("Chart Drawing Error", "The Multichart Series Label Generator expects an array");
            return [];
        }
    };

    //@ Prepare the {delivered,failed,success_rate,cost} object
    $scope.summaries = {
        delivered: 0,
        failed: 0,
        success_rate: 0,
        cost: 0
    };

    //@ Summarize the [delivered,failed,success_rate,cost] from the fetched data
    $scope.prepare_rates = function () {
        return $q(function (resolve, reject) {

            $scope.summaries = $scope.fetched.vw_general_stats.reduce(function (cumulative, sender_status, indx) {
                cumulative.delivered += parseInt(sender_status.total_delivered) || 0;
                cumulative.failed += parseInt(sender_status.total_failed) || 0;
                cumulative.success_rate = cumulative.delivered / (cumulative.delivered + cumulative.failed) * 100;
                return cumulative;
            }, {
                delivered: 0,
                failed: 0,
                success_rate: 0
            });
            resolve();
        });
    };
}]).directive("userEdit", function () {
    return {
        restrict: "E",
        templateUrl: 'views/permissions.html'
    };
})

// .directive("contactEdit"
//                          ,[ function()
// {
//   return {
//        restrict : "E", 
//         templateUrl : 'views/client/contactEdit.html'
//   }
// }])

//@ Allow ng-bind-html with directives
.directive("compile", ["$compile", function ($compile) {
    return function (scope, element, attrs) {
        scope.$watch(function (scope) {
            // watch the 'compile' expression for changes
            return scope.$eval(attrs.compile);
        }, function (value) {
            // when the 'compile' expression changes
            // assign it into the current DOM
            element.html(value);

            // compile the new DOM and link it to the current
            // scope.
            // NOTE: we only compile .childNodes so that
            // we don't get into infinite loop compiling ourselves
            $compile(element.contents())(scope);
        });
    };
}]).service("UuidService", [function () {

    return {

        generate: function generate() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }

    };
}])

//@ PDF Generation Service
.service("pdfGen", ["$q", "$rootScope", "UuidService", function ($q, $rootScope, UuidService) {
    var pdfGen = this;

    pdfGen.WebWorkerService = function ($rootScope, UuidService) {
        // Private properties.
        var webWorker = new Worker("assets/js/worker.js");

        // Activation.
        this.activate();

        return;
        {

            activate: (function () {

                webWorker.addEventListener('message', onWebWorkerResponse, false);
            });

            generatePDF: (function (values) {
                var MESSAGE_ID = UuidService.generate();

                webWorker.postMessage(JSON.stringify([MESSAGE_ID, 'generatePDF', values]));

                return MESSAGE_ID;
            });

            onWebWorkerResponse: (function (message) {

                var data = JSON.parse(message.data),
                    messageId = data[0],
                    result = data[1];

                // Call $apply around async events, including anywhere it calls 
                // broadcast/emit.
                // Docs: https://github.com/angular/angular.js/wiki/When-to-use-$scope.$apply()
                $rootScope.$apply($rootScope.$broadcast(messageId, result));

                data[1].save("SMS REPORTS FOR " + new Date().format("yyyy/mm/dd HH:mm") + ".pdf");
            });

            serviceInterface: {
                generatePDF: generatePDF;
            }
        }
    };

    return pdfGen;
}]).service("worker", ["$q", "$rootScope", "UuidService", function ($q, $rootScope, UuidService) {

    var worker = this;

    // Private properties.
    var webWorker = new Worker("assets/js/worker.js");

    worker.activate = function () {

        webWorker.addEventListener('message', worker.onWebWorkerResponse, false);
    };

    worker.genCharts = function (values) {

        console.log("\nAttempting to generate charts");

        var MESSAGE_ID = UuidService.generate();

        webWorker.postMessage(JSON.stringify([MESSAGE_ID, 'generateCharts', values]));
        console.log(MESSAGE_ID);
        return MESSAGE_ID;
    };

    worker.onWebWorkerResponse = function (message) {

        console.log("\nThe webworker completed it's computaional task");

        var data = JSON.parse(message.data),
            messageId = data[0],
            result = data[1];

        // Call $apply around async events, including anywhere it calls 
        // broadcast/emit.
        // Docs: https://github.com/angular/angular.js/wiki/When-to-use-$scope.$apply()
        $rootScope.$apply($rootScope.$broadcast(messageId, result));
    };

    worker.activate();

    return worker;
}])

//@ Allow easy disabling of anchor tags
.directive("a", [function () {
    return {
        restrict: 'E',
        link: function link(scope, elem, attrs) {
            elem.on('click', function (e) {
                if (attrs.disabled) {
                    e.preventDefault(); // prevent link click from working
                }
            });
        }
    };
}]).directive('fileDownload', function () {
    return {
        restrict: 'E', // applied on 'element'
        scope: {
            fileurl: '@fileurl',
            linktext: '@linktext'
        },
        template: '<a href="{{ fileurl }}" download>{{ linktext }}</a>', // need this so that the inner HTML can be re-used
        link: function link(scope, elem, attrs) {
            /* Ref: https://thinkster.io/egghead/isolate-scope-at
             * This block is used when we have
             * scope: {
                 fileurl: '=fileurl',
                 linktext: '=linktext'     
               }          
             scope.fileurl = attrs.fileurl;
             scope.linktext = attrs.linktext;*/
        }
    };
});