import * as Logger from "bunyan";

import { Router } from "express";
import {
  AuthenticationService,
  AwsService,
  MailerService,
  UserService,
  StockService,
  TradeService,
  NotificationService,
  FmpService,
  BadgeService,
  ReturnService,
  NewsService,
  CustomScenarioService,

} from "_app/services";
import { AccessoriesService } from "_app/services/accessories.service";
import { ChatService } from "_app/services/chat.service";
import { GroupService } from "_app/services/group.service";
import { PostService } from "_app/services/post.service";

/**
 * Base controller that handles abstracted logic common to all controllers in the application
 */
abstract class Controller {
  /**
   * Express Router object
   */
  public router: Router;
  protected path: string;
  protected _authenticationService: AuthenticationService;
  protected _userService: UserService;
  protected _awsService: AwsService;
  protected _accessoriesService: AccessoriesService;
  protected _mailerService: MailerService;
  protected _stockService: StockService;
  protected _tradeService: TradeService;
  protected _groupService: GroupService;
  protected _notificationService: NotificationService;
  protected _postService: PostService;
  protected _fmpService: FmpService;
  protected _badgeService: BadgeService;
  protected _returnService: ReturnService;
  protected _chatService: ChatService;
  protected _newsService: NewsService;
  protected _customScenarioService: CustomScenarioService;



  /**
   * The controller constructor is responsible for setting up the router and initialising the routes to the the
   * implementing controller
   * @constructor
   */
  protected constructor(path: string, protected logger: Logger) {
    this.router = Router();
    this.path = path;

    this._authenticationService = AuthenticationService.getInstance();
    this._userService = UserService.getInstance();
    this._awsService = AwsService.getInstance();
    this._accessoriesService = AccessoriesService.getInstance();
    this._mailerService = MailerService.getInstance();
    this._stockService = StockService.getInstance();
    this._tradeService = TradeService.getInstance();
    this._groupService = GroupService.getInstance();
    this._notificationService = NotificationService.getInstance();
    this._postService = PostService.getInstance();
    this._fmpService = FmpService.getInstance();
    this._badgeService = BadgeService.getInstance();
    this._returnService = ReturnService.getInstance();
    this._chatService = ChatService.getInstance();
    this._newsService = NewsService.getInstance();
    this._customScenarioService = CustomScenarioService.getInstance();

  }

  /**
   * Get the router object for the controller
   */
  public getRoutes(): Router {
    this.logger.debug("Retrieving routes for controller");
    return this.router;
  }
}

export { Controller };
