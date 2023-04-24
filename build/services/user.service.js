"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const mongoose_1 = require("mongoose");
const fs = require("fs");
const handlebars = require("handlebars");
const firebase_scrypt_1 = require("firebase-scrypt");
const models_1 = require("_app/models");
const utils_1 = require("_app/utils");
const services_1 = require("_app/services");
const exceptions_1 = require("_app/exceptions");
const config_1 = require("_app/config");
class UserService {
    constructor() {
        this.user = models_1.userModel;
        this.verificaionModel = models_1.verificationModel;
        this.userFollow = models_1.userFollowModel;
        this.badge = models_1.badgeModel;
        this.userBadge = models_1.userBadgeModel;
        this.holding = models_1.holdingModel;
        this.returnDay = models_1.returnDayModel;
        this.awsService = new services_1.AwsService();
        this.mailsService = new services_1.MailerService();
        this.notificationService = new services_1.NotificationService();
        this.fmpService = new services_1.FmpService();
        this._tradeService = new services_1.TradeService();
    }
    static getInstance() {
        if (!UserService._sharedInstance) {
            UserService._sharedInstance = new UserService();
        }
        return UserService._sharedInstance;
    }
    async getUserByEmail(email, isAdmin = false) {
        return await this.user.findOne({ email });
    }
    async getProfessorByAccessCode(inviteCode) {
        return await this.user.findOne({ inviteCode });
    }
    async getUserBySocialId(socialId) {
        return await this.user.findOne({ socialId });
    }
    async getUserById(id, currentUserId) {
        const user = this.user.findById(id);
        if (!currentUserId) {
            const myProfile = await user;
            return myProfile;
        }
        const otherUser = await user.populate({ path: "followed", match: () => ({ user: currentUserId }) });
        return otherUser;
    }
    async getUserByUsername(username) {
        return await this.user.findOne({ username });
    }
    async confirmCurrentPassword(currentUser, currentPassword) {
        const userData = await this.getUserById(currentUser._id);
        if (userData) {
            if (userData.loginType === "0") {
                const hash_config = {
                    signerKey: config_1.Env.FIREBASE_AUTH_SIGNER_KEY,
                    saltSeparator: config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR,
                    rounds: 8,
                    memCost: 14,
                };
                const scrypt = new firebase_scrypt_1.FirebaseScrypt(hash_config);
                var isPasswordMatching = await scrypt.verify(currentPassword, userData.get("salt", null, { getters: false }) || config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR, userData.get("passwordHash", null, { getters: false }));
                if (!isPasswordMatching) {
                    throw new exceptions_1.HttpException(400, "Wrong Current Password");
                }
                else {
                    return { message: "Password is correct" };
                }
            }
            else {
                throw new exceptions_1.HttpException(400, "You logged in with your social account");
            }
        }
        else {
            throw new exceptions_1.HttpException(400, "User doesn't exist.");
        }
    }
    async updateEmailVerifiedStatus(userId) {
        await this.user.findByIdAndUpdate(userId, { emailVerified: true });
    }
    async updateUserStatus(user, status) {
        await this.user.findByIdAndUpdate(user._id, { isApprovedByProfessor: status });
        const html = fs.readFileSync(__dirname + "/../emailTemplates/student_status_update.html", "utf8").toString();
        var newstatus = "Congratulations, your request to join the WaffleStock has been granted. You can now Sign In with your credentials. Welcome to the WaffleStock, place you can practice trading without negative consequences.";
        var title = "WaffleStock Access had been Granted";
        if (status == false) {
            title = "WaffleStock Access had been Denied";
            newstatus = "We are sorry to let you know that your request to join the WaffleStock has been denied. Please contact your professor/faculty advisor for additional questions.";
        }
        const template = handlebars.compile(html);
        const htmlToSend = template({
            username: user.username,
            userstatus: newstatus,
        });
        await this.mailsService.sendEmail(user.email, title, htmlToSend);
    }
    async updateProfile(userId, passwordHash, profileData) {
        if (profileData.username) {
            // check unique username excluding current user
            const duplication = await this.getUserByUsername(profileData.username);
            if (duplication) {
                throw new exceptions_1.HttpException(400, "User name already exists.");
            }
        }
        if (profileData.email) {
            // check unique username excluding current user
            const duplication = await this.getUserByEmail(profileData.email);
            if (duplication) {
                throw new exceptions_1.HttpException(400, "User email already exists.");
            }
        }
        if (profileData.password) {
            const hash_config = {
                signerKey: config_1.Env.FIREBASE_AUTH_SIGNER_KEY,
                saltSeparator: config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR,
                rounds: 8,
                memCost: 14,
            };
            const scrypt = new firebase_scrypt_1.FirebaseScrypt(hash_config);
            const hashedPassword = await scrypt.hash(profileData.password, config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR);
            await this.user.findByIdAndUpdate(userId, { passwordHash: hashedPassword });
        }
        else {
            if (profileData.hasOwnProperty('bio') && profileData.bio.length === 0)
                delete profileData.bio;
            if (profileData.hasOwnProperty('photoUrl') && profileData.photoUrl.length === 0)
                delete profileData.photoUrl;
            if (profileData.hasOwnProperty('pronoun') && profileData.pronoun.length === 0)
                delete profileData.pronoun;
            if (profileData.hasOwnProperty('education') && profileData.education.length === 0)
                delete profileData.education;
            if (profileData.hasOwnProperty('otherPronouns') && profileData.otherPronouns.length === 0)
                delete profileData.otherPronouns;
            if (profileData.hasOwnProperty('otherEducation') && profileData.otherEducation.length === 0)
                delete profileData.otherEducation;
            if (profileData.hasOwnProperty('userFullName') && profileData.userFullName.length === 0)
                delete profileData.userFullName;
            if (profileData.hasOwnProperty('photoUrl') && profileData.photoUrl.length > 0 && profileData.photoUrl === "AAA")
                profileData.photoUrl = "";
            await this.user.findByIdAndUpdate(userId, profileData);
        }
        return await this.user.findById(userId);
    }
    async saveToken(currentUser, token) {
        await this.user.findByIdAndUpdate(currentUser._id, { token: token });
    }
    async getuserTotalHolding(userId) {
        const total = await this.holding.aggregate([
            {
                $match: { user: new mongoose_1.default.Types.ObjectId(userId) },
            },
            {
                $count: "holdings"
            }
        ]);
        return total.length > 0 ? total[0].holdings : 0;
    }
    async getInceptionDate(userId) {
        const firstBuying = await this._tradeService.getfirstTradeOfUser(userId);
        return firstBuying;
    }
    async getUsers(userId, limit, page, skip, query, orderBy) {
        const filter = query
            ? {
                $or: [
                    { email: new RegExp(query, "i") },
                    { username: new RegExp(query, "i") },
                    { userFullName: new RegExp(query, "i") },
                ],
            }
            : {};
        const userQuery = this.user
            .find(filter)
            .populate("newPosts")
            .skip(skip)
            .limit(limit);
        if (orderBy) {
            userQuery.sort({ userFullName: 1 });
        }
        else {
            userQuery.sort({ createdAt: -1 });
        }
        const total = await this.user.find().merge(userQuery).skip(0).limit(null).countDocuments();
        const users = await userQuery;
        return {
            data: users || [],
            page: Number(page),
            limit: Number(limit),
            total,
        };
    }
    async sendEmailVerificationCode(email, username) {
        const { code } = (0, utils_1.generateVerifyCode)(5);
        const { token } = (0, utils_1.createSignupToken)(email, username, true, code, 1);
        const html = fs.readFileSync(__dirname + "/../emailTemplates/verify-email.html", "utf8").toString();
        const template = handlebars.compile(html);
        const htmlToSend = template({
            username: username,
            verify_code_0: code.split("")[0],
            verify_code_1: code.split("")[1],
            verify_code_2: code.split("")[2],
            verify_code_3: code.split("")[3],
            verify_code_4: code.split("")[4],
            verify_code_5: code.split("")[5],
        });
        await this.mailsService.sendEmail(email, "WaffleStock Email Verification", htmlToSend);
        await this.verificaionModel.updateOne({ email: email, type: "email-verify" }, { token, email: email, type: "email-verify", code: code }, { upsert: true });
        return { code, token };
    }
    async sendNewStudentRegisterEmail(email, username, studentName, studentEmail) {
        const html = fs.readFileSync(__dirname + "/../emailTemplates/new_student_registered.html", "utf8").toString();
        const template = handlebars.compile(html);
        const htmlToSend = template({
            username: username,
            studentname: studentName + "(" + studentEmail + ")",
        });
        await this.mailsService.sendEmail(email, "Request for WaffleStock Access", htmlToSend);
        return 0;
    }
    async confirmVerificationCode(email, username, preSavedCode, enteredCode, token) {
        if (preSavedCode == enteredCode) {
            const verification = await models_1.verificationModel.findOneAndRemove({ token, email, enteredCode });
            if (verification) {
                return true;
            }
        }
        else {
            throw new exceptions_1.WrongAuthenticationTokenException("Something is wrong with your request");
        }
    }
    async parseUserNameEmail(token) {
        return (0, utils_1.parseVerificationToken)(token);
    }
    // Reset Password
    async getUserBgetUserByEmailForEmailSignedUseryEmail(email, loginType) {
        const user = await this.user.findOne({ email, loginType });
        if (user) {
            const { code } = (0, utils_1.generateVerifyCode)(5);
            const { token } = (0, utils_1.createSignupToken)(email, user.username, true, code, 1);
            const html = fs.readFileSync(__dirname + "/../emailTemplates/verify-email.html", "utf8").toString();
            const template = handlebars.compile(html);
            const htmlToSend = template({
                username: user.username,
                verify_code_0: code.split("")[0],
                verify_code_1: code.split("")[1],
                verify_code_2: code.split("")[2],
                verify_code_3: code.split("")[3],
                verify_code_4: code.split("")[4],
                verify_code_5: code.split("")[5],
            });
            await this.mailsService.sendEmail(email, "WaffleStock Forgot Password Request Verification", htmlToSend);
            await this.verificaionModel.updateOne({ email: user.email, type: "reset-password" }, { token, email: user.email, type: "reset-password" }, { upsert: true });
            return { code, token };
        }
        else {
            throw new exceptions_1.WrongAuthenticationTokenException("user not found");
        }
    }
    async sendResetPasswordEmail(user) {
        // const { link, token } = generateResetPasswordLink(user.email);
        // await this.awsService.sendResetPassword(user.email, user.fullName, link);
        // await this.verificaionModel.updateOne(
        //   { email: user.email, type: "reset-password" },
        //   { token, email: user.email, type: "reset-password" },
        //   { upsert: true }
        // );
        return true;
    }
    async resetPassword(email, password) {
        const hash_config = {
            signerKey: config_1.Env.FIREBASE_AUTH_SIGNER_KEY,
            saltSeparator: config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR,
            rounds: 8,
            memCost: 14,
        };
        const scrypt = new firebase_scrypt_1.FirebaseScrypt(hash_config);
        const hashedPassword = await scrypt.hash(password, config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR);
        return await this.user.findOneAndUpdate({ email }, { passwordHash: hashedPassword, salt: config_1.Env.FIREBASE_AUTH_SALT_SEPARTOR });
    }
    async deleteUser(userId) {
        await this.user.findByIdAndDelete(userId);
        return;
    }
    async followUser(follow, leaderId, userId, userName) {
        if (follow) {
            var followstatus = await this.userFollow.findOne({ leader: leaderId, user: userId });
            if (followstatus) {
                if (followstatus.isAccepted == 0) {
                    throw new exceptions_1.HttpException(400, "You already sent follow request to this user.");
                }
                else {
                    throw new exceptions_1.HttpException(400, "You already followed this user.");
                }
            }
            else {
                await this.userFollow.findOneAndUpdate({ leader: leaderId, user: userId, isAccepted: 1 }, {}, { upsert: true });
                await this.notificationService.createNotification(userId.toString(), leaderId, 0, "", userName + " followed you", 0);
            }
        }
        else {
            await this.userFollow.findOneAndDelete({ leader: leaderId, user: userId });
        }
        return true;
    }
    async blockFollowUser(leaderId, userId, userName) {
        var followstatus = await this.userFollow.findOne({ leader: leaderId, user: userId, isAccepted: 1 });
        if (followstatus) {
            await this.userFollow.findOneAndDelete({ leader: leaderId, user: userId });
        }
        else {
            throw new exceptions_1.HttpException(400, "This user didn't followed you.");
        }
        return true;
    }
    async acceptFollowuser(follow, leaderId, userId) {
        if (follow) {
            var followstatus = await this.userFollow.findOne({ leader: leaderId, user: userId, isAccepted: 0 });
            if (followstatus) {
                if (followstatus.isAccepted == 0) {
                    await this.userFollow.findOneAndUpdate({ leader: leaderId, user: userId }, { isAccepted: 1 }, { upsert: true });
                    var notiExist = await this.notificationService.getNotificationBySenerReceiverAndType(userId, leaderId, 0);
                    if (notiExist) {
                        await this.notificationService.updateNotiAccept(notiExist._id.toString(), 1);
                    }
                    const userFollowCounts = await this.userFollow.countDocuments({ leader: leaderId });
                    const followBadges = await this.badge.find({ type: 0 });
                    await Promise.all(followBadges.map(async (badge) => {
                        if (userFollowCounts === badge.number) {
                            const data = {
                                user: leaderId,
                                badge: badge._id,
                            };
                            await this.userBadge.findOneAndUpdate(data, data, { upsert: true });
                            await this.notificationService.createNotification(leaderId.toString(), badge._id.toString(), 9, badge._id.toString(), "Congratulation! You earned a new badge", 1);
                        }
                    }));
                }
                else {
                    throw new exceptions_1.HttpException(400, "You already followed bythis user.");
                }
            }
            else {
                throw new exceptions_1.HttpException(400, "Follow request was cancelled.");
            }
        }
        else {
            await this.userFollow.findOneAndDelete({ leader: leaderId, user: userId });
        }
        return true;
    }
    async getFollowers(myId, userId, limit, page, skip, keyword, orderBy) {
        let filterQuery = [];
        if (keyword !== null && keyword.length > 0) {
            filterQuery.push({ username: new RegExp(keyword, "i") });
            filterQuery.push({ userFullName: new RegExp(keyword, "i") });
        }
        let myFollowQuery = [];
        const followers = await this.userFollow.find({ leader: userId, isAccepted: 1 });
        const followedIds = followers.map((userFollow) => userFollow.user.toString());
        myFollowQuery.push({ _id: { $in: followedIds } });
        const filter = {};
        filterQuery.length > 0 ? (filter.$or = filterQuery) : null;
        myFollowQuery.length > 0 ? (filter.$and = myFollowQuery) : null;
        const followersQuery = this.user
            .find(filter)
            .populate({
            path: "followed",
            match: () => ({ user: myId }),
        })
            .skip(skip)
            .limit(limit);
        if (orderBy) {
            followersQuery.sort({ _id: 1 });
        }
        else {
            followersQuery.sort({ createdAt: -1 });
        }
        const total = await this.user.find().merge(followersQuery).skip(0).limit(null).countDocuments();
        const followerusers = await followersQuery;
        return {
            followers: followerusers || [],
            page: Number(page),
            limit: Number(limit),
            total,
        };
    }
    async getFollowingIds(userId) {
        const followings = await this.userFollow.find({ user: userId });
        const followingIds = followings.map((userFollow) => userFollow.leader.toString());
        return followingIds;
    }
    async getFollowings(myId, userId, limit, page, skip, keyword, orderBy) {
        let filterQuery = [];
        if (keyword !== null && keyword.length > 0) {
            filterQuery.push({ username: new RegExp(keyword, "i") });
            filterQuery.push({ userFullName: new RegExp(keyword, "i") });
        }
        let myFollowQuery = [];
        const followings = await this.userFollow.find({ user: userId });
        const followingIds = followings.map((userFollow) => userFollow.leader.toString());
        myFollowQuery.push({ _id: { $in: followingIds } });
        const filter = {};
        filterQuery.length > 0 ? (filter.$or = filterQuery) : null;
        myFollowQuery.length > 0 ? (filter.$and = myFollowQuery) : null;
        const followingsQuery = this.user
            .find(filter)
            .populate({
            path: "followed",
            match: () => ({ user: myId }),
        })
            .skip(skip)
            .limit(limit);
        if (orderBy) {
            followingsQuery.sort({ _id: 1 });
        }
        else {
            followingsQuery.sort({ createdAt: -1 });
        }
        const total = await this.user.find().merge(followingsQuery).skip(0).limit(null).countDocuments();
        const followingsusers = await followingsQuery;
        return {
            followings: followingsusers || [],
            page: Number(page),
            limit: Number(limit),
            total,
        };
    }
    async getFollowedUsers(user) {
        const users = await this.userFollow.find({ user: user._id }).populate("leader");
        return users;
    }
    async getUserGeographicalBreakdown(userId) {
        let countryColors = [
            "#FFA523",
            "#2256CD",
            "#0BA1DD",
            "#15289B",
            "#34A853",
            "#0BA1DD",
            "#59C1D0",
            "#B8EBF2",
            "#470D69",
            "#801780",
            "#9867C5"
        ];
        const holdingPerCountries = await this.holding.aggregate([
            {
                $match: { user: new mongoose_1.default.Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "stocks",
                    as: "stock",
                    localField: "stock",
                    foreignField: "_id",
                },
            },
            {
                $unwind: "$stock",
            },
            {
                $lookup: {
                    from: "currencyexchanges",
                    as: "currencyexchange",
                    localField: "stock.currency",
                    foreignField: "currency",
                },
            },
            {
                $unwind: "$currencyexchange",
            },
            {
                $project: {
                    _id: 0,
                    stock: 1,
                    quantity: 1,
                    country: "$stock.country",
                    total: {
                        $multiply: [
                            "$stock.price",
                            "$quantity",
                            "$currencyexchange.ask"
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$country",
                    total: { $sum: "$total" },
                },
            },
            {
                $addFields: {
                    "country": "$_id",
                },
            },
            {
                $unset: ["_id"],
            }
        ]);
        let totalPrice = 0;
        holdingPerCountries.forEach((oneObject) => {
            totalPrice += oneObject.total;
        });
        let data = [];
        if (holdingPerCountries.length > 0) {
            holdingPerCountries.forEach((oneHolding, index) => {
                const oneObj = {
                    "country": oneHolding.country,
                    "percent": (oneHolding.total / totalPrice * 100).toFixed(2),
                    "color": countryColors[index]
                };
                data.push(oneObj);
            });
        }
        return data;
    }
    async getUserPortfolioAnalysis(userId) {
        const user = await this.user.findById(new mongoose_1.default.Types.ObjectId(userId));
        const userReturnObjects = await this.returnDay.find({ user: new mongoose_1.default.Types.ObjectId(userId) });
        const userReturnPercentages = [];
        const userInvestAmounts = [];
        let totalPercentage = 0;
        let isPassedFirstNonZeroValue = false;
        let low = 10000000;
        let high = -1;
        //============ For Corrolation and R Square===============
        let xMean = [];
        let returnDates = [];
        userInvestAmounts.push(user.initFunds);
        userReturnObjects.forEach((oneObject) => {
            if (low > oneObject.investing)
                low = oneObject.investing;
            if (high < oneObject.investing)
                high = oneObject.investing;
            if (oneObject.percents != 0 && isPassedFirstNonZeroValue == false) {
                returnDates.push(oneObject.createdAt.toISOString().split("T")[0]);
                isPassedFirstNonZeroValue = true;
                userReturnPercentages.push(oneObject.percents);
                userInvestAmounts.push(oneObject.investing);
                totalPercentage += oneObject.percents;
            }
            else if (oneObject.percents == 0 && isPassedFirstNonZeroValue == false) {
            }
            else {
                returnDates.push(oneObject.createdAt.toISOString().split("T")[0]);
                userReturnPercentages.push(oneObject.percents);
                totalPercentage += oneObject.percents;
                userInvestAmounts.push(oneObject.investing);
            }
        });
        const percentageCount = userReturnPercentages.length;
        let avgPercentage = 0;
        let avg2Value = 0;
        let dailyStandardDeviation = 0; // Daily Standard Deviation from Excel formular
        let cagr = 0;
        const userReturnMeanPow = []; //(return perenct/return mean)^2
        let sumOfVariance = 0;
        let sumOfVarianceDividNminuse1 = 0; // sumOfVariance/(N-1);
        let annualizedSTDEV = 0;
        if (percentageCount > 0) {
            avgPercentage = totalPercentage / percentageCount;
            userReturnPercentages.forEach((oneObject) => {
                let oneAvg = oneObject - avgPercentage;
                let oneAvg2 = Math.pow(oneAvg, 2); // (oneReturn - avgReturn)^2
                userReturnMeanPow.push(oneAvg2);
                xMean.push(oneAvg);
                avg2Value += oneAvg2;
            });
            cagr = Math.pow(userReturnPercentages[userReturnPercentages.length - 1] / user.initFunds, (1 / (1 / ((userReturnPercentages.length + 1) / 365)))) - 1; // Need to ask if first return is zero?????
            sumOfVariance = avg2Value;
            sumOfVarianceDividNminuse1 = sumOfVariance / (percentageCount - 1);
            dailyStandardDeviation = Math.sqrt(sumOfVarianceDividNminuse1);
            annualizedSTDEV = dailyStandardDeviation * Math.sqrt(252);
        }
        //======== Calculate Max Drawdown=============
        let drawdownItems = [];
        let maxDrawdown = 100000;
        userInvestAmounts.forEach((oneObject, index) => {
            if (index < userInvestAmounts.length - 1) {
                let maxDrawdownOfEachReturns = userInvestAmounts[index + 1] > user.initFunds ? userInvestAmounts[index + 1] : user.initFunds;
                let oneDrawdown = (oneObject / maxDrawdownOfEachReturns) - 1;
                drawdownItems.push(oneDrawdown); // It's J Column values
                if (oneDrawdown < maxDrawdown)
                    maxDrawdown = oneDrawdown;
            }
        });
        //console.log(drawdownItems);
        //========== Calculate Sharpe Ratio ============
        const riskFreeRate = await this.fmpService.getRiskFreeRate();
        let sharpeRatio = 0;
        sharpeRatio = (avgPercentage - riskFreeRate) / annualizedSTDEV;
        //========= Calculate Sortino Ratio===========
        let sortinoRatio = 0;
        let excessReturns = []; //G column of Excel
        let downExcessReturns = []; // H column of Excel
        let totalDownExcessReturn = 0;
        let avgDownExcessReturn = 0;
        let stdevExpressReturn = 0;
        userReturnPercentages.forEach((oneObject) => {
            let excessReturn = oneObject - riskFreeRate;
            if (excessReturn < 0) {
                downExcessReturns.push(excessReturn);
                totalDownExcessReturn += excessReturn;
            }
        });
        if (downExcessReturns.length > 0) {
            avgDownExcessReturn = totalDownExcessReturn / downExcessReturns.length;
            let sumOfAvgDownExcessReturns = 0;
            downExcessReturns.forEach((oneObject, index) => {
                sumOfAvgDownExcessReturns += Math.pow(oneObject - avgDownExcessReturn, 2);
            });
            stdevExpressReturn = Math.sqrt(sumOfAvgDownExcessReturns / (downExcessReturns.length - 1)) * Math.sqrt(12); // G63 value of excel
            sortinoRatio = (cagr - riskFreeRate) / stdevExpressReturn;
        }
        //=========== Beta Calculation================
        const total = await this.holding.aggregate([
            {
                $match: { user: new mongoose_1.default.Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "stocks",
                    localField: "stock",
                    foreignField: "_id",
                    as: "stock",
                },
            },
            {
                $unwind: "$stock",
            },
            {
                $lookup: {
                    from: "currencyexchanges",
                    as: "currencyexchange",
                    localField: "stock.currency",
                    foreignField: "currency",
                },
            },
            {
                $unwind: "$currencyexchange",
            },
            {
                $project: {
                    _id: 0,
                    stock: 1,
                    subTotal: {
                        $multiply: [
                            "$stock.price",
                            "$quantity",
                            "$currencyexchange.ask"
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$user",
                    total: { $sum: "$subTotal" },
                },
            },
        ]);
        const stockHoldings = await this.holding.aggregate([
            {
                $match: { user: new mongoose_1.default.Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "stocks",
                    localField: "stock",
                    foreignField: "_id",
                    as: "stock",
                },
            },
            {
                $unwind: "$stock",
            },
            {
                $lookup: {
                    from: "currencyexchanges",
                    as: "currencyexchange",
                    localField: "stock.currency",
                    foreignField: "currency",
                },
            },
            {
                $unwind: "$currencyexchange",
            },
            {
                $project: {
                    _id: 0,
                    stock: 1,
                    quantity: 1,
                    currencyexchange: 1,
                    total: {
                        $multiply: [
                            "$stock.price",
                            "$quantity",
                            "$currencyexchange.ask"
                        ],
                    },
                    percent: {
                        $round: [
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            {
                                                $multiply: [
                                                    "$stock.price",
                                                    "$quantity",
                                                    "$currencyexchange.ask"
                                                ],
                                            },
                                            total.length > 0 ? total[0].total : 0
                                        ],
                                    },
                                    100,
                                ],
                            },
                            2,
                        ],
                    },
                },
            },
            {
                $addFields: {
                    "stock.id": "$stock._id",
                    potfolioBeta: {
                        $multiply: [
                            "$stock.beta",
                            "$percent",
                        ],
                    },
                },
            },
            {
                $sort: { percent: -1 },
            }
        ]);
        let totalBeta = 0;
        stockHoldings.forEach((oneObject) => {
            totalBeta += oneObject.potfolioBeta;
        });
        //============ Corrolation and R^2==============  
        let yValues = []; // S&P 500 Return values
        let yMean = [];
        let xMeanYmean = [];
        let userYmeanReturnPow = [];
        let yTotalValue = 0;
        let xTotalValue = 0;
        let xMeanYmeanTotalValue = 0; // Sum of (X-mean)*(Y-mean)
        let userYmeanReturnPowTotalValue = 0;
        let corrolation = 0;
        let rSquare = 0;
        if (userReturnObjects.length > 0) {
            let sp500Return = await this.fmpService.getReturnHistoryOfSP500(userReturnObjects[0].createdAt.toISOString().split("T")[0], userReturnObjects[userReturnObjects.length - 1].createdAt.toISOString().split("T")[0]);
            let prevYreturn = 0;
            xMean.forEach((oneObject, index) => {
                const returnDate = returnDates[index];
                const oneSp500Return = sp500Return.find((one) => one.date === returnDate);
                if (oneSp500Return) {
                    prevYreturn = oneSp500Return.changePercent;
                }
                yValues.push(prevYreturn);
            });
            let yMeanValue = 0;
            let totalYMeanValue = 0;
            if (yValues.length > 0)
                yMeanValue =
                    yValues.forEach((oneObject, index) => {
                        totalYMeanValue += oneObject;
                    });
            yMeanValue = totalYMeanValue / yValues.length;
            yValues.forEach((oneObject, index) => {
                const oneYmean = oneObject - yMeanValue;
                yMean.push(oneYmean);
                xMeanYmean.push(oneYmean * xMean[index]);
                userYmeanReturnPow.push(Math.pow(oneYmean, 2));
                yTotalValue += oneYmean;
                xTotalValue += xMean;
                xMeanYmeanTotalValue += oneYmean * xMean[index];
                userYmeanReturnPowTotalValue += Math.pow(oneYmean, 2);
            });
            corrolation = xMeanYmeanTotalValue / Math.sqrt(avg2Value * userYmeanReturnPowTotalValue);
            rSquare = Math.pow(corrolation, 2);
        }
        let data = {
            annualizedReturn: cagr.toFixed(2),
            mean: (avgPercentage * 100).toFixed(2),
            sumOfVariance: (sumOfVariance * 100).toFixed(2),
            sumOfVarianceDividNminuse1: (sumOfVarianceDividNminuse1 * 100).toFixed(2),
            dailyStandardDeviation: (dailyStandardDeviation * 100).toFixed(2),
            annualizedSTDEV: (annualizedSTDEV * 100).toFixed(2),
            maxDrawdown: (maxDrawdown * 100).toFixed(2),
            sharpeRatio: sharpeRatio,
            sortinoRatio: sortinoRatio,
            low: low,
            high: high,
            beta: (totalBeta / 100).toFixed(2),
            corrolation: corrolation,
            rSquare: rSquare,
        };
        return data;
    }
    async getAllUsersOfProfessor(professor, studentStatus) {
        let filter = { professor: new mongoose_1.default.Types.ObjectId(professor) };
        if (studentStatus == 1) {
            filter = {
                professor: new mongoose_1.default.Types.ObjectId(professor),
                isApprovedByProfessor: false,
            };
        }
        if (studentStatus == 2) {
            filter = {
                professor: new mongoose_1.default.Types.ObjectId(professor),
                isApprovedByProfessor: true,
            };
        }
        const users = await this.user.aggregate([
            {
                $match: filter,
            }
        ]);
        return users;
    }
}
exports.UserService = UserService;
UserService._sharedInstance = null;
//# sourceMappingURL=user.service.js.map