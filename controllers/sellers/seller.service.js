var _ = require('lodash');
var validator = require('validator');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
var component = require(`${PROJECT_DIR}/controllers/sellers/seller.component`);
const uuidv4 = require('uuid/v4');
var dashboard = require(`${PROJECT_DIR}/controllers/dashboard/dashboard.service`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);


module.exports = {
    getAll,
    searchByLocation,
    detail,
    search,
    add,
    updateSellerInfo,
    updateLocation
};


async function getDbResult(sql) {
    return await client.query(sql)
        .then(data => {
            console.log('INFO::: Fetch DB result');
            return data;
        })
        .catch(err => {
            console.log(err);
            return [];
        });
}
async function getAll(req) {
    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.offset) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.limit) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.type) : false;


        if (is_Validate) {

            // Check is valid ASM/PSM
            teamDetail = await db.getAsmHirarchy(req.headers.agentid);

            if (teamDetail.success) {
                console.log('INFO ::: Team Hirarchy =  ', teamDetail);

                // Account Object has only ASM field so no need to check PSM here 
                // If PSM Login then find Manager of logged in user.
                // Find Retailer(Account) where asm = manager id

                ASM_ID = '';
                PSM_ID = '';
                var accountWhereClouse = [];
                if (teamDetail.memberType == 'PSM') {
                    accountWhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.headers.agentid })
                } else {
                    accountWhereClouse.push({ "fieldName": "asm__c", "fieldValue": teamDetail.ASM, "type": "IN" })
                }


                offset = '0',
                    limit = '1000';
                accountWhereClouse.push({ "fieldName": "sfid", "fieldValue": "", "type": "NOTNULL" })
                accountWhereClouse.push({ "fieldName": "type1__c", "fieldValue": req.query.type })
                if (validation.issetNotEmpty(req.query.search)) {
                    accountWhereClouse.push({ "fieldName": "name", "fieldValue": req.query.search, "type": "LIKE" })
                }
                if (validation.issetNotEmpty(req.query.area_id)) {
                    accountWhereClouse.push({ "fieldName": "area__c", "fieldValue": req.query.area_id });
                }
                


                if (req.query.type == 'Retailer') {
                    fields = SF_RETAILER_FIELD;
                } else {
                    fields = SF_DEALERS_FIELD;
                }

                if (validation.issetNotEmpty(req.query.offset)) {
                    offset = req.query.offset;
                }
                if (validation.issetNotEmpty(req.query.limit)) {
                    limit = req.query.limit;
                }

                tableName = 'account';
                getNearByAccounts = db.SelectAllQry(fields, tableName, accountWhereClouse, offset, limit);

                console.log(`INFO::: Get All Accounts  =  ${getNearByAccounts}`);

                var accountObject = await getDbResult(getNearByAccounts);
                if (accountObject.rowCount != undefined && accountObject.rowCount > 0) {

                    var account_ids = [];
                    var responseData = [];
                    accountObject.rows.forEach(async data => {
                        account_ids.push(data.sfid);
                    })
                    if (account_ids.length > 0) {

                        account_ids = account_ids.join("','");
                        if (req.query.type == 'Retailer') {
                            accountOrderSql = `SELECT DISTINCT on (retailer__c) retailer__c ,name,sfid,date_part('epoch'::text, Order_Date__c) * (1000)::double precision as Order_Date__c,dealer__c,Total_Product_SKU__c,order_value__c FROM ${process.env.TABLE_SCHEMA_NAME}.Order__c where retailer__c IN ('${account_ids}') order by retailer__c,createddate desc`;
                        } else {
                            accountOrderSql = `SELECT DISTINCT on (dealer__c) dealer__c ,name,sfid,date_part('epoch'::text, Order_Date__c) * (1000)::double precision as Order_Date__c,Retailer__c,Total_Product_SKU__c,order_value__c FROM ${process.env.TABLE_SCHEMA_NAME}.Order__c where Dealer__c IN ('${account_ids}') order by dealer__c,createddate desc`;
                        }

                        console.log(`INFO::::::::: GET account order  === ${accountOrderSql}`);
                        orderObject = await getDbResult(accountOrderSql);

                        var processedData = await component.processRetailersOrders(accountObject.rows, orderObject.rows, req.query.type);
                        let responseData = await component.sortSeller(processedData);
                        if (responseData.length > 0) {
                            response.status = 200;
                            response.response = { "success": true, "data": responseData, "message": "" };
                            return response;

                        } else {
                            response.status = 400;
                            response.response = { "success": false, "data": {}, "message": "Retailers not found." };
                            return response;

                        }

                    } else {
                        response.status = 400;
                        response.response = { "success": false, "data": {}, "message": "Retailers not found." };
                        return response;
                    }

                } else {
                    response.status = 400;
                    response.response = { "success": false, "data": {}, "message": "Retailers not found." };
                    return response;
                }



            } else {
                response.status = 400;
                response.response = { "success": false, "data": {}, "message": "Login user not found." };
                return response;
            }
        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing." };
            return response;
        }
    } catch (e) {
        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Mandatory parameter(s) are missing." };
        return response;
    }
}




