console.log(`${PROJECT_DIR}/utility/selectQueries`);
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
//const config = require('config.json');
require("dotenv").config();

const config = {
    "secret": `${process.env.JWT_SECRET}`
}
const jwt = require('jsonwebtoken');
var _ = require('lodash');
var validator = require('validator');
var response = { "status": 200, "response": "" };
var validation = require(`${PROJECT_DIR}/utility/validation`);


var offset = "0";
var limit = "1000";

module.exports = {
    getAll,
    getAllSubCategory,
    getAllSubSubCategory
 };

async function getAll(req) {
    try {

        is_Validate = true;
     
        
        if (is_Validate) {
            const fields = [`sfid`,`Category_Name__c as category_name_old__c `,`Description__c`,`Business__c`,`Name as category_name__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`]; 
            const tableName = `Product_Category__c`;
            
            const WhereClouse = [];
            if(req.query.business != undefined && validation.issetNotEmpty(req.query.business)){
                WhereClouse.push({"fieldName":"Business__c","fieldValue":req.query.business}) 
            }
            var agentInfo = await db.agentDetail(req.headers.agentid);
            if(agentInfo.rowCount > 0 && agentInfo.rows[0]['business']!=undefined){
                WhereClouse.push({ "fieldName": "Business__c", "fieldValue": agentInfo.rows[0]['business'] });
            }

            if(validation.issetNotEmpty(req.query.offset)){
                offset = req.query.offset;
            }
            if(validation.issetNotEmpty(req.query.limit)){
                limit = req.query.limit;
            }
           
            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit);
            console.log(sql);
            var productCats = await client.query(sql);

            if (productCats.rowCount != undefined && productCats.rowCount > 0) {
                response.status = 200;
                response.response = { "success": true, "data": {"product_cat":productCats.rows}, "message": "" };
                return response;
            }else{
                response.status = 400;
                response.response = { "success": false, "data": {}, "message": "No record found." };
                return response;
            }
        }
    } catch (e) {
        console.log('ERROR::: ', e)
        response.status = 500;
        response.response = { "success": false, "data": {}, "message": "Internal server error." };
        return response;
    }
}

async function getAllSubCategory(req) {
    try {

        is_Validate = true;
       
        
        if (is_Validate) {
            const fields = [`sfid`,`Business__c`,`Product_Category__c`,`Name as Product_Sub_Category_Name__c`,`Product_Sub_Category__c as Product_Sub_Category_OLD__c`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`]; 
            const tableName = `Product_Sub_Category__c`;
            
            var WhereClouse = [];
            if(req.query.prodCatId != undefined && validation.issetNotEmpty(req.query.prodCatId)){
                WhereClouse.push({"fieldName":"Product_Category__c","fieldValue":req.query.prodCatId}) 
            }
            
            // Check Business__c
            var agentInfo = await db.agentDetail(req.headers.agentid);
            if(agentInfo.rowCount > 0 && agentInfo.rows[0]['business']!=undefined){
                WhereClouse.push({ "fieldName": "Business__c", "fieldValue": agentInfo.rows[0]['business'] });
            }
            if(validation.issetNotEmpty(req.query.offset)){
                offset = req.query.offset;
            }
            if(validation.issetNotEmpty(req.query.limit)){
                limit = req.query.limit;
            }
           
            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit);
            console.log(sql);
            var productCats = await client.query(sql);

            if (productCats.rowCount != undefined && productCats.rowCount > 0) {
                response.status = 200;
                response.response = { "success": true, "data": {"product_sub_cat":productCats.rows}, "message": "" };
                return response;
            }else{
                response.status = 400;
                response.response = { "success": false, "data": {}, "message": "No record found." };
                return response;
            }
        }
    } catch (e) {
        console.log('ERROR::: ', e)
        response.status = 500;
        response.response = { "success": false, "data": {}, "message": "Internal server error." };
        return response;
    }
}


async function getAllSubSubCategory(req) {
    try {

        is_Validate = true;
       
        if (is_Validate) {
            const fields = [`sfid`,`Business__c`,`Product_Category__c`,`Product_Sub_Category__c`,`Name as Product_Sub_Sub_Category_Name__c`,`Product_Sub_Sub_Category_Name__c as old`,`date_part('epoch'::text, createddate) * (1000)::double precision as createddate`]; 
            const tableName = `Product_Sub_Sub_Category__c`;
            
            var WhereClouse = [];

            console.log(req.query);
            if(req.query.prodCatId != undefined && validation.issetNotEmpty(req.query.prodCatId)){
                WhereClouse.push({"fieldName":"Product_Category__c","fieldValue":req.query.prodCatId}) 
            }

            if(req.query.prodCatSubId != undefined && validation.issetNotEmpty(req.query.prodCatSubId)){
                WhereClouse.push({"fieldName":"Product_Sub_Category__c","fieldValue":req.query.prodCatSubId}) 
            }

           
            // Check Business__c
            var agentInfo = await db.agentDetail(req.headers.agentid);
            if(agentInfo.rowCount > 0 && agentInfo.rows[0]['business']!=undefined){
                WhereClouse.push({ "fieldName": "Business__c", "fieldValue": agentInfo.rows[0]['business'] });
            }
            if(validation.issetNotEmpty(req.query.offset)){
                offset = req.query.offset;
            }
            if(validation.issetNotEmpty(req.query.limit)){
                limit = req.query.limit;
            }
           
            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit);
            console.log(sql);
            var productCats = await client.query(sql);

            if (productCats.rowCount != undefined && productCats.rowCount > 0) {
                response.status = 200;
                response.response = { "success": true, "data": {"product_sub_sub_cat":productCats.rows}, "message": "" };
                return response;
            }else{
                response.status = 400;
                response.response = { "success": false, "data": {}, "message": "No record found." };
                return response;
            }
        }
    } catch (e) {
        console.log('ERROR::: ', e)
        response.status = 500;
        response.response = { "success": false, "data": {}, "message": "Internal server error." };
        return response;
    }
}