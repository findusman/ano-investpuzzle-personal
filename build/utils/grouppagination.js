"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupPaginator = void 0;
const getGroupPaginator = ({ query, }) => {
    let _page = 1;
    let _limit = 20;
    let _skip = 0;
    let _query = null;
    let _pageToken;
    let _orderBy = 1;
    let _keyword = null;
    let _myOwnOnly = 0;
    let _groupType = 0;
    if (Number(query.page) > 1) {
        _page = Number(query.page);
        _skip = (_page - 1) * _limit;
    }
    if (query.limit) {
        _limit = Number(query.limit);
        _skip = (_page - 1) * _limit;
    }
    if (query.query) {
        _query = query.query.toString();
    }
    if (query.pageToken) {
        _pageToken = query.pageToken.toString();
    }
    if (query.keyword) {
        _keyword = query.keyword.toString();
    }
    if (query.myOwnOnly) {
        _myOwnOnly = Number(query.myOwnOnly);
    }
    if (query.groupType) {
        _groupType = Number(query.groupType);
    }
    if (query.orderBy) {
        _orderBy = Number(query.orderBy);
    }
    return {
        page: _page,
        limit: _limit,
        skip: _skip,
        pageToken: _pageToken,
        keyword: _keyword,
        myOwnOnly: _myOwnOnly,
        groupType: _groupType,
        orderBy: _orderBy,
    };
};
exports.getGroupPaginator = getGroupPaginator;
//# sourceMappingURL=grouppagination.js.map