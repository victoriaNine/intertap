var $currentScreen,
	$requestScreen,
	$isTransitioning = false;

var support = { animations : Modernizr.cssanimations },
	animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
	animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
	onEndAnimation = function( el, callback ) {
		var onEndCallbackFn = function( ev ) {
			if( support.animations ) {
				if( ev.target != this ) return;
				this.removeEventListener( animEndEventName, onEndCallbackFn );
			}
			if( callback && typeof callback === 'function' ) { callback.call(); }
		};
		if( support.animations ) {
			el.addEventListener( animEndEventName, onEndCallbackFn );
		}
		else {
			onEndCallbackFn();
		}
	},
	eventtype = mobilecheck() ? 'touchend' : 'click';

var loadingArray = ["images/planet.svg",
					"images/gas.svg",
					"images/moon.svg",
					"images/craters.svg",
					"images/meteor.svg",
					"//fonts.googleapis.com/css?family=Pacifico",
					"//fonts.googleapis.com/css?family=Varela+Round",
					"//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css"]


$(document).ready(function() {
	var loadedFiles = 0;
	for(var i = 0; i < loadingArray.length; i++) {
		$("<div>").load(loadingArray[i], function() {
			loadedFiles++;

			if(loadedFiles == loadingArray.length) {
				$requestScreen = "Menu";
				switchScreen();
			}
		});
	}

	// trim polyfill : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
	if(!String.prototype.trim) {
		(function() {
			// Make sure we trim BOM and NBSP
			var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
			String.prototype.trim = function() {
				return this.replace(rtrim, '');
			};
		})();
	}

	if(navigator.appName == 'Microsoft Internet Explorer') {
        var agent = navigator.userAgent;
        if(agent.match(/MSIE ([0-9]{1,}[\.0-9]{0,})/) != null) {
            var version = parseFloat( RegExp.$1 );
            $("html").addClass("ie"+version);
        }
    }

	 $("#menu li").each(function() {
		var el = this;

		$(el).on(eventtype, function() {
			if(!$(el).hasClass("disabled") && !$isTransitioning) {
				$(el).addClass('animate');
				onEndAnimation(el.getElementsByTagName("span")[0], function() {
					$(el).removeClass('animate');
				});

				$requestScreen = "Play";
				switchScreen();
			}
		});
	});

	$("#screen_Play .btCancel").on(eventtype, function() {
		var el = this;

		if(!$isTransitioning) {
			$(el).addClass('animate');
			onEndAnimation( el.getElementsByTagName("span")[0], function() {
				$(el).removeClass('animate');
			});

			if($("#screen_Play").hasClass("matchmaking")) {
				$requestScreen = "Menu";
				switchScreen();
			}
			else {
				if($("#screen_Play").hasClass("registration"))
					switchPlayScreen("registration", "matchmaking");
				if($("#screen_Play").hasClass("invite")) {
					switchPlayScreen("invite", "matchmaking", function() {
						$(".panel div.invite").mCustomScrollbar("destroy");
					});
				}
			}
		}
	});

	$("#screen_Play .panel button").each(function() {
		var el = this;

		$(el).on(eventtype, function() {
			if(!$isTransitioning) {
				$(el).addClass('animate');
				onEndAnimation(el, function() {
					$(el).removeClass('animate');
				});

				if($(el).hasClass("btRandom")) {
					setModal("loading", 250, false, 0, function() {
						setTimeout(function() {
							$(".modalContent").fadeOut(250, function() {
								$(".modalContent").empty();
								var modalContent  = "<i class=\"fa fa-rocket\"></i>";
		    					    modalContent += "<span>Let's play!</span>";

		    					$(".modalContent").empty().html(modalContent).fadeIn(500, function() {
							    	setTimeout(function() {
										$(".modalContainer").removeClass("open");
									}, 1500);
							    });
							})
						}, 3000);
					});
				}

				if($(el).hasClass("btInvite")) {
					switchPlayScreen("matchmaking", "invite");

					$(".panel div.invite").mCustomScrollbar({
						axis:"y",
						autoHideScrollbar: true,
						autoExpandScrollbar: true,
						theme:"minimal-dark",
						callbacks:{
						    onScrollStart:function(){
						      $(".panel div.invite").addClass("scrolling");
						    },
						    onScroll:function(){
						      $(".panel div.invite").removeClass("scrolling");
						    }
						}
					});
				}

				if($(el).hasClass("btStart")) {
					if($("#screen_Play").hasClass("matchmaking"))
						switchPlayScreen("matchmaking", "registration");
					if($("#screen_Play").hasClass("registration"))
						setModal("success", 250, true);
				}
			}
		});
	});

	$("#screen_Play .panel input").each(function(inputEl) {
		var inputEl = this;

		// in case the input is already filled
		if(inputEl.value.trim() !== '')
			$(inputEl).parent().addClass("filled");

		$(inputEl).on('focus', function() {
			$(inputEl).parent().addClass("filled");
		}).on('blur', function() {
			if(inputEl.value.trim() === '') 
				$(inputEl).parent().removeClass("filled");
		});
	});

	$("#friendlist li").each(function(el) {
		var el = this;

		$(el).on(eventtype, function() {
			if(!$(".panel .invite").hasClass("scrolling")) {
				if(!$(el).hasClass("selected")) {
					$("#friendlist li").removeClass("selected");
					$(el).addClass("selected");

					$("#friendlist").addClass("selecting");
					$(".panel").on('mouseleave', function() {
						$("#friendlist li").removeClass("selected");
						$("#friendlist").removeClass("selecting");

						$(this).unbind("mouseleave");
					});
				}
				else if(!$isTransitioning) {
					$("#friendlist li").removeClass("selected");
					$("#friendlist").removeClass("selecting");
					$(".panel").unbind("mouseleave");

					setModal("inviteSent", 250, true);
				}
			}
		});
	});
});

