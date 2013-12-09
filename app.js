var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/pol');
var offerdb = monk('localhost:27017/offers');
var async = require('async');

// Gets the MongoDB collection pol
var polData = db.get('pol');
var polOffers = offerdb.get('offers');

polData.find({}, { stream: true })
  .each(function(doc){
    var pricesDoc = doc.prices;
    //console.log(doc.name);
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
        if ( (time.getMonth() === new Date().getMonth()) && (time.getFullYear() === new Date().getFullYear()) )
        {
          priceThisMonth = price;
        }
        else if ( ((time.getMonth()) === (new Date().getMonth() - 1)) && (time.getFullYear() === new Date().getFullYear()) && (new Date().getMonth() > 0) )
        {
          priceLastMonth = price;
        }
        // If today is january, compare with price last december last year
        else if ( (new Date().getMonth() === 0) && (time.getMonth() === 11) && (time.getFullYear() === new Date().getFullYear() -1) )
        {
          priceLastMonth = price;
        }
        //console.log("Price: " + price);
        //console.log("Time: " + time);
    }

    if (priceThisMonth != undefined && priceLastMonth != undefined)
    {
      priceThisMonth = parseFloat(priceThisMonth.replace(",",".")).toFixed(2);
      priceLastMonth = parseFloat(priceLastMonth.replace(",",".")).toFixed(2);
      //console.log("Price this month: " + priceThisMonth);
      //console.log("Price last month: " + priceLastMonth);
    
      if (priceThisMonth < priceLastMonth)
      {
        console.log(doc.name);
        console.log("Price this month: " + priceThisMonth);
        console.log("Price last month: " + priceLastMonth);
        console.log("Reduction in price this month in NOK: " + parseFloat(priceLastMonth - priceThisMonth).toFixed(2));
        console.log("Reduction in price this month in percent: " + (((parseFloat(priceLastMonth - priceThisMonth).toFixed(2))/priceLastMonth)*100).toFixed(2));
        var offerJson = {
                      product : doc,
                      priceThisMonth : priceThisMonth,
                      priceLastMonth : priceLastMonth,
                      priceReductionNok : parseFloat(priceLastMonth - priceThisMonth).toFixed(2),
                      priceReductionPrecent : (((parseFloat(priceLastMonth - priceThisMonth).toFixed(2))/priceLastMonth)*100).toFixed(2)
                    };

        polOffers.update( {
                        _id : (new Date().getMonth() + 1) + "" + new Date().getFullYear()
                      },
                  { 
                    $push: { offers:  offerJson } 
                  },
                   { upsert: true }
                  ,function (err, doc) {
                    if (err) {
                        console.log("There was a problem adding the information to the database: " + err);
                    }
                  });      
      }
    }

  })
  .error(function(err){
    console.log(err);
  })
  .success(function(){});

process.on('exit', function(error) {
   console.log(error);
   db.close(); 
   offerdb.close();
   console.log('Exiting'); 
   process.exit(0);
});

process.on('SIGINT', function() {
   db.close(); 
   offerdb.close();
   console.log('Got a SIGINT. Exiting'); 
   process.exit(0);
});




