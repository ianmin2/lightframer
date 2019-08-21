//  //@ CHECK IF OBJECT EXISTS IN ARRAY
//  $scope.objectInArray        = (list, item)=> 
//  {
//      var len = list.length;
 
//     /**
//      *  
//      * Object.entries(  )
//      * 
//      * 
//      * 
//      * 
//      */

//      for (var i = 0; i < len; i++) {
//          var keys = Object.keys(list[i]);
//          var flg = true;
//          for (var j = 0; j < keys.length; j++) {
//              var value = list[i][keys[j]];
//              if (item[keys[j]] !== value) {
//                  flg = false;
//              }
//          }
//          if (flg == true) {
//              return i;
//          }
//      }
//      return -1;
//  };
//  $scope.object_in_array = $scope.obj_in_array = $scope.objectInArray;

 let objectInArray = ( list_arr, item ) =>
 ( !Array.isArray( list_arr ) ) ? $scope.app.notify(`Could not check if an object is defined from a non array object`, `Danger`)
    : list_arr.reduce( (matches, curr_obj, idx) => 
    {
       
       return ( 
            Object.keys(curr_obj).reduce( (matches,obj_key,idx) => 
                { 
                        matches[idx] = ( curr_obj[obj_key] == item[obj_key] ) ? 1 : -1;
                        return matches;
                }, [] ).indexOf(-1) != -1             
            )  ?  -1 : 1; 

    }, -1 ) ;

let main_arr = [ { name: "Ian" }, { name: "Some"}, { name: "Other"} , { name : "Person" }, { name : "Keff" }  ];
let srch_item =  { name : "Jeff" };

console.log(`The object ${JSON.stringify(srch_item)} ${( objectInArray(main_arr,srch_item) != -1 ) ? 'exists': 'does not exist'} in ${JSON.stringify(main_arr)}`);

