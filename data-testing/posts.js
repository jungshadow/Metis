var AWS = require('aws-sdk');
var fs = require('fs');
var multiparty = require('multiparty');
var authorization = require('../authentication/utils.js');
var config = require('../config');
var queue = require('./queue')

AWS.config.update({ accessKeyId: config.aws.accessKey, secretAccessKey: config.aws.secretKey });

module.exports = {
  uploadAddressFile: function(req, res){
    if (req.isAuthenticated() == false) {
      res.writeHead(403);
      res.write('must be authenticated to submit a file for testing')
      res.end();
      return;
    };
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(JSON.stringify(files));
      var fileStream = fs.createReadStream(files.file.path);
      fileStream.on('error', function (err) {
        if (err) { throw err; }
      });
      fileStream.on('open', function () {
        var s3 = new AWS.S3();
        var bucketName = 'address-testing/' + authorization.stateGroupNames(req.user)[0] + '/input';
        var fileName = files.file.originalFilename;
        s3.putObject({
          Bucket: bucketName,
          Key: fileName,
          Body: fileStream
        }, function (err) {
          if (err) { throw err; } else {
            queue.submitAddressFile(bucketName, fileName);
          }
        });
      });
    });


    return;

  },
}
