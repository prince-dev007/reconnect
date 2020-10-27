var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
//var component = require(`${PROJECT_DIR}/controllers/dealer-order-line-items/dealer-order-line-item.component`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);


module.exports = {
    getAll,
    detail
    // placeOrder
};
momenttz = require('moment-timezone');
/**
 * This method is used to get all orederLineItems using follwing parameters
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */
var fields = [`sfid`,`name`,`item__c`,`nrv__c`,`order_header__c as order_number__c`,`orderedquantity__c`,`remaining_quantity__c`,`date_part('epoch'::text, required_date__c) * (1000)::double precision as required_date__c`,`date_part('epoch'::text, ship_date__c) * (1000)::double precision as ship_date__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`];
async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.orderid) : false;
       
        if (is_Validate) {


         
            const tableName = 'Dealer_Order_Line__c';

            const WhereClouse = [];
            var offset = '0', limit = '1000';
            if (validation.issetNotEmpty(req.query.sellerid)) {
                    WhereClouse.push({ "fieldName": "order_number__c", "fieldValue": req.query.orderid });
            }

            
            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }

            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,' order by createddate desc');
            console.log(`INFO::: Get Dealer orederLineItems = ${sql}`);

            var orederLineItems = await client.query(sql);

            if (orederLineItems.rowCount != undefined && orederLineItems.rowCount > 0) {
                response.response = { 'success': true, "data": { "dealer-orederLineItems": orederLineItems.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "dealer-orederLineItems": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "dealer-orederLineItems": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "dealer-orederLineItems": [] }, "message": "Internal server error." };
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

            console.log(`INFO:: Get all orederLineItems ====>  ${sql}`);
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

