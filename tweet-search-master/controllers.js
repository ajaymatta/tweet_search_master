//inject the twitterService into the controller
app.controller('TwitterController', function($scope,$q, $http, twitterService) {

    $scope.tweets=[]; //array of tweets

    twitterService.initialize();

    //using the OAuth authorization result get the latest 20 tweets from twitter for the user
    $scope.refreshTimeline = function(maxId) {
        twitterService.getLatestTweets(maxId).then(function(data) {
            $scope.tweets = $scope.tweets.concat(data);
        },function(){
            $scope.rateLimitError = true;
        });
    }
	
	$scope.searchTwitter = function() {
        twitterService.getSearchResults().then(function(data) {
			$scope.twitterSearchResult = data;
			data = data.statuses;
            $scope.tweets = $scope.tweets.concat(data);
        },function(){
            $scope.rateLimitError = true;
        });
	}
	
	$scope.twitterSentiment = function() {
		var config = {
            headers : {'X-Mashape-Authorization' : 'xA44CDJwt1mshfrJ1cRwBxU5AVYCp1T2oFojsnmd0sMU8AYhOg', 
					   'Content-Type': 'application/json'}	
		}
		
		for (var i = 0; i < $scope.twitterSearchResult.search_metadata.count; i++)	{
			var data = $.param({
				text: $scope.tweets[i].text
			});
			$scope.tweets[i].label = {};
			$http.post('https://japerk-text-processing.p.mashape.com/sentiment/',
						data, 
						config).then(
				function (data, status, headers, config) {
						//$scope.tweets[i].truncated = data.label;
						console.log((data));
						//console.log($scope.tweets[i]);
				},function (data, status, header, config) {
						alert(data);
				});	
		}		
    }

    //when the user clicks the connect twitter button, the popup authorization window opens
    $scope.connectButton = function() {
        twitterService.connectTwitter().then(function() {
            if (twitterService.isReady()) {
                //if the authorization is successful, hide the connect button and display the tweets
                $('#connectButton').fadeOut(function(){
                    $('#getTimelineButton, #getSearchTwitterButton, #getTwitterSentimentButton, #signOut').fadeIn();
                    //$scope.refreshTimeline();
					          $scope.connectedTwitter = true;
                });
            } else {

			         }
        });
    }

    //sign out clears the OAuth cache, the user will have to reauthenticate when returning
    $scope.signOut = function() {
        twitterService.clearCache();
        $scope.tweets.length = 0;
        $('#getTimelineButton, #getSearchTwitterButton, #getTwitterSentimentButton, #signOut').fadeOut(function(){
            $('#connectButton').fadeIn();
			$scope.$apply(function(){$scope.connectedTwitter=false})
        });
        $scope.rateLimitError = false;    
    }

    //if the user is a returning user, hide the sign in button and display the tweets
    if (twitterService.isReady()) {
        $('#connectButton').hide();
        $('#getTimelineButton, #getSearchTwitterButton, #getTwitterSentimentButton, #signOut').show();
    	$scope.connectedTwitter = true;
       // $scope.refreshTimeline();
    }

});