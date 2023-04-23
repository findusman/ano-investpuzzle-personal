import { Request , Response, NextFunction } from "express";

import { authMiddleware, validationMiddleware } from "_app/middlewares";
import { LoggerFactory } from "_app/factories";
import { ProfileFileDto } from "_app/dtos";
import { Controller } from "_app/interfaces";
import * as fs from "fs";
import path = require("path");

//import { multer } from "multer";

class UploadController extends Controller {
  constructor(loggerFactory: LoggerFactory) {
    super("/upload", loggerFactory.getNamedLogger("upload-controller"));
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/profile`,
      validationMiddleware(ProfileFileDto),
      authMiddleware(),
      this.createProfilePresignedS3Url
    );

    this.router.post(
      `${this.path}/uploadtemplate`,      
      this.uploadEmailTemplate
    );

    this.router.post(
      `${this.path}/deletetemplate`,      
      this.deleteEmailTemplate
    );

    // this.router.post(
    //   `${this.path}/uploadfile`,
    //   authMiddleware(),
    //   this.uploadFile
    // );
    
    const multer  = require('multer');
    const imageStorage = multer.diskStorage({
        // Destination to store image     
        destination: 'uploads', 
        filename: (req: any, file: any, cb: any) => {
            cb(null, file.fieldname + '_' + Date.now() 
              + path.extname(file.originalname))
              // file.fieldname is name of the field (image)
              // path.extname get the uploaded file extension
      }
    });
    const imageUpload = multer({ dest: 'uploads/', 
        storage: imageStorage,
        limits: {
          fileSize: 1000000 // 1000000 Bytes = 1 MB
        },
        fileFilter(req: any, file: any, cb: any) {
          if (!file.originalname.match(/\.(png|jpg)$/)) { 
            // upload only png and jpg format
            return cb(new Error('Please upload a Image'))
          }
        cb(undefined, true)
      } 
    });
    this.router.post(
      `${this.path}/uploadfile`,  imageUpload.single('file'), (req : MulterRequest, res: any) => {
            res.send(req.file)
      }, (error : any, req: any, res: any, next: any) => {
            res.status(400).send({ error: error.message })
      }
   );
  }

  private uploadEmailTemplate = async (request: Request, response: Response, next: NextFunction) => {
    //const fileData: ProfileFileDto = request.body;
    const html = fs.readFileSync(__dirname + "/../emailTemplates/verify-email.html", "utf8").toString();
    const templateName = "EmailVerification";
    const subject = "Email verification for signup";
    try {
      const data = await this._awsService.createTemplate(templateName, subject, html);
      response.send(data);
    } catch (error) {
      next(error);
    }
  };

  private deleteEmailTemplate = async (request: Request, response: Response, next: NextFunction) => {    
    try {
      const data = await this._awsService.deleteTemplate("EmailVerification");
      response.send(data);
    } catch (error) {
      next(error);
    }
  };

  private createProfilePresignedS3Url = async (request: Request, response: Response, next: NextFunction) => {
    const fileData: ProfileFileDto = request.body;
    try {
      const data = await this._awsService.createProfilePresignedS3Url(fileData);
      response.send({data : data});
    } catch (error) {
      next(error);
    }
  };

  private uploadFile = async (request: MulterRequest, response: Response, next: NextFunction) => {
    // const fileData  = request.body;
    // console.log(fileData);
    const documentFile  = (request as MulterRequest).file;
    console.log(documentFile);
    try {
      const data = {'url' : documentFile.path};
      response.send({data : data});
    } catch (error) {
      next(error);
    }
  };
}



interface MulterRequest extends Request {
  file: any;
}

export default UploadController;
