"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsService = void 0;
const AWS = require("aws-sdk");
const axios_1 = require("axios");
const exceptions_1 = require("_app/exceptions");
const config_1 = require("../config");
AWS.config.credentials = {
    accessKeyId: config_1.Env.AWS_ACCESS_KEY,
    secretAccessKey: config_1.Env.AWS_SECRET_KEY,
};
AWS.config.update({ region: config_1.Env.AWS_REGION });
AWS.config.apiVersions = {
    sesv2: "2019-09-27",
};
class AwsService {
    constructor() {
        this.SESClient = new AWS.SESV2();
        this.s3Client = new AWS.S3();
    }
    static getInstance() {
        if (!AwsService._sharedInstance) {
            AwsService._sharedInstance = new AwsService();
        }
        return AwsService._sharedInstance;
    }
    async sendEmailVerification(email, name, otpCode) {
        const params = {
            Content: {
                Template: {
                    TemplateName: "EmailVerification",
                    TemplateData: `{ "user_name":"${name}", "verify_code_0": "${otpCode[0]}", "verify_code_1": "${otpCode[1]}", "verify_code_2": "${otpCode[2]}", "verify_code_3": "${otpCode[3]}", "verify_code_4": "${otpCode[4]}", "verify_code_5": "${otpCode[5]}" }`,
                },
            },
            Destination: {
                ToAddresses: [email],
            },
            FromEmailAddress: "support@investpuzzle.com",
        };
        return await this.SESClient.sendEmail(params).promise();
    }
    async sendResetPassword(email, name, otpCode) {
        const params = {
            Content: {
                Template: {
                    TemplateName: "ResetPassword",
                    TemplateData: `{ "user_name":"${name}", "user_email": "${email}", "verify_code": "${otpCode}" }`,
                },
            },
            Destination: {
                ToAddresses: [email],
            },
            FromEmailAddress: "support@investpuzzle.com",
        };
        return await this.SESClient.sendEmail(params).promise();
    }
    async createTemplate(templateName, subject, html) {
        // import raw html file like this.
        //const html = fs.readFileSync(__dirname + "/../../emailTemplates/feed-post-available.html", "utf8").toString();
        // subject: email subject
        const params = {
            TemplateName: templateName,
            TemplateContent: {
                Subject: subject,
                Html: html,
            },
        };
        return await this.SESClient.createEmailTemplate(params).promise();
    }
    async deleteTemplate(templateName) {
        const params = {
            TemplateName: templateName,
        };
        return await this.SESClient.deleteEmailTemplate(params).promise();
    }
    async createProfilePresignedS3Url(fileData) {
        const key = `profile/${fileData.folder}/${fileData.name}`;
        const data = await this.s3Client.createPresignedPost({
            Bucket: config_1.AWS_CONFIG.BUCKETS.FILE,
            Fields: {
                key,
            },
            Expires: 3600,
            Conditions: [
                { bucket: config_1.AWS_CONFIG.BUCKETS.FILE },
                ["eq", "$acl", "public-read"],
                { "Content-Type": fileData.type },
                ["content-length-range", 0, 100000000],
            ],
        });
        return Object.assign(Object.assign({}, data), { url: `https://s3.us-east-1.amazonaws.com/${config_1.AWS_CONFIG.BUCKETS.FILE}` });
    }
    async getProfilePresignedS3Url(folder, name, type, file) {
        const key = `profile/${folder}/${name}`;
        const s3data = await this.s3Client.createPresignedPost({
            Bucket: config_1.AWS_CONFIG.BUCKETS.FILE,
            Fields: {
                key,
            },
            Expires: 3600,
            Conditions: [
                { bucket: config_1.AWS_CONFIG.BUCKETS.FILE },
                ["eq", "$acl", "public-read"],
                { "Content-Type": type },
                ["content-length-range", 0, 100000000],
            ],
        });
        // return { ...data, url: `https://s3.us-east-1.amazonaws.com/${AWS_CONFIG.BUCKETS.FILE}` };
        try {
            console.log(s3data.fields['X-Amz-Signature']);
            var form_data = {
                'key': s3data.fields.key,
                'Content-Type': type,
                'acl': 'public-read',
                'bucket': 'investpuzzle',
                'X-Amz-Algorithm': s3data.fields['X-Amz-Algorithm'],
                'X-Amz-Credential': s3data.fields['X-Amz-Credential'],
                'X-Amz-Date': s3data.fields['X-Amz-Date'],
                'Policy': s3data.fields.Policy,
                'X-Amz-Signature': s3data.fields['X-Amz-Signature'],
                'file': file
            };
            console.log("endded2");
            let config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };
            const { filedata } = await axios_1.default.post(`https://s3.us-east-1.amazonaws.com/${config_1.AWS_CONFIG.BUCKETS.FILE}`, form_data, config);
            console.log("endded");
            console.log(filedata);
        }
        catch (error) {
            console.log("errorexception");
            throw new exceptions_1.HttpException(400, error);
        }
    }
}
exports.AwsService = AwsService;
AwsService._sharedInstance = null;
//# sourceMappingURL=aws.service.js.map