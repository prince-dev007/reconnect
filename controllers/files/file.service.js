var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
var component = require(`${PROJECT_DIR}/controllers/files/file.component`);
var base64 = require('base-64');
const fs = require('fs');


module.exports = {
    getVisitFiles,
    getExpenseItemFiles,
    getExpenseFiles,
    addAttachment
};
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.CLOUDCUBE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDCUBE_SECRET_ACCESS_KEY,
  region: 'us-west-2' //process.env.CLOUDCUBE_REGION
});
var path = require("path");

momenttz = require('moment-timezone');
/**
 * This method is used to get all orders using follwing parameters
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */
async function getVisitFiles(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        
        if (is_Validate) {

            const fields = `id, sfid, Name, PG_ID__c, Visit__c, Visit_PG_ID__c,location__c, createddate`; //ENCODE(CONVERT_TO(Location__c, 'UTF-8'), 'BASE64') as 
            const tableName = 'aws_files__c';

            const WhereClouse = [];
            var offset = '0', limit = '1000';
           
            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }

            if (validation.issetNotEmpty(req.query.id)) {
                WhereClouse.push({ "fieldName": "visit_pg_id__c", "fieldValue": req.query.id });
            }
            
            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,' order by createddate desc');
            console.log(`INFO::: Get all Contacts = ${sql}`);

            var files = await client.query(sql);

            if (files.rowCount != undefined && files.rowCount > 0) {

                for(i in files.rows) {
                    if(validation.issetNotEmpty(files.rows[i].location__c)){
                        files.rows[i].location__c = base64.encode(files.rows[i].location__c);

                    }
                }
                response.response = { 'success': true, "data": { "files": files.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "files": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "files": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "files": [] }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}
async function getExpenseItemFiles(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        
        if (is_Validate) {

            var fields = `id, sfid, Name, PG_ID__c, Visit__c, Visit_PG_ID__c,location__c, createddate`; //ENCODE(CONVERT_TO(Location__c, 'UTF-8'), 'BASE64') as 
            var tableName = 'aws_files__c';

            var WhereClouse = [];
            var offset = '0', limit = '1';
           
            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }

            if (validation.issetNotEmpty(req.query.id) && req.query.id.length > 18 ) {
                WhereClouse.push({ "fieldName": "expense_item_pg_id__c", "fieldValue": req.query.id });
            }else{
                WhereClouse.push({ "fieldName": "expense_item__c", "fieldValue": req.query.id });
            }
            
            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,' order by createddate desc');

            var files = await client.query(sql);

            if (files.rowCount != undefined && files.rowCount > 0) {

                for(i in files.rows) {
                    if(validation.issetNotEmpty(files.rows[i].location__c)){
                        files.rows[i].location__c = base64.encode(files.rows[i].location__c);
                    }
                }
                response.response = { 'success': true, "data": { "files": files.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "files": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "files": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "contacts": [] }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}

async function getExpenseFiles(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        
        if (is_Validate) {

            var fields = `id, sfid, Name, PG_ID__c, location__c, createddate`; //ENCODE(CONVERT_TO(Location__c, 'UTF-8'), 'BASE64') as 
            var tableName = 'aws_files__c';

            var WhereClouse = [];
            var offset = '0', limit = '1';
           
            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }

            if (validation.issetNotEmpty(req.query.id) && req.query.id.length > 18 ) {
                WhereClouse.push({ "fieldName": "expense_pg_id__c", "fieldValue": req.query.id });
            }else{
                WhereClouse.push({ "fieldName": "expense__c", "fieldValue": req.query.id });
            }
            
            sql = db.SelectAllQry(fields, tableName, WhereClouse, offset, limit,' order by createddate desc');

            var files = await client.query(sql);

            if (files.rowCount != undefined && files.rowCount > 0) {

                for(i in files.rows) {
                    if(validation.issetNotEmpty(files.rows[i].location__c)){
                        files.rows[i].location__c = base64.encode(files.rows[i].location__c);
                    }
                }
                response.response = { 'success': true, "data": { "files": files.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "files": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "files": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "files": [] }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}

async function uploadFile(req){
    
}

async function addAttachment(req,res){

    try{
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.attachment__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.file_name) : false;
        is_Validate = is_Validate ? (validation.issetNotEmpty(req.query.expense_id) || validation.issetNotEmpty(req.query.expense_item_id) ) : false;
        if (is_Validate) {

                fileName = req.body.attachment__c;
                var fileExt = path.extname(req.body.file_name);
                var newfileName = uuidv4()+fileExt;
                
                var filePath = PROJECT_DIR + '/public/uploads/expenses/';
        
                fs.writeFile(filePath + newfileName, req.body.attachment__c, 'base64',async function (err, data) {
        
                    if (!err) {
                        fs.readFile(filePath + newfileName, async (err, data) => {
                            console.log('filePath + newfileName  ', filePath + newfileName);
                           
                            
        
                            if (!err) {
                                var fileStream = fs.createReadStream(filePath + newfileName);
                                fileStream.on('error', function(err) {
                                    console.log('File Error', err);
                                });
                                const params = {
                                    Bucket: 'cloud-cube',
                                    Key: 'safvczft2wy1/public/' + newfileName,
                                    Body: fileStream //JSON.stringify(data, null, 2)
                                    
                                };
                                s3.upload(params,async function (s3Err, data) {
                                    
                                    if (s3Err) {
                                        console.log('ERROR::: s3Err = ', s3Err);
                                        fs.unlinkSync(filePath + newfileName);
                                        response.response = { 'success': false, "data": { }, "message": "S3 Error." };
                                        response.status = 400;
                                        res.send(response.response);
                                        //return response;
                                
                                    } else {
                                        var UUIDVal = uuidv4();
                                        //console.log('data >>> ', data);
                                        console.log(`INFO:::  File uploaded successfully at ${data.ETag}`)
                                        console.log(`INFO:::  File uploaded successfully at ${data.Location}`)
                                        console.log(`INFO:::  File uploaded successfully at ${data.key}`)
                                        console.log(`INFO:::  File uploaded successfully at ${data.Bucket}`)
                                        file_TABLE = 'aws_files__c';
                                        if (validation.issetNotEmpty(req.query.expense_id)) {
                                            filetargetFields = 'pg_id__c, bucket__c, etag__c, key__c, location__c, expense__c';
                                            filetargetFieldsValues = [`${UUIDVal}`, `${data.Bucket}`, `${data.ETag}`, `${data.key}`, `${data.Location}`, `${req.query.expense_id}`];
                                        } else if (validation.issetNotEmpty(req.query.expense_item_id)) {
                                            filetargetFields = 'pg_id__c, bucket__c, etag__c, key__c, location__c, expense_item__c';
                                            filetargetFieldsValues = [`${UUIDVal}`, `${data.Bucket}`, `${data.ETag}`, `${data.key}`, `${data.Location}`, `${req.query.expense_item_id}`];
                                        }
                                        
                                       
                                        insertTarget = await db.insertRecord(filetargetFields, filetargetFieldsValues, file_TABLE);
                                        setTimeout(function(){
                                            fs.unlinkSync(filePath + newfileName)}, 10000
                                        );
                                        if(insertTarget.success){
                                            console.log('insertTarget >>> ', insertTarget);
                                            response.response = { 'success': true, "data": insertTarget.data, "message": "" };
                                            response.status = 200;
                                            res.send(response.response);
        //return response;


                                        }else{
                                            response.response = { 'success': false, "data": {}, "message": "" };
                                            response.status = 400;
                                            res.send(response.response);
                                            //return response;
                                    
                                        }
                                    } //throw s3Err
                                }); 
                            } else {
                                response.response = { 'success': false, "data": { }, "message": "File read error." };
                                response.status = 400;
                                res.send(response.response);
                                //return response;
                        
                            }
                            
                        });
                    } else {
                        response.response = { 'success': false, "data": { }, "message": "File write error." };
                        response.status = 400;
                        res.send(response.response);
                        //return response;
                
                    }
                });
                
            
        }else{
            response.response = { 'success': false, "data": {  }, "message": "mandatory parameter are missing." };
            response.status = 400;
            res.send(response.response);
            //return response;
    
        }

        

    }catch(e){
        console.log(e);
        response.response = { 'success': false, "data": { "contacts": [] }, "message": "Internal server error." };
        response.status = 500;
        res.send(response.response);
        //return response;

    }


}