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
// BGM
//
var BGM = (function() {
//===============================
	var audioCtx;
	var sourceArray = new Array();
	var crossfadeArray = new Array();
	var primalTimbre;
	var spiral;

	function init() {
	  try {
	    // Fix up for prefixing
	    window.AudioContext = window.AudioContext||window.webkitAudioContext;
	    audioCtx = new AudioContext();

	    var bufferLoader = new BufferLoader(audioCtx, ['assets/primalTimbre.mp3',
	      										   	   'assets/spiral.mp3'],
	    				                	setSources);

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

		spiral.gainNode.gain.value = 0;

		$(document).trigger("BGMloaded");
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
		if(gain1 != -1) TweenMax.to(primalTimbre.gainNode.gain, 4, {value: gain1, ease: Circ.easeOut});
	    if(gain2 != -1) TweenMax.to(spiral.gainNode.gain, 4, {value: gain2, ease: Circ.easeOut});
	}

	function prepareCrossfade(gain1, gain2) {
		crossfadeArray.push([gain1, gain2]);
	}

	function playCrossfade() {
		setCrossfade(crossfadeArray[0][0], crossfadeArray[0][1]);
		crossfadeArray.shift();
	}

	return {
		init:init,
		play:play,
		setCrossfade:setCrossfade,
		prepareCrossfade:prepareCrossfade,
		playCrossfade:playCrossfade
	};
})();


var SFX = (function() {
	var audioCtx;
	var bufferArray = new Array();

	function init() {
	    // Fix up for prefixing
	    window.AudioContext = window.AudioContext||window.webkitAudioContext;
	    audioCtx = new AudioContext();

	    var bufferLoader = new BufferLoader(audioCtx, ['assets/sfx/cameraMode.mp3',
	      										   	   'assets/sfx/cancel.mp3',
	      										   	   'assets/sfx/closeWindow.mp3',
	      										   	   'assets/sfx/confirm.mp3',
	      										   	   'assets/sfx/enterChat.mp3',
	      										   	   'assets/sfx/enterInstance.mp3',
	      										   	   'assets/sfx/error.mp3',
	      										   	   'assets/sfx/featureUnlocked.mp3',
	      										   	   'assets/sfx/hover.mp3',
	      										   	   'assets/sfx/openWindow.mp3',
	      										   	   'assets/sfx/play.mp3',
	      										   	   'assets/sfx/switchTarget.mp3'],
	    				                	setBuffer);

	  	bufferLoader.load();
	}

	function setBuffer(bufferList) {
		for(var i = 0; i < bufferList.length; i++) {
			bufferArray[i] = bufferList[i];
		}
	}

	function createSource(buffer) {
		var source = audioCtx.createBufferSource();
		var gainNode = audioCtx.createGain ? audioCtx.createGain() : audioCtx.createGainNode();

	    source.buffer = buffer;
	    gainNode.gain.value = .75;

		source.connect(gainNode);
	    gainNode.connect(audioCtx.destination);

	    source.start(0);
	}

	function play(sfxName) {
		var sfx;

		if(sfxName == "cameraMode") sfx = bufferArray[0];
		if(sfxName == "cancel") sfx = bufferArray[1];
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

		createSource(sfx);
	}

	return {
		init:init,
		play:play
	};
})();

$(document).ready(function() {
	$("#menu li, #friendlist li, button").mouseenter(function() {
		if(!$isTransitioning) {
			if(!$(this).hasClass("btCancel") && !$(this).hasClass("selected")) SFX.play("hover");
			else if($(this).hasClass("btCancel")) SFX.play("switchTarget");
		}
	});

	$("#menu li").eq(0).click(function() {
		if(!$isTransitioning) SFX.play("play");	
	});

	$("#menu li.disabled").click(function() {
		if(!$isTransitioning) SFX.play("error");	
	});

	$("input").click(function() {
		if(!$isTransitioning) SFX.play("enterChat");	
	});

	$(".panel").mouseleave(function() {
		if(!$isTransitioning && $(this).parents("#screen_Play").hasClass("invite"))
			SFX.play("cancel");	
	});

	$(".btRandom, .btInvite, #friendlist li").click(function() {
		if(!$isTransitioning) SFX.play("confirm");	
	});

	$(".btStart").click(function() {
		if(!$isTransitioning) SFX.play("featureUnlocked");	
	});

	$(".btCancel").click(function() {
		if(!$isTransitioning) {
			if($("#screen_Play").hasClass("matchmaking"))
				SFX.play("cameraMode");
			else SFX.play("closeWindow");
		}
	});
});