async function searchByLocation(req) {
    try {
        is_Validate = true;
       
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.lat) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.long) : false;
        
        if (is_Validate) {
            var teamDetail = await db.getAsmHirarchy(req.headers.agentid);


            if (teamDetail.success) {

                // Account Object has only ASM field so no need to check PSM here 
                // If PSM Login then find Manager of logged in user.
                // Find Retailer(Account) where asm = manager id

                ASM_ID = '';

                // TO find My/My Team areas 

                var subQuery = SF_RETAILER_TABLE_NAME,
                    accountWhereClouse = [],
                    offset = '0',
                    limit = '1000';
                if (teamDetail.memberType == 'PSM') {
                    accountWhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.headers.agentid })
                } else {
                    accountWhereClouse.push({ "fieldName": "asm__c", "fieldValue": teamDetail.ASM, "type": "IN" })
                }


                accountWhereClouse.push({ "fieldName": "type1__c", "fieldValue": 'Retailer' })
                accountWhereClouse.push({ "fieldName": "distance", "fieldValue": process.env.LOCATION_DISTANCE_FILTER, "type": "LTE" })

                req.query.type = 'Retailer';
                if (req.query.type == 'Retailer') {
                    fields = SF_RETAILER_FIELD;
                } else {
                    fields = SF_DEALERS_FIELD;
                }

                if (validation.issetNotEmpty(req.query.offset)) {
                    offset = req.query.offset;
                }
                if (validation.issetNotEmpty(req.query.limit)) {
                    limit = req.query.limit;
                }
                subQuery = `(SELECT *, 
                            calculate_distance(${req.query.lat}, ${req.query.long}, location__latitude__s, location__longitude__s, 'K')*1000 AS distance 
                        FROM 
                            ${process.env.TABLE_SCHEMA_NAME}.account) AS account`;

                var orderBy = ` order by distance asc`;
                getNearByAccounts = db.SelectWithSubAllQry(fields, subQuery, accountWhereClouse, offset, limit, orderBy);

                console.log(`INFO::: Get getNearByAccounts  =  ${getNearByAccounts}`);

                var accountObject = await getDbResult(getNearByAccounts);
                if (accountObject.rowCount != undefined && accountObject.rowCount > 0) {

                    var account_ids = [];
                    var responseData = [];
                    accountObject.rows.forEach(async data => {
                        account_ids.push(data.sfid);
                    })
                    if (account_ids.length > 0) {

                        account_ids = account_ids.join("','");
                        if (req.query.type == 'Retailer') {
                            accountOrderSql = `SELECT DISTINCT on (retailer__c) retailer__c ,name,sfid,date_part('epoch'::text, Order_Date__c) * (1000)::double precision as Order_Date__c,dealer__c,Total_Product_SKU__c FROM ${process.env.TABLE_SCHEMA_NAME}.Order__c where retailer__c IN ('${account_ids}') order by retailer__c,createddate desc`;
                        } else {
                            accountOrderSql = `SELECT DISTINCT on (dealer__c) dealer__c ,name,sfid,date_part('epoch'::text, Order_Date__c) * (1000)::double precision as Order_Date__c,Retailer__c,Total_Product_SKU__c FROM ${process.env.TABLE_SCHEMA_NAME}.Order__c where Dealer__c IN ('${account_ids}') order by dealer__c,createddate desc`;
                        }

                        console.log(`INFO::::::::: GET account order  === ${accountOrderSql}`);
                        orderObject = await getDbResult(accountOrderSql);

                        var responseData = await component.processRetailersOrders(accountObject.rows, orderObject.rows, req.query.type);
                        if (responseData.length > 0) {
                            response.status = 200;
                            response.response = { "success": true, "data": responseData, "message": "" };
                            return response;

                        } else {
                            response.status = 400;
                            response.response = { "success": false, "data": {}, "message": "Retailers not found." };
                            return response;

                        }

                    } else {
                        response.status = 400;
                        response.response = { "success": false, "data": {}, "message": "Retailers not found." };
                        return response;
                    }

                } else {
                    response.status = 400;
                    response.response = { "success": false, "data": {}, "message": "Retailers not found." };
                    return response;
                }



            }
            else {
                response.status = 400;
                response.response = { "success": false, "data": {}, "message": "Login user not found." };
                return response;
            }
        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing." };
            return response;
        }
    } catch (e) {
        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Mandatory parameter(s) are missing." };
        return response;
    }
}




