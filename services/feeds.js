/**
 * Created by bantonides on 12/3/13.
 */
var utils = require('./utils');
var dao = require('../dao/db');
var mapper = require('./mappers/feed');
var _ = require('underscore');

var registerFeedsServices = function (app) {
  /*
   * REST endpoints associated with Feed data
   */
  app.get('/services/feeds', utils.ensureAuthentication, allFeedsGET);
  app.get('/services/feeds/:feedid', utils.ensureAuthentication, feedOverviewGET);
  app.get('/services/feeds/:feedid/source', utils.ensureAuthentication, feedSourceGET);
  app.get('/services/feeds/:feedid/election', utils.ensureAuthentication, feedElectionGET);
  app.get('/services/feeds/:feedid/election/contests', utils.ensureAuthentication, feedElectionContestsGET);
  app.get('/services/feeds/:feedid/polling', utils.ensureAuthentication, feedPollingGET);
  app.get('/services/feeds/:feedid/contests', utils.ensureAuthentication, feedContestsGET);
  app.get('/services/feeds/:feedid/results', utils.ensureAuthentication, feedResultsGET);
  app.get('/services/feeds/:feedid/history', utils.ensureAuthentication, feedHistoryGET);
};

/*
 * Callbacks for HTTP verbs
 */
allFeedsGET = function (req, res) {
  dao.getFeeds(function(arr, data) {
    res.json(_.map(data, function (data) {
      return mapper.mapFeed(req.path, data);
    }));
  });

};

feedOverviewGET = function (req, res) {
  res.json(mapper.mapFeedOverview(req.path, req.params.feedid));
};

feedSourceGET = function (req, res) {
  var source = {}; //TODO: get data from the database
  res.json(mapper.mapSource(req.path, source));
};

feedElectionGET = function (req, res) {
 var election = {}; //TODO: get data from the database
  res.json(mapper.mapElection(req.path, election));
};

feedElectionContestsGET = function (req, res) {
  var election = {}; //TODO: get data from the database
  res.json(mapper.mapElectionContest(req.path, election));
};

feedPollingGET = function (req, res) {
  var polling = {}; //TODO: get data from the database
  res.json(mapper.mapPollingSummary(req.path, polling));
};

feedContestsGET = function(req, res) {
  var contests = {}; //TODO: get data from the database
  res.json(mapper.mapContests(req.path, contests));
};

feedResultsGET = function(req, res) {
  var results = {}; //TODO: get data from the database
  res.json(mapper.mapResults(req.path, results));
};

feedHistoryGET = function(req, res) {
  var history = {}; //TODO: get data from the database
  res.json(mapper.mapHistory(req.path, history));
};

exports.registerFeedsServices = registerFeedsServices;