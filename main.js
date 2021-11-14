const AirtableKey = "";
const AirbaseKey = "";
const NomicsKey = "";

const Axios = require('axios');
const NomicsAPIRequest = "https://api.nomics.com/v1/exchange-rates?key=" + NomicsKey;
const Airtable = require('airtable');
const Airbase = new Airtable({apiKey: AirtableKey}).base(AirbaseKey);
var DataQueue = [];

function HandleQueue() {
    if (DataQueue.length > 0) {
        NumOfRecords = Math.min(DataQueue.length,10);
        DataToAdd = DataQueue.slice(0,NumOfRecords);
        Airbase('BTC Table').create(DataToAdd,
            function(err) {
                if (err) {
                    console.log("failed adding BTC stats, will try again in 1 minute");
                    return;
                }
                DataQueue.splice(0,NumOfRecords);
        });
    }
}

function main() {
    setInterval(function() {
        Axios
            .get(NomicsAPIRequest)
            .then(response => {
                if (response.status == 200) {
                    CurrBTC = response.data.filter(coin => coin.currency === "BTC");
                    WrappedData = {"fields": {
                        "Time": CurrBTC[0].timestamp,
                        "Rates": parseFloat(CurrBTC[0].rate)
                    }}
                    DataQueue.push(WrappedData);
                }
                else {
                    console.log("failed retreiving BTC stats, will try again in 1 minute");
                }
                HandleQueue();
            })
            .catch(err => { 
                console.error(err);
            });   
    }, 60*1000);
}

if (require.main === module) {
    main();
}