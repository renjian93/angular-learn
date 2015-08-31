/**
 * Created by lenovo on 2015/8/3.
 */
var myControllers = angular.module('myControllers', []);

myControllers.controller('marketingListCtrl', ["$scope", "$http",
    function ($scope, $http) {
        // iscroll 初始化
        pullDownEl = document.getElementById('pullDown');
        pullDownOffset = $(pullDownEl).height();
        pullUpEl = document.getElementById('pullUp');
        pullUpOffset = $(pullUpEl).height();
        var myScroll = new IScroll('#wrapper', {
            //mouseWheel: true,
            scrollbars: true,
            click: true,
            topOffset: pullDownOffset
        });

        //绑定上拉更新 下拉翻页事件
        myScroll.on('scrollStart', function () {
            if (pullDownEl.className.match('loading')) {
                $(pullDownEl).removeClass("loading flip");
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新...';
            } else if (pullUpEl.className.match('loading')) {
                $(pullUpEl).removeClass("loading");
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '上拉加载更多...';
            }
        });
        myScroll.on('scrollMove', function () {
            if (this.y > 5 && !pullDownEl.className.match('flip')) {
                $(pullDownEl).addClass("flip");
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '松手开始更新...';
                this.minScrollY = 0;
            } else if (this.y < 5 && pullDownEl.className.match('flip')) {
                $(pullDownEl).removeClass("flip loading");
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新...';
                this.minScrollY = -pullDownOffset;
            } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
                $(pullUpEl).addClass("flip");
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '松手开始更新...';
                this.maxScrollY = this.maxScrollY;
            } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
                $(pullUpEl).removeClass("flip loading");
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '上拉加载更多...';
                this.maxScrollY = pullUpOffset;
            }
        });
        myScroll.on('scrollEnd', function () {
            if (pullDownEl.className.match('flip')) {
                $(pullDownEl).removeClass("flip").addClass("loading");
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '加载中...';
                pullDownAction();	// Execute custom function (ajax call?)
            } else if (pullUpEl.className.match('flip')) {
                $(pullUpEl).removeClass("flip").addClass("loading");
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载中...';
                pullUpAction();	// Execute custom function (ajax call?)
            }
        });

        //上拉下拉对应方法
        function pullDownAction() {
            var postData = {
                CURRENT_PAGE: 1,
            };
            getData(postData);
            currentPage = 1;
        };
        function pullUpAction() {
            if (!$scope.hasShowAllFlag) {
                var postData = {
                    CURRENT_PAGE: currentPage + 1,
                    P_UP_DOWN: "UP"
                };
                getData(postData);
                currentPage++;
            }
        }

        //初始化数据页面
        var currentPage = 1, P_RECORD_COUNT = 10;

        $scope.data = [];
        $scope.hasShowAllFlag = false;
        var currentPage = 1,
            urlAddress = "http://test.kingnode.com:10010/knd_xSimple/client/market/market_msgList.action";

        getData([]);

        //请求数据方法
        function getData(data) {
            var postData = {
                title: data.title || "",
                CURRENT_PAGE: data.CURRENT_PAGE || "1",
                P_UP_DOWN: data.P_UP_DOWN || "",
                P_RECORD_COUNT: data.P_RECORD_COUNT || "10"
            };
            if(postData.CURRENT_PAGE == 1){
                $scope.data = [];
            }
            console.log(JSON.stringify(postData));
            $http.get(urlAddress + '?data=' + JSON.stringify(postData)).success(function (data) {
                console.log(data);
                if ((currentPage - 1) * P_RECORD_COUNT+data.listdata.length >= data.size) {
                    $scope.hasShowAllFlag = true;
                }else{
                    $scope.hasShowAllFlag = false;
                }
                $scope.data = $scope.data.concat(data.listdata);
                setTimeout(function () {
                    myScroll.refresh();
                }, 200)
            }).error(function(data){

            });
        };
    }]);