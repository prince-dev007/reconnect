//// https://github.com/validatorjs/validator.js
//const config = require('config.json');
require("dotenv").config();

const config = {
    "secret": `${process.env.JWT_SECRET}`
}
const jwt = require('jsonwebtoken');
var _ = require('lodash');
var dateTime = require('node-datetime');
var moment = require('moment');
var validator = require('validator');
var validation = require(`${PROJECT_DIR}/utility/validation`);
var dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);

var response = { "status": 200, "response": "" };
var db = require(`${PROJECT_DIR}/utility/selectQueries`);
var CryptoJS = require("crypto-js");
var md5 = require('md5');
const uuidv4 = require('uuid/v4');


module.exports = {
    sendOTP,
    confirmOTP,
    agentDetails,
    startDay,
    isAttMark,
    endDay,
    markAbsent,
    areas,
    getServerTime,
    setPassword,
    getAllAsm,
    getAllPsm
};


/**
 * Function is used to create randon number
 * @param {*} min 
 * @param {*} max 
 */

function randomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sendOTP(data) {
    console.log(data);
    try {
        var response = { "success": true, "message": "" };
        if (data.phone != undefined && data.phone != '') {
            let sql = `Select Id from "${process.env.TABLE_SCHEMA_NAME}".team__c where phone_no__c='${data.phone}' limit 1`;
            console.log(sql);
            var team = await client.query(sql);
            if (team.rows.length > 0) {
                var varificationCode = randomNumber(100000, 999999);
                varificationCode = '123456';
                var isUpdate = await client.query(`UPDATE ${process.env.TABLE_SCHEMA_NAME}.team__c SET verification_code__c='${varificationCode}' WHERE phone_no__c='${data.phone}'`);
                response["data"] = varificationCode;
            } else {

                response.success = false;
                response.error = "No record found.";
            }
            return response;

        } else {
            return { 'success': false, 'error': 'Mandatory parameters are missing.' };
        }


    } catch (e) {
        console.log(`Error:  >>> `, e);
        return { 'success': false, 'error': e };
    }

}
async function setPassword(data) {
    try {
        if (data.body.phone != undefined && data.body.phone != '') {
            let sql = `Select Id from "${process.env.TABLE_SCHEMA_NAME}".team__c where phone_no__c='${data.body.phone}' limit 1`;
            console.log(`INFO:: SQL = ${sql}`);
            var team = await client.query(sql);
            if (team.rows.length > 0) {
                console.log(data.body)
                console.log(CryptoJS.HmacSHA1(data.body.password, process.env.ENCRYPT_PASSWORD));

                // var password = CryptoJS.AES.encrypt(data.body.password, process.env.ENCRYPT_PASSWORD);
                // var encPass = password.toString();
                var encPass = md5(data.body.password);
               
                //var bytes  = CryptoJS.AES.decrypt(encPass, process.env.ENCRYPT_PASSWORD);
                //var plaintext = bytes.toString(CryptoJS.enc.Utf8);

                //console.log('bytes >>>> ', plaintext);
                console.log(`UPDATE ${process.env.TABLE_SCHEMA_NAME}.team__c SET password__c='${encPass}' WHERE phone_no__c='${data.body.phone}'`);

                var isUpdate = await client.query(`UPDATE ${process.env.TABLE_SCHEMA_NAME}.team__c SET password__c='${encPass}' WHERE phone_no__c='${data.body.phone}'`);
                if(isUpdate.rowCount > 0){
                    response.status = 200;
                    response.response={ 'success': true, "data": {}, "message":"Pasword updated successfully." };
                }else{
                    response.status = 400;
                    response.response={ 'success': false, "data": {}, "message":"update password failed." };
                }
              
            } else {
                response.status = 400;
                response.response={ 'success': false, "data": {}, "message":"No record found." };
            }
            return response;

        } else {
            response.status = 400;
            response.response={ 'success': false, "data": {}, "message":"Mandatory parameter(s) are missing." };
            return response;
        }


    } catch (e) {
        console.log(`Error:  >>> `, e);
        response.status = 500;
        response.response={ 'success': false, "data": {"product_detail":[]}, "message":"Mandatory parameter(s) are missing." };
        return response;
    }

}


