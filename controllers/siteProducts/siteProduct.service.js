var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
var component = require(`${PROJECT_DIR}/controllers/siteProducts/siteProduct.component`);


module.exports = {
    getAll,
    detail,
    add,
    edit
};

var SITE_PRODUCT_FIELD = [`name`,`sites__c`,`sfid`,`pg_id__c`,`site_pg_id__c`,`product__c`,`product_category__c`,`product_sub_category__c`,`product_sub_sub_category__c`,`quantity__c`,`psm__c`,`asm__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`];
var SITE_PRODUCT_TABLE_NAME = `site__c`;
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

            const fields = SITE_PRODUCT_FIELD.join(', ');
            const tableName = SITE_PRODUCT_TABLE_NAME;

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
            if (validation.issetNotEmpty( req.query.id)) {
                WhereClouse.push({ "fieldName": "site_pg_id__c", "fieldValue": req.query.id });
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
            var fields =  SITE_PRODUCT_FIELD.join(', ');
            sql += ` ${fields} `;
            sql += ` FROM ${process.env.TABLE_SCHEMA_NAME}.${SITE_PRODUCT_TABLE_NAME} where pg_id__c='${req.query.id}'`;
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
        //`sites__c`,`sfid`,`pg_id__c`,`product__c`,`product_category__c`,`product_sub_category__c`,`product_sub_sub_category__c`,`quantity__c`,`psm__c`,`asm__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`
        var siteProdObj, is_Validate = true;
        if (req.body != undefined) {
            siteProdObj = req.body;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.sites__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.site_pg_id__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.product__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.product_category__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.product_sub_category__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.product_sub_sub_category__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.asm__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.quantity__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.psm__c) : false;
            
            
        }else{
            is_Validate = false;
        }

        console.log('siteProdObj = > ',siteProdObj)
        console.log('is_Validate = > ',is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var addSiteDetail  = await component.addSite(agentInfo, siteProdObj);
            
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
        
        var siteProdObj, is_Validate = true;
        if (req.body != undefined) {
            siteProdObj = req.body;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.sites__c) : false;
            //is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.pg_id__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.product__c) : false;
            // is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.product_category__c) : false;
            // is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.product_sub_category__c) : false;
            // is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.product_sub_sub_category__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.asm__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.quantity__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(siteProdObj.psm__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
            siteProdObj['pg_id__c'] = req.query.id
            
        }else{
            is_Validate = false;
        }

        console.log('is_Validate = > ',is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var addSiteDetail  = await component.editSite(agentInfo, siteProdObj);
            
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
