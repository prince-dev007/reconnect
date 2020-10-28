var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
var component = require(`${PROJECT_DIR}/controllers/sites/site.component`);
var dashboard = require(`${PROJECT_DIR}/controllers/dashboard/dashboard.service`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);

module.exports = {
    getAll,
    detail,
    add,
    edit
};

var SITE_FIELD = [`name`,`sfid`,`pg_id__c`,`source_type__c`,`address_line_1__c`,`address_line_2__c`,`alternate_phone_no__c`,`area__c`,`asm__c`,`city__c`,`dealer__c`,`email__c`,`phone__c`,`project_type__c`,`retailer__c`,`site_name__c`,`site_stages__c`,`size__c`,`source__c`,`status__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`];
var SITE_TABLE_NAME = `sites__c`;
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
        if((req.query.type==undefined || req.query.type=='') && (req.query.sellerid!=undefined && req.query.sellerid!='')){
            is_Validate = false;
        }else if((req.query.type!=undefined && req.query.type!='') && (req.query.sellerid==undefined || req.query.sellerid=='')){
            is_Validate = false;
        }
        if (is_Validate) {

            const fields = SITE_FIELD.join(', ');
            const tableName = SITE_TABLE_NAME;

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
            if (validation.issetNotEmpty(req.query.contact)) {
                WhereClouse.push({ "fieldName": "source__c", "fieldValue": req.query.contact,"fieldName":"Source__c","fieldValue":"Service_Engineer", });
            }

            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,' order by createddate desc');
            console.log(`INFO::: Get all Sites = ${sql}`);

            var sites = await client.query(sql);

            if (sites.rowCount != undefined && sites.rowCount > 0) {
                response.response = { 'success': true, "data": { "sites": sites.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "sites": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "sites": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "sites": [] }, "message": "Internal server error." };
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
            var fields =  SITE_FIELD.join(', ');
            sql += ` ${fields} `;
            sql += ` FROM ${process.env.TABLE_SCHEMA_NAME}.${SITE_TABLE_NAME} where pg_id__c='${req.query.id}'`;
            sql += ` limit 1`;

            console.log(`INFO:: Get Site Detail ====>  ${sql}`);
            return await client.query(sql)
                .then(data => { console.log('data ===> ', data);
                    if (data.rowCount != undefined && data.rowCount > 0) {
                        response.response = { 'success': true, "data": { "siteDetail": data.rows[0] }, "message": "" };
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
 * This method is used to add  Site.
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */

async function add(req) {

    try {
        //`name`,`sfid`,`pg_id__c`,`address_line_1__c`,`address_line_2__c`,`alternate_phone_no__c`,`area__c`,`asm__c`,`city__c`,`dealer__c`,`email__c`,`phone__c`,`project_type__c`,`retailer__c`,`site_name__c`,`site_stages__c`,`size__c`,`source__c`,`status__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`
        var siteObj, is_Validate = true;
        if (req.body != undefined) {
            siteObj = req.body;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.name) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.address_line_1__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.address_line_2__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.alternate_phone_no__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.area__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.asm__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.dealer__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.email__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.phone__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.retailer__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.size__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.source__c) : false;
            
            is_Validate = is_Validate ? validation.isPicklistValueValid(siteObj.project_type__c,'Site','project_type__c',false) : false;
            is_Validate = is_Validate ? validation.isPicklistValueValid(siteObj.site_stages__c,'Site','site_stages__c',true) : false;
            is_Validate = is_Validate ? validation.isPicklistValueValid(siteObj.source_type__c,'Site','source_type__c',false) : false;
            
            is_Validate = is_Validate ? validation.isPicklistValueValid(siteObj.status__c,'Site','status__c',true) : false;
            
        }else{
            is_Validate = false;
        }

        console.log('siteObj = > ',siteObj)
        console.log('is_Validate = > ',is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var addSiteDetail  = await component.addSite(agentInfo, siteObj);
            
             // UPDATE TARGET AND ACHIEVEMENT
             dashboard.updateMonthlyTarget(req.headers.agentid,'site',dtUtil.currentMonth(),{'sites_visited__c':'sites_visited__c+1'});

            return addSiteDetail;
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
        
        var siteObj, is_Validate = true;
        if (req.body != undefined) {
            siteObj = req.body;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.name) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.address_line_1__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.address_line_2__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.area__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.asm__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.dealer__c) : false;
            // is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.email__c) : false;
            // is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.phone__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.retailer__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.site_name__c) : false;
            // is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.size__c) : false;
            // is_Validate = is_Validate ? validation.issetNotEmpty(siteObj.source__c) : false;

            is_Validate = is_Validate ? validation.isPicklistValueValid(siteObj.project_type__c,'Site','project_type__c',false) : false;
            is_Validate = is_Validate ? validation.isPicklistValueValid(siteObj.site_stages__c,'Site','site_stages__c',true) : false;
            is_Validate = is_Validate ? validation.isPicklistValueValid(siteObj.source_type__c,'Site','source_type__c',true) : false;
            
            is_Validate = is_Validate ? validation.isPicklistValueValid(siteObj.status__c,'Site','status__c',false) : false;
            siteObj['pg_id__c'] = req.query.id
            
        }else{
            is_Validate = false;
        }

        console.log('is_Validate = > ',is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var addSiteDetail  = await component.editSite(agentInfo, siteObj);
            
            return addSiteDetail;
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
