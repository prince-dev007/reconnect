var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
var component = require(`${PROJECT_DIR}/controllers/eventParticipants/eventParticipant.component`);


module.exports = {
    getAll,
    detail,
    add,
    edit
};

var EVENT_FIELD = [`name`,`sfid`,`pg_id__c`,`event_pg_id__c`,`ASM__c`,`Event__c`,`Event_Participants__c`,`date_part('epoch'::text, event_participants__c.createddate) * (1000)::double precision as event_participants__c.createddate`];
var EVENT_TABLE_NAME = `event_participants__c`;
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
            EVENT_FIELD = [`${EVENT_TABLE_NAME}.name`,`${EVENT_TABLE_NAME}.sfid`,`${EVENT_TABLE_NAME}.pg_id__c`,`${EVENT_TABLE_NAME}.event_pg_id__c`,`${EVENT_TABLE_NAME}.ASM__c`,`${EVENT_TABLE_NAME}.Event__c`,`${EVENT_TABLE_NAME}.Event_Participants__c`,`date_part('epoch'::text, ${EVENT_TABLE_NAME}.createddate) * (1000)::double precision as createddate`];

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

            if (validation.issetNotEmpty(req.query.id)) {
                WhereClouse.push({ "fieldName": "event_pg_id__c", "fieldValue": req.query.id });
            }

            //sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,' order by createddate desc');

            joins = [
                {
                    "type": "LEFT",
                    "table_name": "contact",
                    "p_table_field": `${EVENT_TABLE_NAME}.Event_Participants__c`,
                    "s_table_field": "contact.sfid"
                }
            ];
            console.log('EVENT_FIELD    ===>  ',EVENT_FIELD);
            var event_participants_FIELD = EVENT_FIELD;
            event_participants_FIELD.push("contact.name as participant_contact_name");
            console.log('event_participants_FIELD   ===>  ',event_participants_FIELD);
            sql = db.fetchAllWithJoinQry(event_participants_FIELD, tableName,joins, WhereClouse, offset, limit, ' order by event_participants__c.createddate desc' )

            console.log(`INFO::: Get all event_participants__c = ${sql}`);

            var eventParticipants = await client.query(sql);

            if (eventParticipants.rowCount != undefined && eventParticipants.rowCount > 0) {
                response.response = { 'success': true, "data": { "eventParticipants": eventParticipants.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "eventParticipants": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "eventParticipants": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "eventParticipants": [] }, "message": "Internal server error." };
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
            sql += EVENT_FIELD.join(', ');
            sql += ` FROM ${process.env.TABLE_SCHEMA_NAME}.${EVENT_TABLE_NAME} where pg_id__c='${req.query.id}' and isdeleted='false'`;
            sql += ` limit 1`;

            console.log(`INFO:: Get event Detail ====>  ${sql}`);
            return await client.query(sql)
                .then(data => {
                    if (data.rowCount != undefined && data.rowCount > 0) {
                        response.response = { 'success': true, "data": { "eventParticipants": data.rows[0] }, "message": "" };
                        response.status = 200;
                        return response;
                    } else {
                        response.response = { 'success': false, "data": { "eventParticipants": {} }, "message": "No record found." };
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
        //var EVENT_FIELD = [`name`,`sfid`,`pg_id__c`,`asm__c`,`event__c`,`Event_Participants__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`];

        var eventParticipants, is_Validate = true;
        if (req.body != undefined) {
            eventParticipants = req.body;
            eventParticipants.forEach(element => {
                //is_Validate = is_Validate ? validation.issetNotEmpty(element.name) : false;
                is_Validate = is_Validate ? validation.issetNotEmpty(element.asm__c) : false;
                //is_Validate = is_Validate ? validation.issetNotEmpty(element.event__c) : false;
                is_Validate = is_Validate ? validation.issetNotEmpty(element.event_participants__c) : false;
                is_Validate = is_Validate ? validation.issetNotEmpty(element.event_pg_id__c) : false;
            });
            
        }else{
            is_Validate = false;
        }

        console.log('is_Validate = > ',is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var addEventParticipantstDetail  = await component.addEventParticipants(agentInfo, eventParticipants);
            
            return addEventParticipantstDetail;
        }else{
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameters are mising." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(`Error(catch):::: `,e);

        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 400;
        return response;
    }
}
async function edit(req) {

    try {
        // const fields = `sfid,  actual__c, approved_by__c, event_budget__c, name,  gift__c, reuested_by__c, status__c, type__c, venue__c, createddate`;
        //const tableName = `event__c`;
        var event, is_Validate = true;
        if (req.body != undefined) {
            event = req.body;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.actual__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.approved_by__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.event_budget__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.gift__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.retailer__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.reuested_by__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.status__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.type__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(event.venue__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
            event['pg_id__c'] = req.query.id
            
        }else{
            is_Validate = false;
        }

        console.log('is_Validate = > ',is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var addeventDetail  = await component.editevent(agentInfo, event);
            
            return addeventDetail;
        }else{
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameters are mising." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(`Error(catch):::: `,e);

        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 400;
        return response;
    }
}
