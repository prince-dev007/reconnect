var _ = require('lodash');
var validator = require('validator');
var dateTime = require('node-datetime');
var validation = require(`${PROJECT_DIR}/utility/validation`);
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
var component = require(`${PROJECT_DIR}/controllers/meetings/meeting.component`);
var response = { "status": 200, "response": "" };
var dashboard = require(`${PROJECT_DIR}/controllers/dashboard/dashboard.service`);
const fs = require('fs');
const uuidv4 = require('uuid/v4');


module.exports = {
    getAll,
    planVisit,
    addVisitInfo,
    editVisit,
    startVisit,
    cancelCloseVisit,
    detail,
    meetings,
    add,
    todayVisitCount,
    visitbytours
};
var offset = '0'; limit = '1000';
/**
 * Get all visit according to date range 
 * Data pulled from following tables Visit, Account, Area, City
 * @param {*} offset : Optional
 * @param {*} limit : Optional
 * @param {*} agentid : mandatory
 * @param {*} startDate : mandatory
 * @param {*} endDate : mandatory
 */
async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.startDate) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.endDate) : false;

        if (is_Validate) {

            // `CASE WHEN ${SF_VISIT_TABLE_NAME}.sfid is null  THEN ${SF_VISIT_TABLE_NAME}.pg_id__c ELSE ${SF_VISIT_TABLE_NAME}.sfid END `
            const fieldsArray = [
                `CASE WHEN ${SF_VISIT_TABLE_NAME}.sfid is null  THEN ${SF_VISIT_TABLE_NAME}.pg_id__c ELSE ${SF_VISIT_TABLE_NAME}.sfid END`,
                `${SF_VISIT_TABLE_NAME}.ASM__c	`,
                `${SF_VISIT_TABLE_NAME}.Assigned_by__c`,
                `${SF_VISIT_TABLE_NAME}.Cancelled_Reason__c`,
                `${SF_VISIT_TABLE_NAME}.Checkin_Location__Latitude__s`,
                `${SF_VISIT_TABLE_NAME}.Checkin_Location__Longitude__s`,
                `${SF_VISIT_TABLE_NAME}.Checkin_Time__c`,
                `date_part('epoch'::text, ${SF_VISIT_TABLE_NAME}.createddate) * (1000)::double precision as createddate`,
                `${SF_VISIT_TABLE_NAME}.Location_Matched__c`,
                `${SF_VISIT_TABLE_NAME}.Name`,
                `${SF_VISIT_TABLE_NAME}.Next_Scheduled_Date__c`,
                `${SF_VISIT_TABLE_NAME}.Picture__c`,
                `${SF_VISIT_TABLE_NAME}.Pricing_and_Scheme_Info__c`,
                `${SF_VISIT_TABLE_NAME}.Retailer_Dealer_Location__Latitude__s`,
                `${SF_VISIT_TABLE_NAME}.Retailer_Dealer_Location__Longitude__s`,
                `${SF_VISIT_TABLE_NAME}.Retailer_Dealer__c`,
                `${SF_VISIT_TABLE_NAME}.Send_Marketing_Material__c`,
                `${SF_VISIT_TABLE_NAME}.Sequence_No__c`,
                `${SF_VISIT_TABLE_NAME}.Status__c`,
                `${SF_VISIT_TABLE_NAME}.Summary__c`,
                `${SF_VISIT_TABLE_NAME}.Top_Visible_Brand__c`,
                `${SF_VISIT_TABLE_NAME}.Visibility_Level__c`,
                `date_part('epoch'::text, ${SF_VISIT_TABLE_NAME}.visit_date__c) * (1000)::double precision as visit_date__c`,
                `${SF_VISIT_TABLE_NAME}.Visit_Day__c`,
                `${SF_VISIT_TABLE_NAME}.visit_owner__c as psm__c`,
                `${SF_VISIT_TABLE_NAME}.pg_id__c`,
                `account.area__c`,
                `account.mobile__c`,
                `account.name as seller_name`,
                `account.type1__c`,
                `account.category__c`,
                `account.retailer_category__c`,
                `Area_SS__c.name as area_name`,
                `Area_SS__c.city__c`,
                `City_SS__c.name as city_name`,
                `Area_SS__c.State__c`,
                `${SF_VISIT_TABLE_NAME}.check_out_address__c`,
                `${SF_VISIT_TABLE_NAME}.check_in_address__c`
            ];

            const tableName = SF_VISIT_TABLE_NAME;

            const WhereClouse = [];

            teamDetail = await db.getAsmHirarchy(req.headers.agentid);
            if (teamDetail.success) {
                if (teamDetail.memberType == 'PSM') {
                    WhereClouse.push({ "fieldName": `${SF_VISIT_TABLE_NAME}.visit_owner__c`, "fieldValue": req.headers.agentid })
                } else {
                    WhereClouse.push({ "fieldName": `${SF_VISIT_TABLE_NAME}.asm__c`, "fieldValue": teamDetail.ASM, "type": "IN" })
                }

                if (validation.issetNotEmpty(req.query.status__c) && validation.issetNotEmpty(req.query.status__c)) {

                    if (req.query.status__c == 'unexecuted') {
                        // TO DO 
                        WhereClouse.push({ "fieldName": `${SF_VISIT_TABLE_NAME}.status__c`, "fieldValue": `${req.query.status__c}` });

                    } else {

                        WhereClouse.push({ "fieldName": `${SF_VISIT_TABLE_NAME}.status__c`, "fieldValue": `${req.query.status__c}` });
                    }
                }
                if (validation.issetNotEmpty(req.query.startDate) && validation.issetNotEmpty(req.query.endDate)) {
                    req.query.startDate = dtUtil.removeMiliSec(req.query.startDate);
                    req.query.endDate = dtUtil.removeMiliSec(req.query.endDate);

                    var startDate = dtUtil.timestampToDate(req.query.startDate, "YYYY-MM-DD");
                    var endDate = dtUtil.timestampToDate(req.query.endDate, "YYYY-MM-DD");

                    WhereClouse.push({ "fieldName": `${SF_VISIT_TABLE_NAME}.visit_date__c`, "fieldValue": `'${startDate}' and '${endDate}'`, "type": "BETWEEN" });
                }

                if (validation.issetNotEmpty(req.query.offset)) {
                    offset = req.query.offset;
                }
                if (validation.issetNotEmpty(req.query.limit)) {
                    limit = req.query.limit;
                }

                joins = [
                    {
                        "type": "LEFT",
                        "table_name": "account",
                        "p_table_field": `${SF_VISIT_TABLE_NAME}.retailer_dealer__c`,
                        "s_table_field": "account.sfid"
                    },
                    {
                        "type": "LEFT",
                        "table_name": "Area_SS__c",
                        "p_table_field": `account.area__c`,
                        "s_table_field": "Area_SS__c.sfid"
                    },
                    {
                        "type": "LEFT",
                        "table_name": "City_SS__c",
                        "p_table_field": `Area_SS__c.city__c`,
                        "s_table_field": "City_SS__c.sfid"
                    }
                ];
                orderBy = ` order by visit_date__c asc`;
                // construct SQL
                var sql = db.fetchAllWithJoinQry(fieldsArray, tableName, joins, WhereClouse, offset, limit, orderBy);

                console.log(`INFO::: All Visits =======   ${sql}`);
                var meetings = await client.query(sql);

                if (meetings.rowCount != undefined && meetings.rowCount > 0) {
                    // Get Dealer and Retailed Id array
                    var sellerdetails = await component.getAllSellersId(meetings.rows);
                    // Get Retailers Order
                    var retailerOrders = await component.getRetailerOrder(sellerdetails);
                    // Get Dealers order
                    var dealerOrders = await component.getDealerOrder(sellerdetails);
                    // MAP Orders with details and Retailers
                    var visitsWithLastOrder = await component.mapOrdersWithSellers(meetings.rows, retailerOrders, dealerOrders);

                    // Prepair response in expected format which will be consumed by mobile app.
                    var responseData = await component.processVisits(visitsWithLastOrder);

                    response.response = { 'success': true, 'count': meetings.rowCount, "data": responseData };

                    response.status = 200;
                    return response;
                } else {
                    response.response = { 'success': false, "data": { "visits": [] }, "message": "No record found." };
                    response.status = 400;
                    return response;
                }
            } else {
                response.response = { 'success': false, "data": { "visits": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }

        } else {
            response.response = { 'success': false, "data": { "visits": [] }, "message": "Mandatory parameters are  missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log('ERROR::: ', e)
        response.response = { 'success': false, "data": { "visits": [] }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}


async function detail(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.visit_id) : false;
        console.log(req.query);
        console.log(req.query.visit_id);
        console.log(`is_Validate >>> `);
        if (is_Validate) {

            const tableName = SF_VISIT_TABLE_NAME;
            const fieldsArray = [`sfid`, 
            `PG_ID__c`, 
            `Approval_Status__c`, 
            `Approver__c`, 
            `ASM__c`, 
            `Assigned_by__c`, 
            `Cancelled_Reason__c`, 
            `Check_out_Time__c`, 
            `Checkin_Time__c`,
            `Location_Matched__c`,
            `Next_Scheduled_Date__c`,
            `Picture__c`,
            `PSM__c`,
            `Retailer_Dealer__c`, 
            `Retailer_Dealer_Location__Latitude__s`,
            `Retailer_Dealer_Location__Longitude__s`, 
            `Send_Marketing_Material__c`,
            `Sequence_No__c`, 
            `Status__c`,
            `Summary__c`,
            `Top_Visible_Brand__c`, 
            `Visibility_Level__c`, 
            `date_part('epoch'::text, visit_date__c) * (1000)::double precision as visit_date__c`, 
            `Visit_Day__c`,
            `Name`,  
            `Visit_Type__c`,
            `check_out_address__c`,
            `check_in_address__c`];
            //SF_VISIT_FIELD;
            const WhereClouse = [];
            
            if (validation.issetNotEmpty(req.query.visit_id)) {
                WhereClouse.push({ "fieldName": `${SF_VISIT_TABLE_NAME}.pg_id__c`, "fieldValue": `${req.query.visit_id}`});
            }

            joins = [];
            orderBy = ` order by visit_date__c asc`;
            // construct SQL
            var sql = db.fetchAllWithJoinQry(fieldsArray, tableName, joins, WhereClouse, '0', '1', '');

            console.log(`INFO::: All Visits =======   ${sql}`);
            var visitDetail = await client.query(sql);
            
            if (visitDetail.rowCount != undefined && visitDetail.rowCount > 0) {
                response.status = 200;
                response.response = { "success": true, "message": "", "data":visitDetail.rows[0] };
                return response;
            }else{
                response.status = 400;
                response.response = { "success": false, "message": "No record found.", "data":"" };
                return response;    
            }
                
                
                
                // let sql = `SELECT * FROM public.meetings where id='${meetingId}' limit 1`;
                // var meetingDetail = await client.query(sql);
                
                // if (meetingDetail.rowCount != undefined && meetingDetail.rowCount > 0) {
                //     return meetingDetail.rows[0];
                // }
        }else{
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing." };
            return response;
        }
    } catch (e) {
        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server missing." };
        return response;
    }
}


/**
 * Functions is using to create plan visit using mobile UI
 * @param {*} retailer_dealer__c : Mandatory
 * @param {*} visit_date__c : Mandatory
 * @param {*} createddate : Mandatory
 * @author Rohit Ramawat
 */

async function planVisit(req) {
    try {  console.log('req.body  >>>> ', req.body);
        if (!_.isEmpty(req.body)) {
            
            is_Validate = true;
           
            if(req.body.length > 0){
                req.body.forEach(element => { 
                    is_Validate = is_Validate ? validation.issetNotEmpty(element.retailer_dealer__c) : false;
                    is_Validate = is_Validate ? validation.isValidDate(element.visit_date__c) : false;
                    is_Validate = is_Validate ? validation.isValidDate(element.createddate) : false;
                    is_Validate = is_Validate ? validation.issetNotEmpty(element.psm__c) : false; //visit_owner__c
                    //is_Validate = is_Validate ? validation.issetNotEmpty(element.city__c) : false //visit_owner__c
                    
                })
            }
            console.log('is_Validate  ==>> ', is_Validate)
            if (is_Validate) {
                // Get login agent detail
                myDetails = await db.agentDetail(req.headers.agentid);
                isValidManager = true;
                errorMessage = false;
                // Get field valued to create Visit .
                var processResponse = await component.planVisitProcessRecords(req.body, myDetails, req.headers.agentid);
               
                //console.log('INFO::: Visit fieldValues ===> ',processResponse.fieldValues);
              
                tableName = 'visits__c';
               
                if (processResponse.isValidManager) {
                    fieldsToBeInsert = 'pg_id__c,Assigned_by__c, visit_owner__c, asm__c, retailer_dealer__c, status__c, visit_date__c,createddate,visit_type__c';

                    sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${fieldsToBeInsert}) VALUES ${processResponse.fieldValues}`;
                    
                    sql += ` RETURNING id,pg_id__c,sfid`;
                    console.log('--------------------------------------')
                    console.log('INFO::: INSERT VISIT SQL = ',sql)
                    console.log('--------------------------------------')

                    visitDetail =  await db.getDbResult(sql)
                    
                    console.log('INFO:::: response   =  ', visitDetail);

                    if (visitDetail.rowCount > 0) {
                        var visits = await component.getVisitsByPGID(req.headers.agentid, visitDetail.rows);
                        response.status = 200;
                        response.response = { "success": true, "message": "Record created successfully.", "data": visits };
                    } else {

                        response.status = 400;
                        response.response = { "success": false, "message": "Error while create record. Please try again.", "data": {} };
                    }
                } else {

                    response.status = 400;
                    response.response = { "success": false, "message": (errorMessage)?errorMessage:"Please select valid PSM for this visit.", "data": {} };

                }

                return response;
            } else {

                response.status = 400;
                response.response = { "success": false, "message": "Mandatory parameter(s) are missing.", "data": {} };
                return response;
            }
        
        }
    } catch (e) {

        console.log(`EROR::: `, e)
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error.", "data": {} };
        return response;

    }
}


const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.CLOUDCUBE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDCUBE_SECRET_ACCESS_KEY,
    region: 'us-west-2' //process.env.CLOUDCUBE_REGION
  });
var path = require("path");

async function uploadFile(reqBody,visitDetail) {
    console.log('====================>>>>>>> ');
    console.log('file upload started >>>>>>> ');
    if (validation.issetNotEmpty(reqBody.picture__c) && validation.issetNotEmpty(reqBody.file_name) && visitDetail[0] != undefined) {
        
        console.log('Validation True ');
        
        fileName = reqBody.picture__c;
        var fileExt = path.extname(reqBody.file_name);
        var newfileName = uuidv4()+fileExt;
        
        var filePath = PROJECT_DIR + '/public/uploads/visits/';
        
        console.log('filePath >> ', filePath);

        fs.writeFile(filePath + newfileName, reqBody.picture__c, 'base64',async function (err, data) {
        
            if (!err) {
                console.log('File Write done >> ');

                fs.readFile(filePath + newfileName, async (err, data) => {
                    console.log('   filePath + newfileName  ', filePath + newfileName);
                   
                    

                    if (!err) {
                        console.log('Read File >> ');
                        var fileStream = fs.createReadStream(filePath + newfileName);
                        fileStream.on('error', function(err) {
                            console.log('File Error', err);
                        });
                        const params = {
                            Bucket: 'cloud-cube',
                            Key: 'safvczft2wy1/public/cns_retail/' + newfileName,
                            Body: fileStream, //JSON.stringify(data, null, 2)
                            ContentType: 'image/jpeg'
                        };
                        s3.upload(params,async function (s3Err, data) {
                            
                            if (s3Err) {
                                console.log('ERROR::: s3Err = ', s3Err);
                                fs.unlinkSync(filePath + newfileName);
                                return { "success": false, "data": "" };
                            } else {
                                console.log('');
                                var UUIDVal = uuidv4();
                                console.log('data >>> ', data);
                                console.log(`INFO:::  File uploaded successfully at ${data.ETag}`)
                                console.log(`INFO:::  File uploaded successfully at ${data.Location}`)
                                console.log(`INFO:::  File uploaded successfully at ${data.key}`)
                                console.log(`INFO:::  File uploaded successfully at ${data.Bucket}`)
                                file_TABLE = 'aws_files__c';
                                if(visitDetail[0].sfid!=undefined && visitDetail[0].sfid!=null){
                                    filetargetFields = 'pg_id__c, bucket__c, etag__c, key__c, location__c, visit_pg_id__c, visit__c';
                                    filetargetFieldsValues = [`${UUIDVal}`, `${data.Bucket}`, `${data.ETag}`, `${data.key}`, `${data.Location}`, `${visitDetail[0].pg_id__c}`, `${visitDetail[0].sfid}`];
                                }else{
                                    filetargetFields = 'pg_id__c, bucket__c, etag__c, key__c, location__c, visit_pg_id__c';
                                    filetargetFieldsValues = [`${UUIDVal}`, `${data.Bucket}`, `${data.ETag}`, `${data.key}`, `${data.Location}`, `${visitDetail[0].pg_id__c}`];
                                }
                                
                                console.log('visitDetail',visitDetail)
                                insertTarget = await db.insertRecord(filetargetFields, filetargetFieldsValues, file_TABLE);
                                setTimeout(function(){
                                    fs.unlinkSync(filePath + newfileName)}, 10000
                                );
                                return { "success": false, "data": data };
                            } //throw s3Err
                        }); 
                    } else {
                        return { "success": false, "data": "" };
                    }
                    
                });
            } else {
                console.log('err >>>> ', err );
                return { "success": false, "data": "" };
            }
        });
    }
}

function uploadImages(reqBody) {
    if (reqBody.picture__c != null) {

        writeFile(reqBody.file_name, reqBody.picture__c, 'base64',
            function (err, data) {
                if (err) {
                    console.log('err', err);
                }
                console.log('success');

            });
    }


}


async function addVisitInfo(req) {

    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.visit_id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.top_visible_brand__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.pricing_and_scheme_info__c) : false;
        //is_Validate = is_Validate ? validation.issetNotEmpty(req.body.picture__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.summary__c) : false;
        
        is_Validate = is_Validate ? validation.isPicklistValueValid(req.body.visibility_level__c,'Visit','visibility_level__c',true) : false;
        is_Validate = is_Validate ? validation.isPicklistValueValid(req.body.send_marketing_material__c,'Visit','send_marketing_material__c',true) : false;
        console.log('is_Validate',is_Validate);
        //console.log('PICTURE >>>>  ',req.body.picture__c);
        console.log('file_name >>>> ',req.body.file_name);
        if (is_Validate) {

            // Check is valid ASM/PSM
            myDetails = await db.agentDetail(req.headers.agentid);

            // Get Visit Info visit_id
            visit_fields = [`sfid`,`pg_id__c`];
            visit_tablename = SF_VISIT_TABLE_NAME;

            const visit_WhereClouse = [];
            if(req.query.visit_id.length > 18){
                visit_WhereClouse.push({ "fieldName": "pg_id__c", "fieldValue": req.query.visit_id });
            }else{
                visit_WhereClouse.push({ "fieldName": "sfid", "fieldValue": req.query.visit_id });
            }

            if (myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'PSM') {
                visit_WhereClouse.push({ "fieldName": "visit_owner__c", "fieldValue": req.headers.agentid });
                //visit_WhereClouse.push({ "fieldName": "psm__c", "fieldValue": req.headers.agentid }); // TODO:: will be removed
            } else if (myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'ASM') {
                visit_WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
            }

            visit_sql = db.SelectAllQry(visit_fields, visit_tablename, visit_WhereClouse, '0', '1', '');

            console.log('visit_sql >>>>  ', visit_sql);
            var visitDetail = await client.query(visit_sql);

            if (visitDetail.rowCount > 0 && myDetails.rowCount > 0) {

                // Upload Images
                req.body['visit_id'] = req.query.visit_id;
                fileDetails = await uploadFile(req.body,visitDetail.rows);
                console.log('fileDetails >>> ',fileDetails)
                

                fieldValue = [];
                fieldValue.push({ "field": "visibility_level__c", "value": req.body.visibility_level__c });
                fieldValue.push({ "field": "top_visible_brand__c", "value": req.body.top_visible_brand__c });
                fieldValue.push({ "field": "pricing_and_scheme_info__c", "value": req.body.pricing_and_scheme_info__c });
                //fieldValue.push({ "field": "picture__c", "value": req.body.picture__c });
                fieldValue.push({ "field": "send_marketing_material__c", "value": req.body.send_marketing_material__c });
                fieldValue.push({ "field": "summary__c", "value": req.body.summary__c });

                const WhereClouse = [];

                if(req.query.visit_id.length > 18){
                    WhereClouse.push({ "field": "pg_id__c", "value": req.query.visit_id });
                }else{
                    WhereClouse.push({ "field": "sfid", "value": req.query.visit_id });
                }
                console.log('WhereClouse >>> ', WhereClouse);
                visitInfo = await db.updateRecord(visit_tablename, fieldValue, WhereClouse)

                console.log('INFO:::: 380 visitInfo >>>> ', visitInfo);

                if (visitInfo.success) {
                    response.status = 200;
                    delete visitInfo.data;
                    response.response = visitInfo;
                    return response;
                } else {
                    response.status = 400;
                    response.response = { "success": false, "message": "Invalid details for posting visit info." };
                    return response;
                }
            } else {
                response.status = 400;
                response.response = { "success": false, "message": "Invalid details for posting visit info." };
                return response;
            }
        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameters are missing." };
            return response;
        }

    } catch (e) {
        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server missing." };
        return response;
    }
}



async function editVisit(req) {

    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.visit_id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;

        is_Validate = is_Validate ? validation.isValidDate(req.body.visit_date__c) : false;
        //is_Validate = is_Validate ? validation.issetNotEmpty(req.body.visit_owner__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.psm__c) : false;
        
        is_Validate = is_Validate ? validation.isPicklistValueValid(req.body.status__c,'Visit','status__c',true) : false;


        if (is_Validate) {
            console.log('EDIT visit >>> ', req.body);
            req.body.visit_date__c = dtUtil.removeMiliSec(req.body.visit_date__c);
              
            // Check is valid ASM/PSM
            myDetails = await db.agentDetail(req.headers.agentid);
            asm = null, psm = null;

            fieldValue = [];

            visit_fields = [`sfid`];
            visit_tablename = SF_VISIT_TABLE_NAME;
            const visit_WhereClouse = [];
            
            if(req.query.visit_id.length > 18){
                visit_WhereClouse.push({ "fieldName": "pg_id__c", "fieldValue": req.query.visit_id });
            }else{
                visit_WhereClouse.push({ "fieldName": "sfid", "fieldValue": req.query.visit_id });
            }
            error = false, errorMessage = false;

            if (myDetails.rowCount > 0) {

                if (validation.issetNotEmpty(myDetails.rows[0].member_type) && myDetails.rows[0].member_type == 'ASM') {

                    //fieldValue.push({ "field": "visit_owner__c", "value": req.body.visit_owner__c });
                    fieldValue.push({ "field": "visit_owner__c", "value": req.body.psm__c });
                    fieldValue.push({ "field": "asm__c", "value": req.headers.agentid });
                    visit_WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
                
                    
                } else if (validation.issetNotEmpty(myDetails.rows[0].member_type) && myDetails.rows[0].member_type == 'PSM') {
                    fieldValue.push({ "field": "visit_owner__c", "value": req.headers.agentid });
                    visit_WhereClouse.push({ "fieldName": "visit_owner__c", "fieldValue": req.headers.agentid });
                }

                // Get Visit Info visit_id
                visit_sql = db.SelectAllQry(visit_fields, visit_tablename, visit_WhereClouse, '0', '1', '');

                console.log('visit_sql >>>>  ', visit_sql);
                var visitDetail = await client.query(visit_sql);

                if (visitDetail.rowCount > 0 && myDetails.rowCount > 0 && !error) {
                   
                    var visit_date__c = dtUtil.timestampToDate(req.body.visit_date__c, "YYYY-MM-DD");

                    fieldValue = [];
                    fieldValue.push({ "field": "visit_date__c", "value": visit_date__c });
                    fieldValue.push({ "field": "status__c", "value": req.body.status__c });

                    if (validation.issetNotEmpty(req.body.summary__c)) {
                        fieldValue.push({ "field": "summary__c", "value": req.body.summary__c });
                    }

                    const WhereClouse = [];
                    if(req.query.visit_id.length > 18){
                        WhereClouse.push({ "field": "pg_id__c", "value": req.query.visit_id });
                    }else{
                        WhereClouse.push({ "field": "sfid", "value": req.query.visit_id });
                    }
                   

                    visitInfo = await db.updateRecord(visit_tablename, fieldValue, WhereClouse)

                    console.log('INFO:::: 380 visitInfo >>>> ', visitInfo);

                    if (visitInfo.success) {
                        response.status = 200;
                        delete visitInfo.data;
                        response.response = visitInfo;
                        return response;
                    } else {
                        response.status = 400;
                        response.response = { "success": false, "message": "Invalid details." };
                        return response;
                    }
                } else {
                    response.status = 400;
                    response.response = { "success": false, "message": (errorMessage) ? errorMessage : "Invalid details." };
                    return response;
                }
            } else {
                response.status = 400;
                response.response = { "success": false, "message": "Invalid Login user." };
                return response;
            }

        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameters are missing." };
            return response;
        }

    } catch (e) {
        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server missing." };
        return response;
    }
}


async function startVisit(req) {

    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.visit_id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;

        is_Validate = is_Validate ? validation.isValidDate(req.body.checkin_time__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.checkin_location__latitude__s) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.checkin_location__longitude__s) : false;

        if (is_Validate) {
            var searchInField = `sfid`;
            if((req.query.visit_id.length != 15 || req.query.visit_id.length != 18) && req.query.visit_id.length > 18){
                searchInField = `pg_id__c`;
            }
            // Check is valid ASM/PSM
            myDetails = await db.agentDetail(req.headers.agentid);
            asm = null, psm = null;

            fieldValue = [];

            visit_fields = [`sfid`];
            visit_tablename = SF_VISIT_TABLE_NAME;
            const visit_WhereClouse = [];
            visit_WhereClouse.push({ "fieldName": searchInField, "fieldValue": req.query.visit_id });

            if (myDetails.rowCount > 0) {

                var visit_sequence_no__c = '1';
                var todaysvisit_WhereClouse = [];
                if (validation.issetNotEmpty(myDetails.rows[0].member_type) && myDetails.rows[0].member_type == 'ASM') {
                    todaysvisit_WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
                } else if (validation.issetNotEmpty(myDetails.rows[0].member_type) && myDetails.rows[0].member_type == 'PSM') {
                    todaysvisit_WhereClouse.push({ "fieldName": "visit_owner__c", "fieldValue": req.headers.agentid });
                }
                todaysvisit_WhereClouse.push({ "fieldName": "visit_date__c", "fieldValue": dtUtil.todayDate() });
                todaysvisit_WhereClouse.push({ "fieldName": "sequence_no__c", "type": "NOTNULL" });
                today_visit_sql = db.SelectAllQry(['sfid'], visit_tablename, todaysvisit_WhereClouse, '0', '1000', '');
                
                console.log('today_visit_sql >>>>  ', today_visit_sql);
                var todayVisitDetail = await client.query(today_visit_sql);
                visit_sequence_no__c = todayVisitDetail.rowCount + 1;
                if (validation.issetNotEmpty(myDetails.rows[0].member_type) && myDetails.rows[0].member_type == 'ASM') {
                    visit_WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
                } else if (validation.issetNotEmpty(myDetails.rows[0].member_type) && myDetails.rows[0].member_type == 'PSM') {
                    visit_WhereClouse.push({ "fieldName": "visit_owner__c", "fieldValue": req.headers.agentid });
                }
                visit_WhereClouse.push({ "fieldName": "status__c", "fieldValue": [`Cancelled`,`Completed`, `Started`],"type":"NOTIN" });
                
                visit_WhereClouse.push({ "fieldName": "sfid", "type":"NOTNULL" });

                // Get Visit Info visit_id
                visit_sql = db.SelectAllQry(visit_fields, visit_tablename, visit_WhereClouse, '0', '1', '');

                console.log('visit_sql >>>>  ', visit_sql);
                var visitDetail = await client.query(visit_sql);

                if (visitDetail.rowCount > 0 && myDetails.rowCount > 0) {
                   
                    var checkin_time__c = dtUtil.timestampToDate(req.body.checkin_time__c, "YYYY-MM-DD HH:mm:ss");

                 
                    var checkin_address = await db.getLocationAddr (req.body.checkin_location__latitude__s,req.body.checkin_location__longitude__s);

                    fieldValue = [];
                    fieldValue.push({ "field": "status__c", "value": "Started" });
                    fieldValue.push({ "field": "checkin_time__c", "value": checkin_time__c });
                    fieldValue.push({ "field": "checkin_location__latitude__s", "value": req.body.checkin_location__latitude__s });
                    fieldValue.push({ "field": "checkin_location__longitude__s", "value": req.body.checkin_location__longitude__s });
                    fieldValue.push({ "field": "sequence_no__c", "value": visit_sequence_no__c });
                    fieldValue.push({ "field": "check_in_address__c", "value": checkin_address });

                    const WhereClouse = [];
                    WhereClouse.push({ "field": searchInField, "value": req.query.visit_id });

                    visitInfo = await db.updateRecord(visit_tablename, fieldValue, WhereClouse)

                    console.log('INFO:::: 380 visitInfo >>>> ', visitInfo);

                    if (visitInfo.success) {
                        response.status = 200;
                        delete visitInfo.data;
                        response.response = visitInfo;
                        return response;
                    } else {
                        response.status = 400;
                        response.response = { "success": false, "message": "Invalid details." };
                        return response;
                    }
                } else {
                    response.status = 400;
                    response.response = { "success": false, "message": "Invalid visit id or visit already started/completed." };
                    return response;
                }
            } else {
                response.status = 400;
                response.response = { "success": false, "message": "Invalid Login user." };
                return response;
            }

        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameters are missing." };
            return response;
        }

    } catch (e) {
        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server missing." };
        return response;
    }
}
async function cancelCloseVisit(req) {

    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.visit_id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.isPicklistValueValid(req.body.status__c,'Visit','status__c',true) : false;

        if (is_Validate) {

            // Check is valid ASM/PSM
            myDetails = await db.agentDetail(req.headers.agentid);
            asm = null, psm = null;

            fieldValue = [];

            visit_fields = [`sfid`];
            visit_tablename = SF_VISIT_TABLE_NAME;
            const visit_WhereClouse = [];

            if(req.query.visit_id.length > 18){
                visit_WhereClouse.push({ "fieldName": "pg_id__c", "fieldValue": req.query.visit_id });
            }else{
                visit_WhereClouse.push({ "fieldName": "sfid", "fieldValue": req.query.visit_id });
            }
            

            if (myDetails.rowCount > 0) {

                if (validation.issetNotEmpty(myDetails.rows[0].member_type) && myDetails.rows[0].member_type == 'ASM') {
                    visit_WhereClouse.push({ "fieldName": "asm__c", "fieldValue": req.headers.agentid });
                } else if (validation.issetNotEmpty(myDetails.rows[0].member_type) && myDetails.rows[0].member_type == 'PSM') {
                    visit_WhereClouse.push({ "fieldName": "visit_owner__c", "fieldValue": req.headers.agentid });
                }
                visit_WhereClouse.push({ "fieldName": "status__c", "fieldValue": [`Cancelled`,`Completed`],"type":"NOTIN" });

                // Get Visit Info visit_id
                visit_sql = db.SelectAllQry(visit_fields, visit_tablename, visit_WhereClouse, '0', '1', '');

                console.log('visit_sql >>>>  ', visit_sql);
                var visitDetail = await client.query(visit_sql);

                if (visitDetail.rowCount > 0 && myDetails.rowCount > 0) {
                   
                    fieldValue = [];
                    if(validation.issetNotEmpty(req.body.cancelled_reason__c)){
                        fieldValue.push({ "field": "cancelled_reason__c", "value": req.body.cancelled_reason__c });
                    } 
                    if(validation.issetNotEmpty(req.body.check_out_location__latitude__s)){
                        fieldValue.push({ "field": "check_out_location__latitude__s", "value": req.body.check_out_location__latitude__s });
                    }
                    if(validation.issetNotEmpty(req.body.check_out_location__longitude__s)){
                        fieldValue.push({ "field": "check_out_location__longitude__s", "value": req.body.check_out_location__longitude__s });
                    } 
                    if(validation.issetNotEmpty(req.body.check_out_location__longitude__s) && validation.issetNotEmpty(req.body.check_out_location__latitude__s) ){

                        var checkout_address = await db.getLocationAddr (req.body.check_out_location__latitude__s,req.body.check_out_location__longitude__s);
                        fieldValue.push({ "field": "check_out_address__c", "value": checkout_address });
                    }

                    if(validation.issetNotEmpty(req.body.check_out_time__c) && validation.isValidDate(req.body.check_out_time__c)){
                        var check_out_time__c = dtUtil.timestampToDate(req.body.check_out_time__c, "YYYY-MM-DD HH:mm:ss");
                        fieldValue.push({ "field": "check_out_time__c", "value": check_out_time__c });
                    } 
                    fieldValue.push({ "field": "status__c", "value": req.body.status__c });
                    
                    if(req.body.status__c=='Completed'){
                        fieldValue.push({ "field": "visit_mark_complete__c", "value": "Yes" });

                    }
                    const WhereClouse = [];
                    if(req.query.visit_id.length > 18){
                        WhereClouse.push({ "field": "pg_id__c", "value": req.query.visit_id });
                    }else{
                        WhereClouse.push({ "field": "sfid", "value": req.query.visit_id });
                    }

                    visitInfo = await db.updateRecord(visit_tablename, fieldValue, WhereClouse)

                    console.log('INFO:::: 380 visitInfo >>>> ', visitInfo);

                    if (visitInfo.success) {


                        // Update Visit Target Table
                        dashboard.updateMonthlyTarget(req.headers.agentid,'visit',dtUtil.currentMonth(),{'visits__c':'visits__c+1'});


                        response.status = 200;
                        delete visitInfo.data;
                        response.response = visitInfo;
                        return response;
                    } else {
                        response.status = 400;
                        response.response = { "success": false, "message": "Invalid details." };
                        return response;
                    }
                } else {
                    response.status = 400;
                    response.response = { "success": false, "message": "Invalid visit id or visit has been cancelled or already closed." };
                    return response;
                }
            } else {
                response.status = 400;
                response.response = { "success": false, "message": "Invalid Login user." };
                return response;
            }

        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameters are missing." };
            return response;
        }

    } catch (e) {
        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server missing." };
        return response;
    }
}







// contains(str, seed)
    /**
     * contains(str, seed)
     * equals(str, comparison)	
     * isAfter(str [, date])	
     * isAlpha(str [, locale])	
     * isAlphanumeric(str [, locale])	
     * isBase64(str)	
     * isBefore(str [, date])	
     * isBoolean(str)	
     * isByteLength(str [, options])	
     * isEmail(str [, options])	
     * isEmpty(str [, options])	
     * isFloat(str [, options])	
     */





async function meetings(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? !validator.isEmpty(req.query.offset) : false;
        is_Validate = is_Validate ? !validator.isEmpty(req.query.limit) : false;

        if (is_Validate) {
            const fields = SF_VISIT_FIELD;
            const tableName = SF_VISIT_TABLE_NAME;

            const WhereClouse = [];
            if (validator.isEmpty(req.query.type)) {
                WhereClouse.push({ "fieldName": "type", "fieldValue": req.query.type })
            }
            if (validator.isEmpty(req.query.type)) {
                WhereClouse.push({ "fieldName": "CreatedById", "fieldValue": req.query.CreatedById })
            }
            if (validator.isEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validator.isEmpty(req.query.limit)) {
                limit = req.query.limit;
            }

            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit);
            console.log(sql);
            var products = await client.query(sql);

            if (products.rowCount != undefined && products.rowCount > 0) {
                return products.rows;
            }
        }


        if (req.query.offset != undefined && req.query.limit != undefined && req.query.type != undefined) {

            let sql = `SELECT * FROM public.meetings LEFT JOIN orders ON meetings.dealer_id = orders.dealer_id where type='${req.query.type}' order by orders.dealer_id desc  limit ${req.query.limit} offset ${req.query.offset}`;
            var meetings = await client.query(sql);

            if (meetings.rowCount != undefined && meetings.rowCount > 0) {

                // way 2 inline query
                meetings.rows.array.forEach(data => {

                    let sql = `SELECT * FROM public.orders where dealer_id='${data.dealer_id}' order by orders.dealer_id desc  limit 1`;
                    //var orders = await client.query(sql);

                });

            }
            return meetings.rows;
        }
    } catch (e) {
        return { 'success': false, 'error': 'Mandatory parameter(s) are missing.' };
    }
}




async function todayVisitCount(req) {
    try {
        if (req.query.offset != undefined && req.query.limit != undefined && req.query.type != undefined) {
            var dt = dateTime.create();
            var today_date = dt.format('Y-m-d');
            let sql = `SELECT count(id) FROM public.meetings where meeting_date='${today_date}' and agent_id='${req.session.id}' limit ${req.query.limit} offset ${req.query.offset}`;
            var meetings = await client.query(sql);

            if (meetings.rowCount != undefined && meetings.rowCount > 0) {
                return meetings.rows;
            }
        }
    } catch (e) {
        return { 'success': false, 'error': 'Mandatory parameter(s) are missing.' };
    }
}





async function add(req) {
    // contains(str, seed)
    /**
     * contains(str, seed)
     * equals(str, comparison)	
     * isAfter(str [, date])	
     * isAlpha(str [, locale])	
     * isAlphanumeric(str [, locale])	
     * isBase64(str)	
     * isBefore(str [, date])	
     * isBoolean(str)	
     * isByteLength(str [, options])	
     * isEmail(str [, options])	
     * isEmpty(str [, options])	
     * isFloat(str [, options])	
     */
    try {

        if (validator.isEmail(req.Body.email)) {
        }
        if (validator.isEmail('foo@bar.com')) {

        }
        console.log('ssss'); //=> true

    } catch (e) {
        return {};
    }
}

var moment = require('moment');

var enumerateDaysBetweenDates = function(startDate, endDate) {
    var dates = [];

    var currDate = moment(startDate).startOf('day');
    var lastDate = moment(endDate).startOf('day');

    while(currDate.add(1, 'days').diff(lastDate) < 0) {
        //dates.push(currDate.clone().toDate());
        dates.push(moment(currDate.clone().toDate()).format('YYYY-MM-DD'));
        
    }

    return dates;
};

async function visitbytours(req) {

    try{
        var tourWhereClouse = [] ;
        if (validation.issetNotEmpty(req.body.tour_ids)) {
            tourIds = req.body.tour_ids;
            tourWhereClouse.push({ "fieldName": `Tour_SS__c.sfid`, "fieldValue": req.body.tour_ids , "type":"IN"});
            tourWhereClouse.push({ "fieldName": `Tour_SS__c.tour_to__c`, "type":"NOTNULL"});
            tourWhereClouse.push({ "fieldName": `Tour_SS__c.tour_from__c`, "type":"NOTNULL"});
        }

        joins = [];
        orderBy = ` order by visit_date__c asc`;
        tourTableName = 'Tour_SS__c';
        tourFieldsArray = ['sfid',`date_part('epoch'::text, tour_to__c) * (1000)::double precision as tour_to__c`,`date_part('epoch'::text, tour_from__c) * (1000)::double precision as tour_from__c`];
        //tourFieldsArray = ['sfid',`tour_to__c`,`tour_from__c`];
        var sql = db.SelectAllQry(tourFieldsArray, tourTableName, tourWhereClouse, '0', '1000', '');
        console.log('sql  ', sql)
        var tours = await client.query(sql);
        var DatesArray = [];    
        console.log('tours.rows >>> ',  tours.rows);
        if (tours.rowCount != undefined && tours.rowCount > 0) {
            console.log('tours.rows >>> ',  tours.rows);
            for(i in tours.rows) { 
                tour_to__c = dtUtil.timestampToDate(tours.rows[i]['tour_to__c'],'YYYY-MM-DD');
                tour_from__c = dtUtil.timestampToDate(tours.rows[i]['tour_from__c'],'YYYY-MM-DD');
                console.log('tour_to__c >> ', tour_to__c ,'      tour_from__c >> ',tour_from__c)
                datess = enumerateDaysBetweenDates(tour_from__c,tour_to__c);
                // datess = enumerateDaysBetweenDates(tours.rows[i]['tour_from__c'],tours.rows[i]['tour_to__c']);
                DatesArray = DatesArray.concat(datess);
                DatesArray[DatesArray.length] = tour_to__c;
                DatesArray[DatesArray.length] = tour_from__c;
            }
            
        
        console.log(' DatesArray TYPe OF >>> ', typeof(DatesArray) );
        console.log('DatesArray >>> ', DatesArray);
        // Get all visits 
        
        var expItemsWhereClouse = [];
        var orderBy = ``;
        var expItemsTableName = 'Expense_Item_SS__c';
        var expItemsFieldsArray = [
            'visits__c.sfid',
            'visits__c.Retailer_Dealer__c',
            `visits__c.cancelled_reason__c`,
            `visits__c.visit_owner__c`,
            `visits__c.asm__c`,
            `visits__c.name`, 
            `Expense_Item_SS__c.sfid as expense_sfid`,
            `account.name as retailer_dealer_name`,
            `account.sfid as retailer_dealer_sfid`,
            `Expense_SS__c.expense_type__c as expense_type__c`,
            `Expense_Item_SS__c.expense_type__c as expense_item_type__c`
        ]; 
 
        expItemsWhereClouse.push({ "fieldName": `Expense_Item_SS__c.date__c`, "fieldValue": DatesArray , "type":"IN"});
        expItemsWhereClouse.push({ "fieldName": `visits__c.visit_owner__c`, "fieldValue": req.headers.agentid});
        expItemsWhereClouse.push({ "fieldName": `Expense_SS__c.expense_type__c`, "fieldValue": 'Local Expense'});
        
        if (validation.issetNotEmpty(req.query.expenseType) && req.query.expenseType == 'local') {
            expItemsWhereClouse.push({ "fieldName": `Expense_Item_SS__c.expense_type__c`, "fieldValue": "Local Expense" });
        } else {
            expItemsWhereClouse.push({ "fieldName": `Expense_Item_SS__c.expense_type__c`, "fieldValue": "Outstation Expense" });
        }
        
        var expItemsJoins = [
            {
                "type": "LEFT",
                "table_name": "visits__c",
                "p_table_field": `Expense_Item_SS__c.visits__c`,
                "s_table_field": "visits__c.sfid"
            },
            {
                "type": "LEFT",
                "table_name": "account",
                "p_table_field": `visits__c.retailer_dealer__c`,
                "s_table_field": "account.sfid"
            },
            {
                "type": "LEFT",
                "table_name": "Expense_SS__c",
                "p_table_field": `Expense_Item_SS__c.expense__c`,
                "s_table_field": "Expense_SS__c.sfid"
            },
            
        ];

        var sqlExp = db.fetchAllWithJoinQry(expItemsFieldsArray, expItemsTableName,expItemsJoins, expItemsWhereClouse, '0', '1000', '');
        console.log('sqlExp >>> ', sqlExp)
        var ExpItems = await client.query(sqlExp);
        console.log(ExpItems);

        if(ExpItems.rowCount > 0){

            /** New Implementation as per discussion with Gaurav 07-04-2020 */
            // var expense_item_ids = [];
            // for(i in ExpItems.rows){
            //     console.log(ExpItems.rows[i].expense_sfid)
            //     expense_item_ids.push(ExpItems.rows[i].expense_sfid);
            // }
            // console.log('expense_item_ids >>> ', expense_item_ids)
            // var tableName = 'expense_item__c',
            // fieldValue = [];
            // fieldValue.push({ "field": "expense_type__c", "value": 'Local Expense' });
            // var WhereClouse = [];
            // WhereClouse.push({ "field": "sfid", "value": expense_item_ids, "type": "IN" });
            // //WhereClouse.push({ "field": "expense__c", "value": req.body.expense_id});
            // var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);
            // console.log('eventExp >>>> ', eventExp);
            // if(eventExp.success){
            //     response.status = 200;
            //     response.response = { "success": true, "data":{}, "message": "" };
            // }else{
            //     response.status = 400;
            //     response.response = { "success": false, "data":{}, "message": "No record found." };
            // }
            response.status = 200;
            response.response = { "success": true, "data":ExpItems.rows, "message": "" };
            return response;
        }else{
            response.status = 400;
            response.response = { "success": false, "data":{}, "message": "No record found." };
            return response;  
        }
    }else{
        response.status = 400;
            response.response = { "success": false, "data":{}, "message": "Tour not found." };
            return response;  
    }

        
    }catch(e){
        console.log(e)
        response.status = 500;
        response.response = { "success": false, "data":{}, "message": "Internal server error." };
        return response;
    }

}
