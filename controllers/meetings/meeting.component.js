var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var _ = require('lodash');
var validation = require(`${PROJECT_DIR}/utility/validation`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
const uuidv4 = require('uuid/v4');



module.exports = {
    processVisits,
    getAllSellersId,
    getRetailerOrder,
    getDealerOrder,
    mapOrdersWithSellers,
    planVisitProcessRecords,
    getVisitsByPGID,
    removeDupplciate,
    mapOrders
};

/**
 * Fill retailerIds and dealerIds array using given visits
 * @param {*} visits 
 */
async function getAllSellersId(visits) {
    retailerIds = [];
    dealerIds = [];
    visits.forEach(element => {

        if (element.type1__c == 'Retailer') {
            retailerIds.push(element.retailer_dealer__c)
        } else {
            dealerIds.push(element.retailer_dealer__c)
        }
    });

    return { "retailer": retailerIds, "dealer": dealerIds };
}

function removeDupplciate(visits){
    return new Promise((resolve, reject)=> {
        let unique = _.uniqBy(visits, function (visit) {
            return visit.sfid;
        });
        if(unique.length > 0) {
            resolve(unique);
        }
    })
}

function mapOrders (visits, orders){
    return new Promise((resolve, reject)=> {
        let response = [];
            for(let i = 0; i < visits.length; i++){
                let filled = false;
                if(orders.length> 0){
                    for(let j = 0; j < orders.length; j++) {
                        if( filled == false){
                            if (visits[i].type1__c == 'Retailer') {
                                if (orders[j].retailer__c != undefined && orders[j].retailer__c == visits[i].retailer_dealer__c) {
                                    response.push({ "visit": visits[i], "order": orders[j] });
                                    filled = true;
                                    // orders.splice(j, 1)
                                } else if(orders.length == j + 1){
                                    filled = true;
                                    response.push({ "visit": visits[i], "order": {} })
                                }
                            } else if(visits[i].type1__c == 'Dealer') {
                                if (orders[j].dealer__c != undefined && orders[j].dealer__c == visits[i].retailer_dealer__c) {
                                    response.push({ "visit": visits[i], "order": orders[j] });
                                    filled = true;
                                    // orders.splice(j, 1)
                                } else if(orders.length == j + 1){
                                    filled = true;
                                    response.push({ "visit": visits[i], "order": {} })
                                }
                            }
                        }
                    }
                }else {
                    response.push({ "visit": visits[i], "order": {} });
                }
            }
        resolve(response);
    })
}


/**
 * This method is used to map orders with visit accoring account lookup (retailers / Dealers).
 * @param {*} visits 
 * @param {*} retailerOrders 
 * @param {*} dealerOrders 
 */

async function mapOrdersWithSellers(visits, retailerOrders, dealerOrders) {

    var orders = [];
    if (retailerOrders.rows.length > 0 && dealerOrders.rows.length > 0) {
        orders = retailerOrders.rows.concat(dealerOrders.rows);
    } else if (retailerOrders.rows.length > 0) {
        orders = retailerOrders.rows;
    } else if (dealerOrders.rows.length > 0) {
        orders = dealerOrders.rows;
    }
    let uniqueVisits = await removeDupplciate(visits);
    let responseData = await mapOrders(uniqueVisits, orders);

    return responseData;
}

async function mapOrdersWithSellers_OLD(visits, retailerOrders, dealerOrders) {

    var orders = [];
    if (retailerOrders.rows.length > 0 && dealerOrders.rows.length > 0) {
        orders = retailerOrders.rows.concat(dealerOrders.rows);
    } else if (retailerOrders.rows.length > 0) {
        orders = retailerOrders.rows;
    } else if (dealerOrders.rows.length > 0) {
        orders = dealerOrders.rows;
    }
    console.log('=======================================')
    console.log('visits.length ====>>>>  ',visits.length)
    console.log('=======================================')
    responseData = [];
    visits.forEach(visit => {

        if (orders.length > 0) {
            var i = 0
            var isFilled = false;
            orders.forEach(async order => {

                var dup = _.find(responseData, function (o) {
                    return (o.visit.sfid == visit.sfid) ? true : false;
                });
                if (dup == undefined) {
                    if (visit.type1__c == 'Retailer') {

                        if (order.retailer__c != undefined && order.retailer__c == visit.retailer_dealer__c) {
                            responseData.push({ "visit": visit, "order": order });
                            isFilled = true;
                            delete ordersObj.rows[i];
                        } else if (ordersObj.rows.length == i + 1 && isFilled == false) {
                            responseData.push({ "visit": visit, "order": {} })
                        }
                    } else {

                        if (order.dealer__c != undefined && order.dealer__c == visit.retailer_dealer__c) {
                            responseData.push({ "visit": visit, "order": order });
                            isFilled = true;
                            delete ordersObj.rows[i];
                        } else if (ordersObj.rows.length == i + 1 && isFilled == false) {
                            responseData.push({ "visit": visit, "order": {} })
                        }
                    }
                }
                i++;
            })
        } else {
            responseData.push({ "seller": visit, "order": {} })
        }
    })
    return responseData;
}


/**
 * Get Retailer latest orders using account id
 * @param {*} sellerdetails array of account sfid
 */
async function getRetailerOrder(sellerdetails) {

    if (sellerdetails.retailer.length > 0) {
        retailer_ids = sellerdetails.retailer.join("','")
        sql = `SELECT DISTINCT on (retailer__c) retailer__c ,name,sfid,date_part('epoch'::text, Order_Date__c) * (1000)::double precision as Order_Date__c,dealer__c,order_value__c FROM ${process.env.TABLE_SCHEMA_NAME}.Order__c where retailer__c.Retailer = Retailers Sales Service  IN ('${retailer_ids}') order by retailer__c,createddate desc`;
        console.log(`Get Retailer Orders ===== > ${sql}`);
        ordersObj = await db.getDbResult(sql);
    }
    return ordersObj;
}


/**
 * Get Dealer latest orders using account id
 * @param {*} sellerdetails array of account sfid
 */
async function getDealerOrder(sellerdetails) {

    if (sellerdetails.dealer.length > 0) {
        dealer_ids = sellerdetails.dealer.join("','")
        sql = `SELECT DISTINCT on (dealer__c) dealer__c ,name,sfid,date_part('epoch'::text, Order_Date__c) * (1000)::double precision as Order_Date__c,Retailer__c,order_value__c FROM ${process.env.TABLE_SCHEMA_NAME}.Order__c where Dealer__c AND Dealer__c = Retailers_Sales_Service IN ('${dealer_ids}') order by dealer__c,createddate desc`;

        console.log(`Get Dealer Orders ===== > ${sql}`);

        ordersObj = await db.getDbResult(sql);
    }
    return ordersObj;
}


/**
 * Prepair visit response in expected format which will be consumed by mobile app. 
 * @param {*} visits 
 */
async function processVisits(visits) {
    var data = {};
    visits.forEach(element => {
        if (element.visit != undefined && element.visit.visit_date__c != undefined && data[`${element.visit.visit_date__c}`] == undefined) {
            console.log('condition 1');

            data[`${element.visit.visit_date__c}`] = [];
            data[`${element.visit.visit_date__c}`].push(element);
        } else  if (element.visit != undefined && element.visit.visit_date__c != undefined ) {
            console.log('condition 2 ---> ');
            data[`${element.visit.visit_date__c}`].push(element);
        }
    });
    
    
    return data;
}

async function planVisitProcessRecordsOLD(requestBody,myDetails,agentid){
    var fieldValues='';
    index = 0; 
    var pg_id__c;
    for (const visit of requestBody) {
        var assigned_by = null, asm = null, psm = null, isValidManager = true;

        if(visit.psm__c==undefined || visit.psm__c ==''){
            psm = visit.psm__c = agentid;
        }
        
        psmDetails = await db.agentDetail(visit.psm__c);
        
        if (myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'ASM' && validation.issetNotEmpty(visit.psm__c)) {
            asm = agentid;
            if (agentid == visit.psm__c) {
                psm = visit.psm__c;
                assigned_by = 'Self';
            } else {
                assigned_by = 'Manager';
                psm = visit.psm__c;
                psmDetails = await db.agentDetail(visit.psm__c);
                if (psmDetails.rowCount == 0 || psmDetails.rows[0].manager_id != agentid) {
                    errorMessage = 'Please select valid psm.';
                    isValidManager = false;
                }
            }

        } else if (myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'PSM') {

            assigned_by = 'Self'
            psm = agentid;
            asm = myDetails.rows[0].manager_id;
        } else {
                if(myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'ASM' && !validation.issetNotEmpty(visit.psm__c)){
                    psm = null;
                }else{
                    isValidManager = false;
                    errorMessage = 'Agent role is not defined.';
                }
                
        } 
        
        if (isValidManager) {
            
            visit.createddate = dtUtil.removeMiliSec(visit.createddate);
            visit.visit_date__c = dtUtil.removeMiliSec(visit.visit_date__c);

            var today_date = dtUtil.timestampToDate(visit.createddate, "YYYY-MM-DD HH:mm:ss");
            var visit_date__c = dtUtil.timestampToDate(visit.visit_date__c, "YYYY-MM-DD"); // HH:mm:ss

            visit_type__c = 'Planned';
            status__c = 'Open';
            if (visit_date__c == dtUtil.todayDate()) {
                visit_type__c = 'Unplanned'
            }
            
            var dateRange;
            if(validation.issetNotEmpty(visit.recurring_on) && validation.issetNotEmpty(visit.till_date)){
                dateRange = dtUtil.getDates(visit.recurring_on,visit.till_date);
            }
            
            console.log(index, ' _pg_id__c  ==>  ', pg_id__c)
            if(dateRange!=undefined && dateRange.length > 0){
                counnter = 0;
                dateRange.forEach(element => {
                    pg_id__c = uuidv4();
                    if (counnter > 0 || index > 0) {
                        fieldValues += ', ';
                    }
                    fieldValues += `('${pg_id__c}','${assigned_by}', '${psm}', '${asm}', '${visit.retailer_dealer__c}', '${status__c}', '${element}', '${today_date}','${visit_type__c})`;
                    counnter++
                })
            }else{
                pg_id__c = uuidv4();
                if (index > 0) {
                    fieldValues += ', ';
                }
                fieldValues += `('${pg_id__c}','${assigned_by}', '${psm}', '${asm}', '${visit.retailer_dealer__c}', '${status__c}', '${visit_date__c}', '${today_date}','${visit_type__c}')`;
            }

        }
        index++;
    }
    return fieldValues;

    

}


async function planVisitProcessRecords(requestBody,myDetails,agentid){
    var fieldValues='';
    index = 0; 
    var pg_id__c;
    var isValidManager = true;

    for (const visit of requestBody) {

        var assigned_by = null, asm = null, visit_owner__c = null;
        //var isValidOwner = await db.agentDetail(visit.visit_owner__c);
        var isValidOwner = await db.agentDetail(visit.psm__c);
        if(isValidOwner.rowCount > 0){
            asm = agentid;
            visit_owner__c = visit.psm__c;
            //visit_owner__c = visit.visit_owner__c;
            if(agentid==visit.psm__c)
                assigned_by = 'Self';
            else
                assigned_by = 'Manager';
        } else{

            errorMessage = 'Please select valid PSM.';
            isValidManager = false; 
        }
     
        
        if (isValidManager) {
            
            visit.createddate = dtUtil.removeMiliSec(visit.createddate);
            var form_visit_date = visit.visit_date__c;
            visit.visit_date__c = dtUtil.removeMiliSec(visit.visit_date__c);

            var today_date = dtUtil.timestampToDate(visit.createddate, "YYYY-MM-DD HH:mm:ss");
            var visit_date__c = dtUtil.timestampToDate(visit.visit_date__c, "YYYY-MM-DD"); // HH:mm:ss

            visit_type__c = 'Planned';
            status__c = 'Open';
            if (visit_date__c == dtUtil.todayDate()) {
                visit_type__c = 'Unplanned'
            }
            
            var dateRange;
            if(validation.issetNotEmpty(visit.recurring_on) && validation.issetNotEmpty(visit.till_date)){
                dateRange = dtUtil.getDates(visit.recurring_on,visit.till_date, form_visit_date);
            }
            
            console.log(index, ' _pg_id__c  ==>  ', pg_id__c)
            if(dateRange!=undefined && dateRange.length > 0){
                counnter = 0;
                dateRange.forEach(element => {
                    pg_id__c = uuidv4();
                    if (counnter > 0 || index > 0) {
                        fieldValues += ', ';
                    }
                    fieldValues += `('${pg_id__c}','${assigned_by}', '${visit_owner__c}', '${asm}', '${visit.retailer_dealer__c}', '${status__c}', '${element}', '${today_date}','${visit_type__c}')`;
                    counnter++
                })
            }else{
                pg_id__c = uuidv4();
                if (index > 0) {
                    fieldValues += ', ';
                }
                fieldValues += `('${pg_id__c}','${assigned_by}', '${visit_owner__c}', '${asm}', '${visit.retailer_dealer__c}', '${status__c}', '${visit_date__c}', '${today_date}','${visit_type__c}')`;
            }

        }
        index++;
    }
    return {fieldValues,isValidManager};

    

}


/**
 * Get recent inserted visit details using pg_id__c
 * @param {*} agentid 
 * @param {*} visits 
 */

async function getVisitsByPGID(agentid, visits){
    try{
        var visitPgId = [];
        if(visits.length > 0){
            visits.forEach(element => {
                visitPgId.push(element.pg_id__c);
            });


            const fieldsArray = [`${SF_VISIT_TABLE_NAME}.pg_id__c`,`CASE WHEN ${SF_VISIT_TABLE_NAME}.sfid is null  THEN ${SF_VISIT_TABLE_NAME}.pg_id__c ELSE ${SF_VISIT_TABLE_NAME}.sfid END `, `${SF_VISIT_TABLE_NAME}.ASM__c	`, `${SF_VISIT_TABLE_NAME}.Assigned_by__c`, `${SF_VISIT_TABLE_NAME}.Cancelled_Reason__c`, `${SF_VISIT_TABLE_NAME}.Checkin_Location__Latitude__s`, `${SF_VISIT_TABLE_NAME}.Checkin_Location__Longitude__s`, `${SF_VISIT_TABLE_NAME}.Checkin_Time__c`, `date_part('epoch'::text, ${SF_VISIT_TABLE_NAME}.createddate) * (1000)::double precision as createddate`, `${SF_VISIT_TABLE_NAME}.Location_Matched__c`, `${SF_VISIT_TABLE_NAME}.Name`, `${SF_VISIT_TABLE_NAME}.Next_Scheduled_Date__c`, `${SF_VISIT_TABLE_NAME}.PSM__c`, `${SF_VISIT_TABLE_NAME}.Picture__c`, `${SF_VISIT_TABLE_NAME}.Pricing_and_Scheme_Info__c`, `${SF_VISIT_TABLE_NAME}.Retailer_Dealer_Location__Latitude__s`, `${SF_VISIT_TABLE_NAME}.Retailer_Dealer_Location__Longitude__s`, `${SF_VISIT_TABLE_NAME}.Retailer_Dealer__c`, `${SF_VISIT_TABLE_NAME}.Send_Marketing_Material__c`, `${SF_VISIT_TABLE_NAME}.Sequence_No__c`, `${SF_VISIT_TABLE_NAME}.Status__c`, `${SF_VISIT_TABLE_NAME}.Summary__c`, `${SF_VISIT_TABLE_NAME}.Top_Visible_Brand__c`, `${SF_VISIT_TABLE_NAME}.Visibility_Level__c`, `date_part('epoch'::text, ${SF_VISIT_TABLE_NAME}.visit_date__c) * (1000)::double precision as visit_date__c`, 
                `${SF_VISIT_TABLE_NAME}.Visit_Day__c`,
                `account.area__c`,
                `account.mobile__c`,
                `account.name as seller_name`,
                `account.type1__c`,
                `account.category__c`,
                `account.retailer_category__c`,
                `Area_SS__c.name as area_name`,
                `Area_SS__c.city__c`,
                `City_SS__c.name as city_name`,
                `Area_SS__c.State__c`
            ];
    
                const tableName = SF_VISIT_TABLE_NAME;
    
                const WhereClouse = [];
                
                myDetails = await db.agentDetail(agentid);
    
                if (myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'ASM') {
                    WhereClouse.push({ "fieldName": `${SF_VISIT_TABLE_NAME}.ASM__c`, "fieldValue": agentid })
                } else if (myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'PSM') {
                    WhereClouse.push({ "fieldName": `${SF_VISIT_TABLE_NAME}.PSM__c`, "fieldValue": agentid })
                }
    
                if (visitPgId!=undefined && visitPgId.length > 0) {
                    
                    WhereClouse.push({ "fieldName": `${SF_VISIT_TABLE_NAME}.pg_id__c`, "fieldValue": visitPgId ,"type":"IN" });
                }
                
                 
                joins = [
                    {
                        "type": "LEFT",
                        "table_name": "account",
                        "p_table_field": `${SF_VISIT_TABLE_NAME}.retailer_dealer__c`,
                        "s_table_field": "account.sfid"
                    },
                    {
                        "type": "LEFT",
                        "table_name": "Area_SS__c",
                        "p_table_field": `account.area__c`,
                        "s_table_field": "Area_SS__c.sfid"
                    },
                    {
                        "type": "LEFT",
                        "table_name": "City_SS__c",
                        "p_table_field": `Area_SS__c.city__c`,
                        "s_table_field": "City_SS__c.sfid"
                    }
                ];
                orderBy = ` order by visit_date__c asc`;
                offset = '0' ;
                limit = '1000';
                var sql = db.fetchAllWithJoinQry(fieldsArray, tableName, joins, WhereClouse, offset, limit, orderBy);
    
                console.log(`INFO::: All added Visits =======   ${sql}`);
                var meetings = await client.query(sql);
    
                if (meetings.rowCount != undefined && meetings.rowCount > 0) {
                    // Get all seller ids
                    var sellerdetails = await getAllSellersId(meetings.rows);
    
                    var retailerOrders = await getRetailerOrder(sellerdetails);
                    var dealerOrders = await getDealerOrder(sellerdetails);
                    var visitsWithLastOrder = await mapOrdersWithSellers(meetings.rows,retailerOrders,dealerOrders);
    
                    var reaponseData = await processVisits(visitsWithLastOrder); 
                    return reaponseData;
           } else {
                    return [];
                }
            }
            
        }catch(e){
            console.log(e);
            return [];
            
    }

}

