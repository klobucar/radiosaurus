var _result,
    _songIndex,
    _nowPlaying;
$(function() {
  
  $('#search').click(function() {
    
    var artist = $("#search_box").val();
    artist = artist.replace(" ","+");
    rdio.clearQueue();
    echo.apiCall('playlist', 'static', {'artist': artist, 'type': 'artist-radio', 'dmca': false, 'limit': true, 'variety': 0.2, 'results': 30}, function(result) {
      log('Result:', result);
      $('#player').show();
      _result = filterResults(result.response);
      _songIndex = 1;
      var rdioId = _result[0].foreign_ids[0].foreign_id.split(':')[2]; 
      rdio.play(rdioId)
      
      setTimeout(function() {
        for(var i=_songIndex; _result.length - 1;i++) {
            rdioId = _result[i].foreign_ids[0].foreign_id.split(':')[2]; 
            rdio.addQueue(rdioId)
        }
      }, 200);
    });
  });
  $('#play').click(function() {
    rdio.play();
  });
  $('#pause').click(function() {
    rdio.pause();
  });
  
  var dinosaurs = new Array();

  $('#like').click(function() {
    alert('Add Dino');
  });

  $('#dislike').click(function() {
    var id = _.detect(_result, function(result){ return result.foreign_ids[0].foreign_id.split(':')[2] == _nowPlaying.key;}).id,
      artist = $("#search_box").val();
    log("Object to skip: ",  _.detect(_result, function(result){ return result.foreign_ids[0].foreign_id.split(':')[2] == _nowPlaying.key;}));
    log("ID to skip: ", id);
    artist = artist.replace(" ","+");
    rdio.clearQueue();
    echo.apiCall('playlist', 'static', {'artist': artist, 'type': 'artist-radio', 'dmca': false, 'limit': true, 'results': 30, 'variety': 0.2, 'song_id':'-' + id}, function(result) {
      log('Result:', result);
      rdio.stop() 
      _result = filterResults(result.response);
      _songIndex = 1;
      var rdioId = _result[0].foreign_ids[0].foreign_id.split(':')[2]; 
      rdio.play(rdioId);
    
      setTimeout(function() {
        for(var i=_songIndex; _result.length - 1;i++) {
            rdioId = _result[i].foreign_ids[0].foreign_id.split(':')[2]; 
            rdio.addQueue(rdioId);
        }
      }, 200);
    });
  });

  var holder = $('<ul></ul>')
  $.each(styles, function() {
    var newStyle = $('<li></li>').data('obj', this.toString());
    newStyle.text(this.toString());
    holder.append(newStyle);
  });

  $('#styles').html(holder.html()).selectable();

  holder.empty();
  $.each(moods, function() {
    var newMood = $('<li></li>').data('obj', this.toString());
    newMood.text(this.toString());
    holder.append(newMood);
  });

  $('#moods').html(holder.html()).selectable();

  $('#search').click(function() {
    $('#loading').show();
    $('#no_results').hide();
    var params = {};

    $.each(min_max, function(key, val) {
      var min = key.replace('M', 'min');
      var max = key.replace('M', 'max');
      params[min] = $('#' + key).slider('values', 0);
      params[max] = $('#' + key).slider('values', 1);
    });

    function getSelected(el) {
      var items = [];
      el.find('.ui-selected').each(function() {
        items.push('^'+$(this).text());
      });
      return items.join(',');
    }

    var styles = getSelected($('#styles'));
    if(styles.length > 0) {
      params['style'] = styles;
    }

    var moods = getSelected($('#moods'));
    if(moods.length > 0) {
      params['mood'] = moods;
    }

    echo.search(params, function(count) {
      $('#loading').hide();
      if(count == 0) {
        $('#no_results').show();
      }
    });
    return false;
  });
});

function artistList() {
   _.each(_result, function(num){ log(num.artist_name);});
}
function log() {
  if(console && console.log) {
    console.log.apply(console, arguments);
  }
}
function filterResults(results) {
  return _.filter( results.songs, function(result) { return result.foreign_ids.length });
}
function Echo() {
  this.apiKey = "CQA2ZCUXD70EXQTHS";
  this.baseUrl = "http://developer.echonest.com/api/v4/";
}

Echo.prototype.apiCall = function(type, method, params, callback) {
  var url = [
    this.baseUrl,
    type + '/' + method,
    '?api_key=' + this.apiKey,
    '&format=jsonp',
    '&bucket=id:rdio-us-streaming',
    '&rank_type=familiarity'
  ].join('');

  $.each(params, function(key, val) {
    val = ""+val;
    $.each(val.split(','), function() {
      url += '&' + key + '=' + this;
    });
  });
  
  log(url);

  $.ajax({
    url: url,
    dataType: 'jsonp',
    success: callback,
    cache: true
  });
};

