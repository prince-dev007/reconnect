var _ = require('lodash');
var validator = require('validator');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
var component = require(`${PROJECT_DIR}/controllers/orders/order.component`);
var dashboard = require(`${PROJECT_DIR}/controllers/dashboard/dashboard.service`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);


module.exports = {
    getAll,
    detail,
    placeOrder
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
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.type) : false;
        // if((req.query.type==undefined || req.query.type=='') && (req.query.sellerid!=undefined && req.query.sellerid!='')){
        //     is_Validate = false;
        // }else if((req.query.type!=undefined && req.query.type!='') && (req.query.sellerid==undefined || req.query.sellerid=='')){
        //     is_Validate = false;
        // }
        if (is_Validate) {

            var teamDetail = await db.getAsmHirarchy(req.headers.agentid);
            console.log('ddd',teamDetail)
            if (teamDetail.success) {
            

            const fields = SF_ORDER_FIELD;
            const tableName = SF_ORDER_TABLE_NAME;

            const WhereClouse = [];
            var offset = '0', limit = '1000';
            if (validation.issetNotEmpty(req.query.sellerid)) {
                if (req.query.type != undefined && req.query.type == 'Dealer') {
                    WhereClouse.push({ "fieldName": "dealer__c", "fieldValue": req.query.sellerid,"fieldName":"dealer__c.Dealer","fieldValue":"ASC" });
                } else if (req.query.type != undefined && req.query.type == 'Retailer') {
                    WhereClouse.push({ "fieldName": "retailer__c", "fieldValue": req.query.sellerid,"fieldName":"retailer__c","fieldValue":"ASC" });
                } else {
                    // If not type provided then we can check it on database 
                    // todo: Rohit
                    //WhereClouse.push({ "fieldName": "retailer__c", "fieldValue": req.query.sellerid });
                }
            }
            if (teamDetail.memberType == 'PSM') {
                WhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.headers.agentid })
            } else {
                WhereClouse.push({ "fieldName": "asm__c", "fieldValue": teamDetail.ASM, "type": "IN" })
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
            console.log(`INFO::: Get LAST ORDERS = ${sql}`);

            var orders = await client.query(sql);

            if (orders.rowCount != undefined && orders.rowCount > 0) {
                response.response = { 'success': true, "data": { "orders": orders.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "orders": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
         }else{
            response.response = { 'success': false, "data": { "orders": [] }, "message": "No record found." };
            response.status = 400;
            return response;
         } 
        } else {
            response.response = { 'success': false, "data": { "orders": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "orders": [] }, "message": "Internal server error." };
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
            sql += SF_ORDER_FIELD.join(',');
            sql += ` FROM ${process.env.TABLE_SCHEMA_NAME}.order__c where pg_id__c='${req.query.id}' and isdeleted='false'`;
            sql += ` limit 1`;

            console.log(`INFO:: Get all Orders ====>  ${sql}`);
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
 * This method is used to place order.
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */

async function placeOrder(req) {

    try {

        var items, orderDetail, is_Validate = true;
        if (req.body.order != undefined) {
            orderDetail = req.body.order; 
            is_Validate = is_Validate ? validation.issetNotEmpty(orderDetail.dealer__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(orderDetail.order_value__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(orderDetail.promoted_product_count__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(orderDetail.retailer__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(orderDetail.total_product_sku__c) : false;
            is_Validate = is_Validate ? validation.issetNotEmpty(orderDetail.unique_product_count__c) : false;

            is_Validate = is_Validate ? validation.isValidDate(orderDetail.order_date__c) : false;

            if (req.body.items != undefined && req.body.items.length > 0) {
                var items = req.body.items;
                items.forEach(element => {
                    is_Validate = is_Validate ? validation.issetNotEmpty(element.item__c) : false;
                    is_Validate = is_Validate ? validation.issetNotEmpty(element.quantity__c) : false;
                });
            } else {
                is_Validate = false;
            }
        } else {
            is_Validate = false;
        }

        console.log('is_Validate = > ',is_Validate)
        if (is_Validate) {
            // Get login agent details  
            var agentInfo = await db.agentDetail(req.headers.agentid);
            // process order and order line items
            var placedOrderDetail  = await component.addOrderAndOrderLine(agentInfo, orderDetail, items);
            // UPDATE TARGET AND ACHIEVEMENT
            dashboard.updateMonthlyTarget(req.headers.agentid,'order',dtUtil.currentMonth(),{'orders__c':`orders__c + ${orderDetail.order_value__c}`});

            return placedOrderDetail;
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
