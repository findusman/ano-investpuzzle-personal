import { LoggerFactory } from "_app/factories";
import AuthenticationController from "./authentication.controller";
import UserController from "./user.controller";
import UploadController from "./upload.controller";
import CommonController from "./common.controller";
import StockController from "./stock.controller";
import TradeController from "./trade.controller";
import GroupController from "./group.controller";
import NotificationController from "./notification.controller";
import PostController from "./post.controller";
import ChatController from "./chat.controller";
import NewsController from "./news.controller";
import customScenarioController from "./customScenario.controller";




export const controllers = (logger: LoggerFactory) => {
  return [
    new UserController(logger),
    new AuthenticationController(logger),
    new UploadController(logger),
    new CommonController(logger),
    new StockController(logger),
    new TradeController(logger),
    new GroupController(logger),
    new NotificationController(logger),
    new PostController(logger),
    new ChatController(logger),
    new NewsController(logger),
    new customScenarioController(logger),

  ];
};
