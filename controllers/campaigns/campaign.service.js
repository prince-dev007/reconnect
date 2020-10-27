var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
var component = require(`${PROJECT_DIR}/controllers/campaigns/campaign.component`);


module.exports = {
    getAll,
    detail,
    add,
    edit
};
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
        //is_Validate = is_Validate ? validation.issetNotEmpty(req.query.type) : false;
        if((req.query.type==undefined || req.query.type=='') && (req.query.sellerid!=undefined && req.query.sellerid!='')){
            is_Validate = false;
        }else if((req.query.type!=undefined && req.query.type!='') && (req.query.sellerid==undefined || req.query.sellerid=='')){
            is_Validate = false;
        }
        if (is_Validate) {
//pg_id__c , differencw__c

            const fields = `pg_id__c,sfid,  actual__c, approved_by__c, campaign_budget__c, name,  gift__c, reuested_by__c, status__c, type__c, venue__c, date_part('epoch'::text, createddate) * (1000)::double precision as createddate`;
            const tableName = `Campaign__c`;

            const WhereClouse = [];
            var offset = '0', limit = '1000';
            // if (validation.issetNotEmpty(req.query.sellerid)) {
            //     if (req.query.type != undefined && req.query.type == 'Dealer') {
            //         WhereClouse.push({ "fieldName": "dealer__c", "fieldValue": req.query.sellerid });
            //     } else if (req.query.type != undefined && req.query.type == 'Retailer') {
            //         WhereClouse.push({ "fieldName": "retailer__c", "fieldValue": req.query.sellerid });
            //     } 
            // }

            // var agentInfo = await db.agentDetail(req.headers.agentid);
            // // Agent and order bussniss should be same
            // if (agentInfo.rowCount > 0 && agentInfo.rows[0]['business'] != undefined) {
            //     WhereClouse.push({ "fieldName": "business__c", "fieldValue": agentInfo.rows[0]['business'] });
            // }
            
            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }

            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,' order by createddate desc');
            console.log(`INFO::: Get LAST campaigns = ${sql}`);

            var campaigns = await client.query(sql);

            if (campaigns.rowCount != undefined && campaigns.rowCount > 0) {
                response.response = { 'success': true, "data": { "campaigns": campaigns.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "campaigns": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "campaigns": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "campaigns": [] }, "message": "Internal server error." };
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
            sql += ` pg_id__c,sfid,  actual__c, approved_by__c, campaign_budget__c, name,  gift__c, reuested_by__c, status__c, type__c, venue__c, date_part('epoch'::text, createddate) * (1000)::double precision as createddate `;
            sql += ` FROM ${process.env.TABLE_SCHEMA_NAME}.Campaign__c where pg_id__c='${req.query.id}' and isdeleted='false'`;
            sql += ` limit 1`;

            console.log(`INFO:: Get Campaign Detail ====>  ${sql}`);
            return await client.query(sql)
                .then(data => {
                    if (data.rowCount != undefined && data.rowCount > 0) {
                        response.response = { 'success': true, "data": { "orderDetail": data.rows[0] }, "message": "" };
                        response.status = 200;
                        return response;
                    } else {
                        response.response = { 'success': false, "data": { "orderDetail": {} }, "message": "No record found." };
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
 * This method is used to add  campaign.
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */

async function add(req) {

    try {
        // const fields = `sfid,  actual__c, approved_by__c, campaign_budget__c, name,  gift__c, reuested_by__c, status__c, type__c, venue__c, createddate`;
        //const tableName = `Campaign__c`;
        var campaign, is_Validate = true;
        if (req.body != undefined) {
            campaign = req.body;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.actual__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.approved_by__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.campaign_budget__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.gift__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.retailer__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.reuested_by__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.status__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.type__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.venue__c) : false;
            
        }else{
            is_Validate = false;
        }

        console.log('is_Validate = > ',is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var addCampaignDetail  = await component.addCampaign(agentInfo, campaign);
            
            return addCampaignDetail;
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
        // const fields = `sfid,  actual__c, approved_by__c, campaign_budget__c, name,  gift__c, reuested_by__c, status__c, type__c, venue__c, createddate`;
        //const tableName = `Campaign__c`;
        var campaign, is_Validate = true;
        if (req.body != undefined) {
            campaign = req.body;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.actual__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.approved_by__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.campaign_budget__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.gift__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.retailer__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.reuested_by__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.status__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.type__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(campaign.venue__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
            campaign['pg_id__c'] = req.query.id
            
        }else{
            is_Validate = false;
        }

        console.log('is_Validate = > ',is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var addCampaignDetail  = await component.editCampaign(agentInfo, campaign);
            
            return addCampaignDetail;
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
