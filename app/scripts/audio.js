//===============================
// BUFFERLOADER CLASS
//
function BufferLoader(context, urlList, callback) {
//===============================
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length) 
          loader.onload(loader.bufferList);

      	$(document).trigger("soundLoaded");
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}

//===============================
// AUDIOENGINE CLASS
//
function AudioEngine() {
//===============================
	this.loadedFiles = 0;
	this.audioFiles = 0;
	this.muted = false;
	this.ready = false;

	this.init = function() {
		BGM.init();
		SFX.init();

		this.audioFiles = BGM.filesNb() + SFX.filesNb();
	};

	this.loadedPercentage = function() {
		return Math.ceil(this.loadedFiles * 100 / this.audioFiles);
	};

	this.mute = function() {
		BGM.mute();
		SFX.mute();

		$("#soundSwitch").attr("class","off");
		this.muted = true;
	};

	this.unmute = function() {
		BGM.unmute();
		SFX.unmute();

		$("#soundSwitch").attr("class","on");
		this.muted = false;
	};

	this.toggleMute = function() {
		BGM.toggleMute();
		SFX.toggleMute();

		$("#soundSwitch").toggleClass("on off");
		this.muted = !this.muted;
	};

	this.isMuted = function() {
		return this.muted;
	};

	this.init();
};

//===============================
// BGM
//
var BGM = (function() {
//===============================
	var audioCtx;
	var sourceArray = new Array();
	var crossfadeArray = new Array();

	var files = ['assets/bgm/primalTimbre.mp3',
	      		 'assets/bgm/spiral.mp3'];
	var filesLoaded = false;
	var muted = false;
	var crossfading = false;

	var primalTimbre;
	var spiral;

	function init() {
	  try {
	    // Fix up for prefixing
	    window.AudioContext = window.AudioContext||window.webkitAudioContext;
	    audioCtx = new AudioContext();

	    var bufferLoader = new BufferLoader(audioCtx, files, setSources);
	  	bufferLoader.load();
	  }
	  catch(e) {
	    alert('Web Audio API is not supported in this browser');
	  }
	}

	function setSources(bufferList) {
		for(var i = 0; i < bufferList.length; i++) {
			sourceArray[i] = createSource(bufferList[i]);
		}

		primalTimbre = sourceArray[0];
		spiral = sourceArray[1];

		primalTimbre.gainNode.gain.value = .8;
		spiral.gainNode.gain.value = 0;

		filesLoaded = true;
		if(SFX.filesLoaded()) {
			audioEngine.ready = true;
			$(document).trigger("allSoundsLoaded");
		}
	}

	function createSource(buffer) {
		var startDelay = 0.337;
		var tempo = 140;
		var fourthNoteTime = 60 / tempo;
		var barLength = fourthNoteTime * 4;
		var loopStartTime = 44 * barLength + startDelay;
		var songLength;

		var source = audioCtx.createBufferSource();
		var gainNode = audioCtx.createGain ? audioCtx.createGain() : audioCtx.createGainNode();
	    source.buffer = buffer;

	    songLength = source.buffer.duration;

	    source.loop = true;
		source.loopStart = loopStartTime;
		source.loopEnd = songLength;

		source.connect(gainNode);
	    gainNode.connect(audioCtx.destination);

	    return {
	      source: source,
	      gainNode: gainNode
	    };
	}

	function play() {
		primalTimbre.source.start(0);
		spiral.source.start(0);
	}

	function setCrossfade(gain1, gain2) {
		var isDone = 0;
		crossfading = true;

		if(gain1 != -1) {
			TweenMax.to(primalTimbre.gainNode.gain, 3, {value: gain1, ease: Circ.easeOut,
				onComplete:function() {
					if(++isDone == 2) crossfading = false;
				}
			});
		}

	    if(gain2 != -1) {
	    	TweenMax.to(spiral.gainNode.gain, 3, {value: gain2, ease: Circ.easeOut,
				onComplete:function() {
					if(++isDone == 2) crossfading = false;
				}
			});
	    }
	}

	function prepareCrossfade(gain1, gain2) {
		crossfadeArray.unshift([gain1, gain2]);
	}

	function playCrossfade() {
		if(!muted && crossfadeArray.length > 0) {
			setCrossfade(crossfadeArray[0][0], crossfadeArray[0][1]);
			if(!crossfading) crossfadeArray.shift();
		}
	}

	function mute(state) {
		if(state == true || state == false) {
			if(state == mute) return;
			muted = state;
		}
		else if(state == "toggle") muted = !muted;

		if(muted == true) {
			if(!crossfading) {
				crossfadeArray = [];
				prepareCrossfade(primalTimbre.gainNode.gain.value, spiral.gainNode.gain.value);
			}

			setCrossfade(0, 0);
		}
		else {
			playCrossfade();
			if(!crossfading) {
				crossfadeArray = [];
			}
		}
	}

	return {
		init:init,
		play:play,
		setCrossfade:setCrossfade,
		prepareCrossfade:prepareCrossfade,
		playCrossfade:playCrossfade,
		mute:function() {
			mute(true);
		},
		unmute:function() {
			mute(false);
		},
		toggleMute:function() {
			mute("toggle");
		},
		isMuted:function() {
			return muted;
		},
		filesLoaded:function() {
			return filesLoaded;
		},
		filesNb:function() {
			return files.length;
		},
		isCrossfading:function() {
			return crossfading;
		}
	};
})();


