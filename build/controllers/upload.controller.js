"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const middlewares_1 = require("_app/middlewares");
const dtos_1 = require("_app/dtos");
const interfaces_1 = require("_app/interfaces");
const fs = require("fs");
const path = require("path");
//import { multer } from "multer";
class UploadController extends interfaces_1.Controller {
    constructor(loggerFactory) {
        super("/upload", loggerFactory.getNamedLogger("upload-controller"));
        this.uploadEmailTemplate = async (request, response, next) => {
            //const fileData: ProfileFileDto = request.body;
            const html = fs.readFileSync(__dirname + "/../emailTemplates/verify-email.html", "utf8").toString();
            const templateName = "EmailVerification";
            const subject = "Email verification for signup";
            try {
                const data = await this._awsService.createTemplate(templateName, subject, html);
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteEmailTemplate = async (request, response, next) => {
            try {
                const data = await this._awsService.deleteTemplate("EmailVerification");
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.createProfilePresignedS3Url = async (request, response, next) => {
            const fileData = request.body;
            try {
                const data = await this._awsService.createProfilePresignedS3Url(fileData);
                response.send({ data: data });
            }
            catch (error) {
                next(error);
            }
        };
        this.uploadFile = async (request, response, next) => {
            // const fileData  = request.body;
            // console.log(fileData);
            const documentFile = request.file;
            console.log(documentFile);
            try {
                const data = { 'url': documentFile.path };
                response.send({ data: data });
            }
            catch (error) {
                next(error);
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/profile`, (0, middlewares_1.validationMiddleware)(dtos_1.ProfileFileDto), (0, middlewares_1.authMiddleware)(), this.createProfilePresignedS3Url);
        this.router.post(`${this.path}/uploadtemplate`, this.uploadEmailTemplate);
        this.router.post(`${this.path}/deletetemplate`, this.deleteEmailTemplate);
        // this.router.post(
        //   `${this.path}/uploadfile`,
        //   authMiddleware(),
        //   this.uploadFile
        // );
        const multer = require('multer');
        const imageStorage = multer.diskStorage({
            // Destination to store image     
            destination: 'uploads',
            filename: (req, file, cb) => {
                cb(null, file.fieldname + '_' + Date.now()
                    + path.extname(file.originalname));
                // file.fieldname is name of the field (image)
                // path.extname get the uploaded file extension
            }
        });
        const imageUpload = multer({ dest: 'uploads/',
            storage: imageStorage,
            limits: {
                fileSize: 1000000 // 1000000 Bytes = 1 MB
            },
            fileFilter(req, file, cb) {
                if (!file.originalname.match(/\.(png|jpg)$/)) {
                    // upload only png and jpg format
                    return cb(new Error('Please upload a Image'));
                }
                cb(undefined, true);
            }
        });
        this.router.post(`${this.path}/uploadfile`, imageUpload.single('file'), (req, res) => {
            res.send(req.file);
        }, (error, req, res, next) => {
            res.status(400).send({ error: error.message });
        });
    }
}
exports.default = UploadController;
//# sourceMappingURL=upload.controller.js.map