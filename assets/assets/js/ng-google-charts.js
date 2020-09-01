!function(){function r(r,e){angular.element(e).on("resize",function(){r.$emit("resizeMsg")})}angular.module("googlechart",[]).run(r),r.$inject=["$rootScope","$window"]}(),function(){function r(){function r(r){function e(r,e){var t,n;for(n in r)if(r.hasOwnProperty(n))for(t=0;t<i.iFormats[n].length;t++)r[n][t].columnNum<e.getNumberOfColumns()&&i.iFormats[n][t].format(e,r[n][t].columnNum)}function t(r,e,t){var n;if(angular.isArray(t[r])&&!angular.equals(t[r],c[r]))if(c[r]=t[r],i.iFormats[r]=[],"color"===r)o(t);else for(n=0;n<t[r].length;n++)i.iFormats[r].push(new e(t[r][n]))}function n(r,n,o){var i,c,u=!1;if(!angular.isDefined(n)||!angular.isDefined(r))return{requiresHtml:!1};for(i in n)if(n.hasOwnProperty(i)){if(c=a(i,o),!angular.isFunction(c))continue;t(i,c,n),"arrow"!==i&&"bar"!==i&&"color"!==i||(u=!0)}return e(n,r),{requiresHtml:u}}function o(e){var t,n,o,a;for(t=0;t<e.color.length;t++){for(n=new r.visualization.ColorFormat,o=0;o<e.color[t].formats.length;o++)a=e.color[t].formats[o],void 0!==a.fromBgColor&&void 0!==a.toBgColor?n.addGradientRange(a.from,a.to,a.color,a.fromBgColor,a.toBgColor):n.addRange(a.from,a.to,a.color,a.bgcolor);i.iFormats.color.push(n)}}function a(e,t){var n=e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()+"Format";return r.visualization.hasOwnProperty(n)?google.visualization[n]:angular.isDefined(t)&&t.hasOwnProperty(e)?t[e]:void 0}var i=this,c={};i.iFormats={},i.applyFormats=n}return r}angular.module("googlechart").factory("FormatManager",r)}(),function(){function r(r,e,t,n,o,a,i,c){function u(){d()}function s(){s.triggered||void 0===m.chart?void 0!==m.chart&&(o.cancel(s.recallTimeout),s.recallTimeout=o(s,10)):(s.triggered=!0,o(f,0,!0))}function g(){v.getReadyPromise().then(s)}function l(){v.draw(),s.triggered=!1}function f(){v.setup(e,m.chart.type,m.chart.data,m.chart.view,m.chart.options,m.chart.formatters,m.chart.customFormatters),o(l)}function h(){m.chart=r.$eval(t.chart),g()}function p(){var e=r.$eval(t.chart);if(angular.isDefined(e)&&angular.isObject(e))return{customFormatters:e.customFormatters,data:e.data,formatters:e.formatters,options:e.options,type:e.type,view:e.view}}var d,v,m=this;!function(){v=new c,m.registerChartListener=v.registerChartListener,m.registerWrapperListener=v.registerWrapperListener,m.registerServiceListener=v.registerServiceListener,r.$watch(p,h,!0),d=i.$on("resizeMsg",g),r.$on("$destroy",u)}()}angular.module("googlechart").controller("GoogleChartController",r),r.$inject=["$scope","$element","$attrs","$injector","$timeout","$window","$rootScope","GoogleChartService"]}(),function(){function r(){return{restrict:"A",scope:!1,require:"googleChart",link:function(r,e,t,n){function o(e){r.$apply(function(){r.$eval(t.agcBeforeDraw,{chartWrapper:e})})}o.$inject=["chartWrapper"],n.registerServiceListener("beforeDraw",o,this)}}}angular.module("googlechart").directive("agcBeforeDraw",r)}(),function(){function r(){function r(){var r,e;return r=!isNaN(+t)&&+t<45,e=n.packages.indexOf("geochart")>-1||n.packages.indexOf("map")>-1,r&&e}var e=!1,t="current",n={packages:["corechart"]};this.addPackage=function(t){return n.packages=n.packages||[],n.packages.push(t),r()&&(e=!0),this},this.clearOption=function(r){return delete this._options[r],this},this.removePackage=function(r){n.packages=this._options.packages||[];var e=n.packages.indexOf(r);return e>-1&&n.packages.splice(e,1),this},this.setOption=function(r,e){return n[r]=e,this},this.setOptions=function(r){return n=r,this},this.setVersion=function(n){return t=n,r()&&(e=!0),this},this.useBothLoaders=function(r){return void 0===r&&(r=!0),e=!!r,this},this.$get=function(r,o,a){function i(){if(!google||!google.charts||"function"!=typeof google.charts.setOnLoadCallback)return o.reject("Google charts library loader not present.");var e=o.defer();return google.charts.load(t,n),google.charts.setOnLoadCallback(function(){r.$apply(function(){e.resolve(google)})}),e.promise}var c=a("https://www.gstatic.com/charts/loader.js");return e&&(c=c.then(function(){return a("https://www.google.com/jsapi")})),c.then(i)},this.$get.$inject=["$rootScope","$q","agcScriptTagHelper"]}angular.module("googlechart").provider("agcGstaticLoader",r)}(),function(){function r(r,e,t,n,o){r.debug("[AGC] jsapi loader invoked.");var a=t.defer();o.optionalSettings=o.optionalSettings||{};var i=o.optionalSettings.callback,c={callback:function(){angular.isFunction(i)&&i.call(this),e.$apply(function(){a.resolve(google)})}};return c=angular.extend({},o.optionalSettings,c),r.debug("[AGC] Calling tag helper..."),n("//www.google.com/jsapi").then(function(){r.debug("[AGC] Tag helper returned success."),window.google.load("visualization",o.version||"1",c)}).catch(function(){r.error("[AGC] Tag helper returned error. Script may have failed to load."),a.reject()}),a.promise}angular.module("googlechart").factory("agcJsapiLoader",r),r.$inject=["$log","$rootScope","$q","agcScriptTagHelper","googleChartApiConfig"]}(),function(){function r(r){this.$get=function(r){return r},this.setLoader=function(e){r.has(this.getProviderName(e))?this.$get.$inject=[this.getProviderName(e)]:(console.warn('[Angular-GoogleChart] Loader type "'+e+"\" doesn't exist. Defaulting to JSAPI loader."),this.$get.$inject=[this.getProviderName("Jsapi")])},this.getProviderName=function(r){return"agc"+(r=r.charAt(0).toUpperCase()+r.slice(1))+"Loader"},this.setLoader("Jsapi")}angular.module("googlechart").provider("agcLibraryLoader",r),r.$inject=["$injector"]}(),function(){function r(){this._hasTrigger=!1,this._libraryOverride=null,this._triggerFunction=function(){this._deferred?this._deferred.resolve(this._libraryOverride||google):this._hasTrigger=!1}.bind(this),this._deferred=null}angular.module("googlechart").provider("agcNullLoader",r),r.prototype.$get=function(r){return this._deferred=r.defer(),this._hasTrigger||this._deferred.resolve(this._libraryOverride||google),this._deferred.promise},r.prototype.$get.$inject=["$q"],r.prototype.getTriggerFunction=function(){return this._hasTrigger=!0,this._triggerFunction},r.prototype.overrideLibrary=function(r){this._libraryOverride=r}}(),function(){function r(){return{restrict:"A",scope:!1,require:"googleChart",link:function(r,e,t,n){function o(e,n,o){r.$apply(function(){r.$eval(t.agcOnClick,{args:e,chart:n,chartWrapper:o})})}o.$inject=["args","chart","chartWrapper"],n.registerChartListener("click",o,this)}}}angular.module("googlechart").directive("agcOnClick",r)}(),function(){function r(){return{restrict:"A",scope:!1,require:"googleChart",link:function(r,e,t,n){function o(e,n,o){var a={chartWrapper:e,chart:n,args:o,error:o[0],err:o[0],id:o[0].id,message:o[0].message};r.$apply(function(){r.$eval(t.agcOnError,a)})}o.$inject=["chartWrapper","chart","args"],n.registerWrapperListener("error",o,this)}}}angular.module("googlechart").directive("agcOnError",r)}(),function(){function r(){return{restrict:"A",scope:!1,require:"googleChart",link:function(r,e,t,n){function o(e,n,o){var a={chartWrapper:o,chart:n,args:e,column:e[0].column,row:e[0].row};r.$apply(function(){r.$eval(t.agcOnMouseout,a)})}o.$inject=["args","chart","chartWrapper"],n.registerChartListener("onmouseout",o,this)}}}angular.module("googlechart").directive("agcOnMouseout",r)}(),function(){function r(){return{restrict:"A",scope:!1,require:"googleChart",link:function(r,e,t,n){function o(e,n,o){var a={chartWrapper:o,chart:n,args:e,column:e[0].column,row:e[0].row};r.$apply(function(){r.$eval(t.agcOnMouseover,a)})}o.$inject=["args","chart","chartWrapper"],n.registerChartListener("onmouseover",o,this)}}}angular.module("googlechart").directive("agcOnMouseover",r)}(),function(){function r(){return{restrict:"A",scope:!1,require:"googleChart",link:function(r,e,t,n){function o(e,n,o){var a={chartWrapper:o,chart:n,args:e,start:e[0].start,end:e[0].end};r.$apply(function(){r.$eval(t.agcOnRangeChange,a)})}o.$inject=["args","chart","chartWrapper"],n.registerChartListener("rangechange",o,this)}}}angular.module("googlechart").directive("agcOnRangeChange",r)}(),function(){function r(){return{restrict:"A",scope:!1,require:"googleChart",link:function(r,e,t,n){function o(e){r.$apply(function(){r.$eval(t.agcOnReady,{chartWrapper:e})})}o.$inject=["chartWrapper"],n.registerWrapperListener("ready",o,this)}}}angular.module("googlechart").directive("agcOnReady",r)}(),function(){function r(){return{restrict:"A",scope:!1,require:"googleChart",link:function(r,e,t,n){function o(e,n){var o={selectedItems:n.getSelection()};o.selectedItem=o.selectedItems[0],o.chartWrapper=e,o.chart=n,r.$apply(function(){r.$eval(t.agcOnSelect,o)})}o.$inject=["chartWrapper","chart"],n.registerWrapperListener("select",o,this)}}}angular.module("googlechart").directive("agcOnSelect",r)}(),function(){function r(r,e){function t(t){function n(){a.resolve()}function o(){a.reject()}var a=r.defer(),i=e.find("head"),c=angular.element("<script></script>");return c.attr("type","text/javascript"),c.on("load",n),c.on("error",o),c.attr("src",t),i[0].appendChild(c[0]),a.promise}return t}angular.module("googlechart").factory("agcScriptTagHelper",r),r.$inject=["$q","$document"]}(),function(){function r(){return{restrict:"A",scope:!1,controller:"GoogleChartController"}}angular.module("googlechart").directive("googleChart",r),r.$inject=[]}(),function(){angular.module("googlechart").value("googleChartApiConfig",{version:"1",optionalSettings:{packages:["corechart"]}})}(),function(){function r(r){return r}angular.module("googlechart").factory("googleChartApiPromise",r),r.$inject=["agcLibraryLoader"]}(),function(){function r(r,e,t,n){function o(){function o(r){var e;if(angular.isArray(V[r]))for(e=0;e<V[r].length;e++)V[r][e]()}function a(r){return r}function i(r){return _=r,T=!0,I.resolve(),r}function c(){angular.isDefined(P)?(P.setChartType(z),P.setDataTable(H),P.setView(N),P.setOptions(R)):(P=new _.visualization.ChartWrapper({chartType:z,dataTable:H,view:N,options:R,containerId:G[0]}),l(P,U)),B||(B=new n(_)),B.applyFormats(P.getDataTable(),x,E).requiresHtml&&P.setOption("allowHtml",!0),J=!1}function u(r,e,t){for(var n=e?e.split("."):[];n.length&&r;){var o=n.shift();new RegExp("(.+)\\[([0-9]*)\\]").exec(o);t&&(void 0===r[o]&&(r[o]={}),0===n.length&&(r[o]=t)),r=r[o]}return r}function s(){M!==P.getChart()&&(M=P.getChart(),l(M,K))}function g(r,t,n,o){var a=function(){var r={chartWrapper:P,chart:P.getChart(),args:arguments};e.invoke(n,o||this,r)};if(angular.isDefined(r)&&angular.isObject(r))return angular.isArray(r[t])||(r[t]=[]),r[t].push(a),function(){angular.isDefined(a.googleListenerHandle)&&_.visualization.events.removeListener(a.googleListenerHandle);var e=r[t].indexOf(a);r[t].splice(e,1),0===r[t].length&&(r[t]=void 0)}}function l(r,e){for(var t in e)if(e.hasOwnProperty(t)&&angular.isArray(e[t]))for(var n=0;n<e[t].length;n++)angular.isFunction(e[t][n])&&(e[t][n].googleListenerHandle=_.visualization.events.addListener(r,t,e[t][n]))}function f(){o("beforeDraw"),P.draw()}function h(){J&&(q=q.then(c)),q=q.then(f())}function p(){return P}function d(){var r=H||{};return angular.copy(r)}function v(){return G}function m(r){return u(R||{},r)}function $(){var r=R||{};return angular.copy(r)}function y(){return I.promise}function C(){var r=N||{};return angular.copy(r)}function w(){return T}function O(r,e,t){return g(K,r,e,t)}function L(r,e,t){return g(V,r,e,t)}function j(r,e,t){return g(U,r,e,t)}function k(r){angular.isDefined(r)&&(H=angular.copy(r),J=!0)}function b(r){angular.isElement(r)&&G!==r&&(G=r,P=null,J=!0)}function A(r,e){R=R||{},u(R,r,angular.copy(e)),J=!0}function W(r){angular.isDefined(r)&&(R=angular.copy(r),J=!0)}function S(r,e,t,n,o,a,i){G=r||G,z=e||z,H=t||H,N=n||N,R=o||R,x=a||x,E=i||E,q=q.then(c)}function F(r){N=angular.copy(r)}var D=this;D.draw=h,D.getChartWrapper=p,D.getData=d,D.getElement=v,D.getOption=m,D.getOptions=$,D.getView=C,D.getReadyPromise=y,D.isApiReady=w,D.registerChartListener=O,D.registerServiceListener=L,D.registerWrapperListener=j,D.setData=k,D.setElement=b,D.setOption=A,D.setOptions=W,D.setup=S,D.setView=F;var _,q,T,P,G,z,H,N,R,x,M,B,E,I,J=!0,V={},U={},K={};!function(){T=!1,I=t.defer(),q=r.then(i).catch(a),j("ready",s,D)}()}return o}angular.module("googlechart").factory("GoogleChartService",r),r.$inject=["agcLibraryLoader","$injector","$q","FormatManager"]}();
//# sourceMappingURL=ng-google-chart.min.js.map