var SFX = (function() {
	var audioCtx;
	var bufferArray = new Array();

	var files = ['assets/sfx/cancel.mp3',
			   	 'assets/sfx/cancelMenu.mp3',
			   	 'assets/sfx/closeWindow.mp3',
			   	 'assets/sfx/confirm.mp3',
			   	 'assets/sfx/enterChat.mp3',
			   	 'assets/sfx/enterInstance.mp3',
			   	 'assets/sfx/error.mp3',
			   	 'assets/sfx/featureUnlocked.mp3',
			   	 'assets/sfx/hover.mp3',
			   	 'assets/sfx/openWindow.mp3',
			   	 'assets/sfx/play.mp3',
			   	 'assets/sfx/switchTarget.mp3'];
	var filesLoaded = false;
	var muted = false;

	function init() {
	    // Fix up for prefixing
	    window.AudioContext = window.AudioContext||window.webkitAudioContext;
	    audioCtx = new AudioContext();

	    var bufferLoader = new BufferLoader(audioCtx, files, setBuffer);
	  	bufferLoader.load();
	}

	function setBuffer(bufferList) {
		for(var i = 0; i < bufferList.length; i++) {
			bufferArray[i] = bufferList[i];
		}

		filesLoaded = true;
		if(BGM.filesLoaded()) {
			audioEngine.ready = true;
			$(document).trigger("allSoundsLoaded");
		}
	}

	function createSource(buffer) {
		var source = audioCtx.createBufferSource();
		var gainNode = audioCtx.createGain ? audioCtx.createGain() : audioCtx.createGainNode();

	    source.buffer = buffer;
		source.connect(gainNode);
	    gainNode.connect(audioCtx.destination);

	    gainNode.gain.value = .3;
	    source.start(0);
	}

	function play(sfxName) {
		var sfx;

		if(sfxName == "cancel") sfx = bufferArray[0];
		if(sfxName == "cancelMenu") sfx = bufferArray[1];
		if(sfxName == "closeWindow") sfx = bufferArray[2];
		if(sfxName == "confirm") sfx = bufferArray[3];
		if(sfxName == "enterChat") sfx = bufferArray[4];
		if(sfxName == "enterInstance") sfx = bufferArray[5];
		if(sfxName == "error") sfx = bufferArray[6];
		if(sfxName == "featureUnlocked") sfx = bufferArray[7];
		if(sfxName == "hover") sfx = bufferArray[8];
		if(sfxName == "openWindow") sfx = bufferArray[9];
		if(sfxName == "play") sfx = bufferArray[10];
		if(sfxName == "switchTarget") sfx = bufferArray[11];

		if(!muted) createSource(sfx);
	}

	function mute(state) {
		if(state == true || state == false) {
			if(state == mute) return;
			muted = state;
		}
		else if(state == "toggle") muted = !muted;
	}

	return {
		init:init,
		play:play,
		mute:function() {
			mute(true);
		},
		unmute:function() {
			mute(false);
		},
		toggleMute:function() {
			mute("toggle");
		},
		isMuted:function() {
			return muted;
		},
		filesLoaded:function() {
			return filesLoaded;
		},
		filesNb:function() {
			return files.length;
		}
	};
})();

$(document).ready(function() {
	if(!phonecheck()) {
		$("#soundSwitch").on(eventtype, function() {
			audioEngine.toggleMute();
		});

		$("#menu li, #soundSwitch, #close, #friendlist li, button").mouseenter(function() {
			if(!$isTransitioning) {
				if(!$(this).hasClass("btCancel") && !$(this).hasClass("selected")) SFX.play("hover");
				else if($(this).hasClass("btCancel")) SFX.play("switchTarget");
			}
		});

		$("#menu li").eq(0).on(eventtype, function() {
			if(!$isTransitioning) SFX.play("play");	
		});

		$("#menu li.disabled").on(eventtype, function() {
			if(!$isTransitioning) SFX.play("error");	
		});

		$("#close").on(eventtype, function() {
			if(!$isTransitioning && !$(this).parents("#credits").hasClass("open")) SFX.play("openWindow");
			if(!$isTransitioning && $(this).parents("#credits").hasClass("open")) SFX.play("closeWindow");
		});

		$("input").on(eventtype, function() {
			if(!$isTransitioning) SFX.play("enterChat");	
		});

		$(".panel").on("unselect mouseleave", function(e) {
			if(!$isTransitioning && $(this).find("#friendlist").hasClass("selecting") || e.type == "unselect")
				SFX.play("cancel");
		});

		$("#soundSwitch, .btRandom, .btInvite, #friendlist li").on(eventtype, function() {
			if(!$isTransitioning) SFX.play("confirm");	
		});

		$(".btStart").on(eventtype, function() {
			if(!$isTransitioning) SFX.play("featureUnlocked");	
		});

		$(".btCancel").on(eventtype, function() {
			if(!$isTransitioning) {
				if($("#screen_Play").hasClass("matchmaking"))
					SFX.play("cancelMenu");
				else SFX.play("closeWindow");
			}
		});
	}
});