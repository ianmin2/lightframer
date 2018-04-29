"use strict";

var sort_by = function sort_by(field, reverse, primer) {
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

angular.module("framify", ["framify.js", "smDateTimeRangePicker"])

// !CONFIGURE THE BNASIC PRE-RUNTIME STATES OF THE APPLICATION
.config(["$stateProvider", "$urlRouterProvider", "$provide", "$sceProvider", "$mdThemingProvider", function ($stateProvider, $urlRouterProvider, $provide, $sceProvider, $mdThemingProvider) {

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
    });

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
    $urlRouterProvider.otherwise('/app/panel');
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
}]).filter('startFrom', [function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
}]);