var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
//var component = require(`${PROJECT_DIR}/controllers/dealer-orders/dealer-order.component`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);


module.exports = {
    getAll,
    detail
    // placeOrder
};
momenttz = require('moment-timezone');
/**
 * This method is used to get all orders using follwing parameters
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */
var fields = [`sfid`,`business__c`,`distributor__c`,`date_part('epoch'::text, order_date__c) * (1000)::double precision as order_date__c`,`name`,`order_value__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`];
async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
       
        if (is_Validate) {
            const tableName = 'Dealer_Order__c';
            const WhereClouse = [];
            var offset = '0', limit = '1000';
            if (validation.issetNotEmpty(req.query.sellerid)) {
                    WhereClouse.push({ "fieldName": "distributor__c", "fieldValue": req.query.sellerid,"fieldName":"distributor__r.recordTypedeveloperName","fieldValue":"ASC"});
            }
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // Agent and order bussniss should be same
            if (agentInfo.rowCount > 0 && agentInfo.rows[0]['business'] != undefined) {
                WhereClouse.push({ "fieldName": "business__c", "fieldValue": agentInfo.rows[0]['business'] });
            }
            
            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }

            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,' order by createddate desc');
            console.log(`INFO::: Get Dealer ORDERS = ${sql}`);

            var orders = await client.query(sql);

            if (orders.rowCount != undefined && orders.rowCount > 0) {
                response.response = { 'success': true, "data": { "dealer-orders": orders.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "dealer-orders": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "dealer-orders": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "dealer-orders": [] }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}

/**
 * This method is used to get order details using follwing parameters
 * @param {*} id - order_is
 * 
*  */
async function detail(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;

        if (is_Validate) {
            // construct SQL query
            let sql = `SELECT `;
            sql += fields.join(',');
            sql += ` FROM ${process.env.TABLE_SCHEMA_NAME}.Dealer_Order__c where sfid='${req.query.id}' and isdeleted='false'`;
            sql += ` limit 1`;

            console.log(`INFO:: Get all Orders ====>  ${sql}`);
            return await client.query(sql)
                .then(data => {
                    if (data.rowCount != undefined && data.rowCount > 0) {
                        response.response = { 'success': true, "data": { "dealer-order": data.rows[0] }, "message": "" };
                        response.status = 200;
                        return response;
                    } else {
                        response.response = { 'success': false, "data": { "dealer-order": {} }, "message": "No record found." };
                        response.status = 400;
                        return response;
                    }
                }).catch(err => {
                    console.log(err);
                    response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
                    response.status = 500;
                    return response;
                });


        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }
}

