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

const offset = "0";
const limit = "10";

module.exports = {
    getAll,
    productDetail,
    search,
    getAllProductGroup
};

async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? !validator.isEmpty(req.query.offset) : false;
        is_Validate = is_Validate ? !validator.isEmpty(req.query.limit) : false;
        
        if (is_Validate) {
            const fields = SF_PRODUCT_FIELD; 
            const tableName = SF_PRODUCT_TABLE_NAME;
            
            const WhereClouse = [];
            if(validator.isEmpty(req.query.type)){
                WhereClouse.push({"fieldName":"type","fieldValue":req.query.type}) 
            }
            if(validator.isEmpty(req.query.type)){
                WhereClouse.push({"fieldName":"CreatedById","fieldValue":req.query.CreatedById}) 
            }
            if(validator.isEmpty(req.query.offset)){
                offset = req.query.offset;
            }
            if(validator.isEmpty(req.query.limit)){
                limit = req.query.limit;
            }
           
            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit);
            console.log(sql);
            var products = await client.query(sql);

            if (products.rowCount != undefined && products.rowCount > 0) {
                return products.rows;
            }
        }
    } catch (e) {
        console.log('ERROR::: ', e)
        return {};
    }
}
async function getAllProductGroup(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? !validator.isEmpty(req.query.offset) : false;
        is_Validate = is_Validate ? !validator.isEmpty(req.query.limit) : false;
        
        if (is_Validate) {
            const fields = SF_PRODUCT_GROUP_FIELD; 
            const tableName = SF_PRODUCT_TABLE_NAME;
            
            const WhereClouse = [];
            if(validator.isEmpty(req.query.type)){
                WhereClouse.push({"fieldName":"type","fieldValue":req.query.type}) 
            }
            if(validator.isEmpty(req.query.type)){
                WhereClouse.push({"fieldName":"CreatedById","fieldValue":req.query.CreatedById}) 
            }
            if(validator.isEmpty(req.query.offset)){
                offset = req.query.offset;
            }
            if(validator.isEmpty(req.query.limit)){
                limit = req.query.limit;
            }
           
            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit);
            console.log(sql);
            var products = await client.query(sql);

            if (products.rowCount != undefined && products.rowCount > 0) {
                return products.rows;
            }
        }
    } catch (e) {
        console.log('ERROR::: ', e)
        return {};
    }
}

async function productDetail(productId) {
    try {
        if (!_.isEmpty(productId)) {

            let sql = `SELECT * FROM public.products where id='${productId}' limit 1`;
            var pDetail = await client.query(sql);

            if (pDetail.rowCount != undefined && pDetail.rowCount > 0) {
                return pDetail.rows[0];
            }
        }
    } catch (e) {
        return {};
    }
}



async function search(search) {
    try {
        if (!_.isEmpty(productId)) {

            let sql = `SELECT * FROM public.products where name LIKE '%${search}%'`;
            var pDetail = await client.query(sql);

            if (pDetail.rowCount != undefined && pDetail.rowCount > 0) {
                return pDetail.rows[0];
            }
        }
    } catch (e) {
        return {};
    }
}