async function confirmOTP({ phone, password }) {

    try {
        console.log('password >>> ',  password);
        var encPass = md5(password);
        let sql2 = `Select * from ${process.env.TABLE_SCHEMA_NAME}.team__c ` ;
        let sql = `Select sfid as id from ${process.env.TABLE_SCHEMA_NAME}.team__c where regexp_replace(phone_no__c, '[^0-9]+', '', 'g')='${phone}' and password__c='${encPass}'`; // 
        console.log('sql  >>>> ',sql)
        let user = await client.query(sql);
        let user2 = await client.query(sql2);
        console.log(user2);
        if (user.rowCount > 0) {
            const token = jwt.sign({ sub: user.rows[0].id }, config.secret);
            const keys = ['id'];
            //const { phone, ...userWithoutPassword } = cryptoJSON.encrypt(user.rows[0], process.env.ENCRYPT_PASSWORD, { encoding, keys, algorithm });;
            const { phone, ...userWithoutPassword } = user.rows[0];
            response.status = 200;
            response.response = {
                "success": true, "message": "", "data": {
                    ...userWithoutPassword,
                    token
                }
            };
            return response;
        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Invalid Varification code.","data":user2.rows };
            return response;
        }
    } catch (e) {
        console.log(`Error:  >>> `, e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error." };
        return response;
    }

}


/**
 * Function is using to get agent attandence detail using agentid and date
 * @param {*} agentid 
 * @param {*} search_date 
 * 
 */

async function getAttendanceDetail(agentid, search_date) {
    fieldsArrayAtt = [`Attendance_SS__c.Type__c as attendance_type`,
        `Attendance_SS__c.Name as attendance_name`,
        `Attendance_SS__c.team__c as attendance_for_id`,
        `Attendance_SS__c.start_day__c as attendance_start_day`,
        `Attendance_SS__c.end_day__c as attendance_end_day`,
        'Attendance_SS__c.attendance_date__c as attendance_date',
        'Attendance_SS__c.start_time__c as start_time',
        'Attendance_SS__c.end_time__c as end_time',
        'Attendance_SS__c.checkin_location__latitude__s as checkin_location__latitude__s',
        'Attendance_SS__c.checkin_location__longitude__s as checkin_location__longitude__s',
        'Attendance_SS__c.checkout_location__latitude__s as checkout_location__latitude__s',
        'Attendance_SS__c.checkout_location__longitude__s as checkout_location__longitude__s',
        `Attendance_SS__c.sfid as attendance_id`];
    tableNameAtt = 'Attendance_SS__c';
    WhereClouseAtt = [];
    WhereClouse.push({ "fieldName": "team__c", "fieldValue": agentid })
    WhereClouse.push({ "fieldName": "attendance_date__c", "fieldValue": search_date })
    offset = '0';
    limit = '1'
    orderBy = '';
    var sqlAttendance = db.SelectAllQry(fieldsArrayAtt, tableNameAtt, WhereClouseAtt, offset, limit, orderBy);


    return await client.query(sqlAttendance)
        .then(async data => {
            if (data.rowCount > 0) {
                var checkin_address = await db.getLocationAddr (data.rows[0].checkin_location__latitude__s,data.rows[0].checkin_location__longitude__s);
                var checkout_address = await db.getLocationAddr (data.rows[0].checkout_location__latitude__s,data.rows[0].checkout_location__longitude__s);
                console.log('LocationAddress =  ', checkout_address);
                data.rows[0]['checkout_address'] = checkout_address;
                data.rows[0]['checkin_address'] = checkin_address;
                return { "success": true, "message": "", "data": data.rows[0] };

            } else {
                return { "success": true, "message": "", "data": {} };
            }
        })
        .catch(err => {
            return { "success": false, "message": "Internal server error.", "data": {} };
        });
}
/**
 * This api is using to get agent details .
 * This api has following mandatory parameters Area, Latitude, Longitude, date
 * @header {*} agentid 
 * @response  status = 200 for success, 400 for no record found and 500 for internal server error  
 * In response we have agent details along with todays attandence detail.
 */
async function agentDetails(req) {
    console.log(req.headers)
    try {
        if (validation.issetNotEmpty(req.headers.agentid)) {
            var key = ['id'];
            //reqBody = cryptoJSON.decrypt(reqBody, encrypt_password, { encoding, key, algorithm });
            fieldsArray = [
                `t.member_type__c as member_type`,
                `t.email__c as email`, 
                `t.team_member_name__c as team_member_name`,
                `t.dob__c as dob`, 
                `t.designation__c as designation`,
                `t.phone_no__c as phone_no`,
                `t.business__c`,
                `t.name as employee_code__c`,
                `tm.manager__c`,
                `t.sfid as team_id`,
                `Branch_SS__c.name as branch_name`,
                `tm.team_member_name__c as manager_name`
            ];
            tableName = `team__c t `;


            offset = '0';
            limit = '1';
            orderBy = '',
           
            joins = [
            {
                "type": "LEFT",
                "table_name": "Branch_SS__c",
                "p_table_field": "t.branch__c",
                "s_table_field": "Branch_SS__c.sfid"
            },
            {
                "type": "LEFT",
                "table_name": "team__c tm",
                "p_table_field": "t.manager__c",
                "s_table_field": "tm.sfid"
            }
            ];

            //joins = [];
            WhereClouse = [];

            if (validation.issetNotEmpty(req.headers.agentid)) {
                WhereClouse.push({ "fieldName": "t.sfid", "fieldValue": req.headers.agentid })
            }

            var sql = db.fetchAllWithJoinQry(fieldsArray, tableName, joins, WhereClouse, offset, limit, orderBy);
            console.log(`INFP::: SQL ==>>>>> ${sql}`);

            var today_date = moment().format('YYYY-MM-DD');
            var teamAreaFieldsArray = [`team_area__c.area__c`,`team_area__c.sfid as team_area_sfid`,`team_area__c.team_member__c`,
            `City_SS__c.name as city_name`];
            teamAreaJoins=[{
                "type": "LEFT",
                "table_name": "City_SS__c",
                "p_table_field": "City_SS__c.sfid",
                "s_table_field": "team_area__c.city__c"
            }];
            TeamAreaWhereClouse = [
            ];
            if (validation.issetNotEmpty(req.headers.agentid)) {
                TeamAreaWhereClouse.push({ "fieldName": "team_area__c.team_member__c", "fieldValue": req.headers.agentid })
            }

            var agentAreaSql = db.fetchAllWithJoinQry(teamAreaFieldsArray, 'team_area__c', teamAreaJoins, TeamAreaWhereClouse, '0', '1000', ' ');
            
            console.log('agentAreaSql >>> ', agentAreaSql)

            var agentAreaObject = await db.getDbResult(agentAreaSql);
            var agentArea = [];
            if(agentAreaObject.rowCount > 0){
                agentArea = agentAreaObject.rows;
            }
            console.log('agentArea>>>>>>>>', agentArea);
            return await client.query(sql)
                .then(async data => {
                    response.status = 200;
                    // to get agent's todays attandence detail
                    var today_attendance = await getAttendanceDetail(req.headers.agentid, today_date);
                    
                    

                    agentDetail = data.rows[0];
                    attendanceDetail = today_attendance.data;
                    
                    agentDetail.dob = moment(agentDetail.dob).valueOf();
                    attendanceDetail.attendance_date = moment(attendanceDetail.attendance_date).valueOf();
                    
                    response.response = { "success": true, "message": "", "data": { agentDetail, attendanceDetail,agentArea } };
                    return response;
                })
                .catch(err => {
                    console.log(err);
                    response.status = 500;
                    response.response = { "success": false, "message": "Internal server error.", "data": {} };
                    return response;
                });

        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing." };
            return response;
        }
    } catch (e) {
        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error." };
        return response;
    }
}

/**
 * Function is used to get all asm
 * @param {} req 
 */
async function getAllAsm(req) {
    try {
        if (validation.issetNotEmpty(req.headers.agentid)) {
            fieldsArray = [
                `team__c.member_type__c`,
                `team__c.name`,
                `team__c.sfid`
            ];
            tableName = `team__c`;

            offset = '0';
            limit = '1000';
            if(req.query.offset!=undefined && req.query.offset!=""){
                offset = req.query.offset;
            }
            if(req.query.limit!=undefined && req.query.limit!=""){
                limit = req.query.limit;
            }


            orderBy = '',
            WhereClouse = [];
            
            WhereClouse.push({ "fieldName": "member_type__c", "fieldValue": "ASM" })
            
            sql = db.SelectAllQry(fieldsArray, tableName, WhereClouse, offset, limit);
            console.log(`INFO:: GET ALL ASM ${sql}`);
            var asmList = await client.query(sql);

            if(asmList.rowCount > 0){
                response.status = 200;
                response.response = { "success": true, "message": "","data":{"asm":asmList.rows} };
                return response;
                
            }else{
                response.status = 200;
                response.response = { "success": false, "message": "Mandatory parameter(s) are missing.","data":{} };
                return response;

            }
            
        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing.","data":{} };
            return response;
        }
    } catch (e) {
        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error.","data":{} };
        return response;
    }
}
/**
 * Get all PSM of login agent. login agent id we will have in headers
 * @param {*} req 
 */
async function getAllPsm(req) {
    try {
        if (validation.issetNotEmpty(req.headers.agentid)) {

            var teamDetail = await db.getAsmHirarchy(req.headers.agentid);
            console.log('teamDetail >>> ', teamDetail);
            if (teamDetail.success) {
                fieldsArray = [
                    `team__c.member_type__c`,
                    `team__c.name`,
                    `team__c.sfid`,
                    `team__c.email__c`,
                    `team__c.member_type__c`,
                    `team__c.phone_no__c`,
                    `team__c.team_member_name__c`,
                    `team__c.user__c`,
                    `team__c.dob__c`
                ];
                tableName = `team__c`;

                offset = '0';
                limit = '1000';
                if (req.query.offset != undefined && req.query.offset != "") {
                    offset = req.query.offset;
                }
                if (req.query.limit != undefined && req.query.limit != "") {
                    limit = req.query.limit;
                }


                orderBy = '',
                WhereClouse = [];
                
                WhereClouse.push({ "fieldName": "manager__c", "fieldValue": teamDetail.ASM, "type": "IN" })
                

                // if (validation.issetNotEmpty(req.headers.agentid)) {
                //     WhereClouse.push({ "fieldName": "manager__c", "fieldValue": req.headers.agentid })
                // }
                sql = db.SelectAllQry(fieldsArray, tableName, WhereClouse, offset, limit);
                console.log(`INFO:: GET ALL ASM ${sql}`);
                var asmList = await client.query(sql);
                console.log('asmList >>> ', asmList);
                if (asmList.rowCount > 0) {
                    response.status = 200;
                    response.response = { "success": true, "message": "", "data": { "psm": asmList.rows } };
                    return response;

                } else {
                    response.status = 400;
                    response.response = { "success": false, "message": "No Record found.", "data": {} };
                    return response;

                }
            } else {
                response.status = 400;
                response.response = { "success": false, "message": "No Record found.", "data": {} };
                return response;
            }
        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing.", "data": {} };
            return response;
        }
    } catch (e) {
        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error.", "data": {} };
        return response;
    }
}
/**
 * To get login agent all areas
 * @param {*} req headers agent id
 */
async function areas(req) {
    try {
        if (req.headers.agentid != undefined && validation.issetNotEmpty(req.headers.agentid)) {

            var teamDetail = await db.getAsmHirarchy(req.headers.agentid);
            if (teamDetail.success) {
            


            //var key = ['id'];
            //reqBody = cryptoJSON.decrypt(reqBody, encrypt_password, { encoding, key, algorithm });
            let sql = `SELECT DISTINCT on (Area_SS__c.sfid) Area_SS__c.sfid ,Area_SS__c.name as area_name,City_SS__c.name as city_name 
            FROM ${process.env.TABLE_SCHEMA_NAME}.team_area__c 
            LEFT JOIN ${process.env.TABLE_SCHEMA_NAME}.Area_SS__c ON team_area__c.area__c = Area_SS__c.sfid  
            LEFT JOIN ${process.env.TABLE_SCHEMA_NAME}.City_SS__c ON Area_SS__c.city__c = City_SS__c.sfid  
            where `;
            teamArr = [];
            teamArr = teamDetail.ASM;
            teamArr = teamArr.concat(teamDetail.PSM)
            teamIds = teamArr.join("','");
            sql +=`team_member__c IN ('${teamIds}')`;

            console.log(sql);
            var agentAreas = await client.query(sql);

            if (agentAreas.rowCount != undefined && agentAreas.rowCount > 0) {
                response.status = 200;
                response.response = { "success": true, "message": "", "data": { "areas": agentAreas.rows } };
                return response;
            } else {
                response.status = 200;
                response.response = { "success": true, "message": "No record found.", "data": { "areas": [] } };
                return response;
            }
        }else{
            response.status = 400;
                response.response = { "success": false, "message": "No record found.", "data": { "areas": [] } };
                return response;
        }
        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing." };
            return response;
        }
    } catch (e) {
        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error." };
        return response;
    }
}

/**
 * Function is used to get server currnt date & time 
 * @param {*} req 
 */
async function getServerTime(req) {
    try {
        if (validation.issetNotEmpty(req.headers.agentid)) {
            var today_date = moment().format('YYYY-MM-DD');
            var current_time = moment().format('HH:mm:ss');
            var timezone = moment().format('Z z');
            var timestamp = moment().format('x');

            //var dateString = moment.unix(timestamp).format("YYYY-MM-DD HH:mm:ss");
            //console.log(`dateString :::: ${dateString} `);

            response.status = 200;
            response.response = { "success": true, "message": "", "data": { "date": today_date, "time": current_time, "timezone": timezone.trim(), "unix_timestamp": timestamp } };
            return response;

        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing." };
            return response;
        }
    } catch (e) {
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error." };
        return response;
    }
}
async function insertRecord(area, latitude, longitude, checkin_address__c, attendance_date, attendance_time, agentid) {

    try {
        var current_datetime = moment().format('YYYY-MM-DD HH:mm:ss');
        var UUID_attendance = uuidv4();
        return await client.query(
            `INSERT into ${process.env.TABLE_SCHEMA_NAME}.Attendance_SS__c (pg_id__c, area__c, checkin_location__latitude__s, checkin_location__longitude__s,checkin_address__c, start_day__c, team__c, End_Day__c,Attendance_Date__c,Start_Time__c,createddate, type__c) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
            [UUID_attendance, area, latitude, longitude, checkin_address__c, true, agentid, false, attendance_date, attendance_time, current_datetime,'Present'])
            .then(data => {
                return { "success": true, "message": "Attendance mark successfully", "data": {} };
            }).catch(err => {
                console.log('err 137 >>>> ', err);
                return { "success": false, "message": "Error while insert", "data": {} };
            });
    } catch (e) {
        return { "success": false, "message": "Error while insert", "data": {} };
    }
}

/**
 * Afetr login user can use this api to start his day.
 * This api has following mandatory parameters Area, Latitude, Longitude, date
 * @param {*} Area 
 * @param {*} Latitude 
 * @param {*} Longitude 
 * @param {*} date
 * @response  status = 200 for success, 400 for no record found and 500 for internal server error  
 */
async function startDay(req) {
    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.area) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.latitude) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.longitude) : false;
        is_Validate = is_Validate ? validation.isValidDate(req.body.date) : false;

        if (is_Validate) {

            console.log('Start Day');
            var timestamp = dtUtil.removeMiliSec(req.body.date);
            
            var today_date = moment.unix(timestamp).format("YYYY-MM-DD");

            // Is record already created? 
            var records = await client.query(`Select id from ${process.env.TABLE_SCHEMA_NAME}.Attendance_SS__c where Attendance_Date__c = '${today_date}' and team__c='${req.headers.agentid}' limit 1`);
            if (records.rows.length == 0) {
                var area = req.body.area;
                var latitude = req.body.latitude;
                var longitude = req.body.longitude;
                
                var attendance_date = moment.unix(timestamp).format("YYYY-MM-DD");
                var attendance_time = moment.unix(timestamp).format("HH:mm:ss");
                var checkin_address = await db.getLocationAddr (latitude,longitude);

                // Insert record in attendance table
                dbresp = await insertRecord(area,latitude, longitude, checkin_address, attendance_date, attendance_time, req.headers.agentid);
                console.log(dbresp);
                if(dbresp.success){
                    response.status = 200;
                    response.response = dbresp;
                    return response;

                }else{
                    response.status = 400;
                    response.response = dbresp;
                    return response;
                }

            }else if(records.rows.length==1){
                response.status = 200;
                response.response = {
                    "success": true,
                    "message": "Attendance mark successfully",
                    "data": {}
                };
                return response;

            } else {
                response.status = 400;
                response.response = { "success": false, "message": "Attendance already marked.", "data": {} };
                return response;
            }
        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing.", "data": {} };
            return response;
        }
    } catch (e) {

        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error.", "data": {} };
        return response;
    }
}



/**
 * FUnction is used to check is attadence mark for specific day
 * Mandatory Parameter(): date
 * @param {*} req Header: agentid
 */
async function isAttMark(req) {
    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.isValidDate(req.body.date) : false;

        if (is_Validate) {

            console.log('Start Day');
            
            var timestamp = dtUtil.removeMiliSec(req.body.date);
            
            var today_date = moment.unix(timestamp).format("YYYY-MM-DD");

            // Is record already created? 
            var attendance_fields = ` start_day__c,team__c,checkout_address__c,type__c,name,end_day__c,end_time__c,date_part('epoch'::text, createddate) * (1000)::double precision as createddate,absent_reason__c,start_time__c,date_part('epoch'::text, attendance_date__c) * (1000)::double precision as attendance_date__c,sfid,pg_id__c,checkin_address__c,
            checkin_location__latitude__s, checkin_location__longitude__s, checkout_location__latitude__s, checkout_location__longitude__s `;
            var records = await client.query(`Select ${attendance_fields} from ${process.env.TABLE_SCHEMA_NAME}.Attendance_SS__c where Attendance_Date__c = '${today_date}' and team__c='${req.headers.agentid}' limit 1`);
           
            if (records.rows.length == 0) {
                    response.status = 200;
                    response.response = {"success":false,"message":"Attendance is not marked yet.","data":{}};
                    return response;
            
            } else {
                var checkout_address = await db.getLocationAddr (records.rows[0].checkout_location__latitude__s,records.rows[0].checkout_location__longitude__s);
                var checkin_address = await db.getLocationAddr (records.rows[0].checkin_location__latitude__s,records.rows[0].checkin_location__longitude__s);
                console.log('LocationAddress =  ', checkout_address);
                records.rows[0]['checkout_address'] = checkout_address;
                records.rows[0]['checkin_address'] = checkin_address;


                response.status = 200;
                response.response = { "success": true, "message": "","data":records.rows[0]};
                return response;
            }

        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing.", "data": {} };
            return response;
        }
    } catch (e) {

        console.log(e);
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error.", "data": {} };
        return response;
    }
}

async function updateRecord(attendance_date, attendance_time, agentid, latitude, longitude,checkout_address) {

    try {
        return await client.query(
            `update ${process.env.TABLE_SCHEMA_NAME}.Attendance_SS__c set End_Day__c='true', End_Time__c='${attendance_time}', checkout_location__latitude__s='${latitude}', checkout_location__longitude__s='${longitude}', checkout_address__c='${checkout_address}' where Team__c='${agentid}' and Attendance_Date__c='${attendance_date}'`)
            .then(data => {
                console.log('INFO:::: Data >>>> ', data);
                return { "success": true, "message": "Attendance updated successfully." };
            }).catch(err => {
                console.log('ERROR:::: err 137 >>>> ', err);
                return { "success": false, "message": "Error while update record." };
            });
    } catch (e) {
        return { "success": false, "message": "Error while update record." };
    }
}

/**
 * Afetr complected all visit/assigned work agent can update end date time for today's attendance. 
 * @param {*} req 
 */
async function endDay(req) {
    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.latitude) : false;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.body.longitude) : false;
        is_Validate = is_Validate ? validation.isValidDate(req.body.date) : false;
        // day should be start before end it
        if (is_Validate) {

            console.log('End Day');
           
            var timestamp = dtUtil.removeMiliSec(req.body.date);

            var attendance_date = moment.unix(timestamp).format("YYYY-MM-DD");
            var attendance_time = moment.unix(timestamp).format("HH:mm:ss");
            var checkout_address = await db.getLocationAddr (req.body.latitude,req.body.longitude);

            dbresp = await updateRecord(attendance_date, attendance_time, req.headers.agentid, req.body.latitude, req.body.longitude,checkout_address);
            response.status = 200;
            response.response = dbresp;
            return response;

        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing.", "data": {} };
            return response;
        }
    } catch (e) {
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error.", "data": {} };
        return response;
    }
}

/**
 * Due to some reason agent is not able to work so he cam mark as absent.
 * Mandatory Parameter(s): absentReason, leaveType, date, headers: agentid
 * @param {*} req 
 */

async function markAbsent(req) {
    try {
        is_Validate = true;
        is_Validate = is_Validate ? validation.issetNotEmpty(req.headers.agentid) : false;
        is_Validate = is_Validate ? validation.isPicklistValueValid(req.body.absentReason,'attendance','absent_reason__c',true) : false;
        is_Validate = is_Validate ? validation.isPicklistValueValid(req.body.leaveType,'attendance','type__c',true) : false;
        is_Validate = is_Validate ? validation.isValidDate(req.body.date) : false;
        // day should be start before end it
        if (is_Validate) {

            var timestamp = dtUtil.removeMiliSec(req.body.date);

            var attendance_date = moment.unix(timestamp).format("YYYY-MM-DD");
            var current_date_time = moment().format("YYYY-MM-DD HH:mm:ss");

            return await client.query(`Select * from ${process.env.TABLE_SCHEMA_NAME}.Attendance_SS__c where Team__c='${req.headers.agentid}' and Attendance_Date__c = '${attendance_date}'`)
                .then(async records => {
                    if (records.rowCount == 0) {
                        return await client.query(
                            `INSERT into ${process.env.TABLE_SCHEMA_NAME}.Attendance_SS__c (Team__c, Absent_Reason__c, Type__c,Attendance_Date__c,createddate) VALUES($1, $2, $3, $4, $5) RETURNING id`,
                            [req.headers.agentid, req.body.absentReason, req.body.leaveType, attendance_date, current_date_time])
                            .then(data => {
                                response.status = 200;
                                response.response = { "success": true, "message": "Absent mark successfully.", "data": {} };
                                return response;
                            }).catch(err => {
                                console.log(`ERROE:::  >>> `, err)
                                response.status = 500;
                                response.response = { "success": false, "message": "Internal server error.", "data": {} };
                                return response;
                            });
                    } else {
                        response.status = 400;
                        response.response = { "success": false, "message": "Attendance already marked.", "data": {} };
                        return response;
                    }
                }).catch(err => {
                    response.status = 500;
                    response.response = { "success": false, "message": "Internal server error.", "data": {} };
                    return response;
                });
        } else {
            response.status = 400;
            response.response = { "success": false, "message": "Mandatory parameter(s) are missing.", "data": {} };
            return response;
        }
    } catch (e) {
        response.status = 500;
        response.response = { "success": false, "message": "Internal server error.", "data": {} };
        return response;
    }
}


async function visitClose() {
    try {
        // update record status 
        // Where condition Agent id and current date
        // Status = Close
    } catch (e) {
        return {};
    }
}


