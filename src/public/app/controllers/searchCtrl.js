angular.module('apolloApp').controller('searchCtrl', function($scope, $resource, $http, $routeParams, $timeout, $filter) {
	
    $scope.$parent.q = 'explore';
	$scope.contentLoading = true;
    $scope.hadSearchResults = true;
    $scope.search=[];
    $scope.queryString = $routeParams.query;


    var searchTimeout =  $timeout(function(){ 
        throw new Error('Search Timeout');
        }, 60000);
    var nodes = $resource('/apollo/api/node/search/:query', {
        query: '@query'
    },{'query': {isArray: false }});

    var searchResult = nodes.query({
        query: $routeParams.query
    },function(result){
        $timeout.cancel(searchTimeout);
        if (result.nullset)
        {
            $scope.hadSearchResults = false;
        }
        $scope.contentLoading = false;
        $scope.labelCounts = result.nodeLabelCounts;
        $scope.nodes = result.nodedataarr;
        $scope.totalItems = result.nodedataarr.length;
        $filter('orderBy')($scope.totalItems, 'nodes.name');
    });
        
    if($routeParams.query == null || $routeParams.query == '')
    {
        $timeout.cancel(searchTimeout);
        $scope.hasSearchValue= false;
    }
    else
    {
        $scope.hasSearchValue= true;
    }

    $scope.redirectToSearch = function(){
       window.location =  '/apollo/#/search/' + $scope.queryString;
    };

    $scope.checkedLabels = {Program:false,SurveillanceSystem:false,Registry:false,
                            HealthSurvey:false,Tool:false,Dataset:false,DataStandard:false,
                            Collaborative:false,Organization:false,Tag:false};
    searchTimeout.catch( function(err){
            if(err != 'canceled')
            {
                alert('The search timed out, please try again');
            }
        });

    //pagination
 
  $scope.currentPage = 1;
  $scope.entryLimit = 10;
  $scope.maxSize = 10;


   $scope.filterclick = function(){
    $timeout(function(){ 
        //timeout to avoid race condition.  Could add a watch, but they don't seem to recognize labelCount status :-/

        //console.log('someone clicked a filter.  Program is currently ' + $scope.checkedLabels.Program);
        //check all checkboxes, if all are unchecked, then reset totalItems count for pagination
            if (!$scope.checkedLabels.Program && !$scope.checkedLabels.SurveillanceSystem && !$scope.checkedLabels.Registry 
                                && !$scope.checkedLabels.HealthSurvey&& !$scope.checkedLabels.Tool&& !$scope.checkedLabels.Dataset&& !$scope.checkedLabels.DataStandard
                                && !$scope.checkedLabels.Collaborative && !$scope.checkedLabels.Organization && !$scope.checkedLabels.Tag)
            {
                $scope.totalItems =  $scope.nodes.length;
            }
            else 
            {
                //check all checkboxes and add to the total count depending on what's checked.
                var filteredTotalItems = 0;
                if ($scope.checkedLabels.Program)
                {
                    filteredTotalItems = filteredTotalItems +  $scope.labelCounts.Program;
                }
                if ($scope.checkedLabels.SurveillanceSystem)
                {
                    filteredTotalItems = filteredTotalItems +  $scope.labelCounts.SurveillanceSystem;
                }
                if ($scope.checkedLabels.Registry)
                {
                    filteredTotalItems = filteredTotalItems +  $scope.labelCounts.Registry;
                }
                if ($scope.checkedLabels.HealthSurvey)
                {
                    filteredTotalItems = filteredTotalItems +  $scope.labelCounts.HealthSurvey;
                }
                if ($scope.checkedLabels.Tool)
                {
                    filteredTotalItems = filteredTotalItems +  $scope.labelCounts.Tool;
                }
                if ($scope.checkedLabels.Dataset)
                {
                    filteredTotalItems = filteredTotalItems +  $scope.labelCounts.Dataset;
                }
                if ($scope.checkedLabels.DataStandard)
                {
                    filteredTotalItems = filteredTotalItems +  $scope.labelCounts.DataStandard;
                }
                if ($scope.checkedLabels.Collaborative)
                {
                    filteredTotalItems = filteredTotalItems +  $scope.labelCounts.Collaborative;
                }
                if ($scope.checkedLabels.Organization)
                {
                    filteredTotalItems = filteredTotalItems +  $scope.labelCounts.Organization;
                }
                if ($scope.checkedLabels.Tag)
                {
                    filteredTotalItems = filteredTotalItems +  $scope.labelCounts.Tag;
                }
                $scope.totalItems =  filteredTotalItems;
            }        


        }, 10);
    
  }
});