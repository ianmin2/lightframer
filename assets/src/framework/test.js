this.count          = (searchParam, arrayObject) => 
   {


       //@ Ensure that the Object to be searched is an array
       if (Array.isArray(arrayObject)) {

           //@ Handle Multiple Item Searches
           if (Array.isArray(searchParam)) {

               //@ The Required placeholder objects
               var i = 0;
               var cnt = [];

               //@ Loop through each item in the search array
               for (var searchVal in searchParam) {

                   //@ Instantiate the counter object for this particular Item
                   cnt[i] = 0;

                   //@ Loop through the array searching for the item
                   for (var v in arrayObject) {

                       //@ If the item is found, 
                       if (searchParam[searchVal] === arrayObject[v]) {

                           //@ Increment the number of instances in the 'found' Array
                           cnt[i] = (isNaN(cnt[i])) ? 1 : cnt[i] += 1;

                       }

                   }

                   //@ Move to the next Item 
                   i++;

               }

               //@ Return the result to the client
               return cnt;


               //@ Handle Single Item searches
           } else {

               //@ Instantiate the neede placeholders
               var cnt = 0;

               //@ Loop through the Array searching for the value
               for (var v in arrayObject) {

                   //@ When a match is found
                   if (searchParam === arrayObject[v]) {

                       //@ Increment the number of occurences
                       cnt += 1;

                   }

               }

               //@ Return the 'number of occurences'
               return cnt;

           }

           //@ Object is not an array
       } else {

           app.notify("The object to perform an array count on is not an Array.", "danger");

       }



   };
