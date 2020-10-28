var db = require(`${PROJECT_DIR}/utility/selectQueries`);
const uuidv4 = require('uuid/v4');
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
var response = { "status": 200, "response": "" };
var validation = require(`${PROJECT_DIR}/utility/validation`);




module.exports = {
    addSite,
    editSite
};
var SITE_TABLE_NAME = `sites__c`;
async function addSite(myDetails,siteObj){
    try{
        
        if (myDetails.rowCount > 0) {
            siteFields =`name, pg_id__c, address_line_1__c, address_line_2__c, alternate_phone_no__c, area__c, asm__c,  dealer__c, email__c, phone__c, project_type__c, retailer__c, site_name__c,site_stages__c, size__c, source__c, status__c,source_type__c, createddate`; // ,
            var UUID_Site = uuidv4();
            var createdDate = dtUtil.todayDatetime();
            siteFieldsValues =[(siteObj.name)?siteObj.name:null, 
                UUID_Site,
                (siteObj.address_line_1__c)?siteObj.address_line_1__c:null, 
                (siteObj.address_line_2__c)?siteObj.address_line_2__c:null, 
                (siteObj.alternate_phone_no__c)?siteObj.alternate_phone_no__c:null, 
                (siteObj.area__c)?siteObj.area__c:null, 
                (siteObj.asm__c)?siteObj.asm__c:null, 
                //(siteObj.city__c)?siteObj.city__c:null, 
                (siteObj.dealer__c)?siteObj.dealer__c:null, 
                (siteObj.email__c)?siteObj.email__c:null, 
                (siteObj.phone__c)?siteObj.phone__c:null, 
                (siteObj.project_type__c)?siteObj.project_type__c:null, 
                (siteObj.retailer__c)?siteObj.retailer__c:null, 
                (siteObj.site_name__c)?siteObj.site_name__c:null, 
                (siteObj.site_stages__c)?siteObj.site_stages__c:null, 
                (siteObj.size__c)?siteObj.size__c:null, 
                (siteObj.source__c)?siteObj.source__c:null, 
                (siteObj.status__c)?siteObj.status__c:null, 
                (siteObj.source_type__c)?siteObj.source_type__c:null, 
                createdDate]; //
            
            tableName = SITE_TABLE_NAME;
            var siteDetail = await db.insertRecord(siteFields, siteFieldsValues, tableName, `, pg_id__c`);
           
            if (siteDetail.success) {
                    response.response = { 'success': true, "data": siteDetail.data[0], "message": "Site created successfully." };
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


async function editSite(myDetails,siteObj){
    try{
        
        if (myDetails.rowCount > 0 && siteObj.pg_id__c!=undefined && siteObj.pg_id__c!='' ) {
           
            
            tableName = SITE_TABLE_NAME;

            fieldValue = [];
            //siteFields =`name, pg_id__c, address_line_1__c, address_line_2__c, alternate_phone_no__c, area__c, asm__c, city__c, dealer__c, email__c, phone__c, project_type__c, retailer__c, site_name__c, site_stages__c, size__c, source__c, status__c,
            if(validation.issetNotEmpty(siteObj.name))
                fieldValue.push({ "field": "name", "value": siteObj.name });
            if(validation.issetNotEmpty(siteObj.address_line_1__c))
                fieldValue.push({ "field": "address_line_1__c", "value": siteObj.address_line_1__c });
            if(validation.issetNotEmpty(siteObj.address_line_2__c))
                fieldValue.push({ "field": "address_line_2__c", "value": siteObj.address_line_2__c });
            if(validation.issetNotEmpty(siteObj.alternate_phone_no__c))
                fieldValue.push({ "field": "alternate_phone_no__c", "value": siteObj.alternate_phone_no__c });
            if(validation.issetNotEmpty(siteObj.area__c))
                fieldValue.push({ "field": "area__c", "value": siteObj.area__c });
            if(validation.issetNotEmpty(siteObj.asm__c))
                fieldValue.push({ "field": "asm__c", "value": siteObj.asm__c });
            // if(validation.issetNotEmpty(siteObj.city__c))
            //     fieldValue.push({ "field": "city__c", "value": siteObj.city__c });
            if(validation.issetNotEmpty(siteObj.dealer__c))
                fieldValue.push({ "field": "dealer__c", "value": siteObj.dealer__c });
            if(validation.issetNotEmpty(siteObj.email__c))
                fieldValue.push({ "field": "email__c", "value": siteObj.email__c });
            if(validation.issetNotEmpty(siteObj.phone__c))
                fieldValue.push({ "field": "phone__c", "value": siteObj.phone__c });
            if(validation.issetNotEmpty(siteObj.project_type__c))
                fieldValue.push({ "field": "project_type__c", "value": siteObj.project_type__c });
            if(validation.issetNotEmpty(siteObj.retailer__c))
                fieldValue.push({ "field": "retailer__c", "value": siteObj.retailer__c });
            // if(validation.issetNotEmpty(siteObj.site_name__c))
            //     fieldValue.push({ "field": "site_name__c", "value": siteObj.site_name__c });
            if(validation.issetNotEmpty(siteObj.site_stages__c))
                fieldValue.push({ "field": "site_stages__c", "value": siteObj.site_stages__c });
            if(validation.issetNotEmpty(siteObj.size__c))
                fieldValue.push({ "field": "size__c", "value": siteObj.size__c });
            if(validation.issetNotEmpty(siteObj.source__c))
                fieldValue.push({ "field": "source__c", "value": siteObj.source__c });
            if(validation.issetNotEmpty(siteObj.status__c))
                fieldValue.push({ "field": "status__c", "value": siteObj.status__c });
            if(validation.issetNotEmpty(siteObj.source_type__c))
                fieldValue.push({ "field": "source_type__c", "value": siteObj.source_type__c });

            const WhereClouse = [];
            WhereClouse.push({ "field": "pg_id__c", "value": siteObj.pg_id__c });
         
            siteDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

            if (siteDetail.success) {
                    response.response = { 'success': true, "data": {  }, "message": "Site updated successfully." };
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




 
        
        
        