async function detail(sellerId) {
    try {
        if (!_.isEmpty(productId)) {

            let sql = `SELECT * FROM public.sellers where id='${sellerId}' limit 1`;
            var sDetail = await client.query(sql);

            if (sDetail.rowCount != undefined && sDetail.rowCount > 0) {
                return sDetail.rows[0];
            }
        }
    } catch (e) {
        return {};
    }
}


async function search(search) {
    try {
        if (!_.isEmpty(productId)) {

            let sql = `SELECT * FROM public.sellers where address LIKE '%${search}%'`;
            var sDetail = await client.query(sql);

            if (sDetail.rowCount != undefined && sDetail.rowCount > 0) {
                return sDetail.rows[0];
            }
        }
    } catch (e) {
        return {};
    }
}

async function insertRecord(fieldsToBeInsert, fieldValues, tableName){
    sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${fieldsToBeInsert}) VALUES(`;
    if(fieldValues.length > 0){
        var counter = 1;
        fieldValues.forEach(element => {
            if(counter > 1){ sql += `,`; }
            sql += `$${counter}`;
            counter++
        })
    }
    sql += `) RETURNING pg_id__c`;
    console.log('ADD Retailer sql >>> ', sql)
    return await client.query(sql,fieldValues)
        .then(data => { console.log(' data  >>>>> ',data)
            if(data.rowCount > 0){
                return { "success": true, "message": "", "data": data.rows };

            }else{
                return { "success": false, "message": "Error while create record. Please try again.", "data": {} };
            }
        }).catch(err => {
            console.log('Error::: Catch 162 >>>> ', err);
            return { "success": false, "message": "Error while insert", "data": {} };
        });

}


async function add(req) {
    try {
        if (!_.isEmpty(req.body)) {
            // Insert new Delear
           
            is_Validate = true;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.body.name) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.body.mobile_contact__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.body.billingstreet) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.body.billingcity) : false
            var current_date_time = moment().format("YYYY-MM-DD HH:mm:ss");
            if(is_Validate){

                var competitor__c = null, owner_name__c = null, owner_phone__c = null, gstin__c = null, billingcity = null,  billingstreet = null,  billingpostalcode = null,  billingcountry = null, billingstate = null ,
                name = null,   type1__c = 'Retailer', email__c=null, mobile_contact__c=null, potential_value__c=null, potential_retailer__c=null, dealer__c=null,category__c=null,retailer_category__c=null,area__c=null,asm_id=null;
                var psm_id = null;
                var asm_id = null;
                myDetails = await db.agentDetail(req.headers.agentid);
                
                if(myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'ASM'){
                    
                    asm_id = req.headers.agentid;
                }else if(myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'PSM') {
                    psm_id = req.headers.agentid;
                    asm_id = myDetails.rows[0].manager_id;
                } 

                if(req.body.email__c!=undefined){
                    email__c =  req.body.email__c;
                }
                if(req.body.mobile_contact__c!=undefined){
                    mobile_contact__c =  req.body.mobile_contact__c;
                }
                if(req.body.potential_value__c!=undefined){
                    potential_value__c =  req.body.potential_value__c;
                }
                if(req.body.potential_retailer__c!=undefined){
                    potential_retailer__c =  req.body.potential_retailer__c;
                }
                if(req.body.dealer__c!=undefined){
                    dealer__c =  req.body.dealer__c;
                }
                if(req.body.category__c!=undefined){
                    category__c =  req.body.category__c;
                }
                if(req.body.retailer_category__c!=undefined){
                    retailer_category__c =  req.body.retailer_category__c;
                }

                if(req.body.competitor__c!=undefined){
                    competitor__c =  req.body.competitor__c;
                }
                if(req.body.owner_name__c!=undefined){
                    owner_name__c =  req.body.owner_name__c;
                }
                if(req.body.owner_phone__c!=undefined){
                    owner_phone__c =  req.body.owner_phone__c;
                }
                if(req.body.gstin__c!=undefined){
                    gstin__c =  req.body.gstin__c;
                }
                if(req.body.billingcity!=undefined){
                    billingcity =  req.body.billingcity;
                }
                if(req.body.billingstreet!=undefined){
                    billingstreet =  req.body.billingstreet;
                }
                if(req.body.billingpostalcode!=undefined){
                    billingpostalcode =  req.body.billingpostalcode;
                }
                if(req.body.billingcountry!=undefined){
                    billingcountry =  req.body.billingcountry;
                }
                if(req.body.billingstate!=undefined){
                    billingstate =  req.body.billingstate;
                }
                
                if(req.body.area__c!=undefined && req.body.area__c!=""){
                    area__c =  req.body.area__c;
                }
                        
            

                fieldsToBeInsert = ' asm__c, name,   type1__c, email__c, mobile_contact__c, potential_value__c, potential_retailer__c, dealer__c,category__c,retailer_category__c,createddate,competitor__c,owner_name__c,owner_phone__c,gstin__c,billingcity,billingstreet,billingpostalcode,billingcountry,billingstate,area__c,psm__c';
                pg_id__c = uuidv4();
                fieldValues = [ asm_id, req.body.name, 'Retailer', email__c, mobile_contact__c, potential_value__c, potential_retailer__c, dealer__c, category__c, retailer_category__c, current_date_time, competitor__c, owner_name__c, owner_phone__c, gstin__c, billingcity, billingstreet, billingpostalcode, billingcountry, billingstate,area__c,psm_id];
                
                tableName = 'Account';

                accountDetail = await insertRecord(fieldsToBeInsert, fieldValues, tableName);
                if(accountDetail.success){

                    response.status = 200;
                    response.response = { "success": true, "message": "Record created successfully.", "data": accountDetail.data };

                    // UPDATE TARGET AND ACHIEVEMENT
                    dashboard.updateMonthlyTarget(req.headers.agentid,'seller',dtUtil.currentMonth(),{'new_counters__c':'new_counters__c+1'});

                }else{
                    response.status = 400;
                    response.response = { "success": false, "message": "Error while create record. Please try again.", "data": {} };
                }
                return response;
            }else{
                response.status = 400;
                response.response = { "success": false, "message": "Mandatory parameter(s) are missing.", "data": {} };
                return response;     
            }
        }
    } catch (e) {
        console.log(`EROR::: `,e)
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error.", "data": {} };
        return response;

    }
}



async function updateRecord(tableName, fieldValue, WhereClouse){
    try {

        //sql = `update ${process.env.TABLE_SCHEMA_NAME}.${tableName} set End_Day__c='true', End_Time__c='${attendance_time}' where Team__c='${agentid}' and Attendance_Date__c='${attendance_date}'`;
        
         var sql = `update ${process.env.TABLE_SCHEMA_NAME}.${tableName} set`;


        counter = 1;
        fieldValue.forEach(element => {
            if(counter > 1)
                sql+=`,`;
            sql +=` ${element.field}='${element.value}'`;
            counter++;
        });

        sql +=` where `;


        counter = 1;
        WhereClouse.forEach(element => {
            if(counter > 1)
                sql+=` and `;
            sql +=` ${element.field}='${element.value}'`;
            counter++;
        });

        console.log(`INFO::::: ${sql}`);

        return await client.query(sql)
            .then(data => {
                if(data.rowCount > 0){
                    return { "success": true, "message": "Record updated successfully.","data":data };
                }else{
                    return { "success": false, "message": "Record updated failed.","data":{} };
                }
            }).catch(err => {
                console.log('ERROR:::: err 137 >>>> ', err);
                return { "success": false, "message": "Error while update record." };
            });
    } catch (e) {
        return { "success": false, "message": "Error while update record." };
    }
  
}

async function updateSellerInfo(req) {
    try {
        if (!_.isEmpty(req.body)) {
            // Insert new Delear
            
            is_Validate = true;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.body.seller_id) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.body.name) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.body.mobile_contact__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.body.billingstreet) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.body.billingcity) : false;
           

            if(is_Validate){

                var tableName = `account`;
                var fieldValue = [];
                var WhereClouse = [];
                
                fieldValue.push({ "field": "name", "value": req.body.name });
                fieldValue.push({ "field": "mobile_contact__c", "value": req.body.mobile_contact__c });
                
                if(validation.isset(req.body.potential_value__c))
                    fieldValue.push({ "field": "potential_value__c", "value": req.body.potential_value__c });
                
                if(validation.isset(req.body.category__c))
                    fieldValue.push({ "field": "category__c", "value": req.body.category__c });
                
                if(validation.isset(req.body.dealer__c))
                    fieldValue.push({ "field": "dealer__c", "value": req.body.dealer__c });

                if(validation.isset(req.body.email))
                    fieldValue.push({ "field": "email__c", "value": req.body.email__c });
                
                if(validation.isset(req.body.potential_retailer))
                    fieldValue.push({ "field": "potential_retailer__c", "value": req.body.potential_retailer__c });
                
                if(validation.isset(req.body.retailer_category))
                    fieldValue.push({ "field": "retailer_category__c", "value": req.body.retailer_category__c });
                
                if(validation.isset(req.body.competitor__c))
                    fieldValue.push({ "field": "competitor__c", "value": req.body.competitor__c });
                
                if(validation.isset(req.body.owner_name__c))
                    fieldValue.push({ "field": "owner_name__c", "value": req.body.owner_name__c });
                
                if(validation.isset(req.body.owner_phone__c))
                    fieldValue.push({ "field": "owner_phone__c", "value": req.body.owner_phone__c });
                
                if(validation.isset(req.body.gstin__c))
                    fieldValue.push({ "field": "gstin__c", "value": req.body.gstin__c });
                

                // Billing Fields
                if(validation.isset(req.body.billingcity))
                    fieldValue.push({ "field": "billingcity", "value": req.body.billingcity });
                
                if(validation.isset(req.body.billingstreet))
                    fieldValue.push({ "field": "billingstreet", "value": req.body.billingstreet });
                
                if(validation.isset(req.body.billingstate))
                    fieldValue.push({ "field": "billingstate", "value": req.body.billingstate });
                
                if(validation.isset(req.body.billingcountry))
                    fieldValue.push({ "field": "billingcountry", "value": req.body.billingcountry });
                
                if(validation.isset(req.body.billingpostalcode))
                    fieldValue.push({ "field": "billingpostalcode", "value": req.body.billingpostalcode });
                
                
                if(validation.issetNotEmpty(req.body.area__c))
                    fieldValue.push({ "field": "area__c", "value": req.body.area__c });
                


                WhereClouse.push({ "field": "sfid", "value": req.body.seller_id });


                accountDetail = await updateRecord(tableName, fieldValue, WhereClouse);

                if(accountDetail.success && accountDetail.data!=undefined && accountDetail.data.rowCount > 0){
                    response.status = 200;
                }else{
                    response.status = 400;
                }
                if(accountDetail.data!=undefined){
                    delete accountDetail.data;
                }
                response.response = accountDetail;
                return response;


            }else{
                response.status = 400;
                response.response = { "success": false, "message": "Mandatory parameter(s) are missing.", "data": {} };
                return response;  
            }

        }
    } catch (e) {
        console.log(`EROR::: `,e)
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error.", "data": {} };
        return response;

    }
}

async function updateLocation(req) {
    try {
        if (!_.isEmpty(req.body)) {
            // Insert new Delear
            
            is_Validate = true;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.body.seller_id) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.body.lat) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.body.long) : false;
            
            if(is_Validate){

                var tableName = `account`;
                var fieldValue = [];
                var WhereClouse = [];

                fieldValue.push({ "field": "Location__Latitude__s", "value": req.body.lat });
                fieldValue.push({ "field": "Location__Longitude__s", "value": req.body.long });
                
                WhereClouse.push({ "field": "sfid", "value": req.body.seller_id });


                accountDetail = await updateRecord(tableName, fieldValue, WhereClouse);

                if(accountDetail.success && accountDetail.data!=undefined && accountDetail.data.rowCount > 0){
                    response.status = 200;
                }else{
                    response.status = 400;
                }
                if(accountDetail.data!=undefined){
                    delete accountDetail.data;
                }
                response.response = accountDetail;
                return response;


            }else{
                response.status = 400;
                response.response = { "success": false, "message": "Mandatory parameter(s) are missing.", "data": {} };
                return response;  
            }

        }
    } catch (e) {
        console.log(`EROR::: `,e)
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error.", "data": {} };
        return response;

    }
}
