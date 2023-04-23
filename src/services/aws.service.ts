import * as AWS from "aws-sdk";
import axios from "axios";
import { Exception } from "handlebars";
import { HttpException, UserAlreadyExistsException } from "_app/exceptions";
import { APP_CONFIG, AWS_CONFIG, Env } from "../config";
import { ProfileFileDto } from "../dtos";

AWS.config.credentials = {
  accessKeyId: Env.AWS_ACCESS_KEY,
  secretAccessKey: Env.AWS_SECRET_KEY,
};

AWS.config.update({ region: Env.AWS_REGION });

AWS.config.apiVersions = {
  sesv2: "2019-09-27",
};

export class AwsService {
  public SESClient = new AWS.SESV2();
  public s3Client = new AWS.S3();

  static _sharedInstance: AwsService = null;

  static getInstance() {
    if (!AwsService._sharedInstance) {
      AwsService._sharedInstance = new AwsService();
    }
    return AwsService._sharedInstance;
  }

  public async sendEmailVerification(email: string, name: string, otpCode: string[]) {
    const params: AWS.SESV2.SendEmailRequest = {
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

  public async sendResetPassword(email: string, name: string, otpCode: string[]) {
    const params: AWS.SESV2.SendEmailRequest = {
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

  public async createTemplate(templateName: string, subject: string, html: string) {
    // import raw html file like this.
    //const html = fs.readFileSync(__dirname + "/../../emailTemplates/feed-post-available.html", "utf8").toString();
    // subject: email subject

    const params: AWS.SESV2.CreateEmailTemplateRequest = {
      TemplateName: templateName,
      TemplateContent: {
        Subject: subject,
        Html: html,
      },
    };
    return await this.SESClient.createEmailTemplate(params).promise();
  }

  public async deleteTemplate(templateName: string) {
    const params: AWS.SESV2.DeleteEmailTemplateRequest = {
      TemplateName: templateName,
    };
    return await this.SESClient.deleteEmailTemplate(params).promise();
  }

  public async createProfilePresignedS3Url(fileData: ProfileFileDto) {
    const key = `profile/${fileData.folder}/${fileData.name}`;
    const data = await this.s3Client.createPresignedPost({
      Bucket: AWS_CONFIG.BUCKETS.FILE,
      Fields: {
        key,
      },
      Expires: 3600,
      Conditions: [
        { bucket: AWS_CONFIG.BUCKETS.FILE },
        ["eq", "$acl", "public-read"],
        { "Content-Type": fileData.type },
        ["content-length-range", 0, 100000000],
      ],
    });
    return { ...data, url: `https://s3.us-east-1.amazonaws.com/${AWS_CONFIG.BUCKETS.FILE}` };
  }

  public async getProfilePresignedS3Url(folder : string, name : string, type: string, file : any) {
    const key = `profile/${folder}/${name}`;
    const s3data = await this.s3Client.createPresignedPost({
      Bucket: AWS_CONFIG.BUCKETS.FILE,
      Fields: {
        key,
      },
      Expires: 3600,
      Conditions: [
        { bucket: AWS_CONFIG.BUCKETS.FILE },
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
        'Policy':  s3data.fields.Policy,
        'X-Amz-Signature': s3data.fields['X-Amz-Signature'],
        'file': file
      }    
      console.log("endded2");

      let config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }

      const { filedata }: any = await axios.post(
        `https://s3.us-east-1.amazonaws.com/${AWS_CONFIG.BUCKETS.FILE}`,
        form_data,        
        config 
      );
      console.log("endded");
      console.log(filedata);
    } catch (error) {
      console.log("errorexception");
      throw new HttpException(400, error);
    }
   
  }
}
