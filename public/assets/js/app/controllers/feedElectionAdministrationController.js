'use strict';
/*
 * Feeds Election Administration Controller
 *
 */
function FeedElectionAdministrationCtrl($scope, $rootScope, $feedDataPaths, $feedsService, $routeParams, $appProperties, $location, $filter, ngTableParams) {

  var feedid = $scope.vipfeed = $routeParams.vipfeed;
  var localityid = $routeParams.locality;

  $feedDataPaths.getResponse({ path: '/db/feeds/' + feedid + '/election/state/localities/' + localityid + '/election-administration',
                               scope: $rootScope,
                               key: 'feedElectionAdministration',
                               errorMessage: 'Could not retrieve Locality Data.'},
                             function(result) { $rootScope.feedElectionAdministration = result[0]; });

  $feedDataPaths.getResponse({ path: '/db/feeds/' + feedid + '/election/state/localities/' + localityid + '/election-administration/election-official',
                               scope: $rootScope,
                               key: 'feedElectionOfficial',
                               errorMessage: 'Could not retrieve Locality Data.'},
                             function(result) { $rootScope.feedElectionOfficial = result[0]; });

  $feedDataPaths.getResponse({ path: '/db/feeds/' + feedid + '/election/state/localities/' + localityid + '/election-administration/overseas-voter-contact',
                               scope: $rootScope,
                               key: 'feedOverseasVoterContact',
                               errorMessage: 'Could not retrieve Locality Data.'},
                             function(result) { $rootScope.feedOverseasVoterContact = result[0]; });  

  $rootScope.setPageHeader("Election Administration", $rootScope.getBreadCrumbs(), "feeds", "", null);
}