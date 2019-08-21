count = ( searchParam, arrayObject ) => 
   //@ Ensure that the provided dictionary is an object
   (!Array.isArray(arrayObject)) ? app.notify("Failed to count occurances on a non array object.", "danger")
   : ( Array.isArray(searchParam) ) 
        ?   searchParam.reduce( ( count,search_term ) => {
                count[search_term] = arrayObject.filter(array_val => array_val == search_term ).length;
                return count;
            },{}) 
        : arrayObject.filter( array_val => array_val == searchParam ).length;


let obj_arr = ["Dog","Dog","Dog","Cat","Emily","Obrien","Larry","King","Larry","Jeff"];
const term = "Dog"
console.log(`There are ${ JSON.stringify(count(term,obj_arr))} occurances of the term ${term} in the given array.`);