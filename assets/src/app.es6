var sort_by = function(field,reverse,primer){
    var key     = primer ? function(x){ return primer(x[field]) } : function(x){ return x[field] } ;
    reverse     = !reverse ? 1 : -1;
    return function(a,b){
        return a = key(a), b = key(b), reverse* ((a>b) - (b>a));
    }
}

angular.module("framify", 
                            [
                                "framify.js"
                                ,"smDateTimeRangePicker"
                            ])

// !CONFIGURE THE BNASIC PRE-RUNTIME STATES OF THE APPLICATION
.config([
            "$stateProvider"
            ,"$urlRouterProvider"
            ,"$provide"
            ,"$sceProvider"
            ,"$mdThemingProvider"
            ,"ChartJsProvider"
            ,"pickerProvider"
            ,function($stateProvider,$urlRouterProvider,$provide,$sceProvider,$mdThemingProvider,ChartJsProvider,pickerProvider) 
{


    pickerProvider.setOkLabel('Confirm');
    pickerProvider.setCancelLabel('Close');
    pickerProvider.setDayHeader('single');

    //@SET THE DEFAULT CHART COLORS
    ChartJsProvider.setOptions({ colors: ['#d81b60', '#2196f3', '#cddc39', '#00897b', '#5d4037', '#212121', '#9c27b0'] });

    $mdThemingProvider.theme('default').primaryPalette('light-blue').backgroundPalette('blue-grey');

    $sceProvider.enabled(false);

    $stateProvider

    //@ Improper redirection pages
    .state("app.404", {
        url: "/404",
        templateUrl: 'views/404.html'
    }).state("app.500", {
        url: "/500",
        templateUrl: 'views/500.html'
    })

    //@  Main application routes
    .state('app', {
        url: "/app",
        cache: false,
        templateUrl: 'views/dash.html'
        // ,abstract: 'app.index'
        // ,controller: 'framifyController'
        // resolve: {
        //     currentStats: function($http) {
        //         // return $http.get('/currentStats')
        //         //         .then(function(response){
        //         //             return response.data;
        //         //         })
        //         return {};
        //     }
        // }
    }).state("app.index", {
        url: "/index",
        cache: false,
        templateUrl: "views/index.html"
    }).state("app.documentation", {
        url: "/documentation",
        cache: false,
        templateUrl: "views/documentation.html"
    }).state("app.signup", {
        url: "/signup",
        cache: false,
        templateUrl: "views/signup.html"
    }).state("app.login", {
        url: "/login",
        cache: false,
        templateUrl: "views/login.html"
    }).state("app.panel", {
        url: "/panel",
        cache: false,
        templateUrl: "views/panel.html"
    }).state("app.passwords", {
        url: "/passwords",
        cache: false,
        templateUrl: "views/passwords.html"
    }).state("app.manage_users", {
        url: "/manage_users",
        cache: false,
        templateUrl: "views/manage_users.html"
    })
    //@Application balance Manager
    .state("app.balances", {
        url: "/balances",
        cache: false,
        templateUrl: "views/balances.html"
    })

    //@ Permissions 
    .state("app.permissions", {
        url: "/permissions",
        cache: false,
        templateUrl: "views/permissions.html"
    })

    //@ Permissions (For user access updates by relevant administrators)
    .state("app.permissions_edit", {
        url: "/permissions/:member_id",
        cache: false,
        templateUrl: "views/permissions_edit.html",
        controller: function controller($scope, $stateParams) {
            $scope.active_member_id = $stateParams.member_id;
        }
    })

    //@ AID IN PASSWORD RECOVERY
    .state("app.password_recovery", {
        url: "/password_recovery/:recovery_id/:recovery_email/:recovery_key",
        cache: false,
        templateUrl: "views/password_recovery.html",
        controller: function controller($scope, $stateParams) {
            $scope.recovery_email = $stateParams.recovery_email;
            $scope.recovery_url_tail = "auth/passwords/recover/" + $stateParams.recovery_id + "/" + $stateParams.recovery_email + "/" + $stateParams.recovery_key;
        }
    })

    //@ CLIENT MANAGEMENT
    .state('app.client', {
        url: "/client",
        cache: false,
        templateUrl: 'views/client/index.html'
        // ,abstract: 'app.index'
        // ,controller: 'framifyController'
        // resolve: {
        //     currentStats: function($http) {
        //         // return $http.get('/currentStats')
        //         //         .then(function(response){
        //         //             return response.data;
        //         //         })
        //         return {};
        //     }
        // }
    })
    //@ contact management
    .state("app.client.contacts", {
        url: "/contacts",
        cache: false,
        templateUrl: "views/client/contacts.html"
    })
    //@ campaign management
    .state("app.client.campaigns", {
        url: "/campaigns",
        cache: false,
        templateUrl: "views/client/campaigns.html"
    })
    //@ template management
    .state("app.client.templates", {
        url: "/templates",
        cache: false,
        templateUrl: "views/client/templates.html"
    })
    //@ tag management
    .state("app.client.tags", {
        url: "/tags",
        cache: false,
        templateUrl: "views/client/tags.html"
    }).state("app.client.tests", {
        url: "/tests",
        cache: false,
        templateUrl: "views/client/test.html"
    }).state("app.client.sms", {
        url: "/sms",
        cache: false,
        templateUrl: "views/client/sms.html"
    })

    //@ SMS
    .state("app.sms",
    {
        url         : "/sms"
        ,cache      : false
        ,templateUrl    : "views/client/sms/index.html"
    })

    //@ SIMPLE SMS HANDLING
    .state("app.sms.simple_sms",
    {
        url             : "/simple_sms"
        ,cache          : false
        ,templateUrl    : "views/client/sms/simple_sms.html"
    })

    //@ TEMPLATE SMS HANDLING
    .state("app.sms.template_sms",
    {
        url             : "/template_sms"
        ,cache          : false
        ,templateUrl    : "views/client/sms/template_sms.html"
    })

    //@ GROUP SMS HANDLING
    .state("app.sms.group_sms",
    {
        url             : "/group_sms"
        ,cache          : false
        ,templateUrl    : "views/client/sms/group_sms.html"
    })

    //@ DIRECT BULK SMS HANDLING
    .state("app.sms.direct_bulk",
    {
        url             : '/direct_bulk'
        ,cache          : false
        ,templateUrl    : "views/client/sms/direct_bulk.html"
    })
    

    //@ Force a view reload
    $provide.decorator('$state', function ($delegate, $stateParams) {

        $delegate.forceReload = function () {
            return $delegate.go($delegate.current, $stateParams, {
                reload: true,
                inherit: false,
                notify: true
            });
        };

        return $delegate;
    });

    //@ Define the main route
    $urlRouterProvider.otherwise('/app/index');

}])

