var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
var component = require(`${PROJECT_DIR}/controllers/events/event.component`);


module.exports = {
    getAll,
    detail,
    add,
    edit
};

var EVENT_FIELD = [`name`, `sfid`, `pg_id__c`, `type__c`,
    `date_part('epoch'::text, event_date__c) * (1000)::double precision as event_date__c`,
    `area__c`, `actual_expense__c`, `ASM__c`, `Budget__c`, `Expected_Participation__c`, `Status__c`, `Target_Audience__c`, `Venue_Details__c`, `date_part('epoch'::text, createddate) * (1000)::double precision as createddate`];
var EVENT_TABLE_NAME = `events__c`;
momenttz = require('moment-timezone');
/**
 * This method is used to get all orders using follwing parameters
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */
async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;

        if (is_Validate) {

            const fields = EVENT_FIELD.join(', ');
            const tableName = EVENT_TABLE_NAME;

            const WhereClouse = [];
            var offset = '0', limit = '1000';

            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }
            if (validation.issetNotEmpty(req.headers.agentid)) {
                WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
            }
            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit, ' order by createddate desc');
            console.log(`INFO::: Get all Events = ${sql}`);

            var events = await client.query(sql);

            if (events.rowCount != undefined && events.rowCount > 0) {
                response.response = { 'success': true, "data": { "events": events.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "events": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "events": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "events": [] }, "message": "Internal server error." };
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
            var fields = EVENT_FIELD.join(', ');
            sql += ` ${fields} `;
            sql += ` FROM ${process.env.TABLE_SCHEMA_NAME}.events__c where pg_id__c='${req.query.id}' and asm__c='${req.headers.agentid}'`;
            sql += ` limit 1`;

            console.log(`INFO:: Get event Detail ====>  ${sql}`);
            return await client.query(sql)
                .then(data => {
                    console.log('data ===> ', data);
                    if (data.rowCount != undefined && data.rowCount > 0) {
                        response.response = { 'success': true, "data": { "eventDetail": data.rows[0] }, "message": "" };
                        response.status = 200;
                        return response;
                    } else {
                        response.response = { 'success': false, "data": {}, "message": "No record found." };
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

/**
 * This method is used to add  event.
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */

async function add(req) {

    try {

        var event, is_Validate = true;
        if (req.body != undefined) {
            event = req.body;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.name) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.area__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.asm__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.budget__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.expected_participation__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.venue_details__c) : false;
            is_Validate = is_Validate ? validation.isValidDate(event.event_date__c) : false;

            is_Validate = is_Validate ? validation.isPicklistValueValid(event.status__c, "Event", 'status__c', true) : false;
            is_Validate = is_Validate ? validation.isPicklistValueValid(event.type__c, "Event", 'type__c', true) : false;

            is_Validate = is_Validate ? validation.isPicklistValueValid(event.target_audience__c, "Event", 'target_audience__c', false) : false;

        } else {
            is_Validate = false;
        }

        console.log('is_Validate = > ', is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var addeventDetail = await component.addevent(agentInfo, event);

            return addeventDetail;
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameters are mising." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(`Error(catch):::: `, e);

        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 400;
        return response;
    }
}
async function edit(req) {

    try {

        var event, is_Validate = true;
        if (req.body != undefined) {
            event = req.body;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.name) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.area__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.asm__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.budget__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.expected_participation__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.venue_details__c) : false;
            is_Validate = is_Validate ? validation.isValidDate(event.event_date__c) : false;

            is_Validate = is_Validate ? validation.isPicklistValueValid(event.type__c, "Event", 'type__c', true) : false;
            is_Validate = is_Validate ? validation.isPicklistValueValid(event.status__c, "Event", 'status__c', true) : false;

            is_Validate = is_Validate ? validation.isPicklistValueValid(event.target_audience__c, "Event", 'target_audience__c', false) : false;


            is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
            event['pg_id__c'] = req.query.id

            isValidASM = await validation.isValidSalesforceId('team__c', event.asm__c, true);
            is_Validate = (isValidASM.success) ? true : false;
        } else {
            is_Validate = false;
        }

        console.log('is_Validate = > ', is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var addeventDetail = await component.editevent(agentInfo, event);

            return addeventDetail;
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameters are mising." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(`Error(catch):::: `, e);

        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 400;
        return response;
    }
}
