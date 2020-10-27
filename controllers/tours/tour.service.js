var _ = require('lodash');
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var response = { "status": 200, "response": "" };
var moment = require('moment');
var validation = require(`${PROJECT_DIR}/utility/validation`);
const uuidv4 = require('uuid/v4');
//var component = require(`${PROJECT_DIR}/controllers/invoices/invoice.component`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);


module.exports = {
    getAll,
    create,
    updateTour,
    approveRejectTour,
    sendingForApproval
};
momenttz = require('moment-timezone');
/**
 * This method is used to get all invoices using follwing parameters
 * @param {*} offset - start point
 * @param {*} limit - record limit
 * @param {*} sellerid - account id 
 * @param {*} type Dealer/retailer
 
 */

async function getAll(req) {
    try {

        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        // is_Validate = is_Validate ? (validation.issetNotEmpty(req.query.visitid) || validation.issetNotEmpty(req.query.month)) : false;

        tour_type = 'other-self';
        is_Validate = is_Validate ? (validation.issetNotEmpty(req.query.tour_type) && tour_type.indexOf(req.query.tour_type) > -1) : false;

        if (is_Validate) {

            const tableName = 'Tour_SS__c';

            const WhereClouse = [];
            var offset = '0', limit = '1000';
            
            if (validation.issetNotEmpty(req.query.tour_type) && req.query.tour_type == 'self') {
                WhereClouse.push({ "fieldName": "tour_owner__c", "fieldValue": req.headers.agentid });
            } else if (validation.issetNotEmpty(req.query.tour_type) && req.query.tour_type == 'other') {
                WhereClouse.push({ "fieldName": "tour_approver__c", "fieldValue": req.headers.agentid });
                WhereClouse.push({ "fieldName": "tour_status__c", "fieldValue": "Pending For Approval" });

            }
            if (validation.issetNotEmpty(req.query.status)) {
                WhereClouse.push({ "fieldName": "tour_status__c", "fieldValue": req.query.status });
            }

            if (validation.issetNotEmpty(req.query.offset)) {
                offset = req.query.offset;
            }
            if (validation.issetNotEmpty(req.query.limit)) {
                limit = req.query.limit;
            }

            var joins = [
                {
                    "type": "LEFT",
                    "table_name": "team__c member",
                    "p_table_field": "Tour_SS__c.tour_owner__c",
                    "s_table_field": "member.sfid"
                },
                {
                    "type": "LEFT",
                    "table_name": "team__c approvar",
                    "p_table_field": "Tour_SS__c.tour_approver__c",
                    "s_table_field": "approvar.sfid"
                }
            ];
            var fields = [
                `Tour_SS__c.sfid`,
                `Tour_SS__c.pg_id__c`,
                `Tour_SS__c.food__c`,
                `Tour_SS__c.hotel__c`,
                `Tour_SS__c.remark__c`,
                `Tour_SS__c.tour_from__c`,
                `Tour_SS__c.tour_approver__c`,
                `Tour_SS__c.name`,
                `Tour_SS__c.tour_owner__c`,
                `Tour_SS__c.tour_status__c`,
                `Tour_SS__c.tour_to__c`,
                `Tour_SS__c.tour_purpose__c`,
                `date_part('epoch'::text, Tour_SS__c.createddate) * (1000)::double precision as createddate`,
             
                `member.name as member_name`,
                `member.team_member_name__c as member_team_member_name__c`,

                `approvar.name as approvar_name`,
                `approvar.team_member_name__c as approvar_team_member_name__c`,

                // `date_part('epoch'::text, visits__c.visit_date__c) * (1000)::double precision as visit_date__c`,
                // `visits__c.sfid as visit_sfid`,
                // `visits__c.name as visit_name`,

            ];
            var sql = db.fetchAllWithJoinQry(fields, tableName, joins, WhereClouse, offset, limit, ' order by createddate desc');

            console.log(`INFO::: Get Tour = ${sql}`);

            var tours = await client.query(sql);

            if (tours.rowCount != undefined && tours.rowCount > 0) {
                response.response = { 'success': true, "data": { "tours": tours.rows } };
                response.status = 200;
                return response;
            } else {
                response.response = { 'success': false, "data": { "tours": [] }, "message": "No record found." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": { "tours": [] }, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": { "tours": [] }, "message": "Internal server error." };
        response.status = 500;
        return response;
    }
}

/**
 * This method is used to get order details using follwing parameters
 * @param {*} id - order_is
 * 
*  */
async function updateTour(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.tour_status__c) : false;

        if (is_Validate) {
           
            var tableName = 'Tour_SS__c';
            
            var fieldValue = [];

            if(validation.issetNotEmpty(req.body.food__c))
                fieldValue.push({ "field": "food__c", "value": req.body.food__c });
            if(validation.issetNotEmpty(req.body.hotel__c))
                fieldValue.push({ "field": "hotel__c", "value": req.body.hotel__c });
            if(validation.issetNotEmpty(req.body.tour_to__c))
                fieldValue.push({ "field": "tour_to__c", "value": req.body.tour_to__c });
            
            if(validation.issetNotEmpty(req.body.tour_status__c))
                fieldValue.push({ "field": "tour_status__c", "value": req.body.tour_status__c });

            if(validation.issetNotEmpty(req.body.comapny_paid__c))
                fieldValue.push({ "field": "comapny_paid__c", "value": req.body.comapny_paid__c });
            if(validation.issetNotEmpty(req.body.have_bills__c))
                fieldValue.push({ "field": "have_bills__c", "value": req.body.have_bills__c });
            if(validation.issetNotEmpty(req.body.tour_from__c))
                fieldValue.push({ "field": "tour_from__c", "value": req.body.tour_from__c });
            if(validation.issetNotEmpty(req.body.tour_to__c))
                fieldValue.push({ "field": "tour_to__c", "value": req.body.tour_to__c });
            if(validation.issetNotEmpty(req.body.travel_by__c))
                fieldValue.push({ "field": "travel_by__c", "value": req.body.travel_by__c });
            if(validation.issetNotEmpty(req.body.travel_details__c))
                fieldValue.push({ "field": "travel_details__c", "value": req.body.travel_details__c });

            if(validation.issetNotEmpty(req.body.city_1__c))
                fieldValue.push({ "field": "city_1__c", "value": req.body.city_1__c });
            if(validation.issetNotEmpty(req.body.city_2__c))
                fieldValue.push({ "field": "city_2__c", "value": req.body.city_2__c });
            if(validation.issetNotEmpty(req.body.city_3__c))
                fieldValue.push({ "field": "city_3__c", "value": req.body.city_3__c });
            if(validation.issetNotEmpty(req.body.city_4__c))
                fieldValue.push({ "field": "city_4__c", "value": req.body.city_4__c });
            if(validation.issetNotEmpty(req.body.city_5__c))
                fieldValue.push({ "field": "city_5__c", "value": req.body.city_5__c });
            if(validation.issetNotEmpty(req.body.city_6__c))
                fieldValue.push({ "field": "city_6__c", "value": req.body.city_6__c });
            if(validation.issetNotEmpty(req.body.city_7__c))
                fieldValue.push({ "field": "city_7__c", "value": req.body.city_7__c });
            if(validation.issetNotEmpty(req.body.city_8__c))
                fieldValue.push({ "field": "city_8__c", "value": req.body.city_8__c });
            if(validation.issetNotEmpty(req.body.city_9__c))
                fieldValue.push({ "field": "city_9__c", "value": req.body.city_9__c });
            if(validation.issetNotEmpty(req.body.city_10__c))
                fieldValue.push({ "field": "city_10__c", "value": req.body.city_10__c });
            if(validation.issetNotEmpty(req.body.city_11__c))
                fieldValue.push({ "field": "city_11__c", "value": req.body.city_11__c });
            if(validation.issetNotEmpty(req.body.city_12__c))
                fieldValue.push({ "field": "city_12__c", "value": req.body.city_12__c });
            if(validation.issetNotEmpty(req.body.city_13__c))
                fieldValue.push({ "field": "city_13__c", "value": req.body.city_13__c });
            if(validation.issetNotEmpty(req.body.city_14__c))
                fieldValue.push({ "field": "city_14__c", "value": req.body.city_14__c });
            if(validation.issetNotEmpty(req.body.city_15__c))
                fieldValue.push({ "field": "city_15__c", "value": req.body.city_15__c });
            if(validation.issetNotEmpty(req.body.tour_purpose__c))
                fieldValue.push({ "field": "tour_purpose__c", "value": req.body.tour_purpose__c });
                
            console.log(fieldValue);
 
            const WhereClouse = [];
            WhereClouse.push({ "field": "sfid", "value": req.query.id });

            var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);

            if (eventExp.success) {
                response.response = { 'success': true, "data": {}, "message": "Tour updated successfully." };
                response.status = 200;
                return response;
            } else {
                console.log(eventExp);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Tour update failed." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }
}


async function create(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.tour_from__c) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.tour_to__c) : false;
        console.log('is_Validate >>>>  ', is_Validate);
        if (is_Validate) {
            tourBody = req.body;
            tourBody.tour_from__c = dtUtil.timestampToDate(tourBody.tour_from__c, "YYYY-MM-DD");
            tourBody.tour_to__c = dtUtil.timestampToDate(tourBody.tour_to__c, "YYYY-MM-DD");

            //sql = `SELECT sfid FROM cns.Tour_SS__c where tour_owner__c='a0H1m000001P8DTEA0' and 
            //(tour_from__c BETWEEN '${tourBody.tour_to__c}' and '${tourBody.tour_from__c}' OR 
            //tour_to__c BETWEEN '${tourBody.tour_to__c}' and '${tourBody.tour_from__c}') 
            //order by sfid asc offset 0 limit 1`;

            sql = `SELECT sfid FROM ${process.env.TABLE_SCHEMA_NAME}.Tour_SS__c where tour_owner__c='${req.headers.agentid}' and 
            ('${tourBody.tour_to__c}' BETWEEN tour_from__c and tour_to__c OR 
            '${tourBody.tour_from__c}' BETWEEN tour_to__c and tour_from__c) 
            order by sfid asc offset 0 limit 1`;
            console.log('sql >>>> ', sql);
           
            var toursList = await client.query(sql);

            if (toursList.rowCount != undefined && toursList.rowCount == 0) {

                var UUID_TOUR = uuidv4();
                var tableName = 'Tour_SS__c';


                tourFields = `name, pg_id__c, food__c, hotel__c, tour_status__c, comapny_paid__c, have_bills__c,tour_from__c ,tour_to__c ,travel_by__c ,travel_details__c , city_1__c, city_2__c,city_3__c ,city_4__c ,city_5__c , city_6__c,city_7__c ,city_8__c ,city_9__c , city_10__c, city_11__c,city_12__c, city_13__c, city_14__c, city_15__c,tour_purpose__c, tour_owner__c`; // ,



                tourFieldsBody = [

                    validation.issetNotEmpty(tourBody.name) ? tourBody.name : null,
                    UUID_TOUR,
                    validation.issetNotEmpty(tourBody.food__c) ? tourBody.food__c : null,
                    validation.issetNotEmpty(tourBody.hotel__c) ? tourBody.hotel__c : null,
                    validation.issetNotEmpty(tourBody.tour_status__c) ? tourBody.tour_status__c : 'Draft',
                    validation.issetNotEmpty(tourBody.comapny_paid__c) ? tourBody.comapny_paid__c : null,
                    validation.issetNotEmpty(tourBody.have_bills__c) ? tourBody.have_bills__c : null,
                    validation.issetNotEmpty(tourBody.tour_from__c) ? tourBody.tour_from__c : null,
                    validation.issetNotEmpty(tourBody.tour_to__c) ? tourBody.tour_to__c : null,
                    validation.issetNotEmpty(tourBody.travel_by__c) ? tourBody.travel_by__c : null,
                    validation.issetNotEmpty(tourBody.travel_details__c) ? tourBody.travel_details__c : null,
                    validation.issetNotEmpty(tourBody.city_1__c) ? tourBody.city_1__c : null,
                    validation.issetNotEmpty(tourBody.city_2__c) ? tourBody.city_2__c : null,
                    validation.issetNotEmpty(tourBody.city_3__c) ? tourBody.city_3__c : null,
                    validation.issetNotEmpty(tourBody.city_4__c) ? tourBody.city_4__c : null,
                    validation.issetNotEmpty(tourBody.city_5__c) ? tourBody.city_5__c : null,
                    validation.issetNotEmpty(tourBody.city_6__c) ? tourBody.city_6__c : null,
                    validation.issetNotEmpty(tourBody.city_7__c) ? tourBody.city_7__c : null,
                    validation.issetNotEmpty(tourBody.city_8__c) ? tourBody.city_8__c : null,
                    validation.issetNotEmpty(tourBody.city_9__c) ? tourBody.city_9__c : null,
                    validation.issetNotEmpty(tourBody.city_10__c) ? tourBody.city_10__c : null,
                    validation.issetNotEmpty(tourBody.city_11__c) ? tourBody.city_11__c : null,
                    validation.issetNotEmpty(tourBody.city_12__c) ? tourBody.city_12__c : null,
                    validation.issetNotEmpty(tourBody.city_13__c) ? tourBody.city_13__c : null,
                    validation.issetNotEmpty(tourBody.city_14__c) ? tourBody.city_14__c : null,
                    validation.issetNotEmpty(tourBody.city_15__c) ? tourBody.city_15__c : null,
                    validation.issetNotEmpty(tourBody.tour_purpose__c) ? tourBody.tour_purpose__c : null,
                    req.headers.agentid
                ];
                var tourDetails = await db.insertRecord(tourFields, tourFieldsBody, tableName, `, pg_id__c`);

                if (tourDetails.success) {
                    response.response = { 'success': true, "data": {}, "message": "Tour Created successfully." };
                    response.status = 200;
                    return response;
                } else {
                    console.log(tourDetails);
                    response.response = { 'success': false, "data": {}, "message": "Due to internal error Tour insert failed." };
                    response.status = 400;
                    return response;
                }
            } else {
                response.response = { 'success': false, "data": {}, "message": "Duplicate tour." };
                response.status = 401;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }
}


async function validateManagerTour(req) {
    try {
        var tableName = 'Tour_SS__c',
        WhereClouse = [],
        offset = '0',
        limit = '10';
        WhereClouse.push({ "fieldName": "sfid", "fieldValue": req.query.id });
        WhereClouse.push({ "fieldName": "tour_approver__c", "fieldValue": req.headers.agentid });

        var sql = db.SelectAllQry(['sfid'], tableName, WhereClouse, offset, limit, ' ');
        var tours = await client.query(sql);

        if (tours.rowCount > 0) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log('= ', e);
        return false;
    }
}

async function validateMemberTour(req) {
    try {


        var tableName = 'Tour_SS__c',
            WhereClouse = [];
        offset = '0';
        limit = '10';
        WhereClouse.push({ "fieldName": "sfid", "fieldValue": req.query.id });
        WhereClouse.push({ "fieldName": "tour_owner__c", "fieldValue": req.headers.agentid });
        WhereClouse.push({ "fieldName": "tour_status__c", "fieldValue": "Draft" });
        joins = [];
        var sql = db.SelectAllQry(['sfid'], tableName, WhereClouse, offset, limit, ' ');

        var tours = await client.query(sql);

        if (tours.rowCount > 0) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log('= ', e);
        return false;
    }
}


async function approveRejectTour(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.query.id) : false;
        console.log(is_Validate);
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        console.log(is_Validate);
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.remark__c) : false;
        console.log(is_Validate);
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.tour_status__c) : false;
        //is_Validate = is_Validate ? await validateManagerTour(req) : false;
        console.log(is_Validate);

        console.log('req.body >> ', req.body);
        console.log('req.headers >> ', req.headers);

        if (is_Validate) {


            var tableName = 'Tour_SS__c',
                fieldValue = [];
            fieldValue.push({ "field": "remark__c", "value": req.body.remark__c });
            fieldValue.push({ "field": "tour_status__c", "value": req.body.tour_status__c });

            const WhereClouse = [];
            WhereClouse.push({ "field": "sfid", "value": req.query.id });
            WhereClouse.push({ "field": "tour_approver__c", "value": req.headers.agentid });

            var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);
            console.log(eventExp)
            if (eventExp.success) {
                response.response = { 'success': true, "data": {}, "message": "Tour updated successfully." };
                response.status = 200;
                return response;
            } else {
                console.log(eventExp);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Tour update failed." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }

}