//!DEFINE THE APPLICATION RUNTIME DEFAULTS
//$templateCache
.run(["app", "$rootScope", "$state", "$localStorage", function (app, $rootScope, $state, $localStorage) {

    // $rootScope.$on('$viewContentLoaded', function() {
    //     $templateCache.removeAll();
    // });


    $rootScope.sort_by = function (field, reverse, primer) {
        var key = primer ? function (x) {
            return primer(x[field]);
        } : function (x) {
            return x[field];
        };
        reverse = !reverse ? 1 : -1;
        return function (a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        };
    };

    //! INJECT THE LOCATION SOURCE TO THE ROOT SCOPE
    $rootScope.location = $state;

    //! INJECT THE $localStorage instance into the root scope
    $rootScope.storage = $localStorage;

    //! INJECT THE APPLICATION'S MAIN SERVICE TO THE ROOT SCOPE SUCH THAT ALL SCOPES MAY INHERIT IT
    $rootScope.app = app;

    //! SIMPLE APPLICATION BEHAVIOR SETUP
    $rootScope.frame = {};

    //! IDENTIFY THE CURRENT PATH
    $rootScope.frame.path = function () {
        return $state.absUrl().split("/#/")[0] + "/#/" + $state.absUrl().split("/#/")[1].split("#")[0];
    };
    //p.split("/#/")[0]+"/#/"+p.split("/#/")[1].split("#")[0]

    //! RELOCATION HANDLING
    $rootScope.frame.relocate = function (loc) {
        // console.log('Relocating to: #' + loc);
        $rootScope.location.go(loc);
    };
}]).filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
});