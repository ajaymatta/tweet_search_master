//inject the twitterService into the controller
app.controller('TwitterController', function($scope,$q, $http, twitterService) {

    $scope.tweets=[]; //array of tweets
	$scope.sentiResult = [];
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
			localStorage.setItem("counter", 0);
        },function(){
            $scope.rateLimitError = true;
        });
	}
	
	$scope.twitterSentiment = function() {

		var resultObject = {};
		resultObject.tweet = "";
		resultObject.senti = "";
		resultObject.userName = "";
		resultObject.userLocation ="";
		var config = {
            headers : {'X-Mashape-Authorization' : 'xA44CDJwt1mshfrJ1cRwBxU5AVYCp1T2oFojsnmd0sMU8AYhOg', 
					   'Content-Type': 'application/json'}	
		}
		
		//for (var i = 0; i < $scope.twitterSearchResult.search_metadata.count; i++)	{
			if (parseInt(localStorage.getItem("counter")) < $scope.twitterSearchResult.search_metadata.count) {
						
				var data = $.param({
					text: $scope.tweets[parseInt(localStorage.getItem("counter"))].text
				});
				resultObject.tweet = $scope.tweets[parseInt(localStorage.getItem("counter"))].text;
				$http.post('https://japerk-text-processing.p.mashape.com/sentiment/',
							data, 
							config).then(
					function (data, status, headers, config) {
							
						resultObject.senti = data.data.label;						
						//console.log((data));
						console.log(resultObject);
						if (parseInt(localStorage.getItem("counter")) < $scope.twitterSearchResult.search_metadata.count) {
							$scope.sentiResult[parseInt(localStorage.getItem("counter"))] = resultObject;
							localStorage.setItem("counter", parseInt(localStorage.getItem("counter")) +1 );
							$scope.twitterSentiment();
						} 
					},function (data, status, header, config) {
							alert("something is gone terrible wrong");
					});	
						}else if (parseInt(localStorage.getItem("counter")) == $scope.twitterSearchResult.search_metadata.count){
				$scope.chartDesign();
			}		
    }
	
	$scope.chartDesign = function () {
		var data = {};
		data.labels = [];
		data.datasets = [];
		data.datasets[0] = {}
		data.datasets[0].data = [];
		var counter = 0;
		for (var i = 0; i < $scope.twitterSearchResult.search_metadata.count; i++)	{
			if (data.labels.indexOf($scope.sentiResult[i].senti)==-1) {
				data.labels.push($scope.sentiResult[i].senti);
				data.datasets[0].data.push(1);
			} else {
				data.datasets[0].data[data.labels.indexOf($scope.sentiResult[i].senti)] +=1;
			}		
		}
		
		console.log (data);	
		
		
		/*var data = {
			labels: ["January", "February", "March", "April", "May", "June", "July"],
			datasets: [
				{
					label: "My First dataset",
					fill: false,
					lineTension: 0.1,
					backgroundColor: "rgba(75,192,192,0.4)",
					borderColor: "rgba(75,192,192,1)",
					borderCapStyle: 'butt',
					borderDash: [],
					borderDashOffset: 0.0,
					borderJoinStyle: 'miter',
					pointBorderColor: "rgba(75,192,192,1)",
					pointBackgroundColor: "#fff",
					pointBorderWidth: 1,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: "rgba(75,192,192,1)",
					pointHoverBorderColor: "rgba(220,220,220,1)",
					pointHoverBorderWidth: 2,
					pointRadius: 1,
					pointHitRadius: 10,
					data: [65, 59, 80, 81, 56, 55, 40],
					spanGaps: false,
				}
			]
		};*/
		
		var myLine = new Chart(document.getElementById("canvas").getContext("2d"), {type:'line', data:data});
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
