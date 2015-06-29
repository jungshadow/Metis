var conn = require('./conn.js');
var queries = require('./queries.js');
var util = require('./util.js');

var overviewTableRow = function(row, type, dbTable, link) {
  return {element_type: type,
          count: row[dbTable + '_count'],
          complete_pct: row[dbTable + '_completion'],
          error_count: row[dbTable + '_error_count'],
          link: link};
}

module.exports = {
  // Functions below return arrays for the various queries with the requirement of an ID.
  getFeeds: util.simpleQueryResponder("SELECT r.public_id, date(r.start_time) AS date, CASE WHEN r.end_time IS NOT NULL THEN r.end_time - r.start_time END AS duration, r.complete, s.name AS state, e.election_type, e.date FROM results r LEFT JOIN states s ON s.results_id = r.id LEFT JOIN elections e ON e.results_id = r.id ORDER BY r.start_time DESC;"),
  getResults: util.simpleQueryResponder("SELECT * FROM results WHERE public_id=$1", function(req) { return [decodeURIComponent(req.params.feedid)]; }),
  getFeedContest: util.simpleQueryResponder("SELECT c.*, (SELECT COUNT(v.*) FROM validations v WHERE r.id = v.results_id AND v.scope = 'contests') AS error_count FROM contests c INNER JOIN results r ON r.id = c.results_id WHERE r.public_id=$1 AND c.id=$2;", function(req) { return [decodeURIComponent(req.params.feedid), decodeURIComponent(req.params.contestid)]; }),
  getFeedContestBallot: util.simpleQueryResponder("SELECT c.ballot_id, (SELECT COUNT(b.referendum_id) FROM ballots b WHERE b.id=c.ballot_id AND b.results_id = c.results_id) AS referendum_count, (SELECT COUNT(*) FROM ballot_candidates bc WHERE bc.results_id=c.results_id AND ballot_id=c.ballot_id) AS candidate_count FROM contests c INNER JOIN results r ON r.id=c.results_id WHERE r.public_id=$1 AND c.id=$2;", function(req) { return [decodeURIComponent(req.params.feedid), decodeURIComponent(req.params.contestid)]; }),
  getFeedContestBallotReferendum: util.simpleQueryResponder("SELECT ref.* FROM contests c LEFT JOIN ballots b ON b.id = c.ballot_id AND b.results_id = c.results_id INNER JOIN referendums ref ON ref.id = b.referendum_id AND ref.results_id = c.results_id LEFT JOIN results r ON r.id=c.results_id WHERE r.public_id=$1 AND c.id=$2;", function(req) { return [decodeURIComponent(req.params.feedid), decodeURIComponent(req.params.contestid)]; }),
  getFeedContestBallotCandidates: util.simpleQueryResponder("SELECT * FROM contests con LEFT JOIN ballot_candidates bc ON bc.ballot_id = con.ballot_id AND bc.results_id = con.results_id LEFT JOIN candidates can ON can.id = bc.candidate_id AND bc.results_id = can.results_id LEFT JOIN results r ON r.id=con.results_id WHERE r.public_id=$1 AND con.id=$2;", function(req) { return [decodeURIComponent(req.params.feedid), decodeURIComponent(req.params.contestid)]; }),
  getFeedContestBallotCustomBallot: util.simpleQueryResponder("SELECT cb.* FROM contests c LEFT JOIN ballots b ON b.custom_ballot_id = c.ballot_id AND b.results_id = c.results_id LEFT JOIN custom_ballots cb ON cb.id = b.custom_ballot_id AND cb.results_id = c.results_id LEFT JOIN results r ON r.id=c.results_id WHERE r.public_id=$1 AND c.id=$2;", function(req) { return [decodeURIComponent(req.params.feedid), decodeURIComponent(req.params.contestid)]; }),
  getFeedContestBallotCustomBallotResponses: util.simpleQueryResponder("SELECT br.*, (SELECT COUNT(v.*) FROM validations v WHERE v.results_id=c.results_id AND scope = 'ballot_responses' AND identifier = br.id) FROM contests c LEFT JOIN ballots b ON b.custom_ballot_id = c.ballot_id AND b.results_id = c.results_id LEFT JOIN custom_ballots cb ON cb.id = b.custom_ballot_id AND cb.results_id = c.results_id LEFT JOIN custom_ballot_ballot_responses cbbc ON cbbc.custom_ballot_id = cb.id AND cbbc.results_id = c.results_id LEFT JOIN ballot_responses br ON br.id = cbbc.ballot_response_id AND br.results_id = c.results_id  LEFT JOIN results r ON r.id=c.results_id WHERE r.public_id=$1 AND c.id=$2;", function(req) { return [decodeURIComponent(req.params.feedid), decodeURIComponent(req.params.contestid)]; }),
  getFeedContestElectoralDistrict: util.simpleQueryResponder("SELECT c.electoral_district_id, e.name, (SELECT COUNT(*) FROM precinct_electoral_districts ped WHERE ped.electoral_district_id = c.electoral_district_id) AS precinct_count, (SELECT COUNT(*) FROM precinct_split_electoral_districts psed WHERE psed.electoral_district_id = c.electoral_district_id) AS precinct_split_count FROM contests c INNER JOIN electoral_districts e ON c.electoral_district_id = e.id INNER JOIN results r ON r.id = c.results_id WHERE r.public_id=$1 AND c.id=$2;", function(req) { return [decodeURIComponent(req.params.feedid), decodeURIComponent(req.params.contestid)]; }),
  getFeedContestResult: util.simpleQueryResponder("SELECT cr.id, cr.total_votes, cr.total_valid_votes, cr.overvotes, cr.blank_votes, cr.certification FROM contests c INNER JOIN contest_results cr ON cr.contest_id = c.id INNER JOIN results r ON r.id = c.results_id WHERE r.public_id=$1 AND c.id=$2;", function(req) { return [decodeURIComponent(req.params.feedid), decodeURIComponent(req.params.contestid)]; }),
  getFeedContestBallotLineResults: util.simpleQueryResponder("SELECT blr.id, blr.votes, blr.certification FROM contests c INNER JOIN ballot_line_results blr ON blr.contest_id = c.id INNER JOIN results r ON r.id = c.results_id WHERE r.public_id=$1 AND c.id=$2;", function(req) { return [decodeURIComponent(req.params.feedid), decodeURIComponent(req.params.contestid)]; }),
  getFeedContests: util.simpleQueryResponder("SELECT c.* FROM contests c INNER JOIN results r ON r.id = c.results_id WHERE r.public_id=$1", function(req) { return [decodeURIComponent(req.params.feedid)]; }),
  getFeedLocalities: util.simpleQueryResponder("SELECT l.id, l.name, COUNT(p.*) AS precincts, CONCAT('#/feeds/', l.results_id, '/election/state/localities/', l.id) as link FROM localities l INNER JOIN precincts p ON p.locality_id = l.id AND p.results_id = l.results_id INNER JOIN results r ON l.results_id = r.id WHERE r.public_id = $1 GROUP BY l.id, l.name, l.results_id ORDER BY l.id;", function(req) { return [decodeURIComponent(req.params.feedid)]; }),
  getFeedState: util.simpleQueryResponder("SELECT s.id, s.name, (SELECT COUNT(l.*) FROM localities l WHERE l.results_id = s.results_id) AS locality_count, (SELECT COUNT(v.*) FROM validations v WHERE v.results_id = s.results_id AND v.scope = 'states') AS error_count FROM states s INNER JOIN results r ON s.results_id = r.id WHERE r.public_id = $1 GROUP BY s.id, s.name, s.results_id ORDER BY s.id;", function(req) { return [decodeURIComponent(req.params.feedid)]; }),
  getFeedElectionAdministrations: util.simpleQueryResponder("SELECT e.id, e.name, CONCAT(e.physical_address_city, ', ', e.physical_address_state, ', ', e.physical_address_zip) AS address, CONCAT('#/feeds/', e.results_id, '/election/state/electionadministration') AS link FROM election_administrations e INNER JOIN results r ON e.results_id = r.id WHERE r.public_id=$1;", function(req) { return [decodeURIComponent(req.params.feedid)]; }),
  getFeedElection: util.simpleQueryResponder("SELECT e.*, (SELECT COUNT(v.*) FROM validations v WHERE v.results_id = e.results_id AND scope='elections') AS error_count FROM elections e INNER JOIN results r ON r.id = e.results_id WHERE r.public_id=$1", function(req) { return [decodeURIComponent(req.params.feedid)]; }),
  getFeedReferendum: util.simpleQueryResponder("SELECT ref.*, (SELECT COUNT(v.*) FROM validations v WHERE v.results_id = ref.results_id AND scope='referendums' AND identifier = ref.id) AS error_count FROM referendums ref INNER JOIN results r ON r.id = ref.results_id WHERE r.public_id=$1 AND ref.id = $2;", function(req) { return [decodeURIComponent(req.params.feedid), decodeURIComponent(req.params.referendumid)]; }),
  getFeedReferendumBallotResponses: util.simpleQueryResponder("SELECT br.*, (SELECT COUNT(v.*) FROM validations v WHERE v.results_id = br.results_id AND scope='ballot_responses' AND identifier = br.id) AS error_count FROM referendums ref INNER JOIN referendum_ballot_responses rbr ON ref.id = rbr.referendum_id AND rbr.results_id = ref.results_id INNER JOIN ballot_responses br ON br.id = rbr.ballot_response_id AND br.results_id = ref.results_id INNER JOIN results r ON r.id = ref.results_id WHERE r.public_id=$1 AND ref.id = $2;", function(req) { return [decodeURIComponent(req.params.feedid), decodeURIComponent(req.params.referendumid)]; }),
  getFeedSource: util.simpleQueryResponder("SELECT s.*, (SELECT COUNT(v.*) FROM validations v WHERE v.results_id = s.results_id AND scope='sources') AS error_count FROM sources s INNER JOIN results r ON r.id = s.results_id WHERE r.public_id=$1", function(req) { return [decodeURIComponent(req.params.feedid)]; }),
  getFeedOverview: function(req, res) {
    var client = conn.openPostgres();
    var feedid = req.params.feedid;
    var query = client.query("SELECT s.* FROM statistics s INNER JOIN results r ON s.results_id = r.id WHERE r.public_id=$1", [decodeURIComponent(feedid)]);

    query.on("row", function (row, result) {
      var tables = {
        pollingLocations: [
          overviewTableRow(row, 'Early Vote Sites', 'early_vote_sites', '#/feeds/' + feedid + '/overview/earlyvotesites/errors'),
          overviewTableRow(row, 'Election Adminitrations', 'election_administrations', '#/feeds/' + feedid + '/overview/electionadministrations/errors'),
          overviewTableRow(row, 'Election Officials', 'election_officials', '#/feeds/' + feedid + '/overview/electionofficials/errors'),
          overviewTableRow(row, 'Localities', 'localities', '#/feeds/' + feedid + '/overview/localities/errors'),
          overviewTableRow(row, 'Polling Locations', 'polling_locations', '#/feeds/' + feedid + '/overview/pollinglocations/errors'),
          overviewTableRow(row, 'Precinct Splits', 'precinct_splits', '#/feeds/' + feedid + '/overview/precinctsplits/errors'),
          overviewTableRow(row, 'Precincts', 'precincts', '#/feeds/' + feedid + '/overview/precincts/errors'),
          overviewTableRow(row, 'Street Segments', 'street_segments', '#/feeds/' + feedid + '/overview/streetsegments/errors')
        ],
        contests: [
          overviewTableRow(row, 'Ballots', 'ballots', '#/feeds/' + feedid + '/overview/ballots/errors'),
          overviewTableRow(row, 'Candidates', 'candidates', '#/feeds/' + feedid + '/overview/candidates/errors'),
          overviewTableRow(row, 'Contests', 'contests', '#/feeds/' + feedid + '/election/contests/errors'),
          overviewTableRow(row, 'Electoral Districts', 'electoral_districts', '#/feeds/' + feedid + '/overview/electoraldistricts/errors'),
          overviewTableRow(row, 'Referenda', 'referendums', '#/feeds/' + feedid + '/overview/referenda/errors')
        ],
        source: overviewTableRow(row, 'Source', 'sources', '#/feeds/' + feedid + '/source/errors'),
        election: overviewTableRow(row, 'Election', 'elections', '#/feeds/' + feedid + '/election/errors')
      };
      result.addRow(tables);
    });

    conn.closePostgres(query, client, res);
  },
  getFeedContestsOverview: function(req, res) {
    var client = conn.openPostgres();
    var feedid = req.params.feedid;
    var query = client.query("SELECT s.ballots_count, s.ballots_error_count, s.ballots_completion, s.candidates_count, s.candidates_error_count, s.candidates_completion, s.contests_count, s.contests_error_count, s.contests_completion, s.electoral_districts_count, s.electoral_districts_error_count, s.electoral_districts_completion, s.referendums_count, s.referendums_error_count, s.referendums_completion FROM statistics s INNER JOIN results r ON s.results_id = r.id WHERE r.public_id=$1", [decodeURIComponent(feedid)]);

    query.on("row", function (row, result) {
      var tableData = [
        overviewTableRow(row, 'Ballots', 'ballots', '#/feeds/' + feedid + '/overview/ballots/errors'),
        overviewTableRow(row, 'Candidates', 'candidates', '#/feeds/' + feedid + '/overview/candidates/errors'),
        overviewTableRow(row, 'Contests', 'contests', '#/feeds/' + feedid + '/election/contests/errors'),
        overviewTableRow(row, 'Electoral Districts', 'electoral_districts', '#/feeds/' + feedid + '/overview/electoraldistricts/errors'),
        overviewTableRow(row, 'Referenda', 'referendums', '#/feeds/' + feedid + '/overview/referenda/errors')
      ];
      result.addRow(tableData);
    });

    conn.closePostgres(query, client, res);
  },
  getValidationsErrorCount: util.simpleQueryResponder("SELECT COUNT(*) AS errorcount FROM validations v INNER JOIN results r ON r.id = v.results_id WHERE r.public_id = $1", function(req) { return [decodeURIComponent(req.params.feedid)]; })
}
