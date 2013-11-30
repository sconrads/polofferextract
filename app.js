var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/pol');
var async = require('async');

// Gets the MongoDB collection pol
var polData = db.get('pol');

polData.find({}, { stream: true })
  .each(function(doc){
    var pricesDoc = doc.prices;
    console.log(doc.name);
    var priceThisMonth;
    var priceLastMonth;
    // Loop prices for this product
    for(var i=0;i<pricesDoc.length;i++){
        var priceDoc = pricesDoc[i];
        var price;
        var time;
        // Loop each price document. Find price this month and last month
        for(var attr in priceDoc){
            var attrName = attr;
            //console.log(attrName);
            var attrValue = priceDoc[attr];
            //console.log(attrValue);
            if (attrName === "time")
            {
              time = attrValue;
            }
            else if (attrName === "price")
            {
              price = attrValue;
            }
            
        }
        if ( (time.getMonth() === new Date().getMonth()) && (time.getYear() === new Date().getYear()) )
        {
          priceThisMonth = price;
        }
        else if ( ((time.getMonth()) === (new Date().getMonth() - 1)) && (time.getYear() === new Date().getYear()) && (new Date().getMonth() > 0) )
        {
          priceLastMonth = price;
        }
        // If today is january, compare with price last december last year
        else if ( (new Date().getMonth() === 0) && (time.getMonth() === 11) && (time.getYear() === new Date().getYear() -1) )
        {
          priceLastMonth = price;
        }
        console.log("Price: " + price);
        console.log("Time: " + time);
    }
    console.log("Price this month: " + priceThisMonth);
    console.log("Price last month: " + priceLastMonth);
  })
  .error(function(err){
    console.log(err);
  })
  .success(function(){});

process.on('exit', function() {
   db.close(); 
   console.log('Exiting'); 
   process.exit(0);
});

process.on('SIGINT', function() {
   db.close(); 
   console.log('Got a SIGINT. Exiting'); 
   process.exit(0);
});




