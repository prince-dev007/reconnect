var _ = require('lodash');
var validator = require('validator');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = {"status":200,"response":""};
var validation = require(`${PROJECT_DIR}/utility/validation`);

var moment = require('moment');

module.exports = {
    getAll,
    detail
};
momenttz = require('moment-timezone');

async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.offset) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.limit) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        //is_Validate = is_Validate ? validation.issetNotEmpty(req.query.type) : false;

        if (is_Validate) {

            var agentInfo = await db.agentDetail(req.headers.agentid);
            console.log(agentInfo.rows[0]);

            const fields = [`sfid`,`Business__c`,`Description__c`,`Item_Code__c`,`Product_Category__c`,`Name`,`Product_Name__c`,`Product_Sub_Category__c`,`Product_Sub_Sub_Category__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`];
            const tableName = `product__c`;

            const WhereClouse = [];
            if (validation.issetNotEmpty(req.query.search)) {
                WhereClouse.push({ "fieldName": "product__c.product_name__c", "fieldValue": req.query.search, "type":"LIKE" });
            }
            
            if (validation.issetNotEmpty(req.query.pcat)) {
                WhereClouse.push({ "fieldName": "product__c.Product_Category__c", "fieldValue": req.query.pcat });
            }
            
            if (validation.issetNotEmpty(req.query.pscat)) {
                WhereClouse.push({ "fieldName": "product__c.Product_Sub_Category__c", "fieldValue": req.query.pscat });
            }
            if (validation.issetNotEmpty(req.query.psscat)) {
                WhereClouse.push({ "fieldName": "product__c.Product_Sub_Sub_Category__c", "fieldValue": req.query.psscat });
            }
            
            if(agentInfo.rowCount > 0 && agentInfo.rows[0]['business']!=undefined){
                
                WhereClouse.push({ "fieldName": "product__c.business__c", "fieldValue": agentInfo.rows[0]['business'] });
            }
            var offset = '0', limit = '10';
            
            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }
            
            fieldsArray = [`product__c.sfid`,`product__c.Business__c`,`product__c.Description__c`,`product__c.Item_Code__c`,`product__c.Product_Category__c`,`product_category__c.category_name__c`,`product__c.Name`,`product__c.Product_Name__c`,`product__c.Product_Sub_Category__c`,`product__c.Product_Sub_Sub_Category__c`,`date_part('epoch'::text, product__c.createddate) * (1000)::double precision as createddate`,`product_category__c.name as cat_code`];

            joins = [{
                "type": "LEFT",
                "table_name": "product_category__c",
                "p_table_field": "product__c.product_category__c",
                "s_table_field": "product_category__c.sfid"
            }
            ];
            orderBy = ' order by name asc';
            sql = db.fetchAllWithJoinQry(fieldsArray, tableName,joins, WhereClouse, offset, limit, orderBy )

            //sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit);
            console.log(`INFO::: Get All Products = ${sql}`);
            
            momenttz().tz("America/Los_Angeles").format();
            var orders = await client.query(sql);
            
            if (orders.rowCount != undefined && orders.rowCount > 0) {
                response.response={ 'success': true, "data": {"products":orders.rows} };
                response.status = 200;
                return response; 
            }else{
                response.response={ 'success': false, "data": {"products":[]}, "message":"No record found." };
                response.status = 400;
                return response; 
            }
        }else{
            response.response={ 'success': false, "data": {"products":[]}, "message":"Mandatory parameter(s) are missing." };
            response.status = 400;
            return response; 
        }
    } catch (e) {
        console.log(e);
        response.response={ 'success': false, "data": {"products":[]}, "message":"Internal server error." };
        response.status = 500;
        return response; 
    }
}

async function detail(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        //is_Validate = is_Validate ? validation.issetNotEmpty(req.query.type) : false;

        if (is_Validate) {

            var agentInfo = await db.agentDetail(req.headers.agentid);

            const fields = [`sfid`,`Business__c`,`Description__c`,`Item_Code__c`,`Product_Category__c`,`Name`,`Product_Name__c`,`Product_Sub_Category__c`,`Product_Sub_Sub_Category__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`];
            const tableName = `Product__c`;

            const WhereClouse = [];
            if(req.query.orderid!=undefined && req.query.orderid!=''){
                WhereClouse.push({ "fieldName": "sfid", "fieldValue": req.query.orderid });
            }
            if(agentInfo.rowCount > 0 && agentInfo.rows[0]['business']!=undefined){
                WhereClouse.push({ "fieldName": "Business__c", "fieldValue": agentInfo.rows[0]['business'] });
            }

            var offset = '0', limit = '1';
            
            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit);
            console.log(`INFO::: Get All Sellers = ${sql}`);
            
            momenttz().tz("America/Los_Angeles").format();
            var orders = await client.query(sql);
            
            if (orders.rowCount != undefined && orders.rowCount > 0) {
                response.response={ 'success': true, "data": {"product_detail":orders.rows[0]} };
                response.status = 200;
                return response; 
            }else{
                response.response={ 'success': false, "data": {"product_detail":[]}, "message":"No record found." };
                response.status = 400;
                return response; 
            }
        }else{
            response.response={ 'success': false, "data": {"product_detail":[]}, "message":"Mandatory parameter(s) are missing." };
            response.status = 400;
            return response; 
        }
    } catch (e) {
        console.log(e);
        response.response={ 'success': false, "data": {"product_detail":[]}, "message":"Internal server error." };
        response.status = 500;
        return response; 
    }
}

