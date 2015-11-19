var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var jschardet = require("jschardet");

exports = module.exports = function(options, done) {
  if(options && options.target) {
    if(!exports.isAbsolute(options.target)) {
      options.target = path.resolve(process.cwd(), options.target);
    }

    if(exports.checkPath(options.target)) {
      var results = {};
      if(fs.lstatSync(options.target).isDirectory()) {
        results = exports.findInPath(options.target, {
          recursive: true
        });
      } else {
        results[options.target] = exports.getFileObj(options.target);
      }

      for(var key in results) {
        results[key].analyze = exports.analyzeFile(key, options);
      }

      // TODO: implement calculate summary
      results.summary = {
        files: 0,
        loc: {
          total: 0,
          blank: 0,
          comment: 0
        }
      };

      if(_.isFunction(done)) {
        done(null, results);
      }
      return results;
    } else {
      done(new Error("No such file or directory!"), null);
    }
  } else {
    done(new Error("No target specified!"), null);
  }
};

exports.analyzeFile = function(filePath, options) {
  var analyzeObj = {};

  // LOC
  analyzeObj.loc = exports.getLoc(filePath, options);

  if(options.withEncoding) {
    analyzeObj.encoding = exports.getEncoding(filePath, options);
  }

  // TODO: other analytics

  return analyzeObj;
};

exports.getLoc = function(filePath, options) {
  var loc = {};
  // TODO Implementation to get LOC

  loc.total = 0;
  loc.blank = 0;
  loc.comment = 0;

  return loc;
};

exports.getEncoding = function(filePath, options) {
  var content = fs.readFileSync(filePath);
  return jschardet.detect(content).encoding;
};

exports.getFileObj = function(filePath) {
  var fileObj = {};
  fileObj.path = filePath;
  fileObj.name = path.basename(fileObj.path);
  fileObj.stats = fs.lstatSync(fileObj.path);
  fileObj.extname = path.extname(fileObj.path);
  fileObj.basename = path.basename(fileObj.path, fileObj.extname);

  return fileObj;
};

exports.isAbsolute = function(p) {
  return path.normalize(p + '/') === path.normalize(path.resolve(p) + '/');
};

exports.checkPath = function(searchPath, extensions) {
    if(extensions) {
        for(var i in extensions) {
            var extension = extensions[i];
            if(fs.existsSync(searchPath+extension)) {
                return searchPath+extension;
            }
        }
    } else {
        return fs.existsSync(searchPath)?searchPath:false;
    }

    return false;
};

exports.notIn = function(arrayOfExpressions, stringValue) {
  for(var index in arrayOfExpressions) {
    var expression = arrayOfExpressions[index];
    if(stringValue.indexOf(expression) !== -1) {
      return false;
    }
  }

  return true;
};

exports.findInPath = function(searchPath, config, currentDepth) {
  var foundFiles = {};

  // Check Path
  if (!exports.checkPath(searchPath)) {
    return foundFiles;
  }

  // check config attribute
  if (!_.isPlainObject(config)) {
    config = {};
  }

  if (_.isUndefined(currentDepth) || _.isNaN(currentDepth)) {
    currentDepth = 0;
  }

  // setup default config
  var defaultConfig = {
    recursive: false,
    exclude: [
      ".git",
      "node_modules",
      "bower_components"
    ],
    matcher: function(fileObj) {
      return !fileObj.stats.isDirectory();
    },
    depth: -1
  };

  // merge defaultConfig with config
  config = _.assign(defaultConfig, config);

  // read searchPath and iterate through files
  fs.readdirSync(searchPath).forEach(function(file) {
    var fileObj = exports.getFileObj(path.resolve(searchPath, file));

    // if it is a directory and config recursive is true, make
    // deep search (but check currentDepth to config.depth)
    if (fileObj.stats.isDirectory() && config.recursive) {
      // if we would call this in same line with "isDirectory"
      // directories would also add to foundFiles
      if (config.depth === -1 || config.depth > currentDepth) {
        _.merge(foundFiles, exports.findInPath(fileObj.path, config, currentDepth + 1));
      }
    }
    else {
      // Setup match results for matcher
      var matchResult = false;
      if (_.isFunction(config.matcher)) {
        matchResult = config.matcher(fileObj);
      }
      else {
        matchResult = config.matcher;
      }

      // if matchResult is true, save filePath
      if (matchResult && exports.notIn(config.exclude, fileObj.path)) {
        foundFiles[fileObj.path] = fileObj;
      }
    }
  });

  return foundFiles;
};
