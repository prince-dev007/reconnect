var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
var component = require(`${PROJECT_DIR}/controllers/influencers/influencer.component`);


module.exports = {
    getAll,
    detail,
    add,
    edit
};

var CONTACT_FIELD = [`name`,`firstname`,`lastname`,`email`,`sfid`,`pg_id__c`,`asm__c`,`accountid`,`area__c`,`attached_dealer__c`,`attached_retailer__c`,`business_so_far__c`,`business_this_month__c`,`category__c`,`meets_attended__c`,`phone`,`potential__c`,`status__c`,`title`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`];
var CONTACT_TABLE_NAME = `contact`;
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

            const fields = CONTACT_FIELD.join(', ');
            const tableName = CONTACT_TABLE_NAME;

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
            if (validation.issetNotEmpty(req.query.name)) {
                WhereClouse.push({ "fieldName": "name", "fieldValue": req.query.name, "type":"LIKE" });
            }
            if (validation.issetNotEmpty(req.query.email)) {
                WhereClouse.push({ "fieldName": "email", "fieldValue": req.query.email, "type":"LIKE" });
            }
            if (validation.issetNotEmpty(req.query.phone)) {
                WhereClouse.push({ "fieldName": "phone", "fieldValue": req.query.phone, "type":"LIKE" });
            }

            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,' order by createddate desc');
            console.log(`INFO::: Get all Contacts = ${sql}`);

            var contacts = await client.query(sql);

            if (contacts.rowCount != undefined && contacts.rowCount > 0) {
                response.response = { 'success': true, "data": { "contacts": contacts.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "contacts": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "contacts": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "contacts": [] }, "message": "Internal server error." };
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
            var fields =  CONTACT_FIELD.join(', ');
            sql += ` ${fields} `;
            sql += ` FROM ${process.env.TABLE_SCHEMA_NAME}.${CONTACT_TABLE_NAME} where pg_id__c='${req.query.id}' and asm__c='${req.headers.agentid}'`;
            sql += ` limit 1`;

            console.log(`INFO:: Get contact Detail ====>  ${sql}`);
            return await client.query(sql)
                .then(data => { console.log('data ===> ', data);
                    if (data.rowCount != undefined && data.rowCount > 0) {
                        response.response = { 'success': true, "data": { "contactDetail": data.rows[0] }, "message": "" };
                        response.status = 200;
                        return response;
                    } else {
                        response.response = { 'success': false, "data": {  }, "message": "No record found." };
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
 * This method is used to add  contact.
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */

async function add(req) {

    try {
        //`name`,`sfid`,`pg_id__c`,`asm__c`,`accountid`,`area__c`,`attached_dealer__c`,`attached_retailer__c`,`business_so_far__c`,`business_this_month__c`,`category__c`,`meets_attended__c`,`mobilephone`,`psm__c`,`phone`,`potential__c`,`status__c`,`title`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`
        var contactObj, is_Validate = true;
        if (req.body != undefined) {
            contactObj = req.body;
            is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.firstname) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.lastname) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.asm__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.area__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.attached_dealer__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.attached_retailer__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.business_so_far__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.business_this_month__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.meets_attended__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.psm__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.phone) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.title) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.email) : false;
            console.log('is_Validate .. 2 ', is_Validate);
            
            //is_Validate = is_Validate ? validation.isPicklistValueValid(contactObj.category__c,'Influencer','category__c',true) : false;
            is_Validate = is_Validate ? validation.isPicklistValueValid(contactObj.potential__c,'Influencer','potential__c',false) : false;
            console.log('is_Validate .. ', is_Validate);
            is_Validate = is_Validate ? validation.isPicklistValueValid(contactObj.status__c,'Influencer','status__c',false) : false;
            console.log('is_Validate .. ', is_Validate);
        }else{
            is_Validate = false;
        }

        console.log('is_Validate = > ',is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var addContactDetail  = await component.addContact(agentInfo, contactObj);
            
            return addContactDetail;
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
        // const fields = `sfid,  actual__c, approved_by__c, contact_budget__c, name,  gift__c, reuested_by__c, status__c, type__c, venue__c, createddate`;
        //const tableName = `contact__c`;
        var contactObj, is_Validate = true;
        if (req.body != undefined) {
            contactObj = req.body;
            is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.firstname) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.lastname) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.asm__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.area__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.attached_dealer__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.attached_retailer__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.business_so_far__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.business_this_month__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.meets_attended__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.psm__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.phone) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.title) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(contactObj.email) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
            console.log('is_Validate = > ',is_Validate)
            //is_Validate = is_Validate ? validation.isPicklistValueValid(contactObj.category__c,'Influencer','category__c',true) : false;
            is_Validate = is_Validate ? validation.isPicklistValueValid(contactObj.potential__c,'Influencer','potential__c',false) : false;
            is_Validate = is_Validate ? validation.isPicklistValueValid(contactObj.status__c,'Influencer','status__c',false) : false;

            contactObj['pg_id__c'] = req.query.id
            
        }else{
            is_Validate = false;
        }

        console.log('is_Validate = > ',is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var addContactDetail  = await component.editContact(agentInfo, contactObj);
            
            return addContactDetail;
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
