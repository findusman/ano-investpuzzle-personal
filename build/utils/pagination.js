"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginator = void 0;
const getPaginator = ({ query, }) => {
    let _page = 1;
    let _limit = 20;
    let _skip = 0;
    let _query = null;
    let _pageToken;
    let _orderBy = 1;
    let _keyword = null;
    let _filterType = 0;
    let _myfollowonly = 1;
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
    if (query.filterType) {
        _filterType = Number(query.filterType);
    }
    if (query.myfollowonly) {
        _myfollowonly = Number(query.myfollowonly);
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
        filterType: _filterType,
        myfollowonly: _myfollowonly,
        orderBy: _orderBy,
    };
};
exports.getPaginator = getPaginator;
//# sourceMappingURL=pagination.js.map