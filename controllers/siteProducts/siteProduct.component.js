var db = require(`${PROJECT_DIR}/utility/selectQueries`);
const uuidv4 = require('uuid/v4');
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
var response = { "status": 200, "response": "" };
var validation = require(`${PROJECT_DIR}/utility/validation`);




module.exports = {
    addSite,
    editSite
};
var SITE_PRODUCT_TABLE_NAME = `site__c`;
async function addSite(myDetails,siteProdObj){
    try{
        
        if (myDetails.rowCount > 0) {
           
            siteProdFields =`site_pg_id__c, pg_id__c, product__c, product_category__c, product_sub_category__c, product_sub_sub_category__c, quantity__c, psm__c, asm__c, createddate,name`; 
            var UUID_Site = uuidv4();
            var createdDate = dtUtil.todayDatetime();
            siteProdFieldsValues =[(siteProdObj.site_pg_id__c)?siteProdObj.site_pg_id__c:null, UUID_Site, (siteProdObj.product__c)?siteProdObj.product__c:null, (siteProdObj.product_category__c)?siteProdObj.product_category__c:null, (siteProdObj.product_sub_category__c)?siteProdObj.product_sub_category__c:null, (siteProdObj.product_sub_sub_category__c)?siteProdObj.product_sub_sub_category__c:null, (siteProdObj.quantity__c)?siteProdObj.quantity__c:null, (siteProdObj.psm__c)?siteProdObj.psm__c:null, (siteProdObj.asm__c)?siteProdObj.asm__c:null, createdDate,(siteProdObj.asm__c)?siteProdObj.name:null]; //, siteProdObj.site_name__c
            
            tableName = SITE_PRODUCT_TABLE_NAME;
            var siteDetail = await db.insertRecord(siteProdFields, siteProdFieldsValues, tableName, `, pg_id__c`);
           
            if (siteDetail.success) {
                    response.response = { 'success': true, "data": siteDetail.data[0], "message": "Site Product created successfully." };
                    response.status = 200;
                    return response;
            }else{
                console.log(siteDetail);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Site creation failed." };
                response.status = 400;
                return response;
            }
        }else{
                response.response = { 'success': false, "data": {}, "message": "Invalid login user." };
                response.status = 400;
                return response;
        }
    }catch(e){
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }
}


async function editSite(myDetails,siteProdObj){
    try{
        
        if (myDetails.rowCount > 0) {
           
            
            tableName = SITE_PRODUCT_TABLE_NAME;

            fieldValue = [];
            //siteProdFields =`sites__c`,`pg_id__c`,`product__c`,`product_category__c`,`product_sub_category__c`,`product_sub_sub_category__c`,`quantity__c`,`psm__c`,`asm__c`,`createddate`; 

            if(validation.issetNotEmpty(siteProdObj.name))
                fieldValue.push({ "field": "name", "value": siteProdObj.name });
            // if(validation.issetNotEmpty(siteProdObj.sites__c))
            //     fieldValue.push({ "field": "sites__c", "value": siteProdObj.sites__c });
            if(validation.issetNotEmpty(siteProdObj.product__c))
                fieldValue.push({ "field": "product__c", "value": siteProdObj.product__c });
            if(validation.issetNotEmpty(siteProdObj.product_category__c))
                fieldValue.push({ "field": "product_category__c", "value": siteProdObj.product_category__c });
            if(validation.issetNotEmpty(siteProdObj.product_sub_category__c))
                fieldValue.push({ "field": "product_sub_category__c", "value": siteProdObj.product_sub_category__c });
            if(validation.issetNotEmpty(siteProdObj.product_sub_sub_category__c))
                fieldValue.push({ "field": "product_sub_sub_category__c", "value": siteProdObj.product_sub_sub_category__c });
            if(validation.issetNotEmpty(siteProdObj.quantity__c))
                fieldValue.push({ "field": "quantity__c", "value": siteProdObj.quantity__c });
            if(validation.issetNotEmpty(siteProdObj.psm__c))
                fieldValue.push({ "field": "psm__c", "value": siteProdObj.psm__c });
            if(validation.issetNotEmpty(siteProdObj.asm__c))
                fieldValue.push({ "field": "asm__c", "value": siteProdObj.asm__c });
            

            const WhereClouse = [];
            WhereClouse.push({ "field": "pg_id__c", "value": siteProdObj.pg_id__c });
         
            siteDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

            if (siteDetail.success) {
                    response.response = { 'success': true, "data": {  }, "message": "Site Product updated successfully." };
                    response.status = 200;
                    return response;
            }else{
                console.log(siteDetail);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Site update failed." };
                response.status = 400;
                return response;
            }
        }else{
                response.response = { 'success': false, "data": {}, "message": "Invalid login user." };
                response.status = 400;
                return response;
        }
    }catch(e){
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal server error." };
        response.status = 500;
        return response;

    }
}




 
        
        
        