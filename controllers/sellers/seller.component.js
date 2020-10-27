var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var _ = require('lodash');


module.exports = {
    processRetailersOrders,
    sortSeller
};

function sortSeller(data) {
    function compare(a, b) {
        const A = a.seller.name.toUpperCase();
        const B = b.seller.name.toUpperCase();

        let comparison = 0;
        if (A > B) {
            comparison = 1;
        } else if (A < B) {
            comparison = -1;
        }
        return comparison;
    }
    // for(entry in data){
    //     data[date].sort(compare);
    // }
    data.sort(compare);
    return data;
}


async function processRetailersOrders(sellers, orders, type) {
    var responseData = [];

    if (sellers.length > 0) {

        sellers.forEach(account => {

            if (orders.length > 0) {

                var i = 0
                var isFilled = false;

                orders.forEach(order => {

                    if (type == 'Retailer') {

                        if (order.retailer__c != undefined && order.retailer__c == account.sfid) {

                            isFilled = true;
                            responseData.push({ "seller": account, "order": order });

                        }
                    } else {

                        if (order.dealer__c != undefined && order.dealer__c == account.sfid) {

                            isFilled = true;
                            responseData.push({ "seller": account, "order": order });
                        }
                    }

                    i++;
                    if (orders.length == i && isFilled == false) {
                        responseData.push({ "seller": account, "order": {} })
                    }
                })
            } else {
                responseData.push({ "seller": account, "order": {} })
            }
        })

    } 
    return responseData;
}