async function sendingForApproval(req) {

    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.tour_ids) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        // is_Validate = is_Validate ? await validateMemberTour(req) : false;

        console.log('req.body >>>>  ',req.body)
        if (is_Validate && req.body.tour_ids.length > 0 && typeof(req.body.tour_ids)=='object') {

            var tableName = 'Tour_SS__c',
            fieldValue = [];
            fieldValue.push({ "field": "tour_status__c", "value": 'Pending For Approval' });

            const WhereClouse = [];
           
            WhereClouse.push({ "field": "pg_id__c", "value": req.body.tour_ids , "type":"IN" });
            WhereClouse.push({ "field": "tour_owner__c", "value": req.headers.agentid });

            var eventExp = await db.updateRecord(tableName, fieldValue, WhereClouse);
            
            if (eventExp.success) {
                response.response = { 'success': true, "data": {}, "message": "Tour sending for approval successfully." };
                response.status = 200;
                return response;
            } else {
                console.log(eventExp);
                response.response = { 'success': false, "data": {}, "message": "Due to internal error Tour update failed." };
                response.status = 400;
                return response;
            }
        } else {
            response.response = { 'success': false, "data": {}, "message": "Mandatory parameter(s) are missing." };
            response.status = 400;
            return response;
        }
    } catch (e) {
        console.log(e);
        response.response = { 'success': false, "data": {}, "message": "Internal Server error." };
        response.status = 500;
        return response;
    }

}