function setTransition(transition) {
	var transition;

	var initWidth = $("#menu li hr").css("width");
	var initLeft = $("#menu li hr").css("left");

	if(transition == "screen_Menu_In") {
		transition = new TimelineMax({paused:true});
		transition.from($("#screen_Menu"), .5, {transform:"scale(3)"}, 0)
			      .to($("<div>"), 1, {onStart:function() {
				  	$("#container").removeClass("white");
				  }}, 0)
			      .staggerFromTo($("#menu li hr"), .5, {width:"0", left:"50%"}, {width:"80%", left:"10%", ease:Back.easeIn}, .1, .25)
			      .to($("#menu li hr"), .5, {width:initWidth, left:initLeft, ease:Power1.easeIn})
			      .staggerFrom($("#menu li span"), .5, {top:"65px", ease:Power2.easeIn}, .1, 1);
	}

	if(transition == "screen_Menu_Out") {
		transition = new TimelineMax({paused:true, delay:.5});
		transition.staggerTo($("#menu li hr"), .5, {width:"80%", left:"10%", ease:Back.easeIn}, -.1)
				  .staggerTo($("#menu li span"), .5, {top:"65px", ease:Power4.easeIn}, -.1, 1)
				  .staggerTo($("#menu li hr"), .5, {width:initWidth, left:initLeft, ease:Power1.easeIn}, -.1, 1)
				  .to($("<div>"), 1, {onStart:function() {
				  	$("#container").addClass("white");
				  }}, 1.5)
				  .to($("#screen_Menu"), .5, {transform:"scale(.5)"}, 1.5);
	}

	if(transition == "screen_Play_In") {
		transition = new TimelineMax({paused:true});
		transition.from($("#screen_Play"), .5, {transform:"scale(3)"}, 0)
			      .to($("<div>"), 1, {onStart:function() {
				  	$("#container").removeClass("white");
				  }}, 0)
				  .staggerFrom($(".panel button"), .5, {transform:"scale(1.5) translateY(20px)"}, .1, .1);
	}

	if(transition == "screen_Play_Out") {
		transition = new TimelineMax({paused:true});
		transition.staggerTo($(".panel button"), .5, {transform:"scale(1.5) translateY(20px)"}, .1, 1.75)
				  .to($("#screen_Play"), .5, {transform:"scale(3)", ease:Power4.easeIn}, 1.75)
			      .to($("<div>"), 1, {onStart:function() {
				  	$("#container").addClass("white");
				  }}, 1.5);
	}

	return transition;
}

