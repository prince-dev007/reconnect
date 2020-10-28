var db = require(`${PROJECT_DIR}/utility/selectQueries`);
const uuidv4 = require('uuid/v4');
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
var response = { "status": 200, "response": "" };
var validation = require(`${PROJECT_DIR}/utility/validation`);




module.exports = {
    addContact,
    editContact
};
async function addContact(myDetails,contactObj){
    try{
        
        if (myDetails.rowCount > 0) {
            
            contactFields =`firstname,lastname,pg_id__c,asm__c,area__c,attached_dealer__c,attached_retailer__c,business_so_far__c,business_this_month__c,meets_attended__c,psm__c,phone,potential__c,status__c,title,email,createddate`; 
            var UUID_Contact = uuidv4();
            var createdDate = dtUtil.todayDatetime();
            retailerID= '0122w000000NfMlAAK';
            dealerID = '0122w000000NdOTAA0';
            contactFieldsValues =[contactObj.firstname,contactObj.lastname,UUID_Contact, contactObj.asm__c, contactObj.area__c, contactObj.dealerID, contactObj.retailerID, contactObj.business_so_far__c, contactObj.business_this_month__c, contactObj.meets_attended__c, contactObj.psm__c, contactObj.phone, contactObj.potential__c, contactObj.status__c, contactObj.title,contactObj.email, createdDate];
            
            tableName = 'contact';
            var contactDetail = await db.insertRecord(contactFields, contactFieldsValues, tableName, `, pg_id__c`);
           
            if (contactDetail.success) {
                    response.response = { 'success': true, "data": contactDetail.data[0], "message": "Contact created successfully." };
                    response.status = 200;
                    return response;
            }else{
                console.log(contactDetail);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Contact creation failed." };
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


async function editContact(myDetails,contactObj){
    try{
        
        if (myDetails.rowCount > 0) {
           
            
            tableName = 'contact';

            fieldValue = [];
            // contactFields =`firstname,lastname,pg_id__c,asm__c,
           // `area__c,attached_dealer__c,attached_retailer__c,business_so_far__c,business_this_month__c,category__c,meets_attended__c,mobilephone,psm__c,phone,potential__c,status__c,title,createddate`; 
            if(validation.issetNotEmpty(contactObj.firstname))
                fieldValue.push({ "field": "firstname", "value": contactObj.firstname });
            if(validation.issetNotEmpty(contactObj.lastname))
                fieldValue.push({ "field": "lastname", "value": contactObj.lastname });
            if(validation.issetNotEmpty(contactObj.lastname))
            fieldValue.push({ "field": "asm__c", "value": contactObj.asm__c });
            
            if(validation.issetNotEmpty(contactObj.area__c))
                fieldValue.push({ "field": "area__c", "value": contactObj.area__c });
            if(validation.issetNotEmpty(contactObj.attached_dealer__c))
                fieldValue.push({ "field": "attached_dealer__c", "value": contactObj.attached_dealer__c });
            if(validation.issetNotEmpty(contactObj.attached_retailer__c))
                fieldValue.push({ "field": "attached_retailer__c", "value": contactObj.attached_retailer__c });
            if(validation.issetNotEmpty(contactObj.business_so_far__c))
                fieldValue.push({ "field": "business_so_far__c", "value": contactObj.business_so_far__c });
            if(validation.issetNotEmpty(contactObj.business_this_month__c)) 
                fieldValue.push({ "field": "business_this_month__c", "value": contactObj.business_this_month__c });

            fieldValue.push({ "field": "category__c", "value": 'electricians' });
            if(validation.issetNotEmpty(contactObj.meets_attended__c))
                fieldValue.push({ "field": "meets_attended__c", "value": contactObj.meets_attended__c });
                //fieldValue.push({ "field": "mobilephone", "value": contactObj.mobilephone });
            if(validation.issetNotEmpty(contactObj.psm__c))
                fieldValue.push({ "field": "psm__c", "value": contactObj.psm__c });
            if(validation.issetNotEmpty(contactObj.potential__c))   
                fieldValue.push({ "field": "phone", "value": contactObj.potential__c });
            if(validation.issetNotEmpty(contactObj.potential__c))
                fieldValue.push({ "field": "potential__c", "value": contactObj.potential__c });
            if(validation.issetNotEmpty(contactObj.status__c))
                fieldValue.push({ "field": "status__c", "value": contactObj.status__c });
            if(validation.issetNotEmpty(contactObj.title))
                fieldValue.push({ "field": "title", "value": contactObj.title });
            if(validation.issetNotEmpty(contactObj.email))
                fieldValue.push({ "field": "email", "value": contactObj.email });

            const WhereClouse = [];
            WhereClouse.push({ "field": "pg_id__c", "value": contactObj.pg_id__c,"field":"Attached_retailer__c","value":"0122w000000NfMlAAK","field":"Attached_Dealer__c","value":"0122w000000NdOTAA0" });
         
            contactDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

            if (contactDetail.success) {
                    response.response = { 'success': true, "data": {  }, "message": "Contact updated successfully." };
                    response.status = 200;
                    return response;
            }else{
                console.log(contactDetail);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Contact update failed." };
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




 
        
        
        