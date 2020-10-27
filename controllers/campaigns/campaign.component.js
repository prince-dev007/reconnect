var db = require(`${PROJECT_DIR}/utility/selectQueries`);
const uuidv4 = require('uuid/v4');
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
var response = { "status": 200, "response": "" };




module.exports = {
    addCampaign,
    editCampaign
};
async function addCampaign(myDetails,campaign){
    try{
        
        if (myDetails.rowCount > 0) {
            campaignFields =`pg_id__c,  actual__c, approved_by__c, campaign_budget__c, name,  gift__c, reuested_by__c, status__c, type__c, venue__c, createddate`;
            var UUID_Order = uuidv4();
            var createdDate = dtUtil.todayDatetime();
            campaignFieldsValues = [UUID_Order, campaign.actual__c, campaign.approved_by__c, campaign.campaign_budget__c, campaign.name,  campaign.gift__c, campaign.reuested_by__c, campaign.status__c, campaign.type__c, campaign.venue__c, createdDate];
            tableName = 'campaign__c';
            var campaignDetail = await db.insertRecord(campaignFields, campaignFieldsValues, tableName);
            // var campaignDetail = {};
            // campaignDetail.success = false;
            
            if (campaignDetail.success) {
                    response.response = { 'success': true, "data": {  }, "message": "Campaign created successfully." };
                    response.status = 200;
                    return response;
            }else{
                console.log(campaignDetail);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Campaign creation failed." };
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


async function editCampaign(myDetails,campaign){
    try{
        
        if (myDetails.rowCount > 0) {
           
            
            tableName = 'campaign__c';

            fieldValue = [];
            fieldValue.push({ "field": "actual__c", "value": campaign.actual__c });
            fieldValue.push({ "field": "approved_by__c", "value": campaign.approved_by__c });
            fieldValue.push({ "field": "campaign_budget__c", "value": campaign.campaign_budget__c });
            fieldValue.push({ "field": "name", "value": campaign.name });
            fieldValue.push({ "field": "gift__c", "value": campaign.gift__c });
            fieldValue.push({ "field": "status__c", "value": campaign.status__c });
            fieldValue.push({ "field": "reuested_by__c", "value": campaign.reuested_by__c });
            fieldValue.push({ "field": "type__c", "value": campaign.type__c });
            fieldValue.push({ "field": "venue__c", "value": campaign.venue__c });

            const WhereClouse = [];
            WhereClouse.push({ "field": "pg_id__c", "value": campaign.pg_id__c });
         
            campaignDetail = await db.updateRecord(tableName, fieldValue, WhereClouse);

            // var campaignDetail = {};
            // campaignDetail.success = false;
            
            if (campaignDetail.success) {
                    response.response = { 'success': true, "data": {  }, "message": "Campaign updated successfully." };
                    response.status = 200;
                    return response;
            }else{
                console.log(campaignDetail);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Campaign update failed." };
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




 
        
        
        