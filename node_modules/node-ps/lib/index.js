var childProcess = require('child_process');

function _getTitles(titleLine) {
  var titles = [];
  titleLine.split(/\s+/).forEach(function (title) {
    if (title.trim() === '') {
      return;
    }

    titles.push(title.trim());
  });
  return titles;
}

function _parse(input) {
  var lines = input.split('\n');
  var titles = _getTitles(lines.shift());

  var objs = lines.filter(function (line) {
    return line.trim() !== '';
  }).map(function (line) {
    var columns = line.trim().split(/\s+/);
    var obj = {};
    for (var i = 0; i < titles.length; i++) {
      if (i === titles.length - 1 &&
          columns.length > 1) {
        obj[titles[i]] = columns.join(' ');
      } else {
        obj[titles[i]] = columns.shift();
      }
    }
    return obj;
  });

  return objs;
}

function _filter(query, processes) {
  return processes.filter(function(proc) {
    var res = true;
    if (query.pid) {
      var pids = Object.create(null);
      if (Array.isArray(query.pid)) {
        query.pid.forEach(function(pid) {
          pids[pid] = true;
        });
      } else {
        pids[query.pid] = true;
      }

      res = res && proc.PID in pids;
    }
    if (query.command) {
      res = res && proc.CMD.search(query.command) !== -1;
    }
    return res;
  });
}

/*
 *  Return an array of processes with properties PID, CMD
 */
function _ps(args, cb) {
  if (process.platform === 'win32') {
    // TODO add windows support
    return cb('Windows support not implemented yet.');
  } else {
    var cmd = 'ps';
    if (args) {
      cmd += ' ' + args.join(' ');
    }
    childProcess.exec(cmd, function (err, stdout, stderr) {
      if (err || stderr)
        return cb(err || stderr.toString());
      return cb(null, _parse(stdout.toString()));
    });
  }
}

function lookup(query, cb) {
  _ps(query.psargs, function(err, results) {
    if (err)
      return cb(err);
    return cb(null, _filter(query, results));
  });
}

if (process.env.NODE_ENV === 'test') {
  module.exports = {
    _getTitles: _getTitles,
    _parse: _parse,
    _filter: _filter,
    _ps: _ps,
    lookup: lookup
  };
} else {
  module.exports = {
    lookup: lookup
  };
}