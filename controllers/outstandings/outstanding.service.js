var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
//var component = require(`${PROJECT_DIR}/controllers/outstandings/outstanding.component`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);


module.exports = {
    getAll,
    detail
};
momenttz = require('moment-timezone');
/**
 * This method is used to get all outstandings using follwing parameters
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */
var fields = [`sfid`,`dealer__c`,`date_part('epoch'::text, due_date__c) * (1000)::double precision as due_date__c`,`invoice_amount__c`,`date_part('epoch'::text, invoice_date__c) * (1000)::double precision as invoice_date__c`,`invoice_no__c`,`name`,`pending_c_form__c`,`remaining_amount__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`];
async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.sellerid) : false;
       
        if (is_Validate) {


         
            const tableName = 'Outstanding__c';

            const WhereClouse = [];
            var offset = '0', limit = '1000';
            if (validation.issetNotEmpty(req.query.sellerid)) {
                    WhereClouse.push({ "fieldName": "dealer__c", "fieldValue": req.query.sellerid });
            }

           
            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }

            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,' order by createddate desc');
            console.log(`INFO::: Get Dealer outstandings = ${sql}`);

            var outstandings = await client.query(sql);

            if (outstandings.rowCount != undefined && outstandings.rowCount > 0) {
                response.response = { 'success': true, "data": { "outstandings": outstandings.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "outstandings": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "outstandings": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "outstandings": [] }, "message": "Internal server error." };
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
            sql += ` FROM ${process.env.TABLE_SCHEMA_NAME}.Outstanding__c where sfid='${req.query.id}' and isdeleted='false'`;
            sql += ` limit 1`;

            console.log(`INFO:: Get all outstandings ====>  ${sql}`);
            return await client.query(sql)
                .then(data => {
                    if (data.rowCount != undefined && data.rowCount > 0) {
                        response.response = { 'success': true, "data": { "outstanding": data.rows[0] }, "message": "" };
                        response.status = 200;
                        return response;
                    } else {
                        response.response = { 'success': false, "data": { "outstanding": {} }, "message": "No record found." };
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

