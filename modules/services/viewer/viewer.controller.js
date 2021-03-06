angular.module("Viewer").controller("ViewerController", ["$scope", "imageCache", "$timeout", function($scope, imageCache, $timeout){
    var currentIndex,
        loadingTimeoutPromise;

    $scope.viewerOpen = false;

    var methods = {
        open: function(data){
            $scope.items = data.items;
            if (data.currentItem !== undefined)
                $scope.selectImage(data.currentItem);

            $scope.viewerOpen = true;
        }
    };

    $scope.$on($scope.service.type, function(e, eventData){
        methods[eventData.method] && methods[eventData.method](eventData.data);
    });

    $scope.prev = function(event){
        event.stopPropagation();
        $scope.selectImage(currentIndex - 1);
    };

    $scope.next = function(event){
        event.stopPropagation();
        $scope.selectImage(currentIndex + 1);
    };

    $scope.closeViewer = function(){
        currentIndex = null;
        $timeout.cancel(loadingTimeoutPromise);
        $scope.viewerOpen = false;
        $scope.currentItem = null;
    };

    $scope.$on("modalClose", $scope.closeViewer);

    $scope.selectImage = function(index){
        $timeout.cancel(loadingTimeoutPromise);
        $scope.currentItemIsFirst = $scope.currentItemIsLast = false;

        if (index <= 0){
            index = 0;
            $scope.currentItemIsFirst = true;
        }
        else if (index >= $scope.items.length - 1){
            index = $scope.items.length - 1;
            $scope.currentItemIsLast = true;
        }

        var item = $scope.items[currentIndex = index],
            imageUrl = item.url || item.image.src;

        $scope.currentItem = item;
        $scope.currentImageUrl = item.thumbnail ? item.thumbnail.src : imageUrl;
        $scope.currentImageWidth = item.width || (item.thumbnail && item.thumbnail.width);

        loadingTimeoutPromise = $timeout(function(){
            $scope.loading = true;
        }, 140);

        imageCache.cacheImage(imageUrl).then(function(imageData){
            item.width = imageData.width;
            item.height = imageData.height;
            $scope.currentImageUrl = imageUrl;
            $scope.currentImageWidth = item.width;
            $timeout.cancel(loadingTimeoutPromise);
            $scope.loading = false;
        }, function(error){
            if (error){
                $scope.currentItem = { url: null, title: "<i class='icon-warning-sign'></i> Can't load image from <a href='" + imageUrl + "' target='_blank'>" + imageUrl + "</a>"};
                $timeout.cancel(loadingTimeoutPromise);
                $scope.loading = false;
            }
        });
    };
}]);