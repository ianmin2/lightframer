arrayPush            = array_push =  ( arr,valu ) =>
    ( !Array.isArray(arr) ) 
        ? []
        : ( Array.isArray(valu) )
            ?  arr.concat(valu) 
            : (function(){ 
                let myarr = JSON.parse( JSON.stringify( arr ) );
                myarr.push(valu);
                return myarr;
            })();

  

    const ar_1 = [1,2,3,4,5];
    const ar_2 = ["a","b","c"];
    const v_1  = "a";

    console.log('result 2arr', array_push( ar_1  , ar_2  ) )
    console.log('Result ar1', ar_1 )
    console.log('Result ar2', ar_2 )
    console.log('Result ar1 v1', array_push( ar_1, v_1 ) )
    console.log('Result ar1', ar_1 )
    console.log('Result ar2', ar_2 )