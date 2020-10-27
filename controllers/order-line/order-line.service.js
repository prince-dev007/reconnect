var _ = require('lodash');
var validator = require('validator');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);


module.exports = {
    getAll
};
momenttz = require('moment-timezone');






async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.offset) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.limit) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.orderid) : false;

        if (is_Validate) {


            var tMem = [];
            var agentInfo = await db.agentDetail(req.headers.agentid);
            teamDetail = await db.getAsmHirarchy(req.headers.agentid);
            if (teamDetail.success && agentInfo.rows.length > 0) {

                const fields = [`order_line__c.order_pg_id__c`, `order_line__c.sfid`, `ASM__c`, `order_line__c.business__c`, `date_part('epoch'::text, date__c) * (1000)::double precision as date__c`, `order_line__c.account__c`, `order_line__c.item__c`, `order_line__c.order__c`, `Order1__c`, `order_line__c.name`, `order_line__c.Product_Category__c`, `order_line__c.Product_Sub_Category__c`, `order_line__c.Product_Sub_Sub_Category__c`, `order_line__c.PSM__c`, `order_line__c.quantity__c`, `order_line__c.retailer__c`, `date_part('epoch'::text, order_line__c.createddate) * (1000)::double precision as createddate`, `product__c.Product_Name__c as Product_Name__c`];
                const tableName = `order_line__c`;

                const WhereClouse = [];
                if (req.query.orderid != undefined && req.query.orderid != '') {
                    WhereClouse.push({ "fieldName": "order_line__c.order_pg_id__c", "fieldValue": req.query.orderid });
                }

                // Get AgentDetail
                WhereClouse.push({ "fieldName": "order_line__c.business__c", "fieldValue": agentInfo.rows[0]['business'] });

                if (teamDetail.memberType == 'PSM') {
                    WhereClouse.push({ "fieldName": "order_line__c.psm__c", "fieldValue": req.headers.agentid })
                } else {
                    WhereClouse.push({ "fieldName": "order_line__c.asm__c", "fieldValue": teamDetail.ASM, "type": "IN" })
                }


                var offset = '0', limit = '1000';

                if (req.query.offset != undefined && validation.issetNotEmpty(req.query.offset)) {
                    offset = req.query.offset;
                }
                if (req.query.limit != undefined && validation.issetNotEmpty(req.query.limit)) {
                    limit = req.query.limit;
                }
                orderBy = '';
                joins = [{
                    "type": "LEFT",
                    "table_name": "product__c",
                    "p_table_field": "order_line__c.item__c",
                    "s_table_field": "product__c.sfid"
                }
                ];

                var sql = db.fetchAllWithJoinQry(fields, tableName, joins, WhereClouse, offset, limit, orderBy);

                // sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit);
                console.log(`INFO::: Get All Order Lines = ${sql}`);

                var orders = await client.query(sql);
                console.log('orders.rowCount >>>  ', orders.rowCount)
                if (orders.rowCount != undefined && orders.rowCount > 0) {
                    response.response = { 'success': true, "data": { "order_line": orders.rows } };
                    response.status = 200;
                    return response;
                } else {
                    response.response = { 'success': false, "data": { "order_line": [] }, "message": "No record found." };
                    response.status = 400;
                    return response;
                }

            } else {
                response.response = { 'success': false, "data": { "order_line": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "order_line": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "order_line": [] }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}