function switchScreen() {
	var transitionDelay = 0;
	var inTransition, outTransition;

	if($currentScreen == "Menu")
		outTransition = setTransition("screen_Menu_Out");
	else if($currentScreen == "Play")
		outTransition = setTransition("screen_Play_Out");
	else outTransition = null;

	if($requestScreen == "Menu")
		inTransition = setTransition("screen_Menu_In");
	else if($requestScreen == "Play")
		inTransition = setTransition("screen_Play_In");

	if(outTransition) {
		$isTransitioning = true;

		transitionDelay = outTransition.totalDuration() * 1000;
		outTransition.play();
	}

	setTimeout(function() {
		$(".animate").removeClass("animate");
		$("#screen_"+$currentScreen).removeClass("active");
		$("#screen_"+$requestScreen).addClass("active");

		changeCanvas("canvas_"+$requestScreen);

		if(outTransition) clearProps(outTransition);

		inTransition.play();
		inTransition.call(function() {
			$currentScreen = $requestScreen;
			$isTransitioning = false;
		});
	}, transitionDelay);
}

function switchPlayScreen(outScreen, inScreen, callback) {
	var outTransition, inTransition;
	$isTransitioning = true;

	outTransition = new TimelineMax({paused:true,
		onComplete: function() {
			$("#screen_Play").removeClass(outScreen).addClass(inScreen);

			clearProps(outTransition);
			inTransition.play();
		}
	});

	outTransition.staggerTo($("#screen_Play .header."+outScreen).children(), 1, {transform:"translateX(-200px)", opacity:0, ease:Back.easeIn}, .1)
			     .to($("#screen_Play .panel ."+outScreen+":not(."+inScreen+")"), .75, {opacity:0}, .25);

	if(inScreen == "invite")
		outTransition.to($("#screen_Play .header."+outScreen+" h2"), .25, {height:0, marginBottom:0});

	inTransition = new TimelineMax({paused:true,
		onComplete: function() {
			$isTransitioning = false;
			if(typeof(callback) === 'function') callback();
		}
	});

	inTransition.staggerFrom($("#screen_Play .header."+inScreen).children(), 1, {transform:"translateX(-200px)", opacity:0, ease:Back.easeOut}, .1)
			    .from($("#screen_Play .panel ."+inScreen+":not(."+outScreen+")"), .75, {opacity:0}, .25);

	if(outScreen == "invite")
		inTransition.from($("#screen_Play .header."+inScreen+" h2"), .25, {height:0, marginBottom:0}, 0);

	outTransition.play();
}

function setModal(modalWindow, openDelay, autoClose, autoCloseDelay, callback) {
	var modalWindow;
	openDelay = Math.abs(openDelay) || 0;
	autoCloseDelay = autoCloseDelay || 1500;

	if(modalWindow == "success") {
		modalContent  = "<i class=\"fa fa-check\"></i>";
        modalContent += "<span>Success</span>";
	}

	if(modalWindow == "loading") {
		modalContent  = "<i class=\"fa fa-spinner fa-spin\"></i>";
        modalContent += "<span>Loading</span>";
	}

	if(modalWindow == "inviteSent") {
		modalContent  = "<i class=\"fa fa-paper-plane\"></i>";
        modalContent += "<span>Invite sent</span>";
	}

	$(".modalContent").empty().html(modalContent);

	setTimeout(function() {
		$(".modalContainer").addClass("open");
		if(typeof(callback) === 'function') callback();

		if(autoClose)
			setTimeout(function() {
				$(".modalContainer").removeClass("open");
			}, autoCloseDelay);
	}, openDelay);
}

function clearProps(timeline) {
	var targets = timeline.getChildren();
	timeline.kill();

	for (var i=0; i<targets.length; i++) {
	  if(targets[i].target != null)
	  	TweenMax.set(targets[i].target, {clearProps:"all"});
	}
}

// http://stackoverflow.com/a/11381730/989439
function mobilecheck() {
	var check = false;
	(function(a){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}