function Rdio() {
  var token = "GAlNwZcE_____3IyZWI3djNweXltOXZjY2pmcGtnYXpwcmxvY2FsaG9zdLxCDkEq2VNS7Y3-WVyyS8Y=",
    domain = "localhost",
    listener = "rdio_callback",

    flashvars = {},

    params = {
      'allowScriptAccess': 'always'
    },

    attributes = {};

  /* set correct token if in "production" */
  if(document.location.host == 'radiosaurus.com') {
    token = "GA9ObZWP_____2R2cHlzNHd5ZXg3Z2M0OXdoaDY3aHdrbnJhZGlvc2F1cnVzLmNvbVtljaJJ9-K9PHbR5771ARk=";
    domain = 'radiosaurus.com';
  }

   else if(document.location.host == 'klobucar.github.com') {
    token = "GBNOdt5o_____2R2cHlzNHd5ZXg3Z2M0OXdoaDY3aHdrbmtsb2J1Y2FyLmdpdGh1Yi5jb232XyUr7U8t4tnag69IYBIh";
    domain = "klobucar.github.com";
  }

  flashvars = {
    'playbackToken': token,
    'domain': domain,
    'listener': listener
  };

  swfobject.embedSWF('http://www.rdio.com/api/swf/', // the location of the Rdio Playback API SWF
    'apiswf', // the ID of the element that will be replaced with the SWF
    1, 1, '9.0.0', 'expressInstall.swf', flashvars, params, attributes);
}
function playerStatus(message) {
  $('#status').html(message);
};

Rdio.prototype.ready = function() {
  this.player = $('#apiswf')[0];
};

Rdio.prototype.play = function(key) {
  $('#play').hide();
  $('#pause').show();
  $('#album_art').show();
  if (!key) {
    log('Resuming player');
    playerStatus("Resumed");
    this.player.rdio_play();
  } else {
    log('playing ' + key);
    playerStatus("Playing")
    this.player.rdio_play(key);
  }
};

Rdio.prototype.stop = function() {
  $('#play').show();
  $('#pause').hide();
  log('stopped playing');
  playerStatus("Stopped");
  this.player.rdio_stop();
};

Rdio.prototype.pause = function() {
  $('#play').show();
  $('#pause').hide();
  log('Pausing');
  playerStatus("Paused");
  this.player.rdio_pause();
};

Rdio.prototype.addQueue = function(key) {
  log("Adding key to queue: " + key);
  this.player.rdio_queue(key);
};

Rdio.prototype.clearQueue = function() {
  log("Clearing queue");
  this.player.rdio_clearQueue();
}; 

Rdio.prototype.next = function() {
  log("Next");
  this.player.rdio_next();
};
var rdio_callback = {
  ready: function() {
    log('player ready');
    rdio.ready();
  },
  
  playStateChanged: function(playState) {
    // The playback state has changed.
    // The state can be: 0 - paused, 1 - playing, 2 - stopped, 3 - buffering or 4 - paused.
    log("response object:", _result);
    log("Song index: " + _songIndex);
    log('playstate changed ' + playState);
     //$('#playState').text(playState);
  },

  playingTrackChanged: function(playingTrack, sourcePosition) {
    // The currently playing track has changed.
    // Track metadata is provided as playingTrack and the position within the playing source as sourcePosition.
    log('playingTrackChanged',arguments);
    if (playingTrack != null) {
      _nowPlaying = arguments[0];
      //$('#track').text(playingTrack['name']);
      //$('#album').text(playingTrack['album']);
      //$('#artist').text(playingTrack['artist']);
      //$('#art').attr('src', playingTrack['icon']);
    }
  },
  playingSourceChanged: function(playingSource) {
    // The currently playing source changed.
    // The source metadata, including a track listing is inside playingSource.
    log('playingSourceChanged',arguments);
    
    $('#album_art').attr('src', arguments[0].icon);
    $('#artist').html(arguments[0].artist);
    $('#album').html(arguments[0].album);
    $('#track').html(arguments[0].name);
  },

  volumeChanged: function(volume) {
    // The volume changed to volume, a number between 0 and 1.
    log('volumeChanged',arguments);
  },

  muteChanged: function(mute) {
    // Mute was changed. mute will either be true (for muting enabled) or false (for muting disabled).
    log('muteChanged',arguments);
  },

  positionChanged: function(position) {
    //The position within the track changed to position seconds.
    // This happens both in response to a seek and during playback.
    //$('#position').text(position);
    //log('positionChanged',arguments);
  },

  queueChanged: function(newQueue) {
    // The queue has changed to newQueue.
    log('queueChanged',arguments);
  },

  shuffleChanged: function(shuffle) {
    // The shuffle mode has changed.
    // shuffle is a boolean, true for shuffle, false for normal playback order.
    log('shuffleChanged',arguments);
  },

  repeatChanged: function(repeatMode) {
    // The repeat mode change.
    // repeatMode will be one of: 0: no-repeat, 1: track-repeat or 2: whole-source-repeat.
    log('repeatChanged',arguments);
  },

  playingSomewhereElse: function() {
    // An Rdio user can only play from one location at a time.
    // If playback begins somewhere else then playback will stop and this callback will be called.
    log('playingSomewhereElse',arguments);
  },
  
};

var echo = new Echo();
var rdio = new Rdio();
