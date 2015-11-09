$("document").ready(function(){
	if(!!debug){
		// debug mode
	}	
	if(!!!debug){
		// not debug mode 
	}
	var Env = {
		id : {
			memoString : "Memo",
			nextMemoId : function(){
				return Env.id.memoString + EnvFun.getTodayDateTime();
			},
			lineString : "Line",
			nextLineId : function(){
				return Env.id.lineString + EnvFun.getTodayDateTime();
			}
		},
		add : {
			addable : true,
			isAddable : function(){
				return Env.add.addable;
			},
			setAddable : function(status){
				if(status == true) {
					Env.add.addable = true;
				} else if (status == false){
					Env.add.addable = false;	
				} else {
					Env.add.addable = false;
					EnvFun.cleanUp();
					Env.add.addable = true;
				}
			},
			addableTimerId : null,
			useAddableTimer : function(){
				if(Env.add.addableTimerId !== null){
					clearTimeout(Env.add.addableTimerId);
					Env.add.addableTimerId = null;
				}
				Env.add.setAddable(false);
				Env.add.addableTimerId = setTimeout(function(){
					Env.add.setAddable(true);
				}, 500);

			}
		},
		focus : {
			$el : null,
			e : null,
			isFocused : function(){
				return Env.focus.$el !== null;
			},
			giveFocus : function($target, e){
				if($target !== undefined && $target !== null && $target.hasClass("memo")){
					Env.focus.$el = $target;
					Env.focus.e = e || null;
				}
			},
			removeFocus : function(){
				Env.focus.$el = null;
				Env.focus.e = null;
			}
		},
		rubbing : {
			$el : null,
			standby : false,
			count : 0,
			max : 1,
			isStandBy : function(){
				return Env.rubbing.standby;
			},
			prepareStandby : function(){
				Env.rubbing.standby = true;	
			},
			setRubbingElement : function($dom){
				if(!isEqual(Env.rubbing.$el, $dom)){
					Env.rubbing.clear();
				}
				Env.rubbing.$el = $dom;	
			},
			addCount : function(){
				Env.rubbing.count++;	
			},
			getCount : function() {
				return Env.rubbing.count;	
			},
			isInvokeRubbingEvent : function(){
				return Env.rubbing.count >= Env.rubbing.max;	
			},
			clear : function(){
				Env.rubbing.count = 0;
				Env.rubbing.standby = false;
				Env.rubbing.$el = null;
			}
		},
		save : {
			duration : 1000,
			timerId : null,
			autoSaveActivate : false,
			clearTimer : function(){
				if(Env.save.timerId !== null){
					clearTimeout(Env.save.timerId);
					Env.save.timerId = null;
				}	
			},
			saveThis : function(){
				Env.save.autoSaveActivate = false;
				_.each($memos.find(".memo"), function(memo){
					changeDateColor($(memo));					
				});
				$.jStorage.set(EnvFun.getTodayDate(), $memos.html());
				Env.save.autoSaveActivate = true;
			},
			autoSave : function(){
				Env.save.clearTimer();
				if(Env.save.autoSaveActivate){
					Env.save.saveThis();
				}
				Env.save.timerId = setTimeout(Env.save.autoSave, Env.save.duration);	
			}
		}
	};
	Env.save.autoSave();
	Env.save.autoSaveActivate = true;
	var EnvFun = {
		cleanUp : function(){
			Env.focus.removeFocus();
		},
		getTodayDate : function(format){
			var localFormat = format || "yymmdd";
			return $.datepicker.formatDate(localFormat, new Date());
		},
		getTodayDateTime : function(){
			return (new Date()).getTime();
		}
	};
	$("#tabs li a").click(function(e){
		var $this = $(e.currentTarget);
		if(!$this.hasClass("active")){
			
		}
	});
	var $memos = $(".memos:eq(0)"),
		$archivedMemos = $(".memos:eq(1)"),
		$memoSample = $("#memo_sample");
	var paddingX = 150, paddingY = 150;
	var $copyFromYesterday = $("#copy_from_yesterday"), $archiveThis = $("#archive_this");
	
	$.datepicker.setDefaults({
        showOtherMonths: true,
        numberOfMonths: 1,
        selectOtherMonths: true,
        dateFormat : "yy-mm-dd"
    });
	$("body").on({
		'mouseup' : function(e){
			if(Env.focus.isFocused()){
				EnvFun.cleanUp();
			}
		}
	});
	$memos.on({
		'mousedown' : function(e) {
			Env.add.setAddable(false);
			Env.rubbing.prepareStandby();
		},
		'mouseup' : function(e) {
			Env.add.setAddable(true);
			Env.rubbing.clear();
		},
		'dblclick' : function(e){
			e.stopPropagation();
			e.preventDefault();
			if(Env.add.isAddable()){
				console.log(e.offsetX, e.offsetY);
				addNewMemo(e.offsetX, e.offsetY);	
			}
			
		}
	});
	
	$copyFromYesterday.click(function(e){
		var proc = true;
		if($memos.find(".memo").size() > 0){
			proc = confirm("There are memos more than one. Will you remove whole and copy from yesterday?");
		} 
		
		if(proc){
			var yesterday = $.datepicker.formatDate('yymmdd', new Date(new Date() - 24*60*60*1000));
			var $yesterday = $.jStorage.get(yesterday);
			if(_.isEmpty($yesterday)){
				if(confirm("There is no data from yesterday. Will you copy from last memos?")){
					var keys = $.jStorage.index();
					var key = _.max(
						_.filter(keys, function(k){
							return k.length == 8;						
						})
					);
					if(!_.isEmpty(key)){
						$yesterday = $.jStorage.get(key);
					} else {
						return;
					}
				} else {
					return;
				}
			}
			$memos.children().remove();
			$memos.removeClass("hasSVG");
			var $html = $($yesterday);
			$memos.svg();
			var $svgLines = $html.find("line");
			if(!_.isEmpty($svgLines)){
				var $svg = $memos.find("svg");
				_.each($svgLines, function(line){
					var $line = $(line);
					registLineEvents($line);
					$svg.append($svgLines);
				});

			}	
			_.each($html.siblings(".memo"), function(memo){
				var $memo = $(memo);
				$memos.append($memo);
				registEvents($memo);				
			});
			if(!_.isEmpty($memos.find(".memo-content p.stroke-out")) && confirm("Will you remove all completed memos?")){
				_.each($memos.find(".memo-content p.stroke-out"), function(p){
					var $p = $(p), $memo = $p.parent().parent();
					removeMemo($memo, $memo.index());
				});
			}

		}
	});
	
	$archiveThis.click(function(e){
		var id = "a" + EnvFun.getTodayDate("yy-mm-dd");
		$.jStorage.set(id, $memos.html());
		alert("archived : " + EnvFun.getTodayDate("yy-mm-dd")); 
	});
	
	var setDefaults = function(){
		var $archivedDatepicker = $("#archived_datepicker");
		var maxDate = new Date();
	    $archivedDatepicker.datepicker({
	        maxDate : maxDate,
	        changeMonth : true,
	        changeYear : true,
	        onSelect : function(date){
		        var html = $.jStorage.get("a" + date, null);
		        // if empty, return alert
		        if(_.isEmpty(html)){
			        alert("There is no archived data");
		        } else {
					$html = $(html);
			        $archivedMemos.children().remove();
			        if($archivedMemos.hasClass("hasSVG")){
				    	$archivedMemos.removeClass("hasSVG");    
			        }
					
					$archivedMemos.svg();
					var $svgLines = $html.find("line");
					if(!_.isEmpty($svgLines)){
						var $svg = $archivedMemos.find("svg");
						_.each($svgLines, function(line){
							var $line = $(line);
							$svg.append($svgLines);
						});
		
					}	
					_.each($html.siblings(".memo"), function(memo){
						var $memo = $(memo);
						var $dateInput = $memo.find("input.d_datepicker");
						$dateInput.val($dateInput.attr("date"));
						$dateInput.prop("readonly", true);
						$archivedMemos.append($memo);
					});
					
		        }
		        
	        }        
	    });
// 		$archivedDatepicker.datepicker('setDate', new Date(maxDate - 24*60*60*1000));
		$archivedDatepicker.datepicker('setDate', maxDate);
		var html = $.jStorage.get(EnvFun.getTodayDate(), null)
		if(html !== null){
			var $html = $(html);
			$memos.svg();
			var $svgLines = $html.find("line");
			if(!_.isEmpty($svgLines)){
				var $svg = $memos.find("svg");
				_.each($svgLines, function(line){
					var $line = $(line);
					registLineEvents($line);
					$svg.append($svgLines);
				});

			}

			_.each($html.siblings(".memo"), function(memo){
				var $memo = $(memo);
				$memos.append($memo);
				registEvents($memo);
			});
		} else {
			$memos.svg();			
		}
		
	};
	
	var registEvents = function($dom){
		var $cloneMemoSample = $dom;
		var $datepicker = $cloneMemoSample.find(".d_datepicker");
		if($datepicker.hasClass("hasDatepicker")){
			$datepicker.removeClass("hasDatepicker");
		}

		var minDate = new Date();
	    $datepicker.datepicker({
	        minDate : minDate,
	        changeMonth : true,
	        changeYear : true
	    });
	    if(_.isEmpty($datepicker.attr("date"))){
			$datepicker.datepicker('setDate', new Date());
			$datepicker.attr("date", EnvFun.getTodayDate("yy-mm-dd"));    
	    } else {
			var dateText = $datepicker.attr("date");
			$datepicker.datepicker('setDate', dateText);
	    }
		
		$datepicker.click(function(e){
			Env.add.useAddableTimer();
		});
		$datepicker.datepicker( 'option' , 'onClose', function(dateText) {
			if(_.isEmpty($datepicker.val())){
				$datepicker.val(minDate);
			}
			$datepicker.attr("date", dateText);
			changeDateColor($cloneMemoSample);
		});
		$cloneMemoSample.draggable({
			containment : ".memos",
			opacity : 0.7,
			cursor : 'move',
			start : function(){
				Env.save.autoSaveActivate = false;
				var $this = $(this);
				$this.attr({"left" : $this.offset().left, "top" : $this.offset().top, "move" : "move"});
			},
			stop : function(e, ui){

				var $this = $(this), id = $this.attr("id");
				if($this.attr("move") === "move"){
					var sizeX = $this.width() / 2, sizeY = $this.height() / 2;
					var offsetX = $this.offset().left - $this.parent().offset().left + 1 + sizeX;
					var offsetY = $this.offset().top - $this.parent().offset().top + 1 + sizeY;
					
					var lines = $this.attr("lines") || "";
					lines = _.isEmpty(lines) ? _.toArray(lines) : lines.split(",");
					_.each(lines, function(line){
						var $line = $("#" + line);
						if($line.attr("from") === id){
							$line.attr({"x1": offsetX, "y1" : offsetY});
						} else if ($line.attr("to") === id) {
							$line.attr({"x2": offsetX, "y2" : offsetY});						
						} else {
							if(!!debug){
								console.log("not matched");
							}
						}
					});	
					
					$this.attr("move", "");
				}
				Env.save.autoSaveActivate = true;
				if(!_.isEmpty($memos.find(".memo .focus"))){
					setTimeout(function(){ $memos.find(".memo .focus textarea").blur();	}, 100);
				}
			}
		});

		$cloneMemoSample.droppable({
			accept : ".memo",
			activeClass: "ui-state-hover",
			hoverClass: "ui-state-highlight",
		    drop: function( event, ui ) {
			    if(!!debug){
			    	console.log('drop');
			    }
			    var $draggable = $(ui.draggable), $this = $(this);
			    $draggable.offset({"left" : $draggable.attr("left") || $draggable.offset().left, "top" : $draggable.attr("top") || $draggable.offset().top});
			    drawLine($draggable, $this, $this);
			    $draggable.attr("move", "");
			    return false;
			},
			over: function(event, ui) {
				if(!!debug){
					console.log('over');	
				}
				if($(this).hasClass("ui-state-error")){
					$(this).removeClass("ui-state-error");
				}
			},
			out: function(event, ui) {
				if(!!debug){
					console.log('out');	
				}				
				changeDateColor($(this));
			}
		});
		var $remainSlider = $cloneMemoSample.find("div.slider");
		if(!_.isEmpty($remainSlider)){
			$remainSlider.remove();
		}
		var slider = $cloneMemoSample.find("input:eq(1)").bootstrapSlider({
			tooltip_position : "bottom",
			handle : "triangle",
			min : 0,
			max : 10,
			step : 1,
			formatter : function(value){
				return "progress : " + (value*10) + "%";
			}
		});
		
		slider.on({
			'slideStop' : function(e){
				Env.add.useAddableTimer();
				var $this = $(this), $memo = $this.parent().parent(), value = e.value;
				var $p = $this.siblings("p");
				$this.attr("prog", value);
				if(value == 10){
					if(!$p.hasClass("stroke-out")){
						$p.addClass("stroke-out");
					}
				} else {
					if($p.hasClass("stroke-out")){
						$p.removeClass("stroke-out");
					}
				}
				if(!_.isEmpty($memos.find(".memo .focus"))){
					$memos.find(".memo .focus textarea").blur();	
				}
				
			}
		});

		if(_.isEmpty($cloneMemoSample.find("p").text())){
			slider.bootstrapSlider('disable');
			slider.bootstrapSlider('setValue', 0, true);
		} else {
			slider.bootstrapSlider('enable');
			var sliderValue = $cloneMemoSample.find("input:eq(1)").attr("prog") || 0;
			slider.bootstrapSlider('setValue', parseInt(sliderValue), true);
		}
		
		$dom.find(".memo-content p").click(function(e){
			e.stopPropagation();
			e.preventDefault();
			var $this = $(e.currentTarget);
			var $content = $this.parent();
			if($content.parent().prop("readonly") !== "true"){
				var content = $this.text();
				
				$content.find("textarea").val(content);
				$content.addClass("focus");
				Env.add.setAddable(false);
				$content.find("textarea").focus();
			}

		});
		$dom.find(".memo-content textarea").on({
			'blur' : function(e){
				var $this = $(e.currentTarget);
				var content = $this.val();
				$this.parent().removeClass("focus");
				$this.parent().find("p").text(content);			
				if(_.isEmpty(content)){
					$this.parent().find("input.d_progress_slider").bootstrapSlider('disable').bootstrapSlider('setValue', 0, true);
/*
					if($this.hasClass("stroke-out")){
						$this.removeClass("stroke-out");
					}
*/
				} else {
					$this.parent().find("input.d_progress_slider").bootstrapSlider('enable');
				}
				Env.focus.removeFocus();
				Env.save.saveThis();
				Env.add.setAddable(true);
			},
			'keyup' : function(e){
				var $this = $(e.currentTarget);
				var content = $this.val();
				if(_.isEmpty($this.siblings("p").text()) && _.isEmpty(content)){
					$this.parent().find("input.d_progress_slider").bootstrapSlider('disable').bootstrapSlider('setValue', 0, true);
/*
					if($this.siblings("p").hasClass("stroke-out")){
						$this.siblings("p").removeClass("stroke-out");
					}
*/
				} else {
					$this.parent().find("input.d_progress_slider").bootstrapSlider('enable');
				}
			}
		});

		$dom.find(".memo-button.important").click(function(e){
			e.stopPropagation();
			e.preventDefault();
			var $this = $(e.currentTarget);
			if($this.parent().parent().prop("readonly") !== "true"){
				Env.add.useAddableTimer();
				if($this.prop("checked") === "true"){
					if($this.hasClass("checked")){
						$this.removeClass("checked");
					}		
					$this.prop("checked", "false");
				} else {
					$this.addClass("checked");
					$this.prop("checked", "true");				
				}
			}
			Env.focus.removeFocus();
		});	
		$dom.find(".memo-button.remove").click(function(e){
			e.stopPropagation();
			e.preventDefault();

			if(confirm("You really want to delete this memo?")){
				Env.add.useAddableTimer();
				var $this = $(e.currentTarget);
				var $memo = $this.parent().parent();
				removeMemo($memo, $memo.index());
			}

			Env.focus.removeFocus();
		});

	};
	var removeMemo = function($memo, index){
				
		$memo.unbind();
		// remove all Lines
		var lines = $memo.attr("lines") || "";
		lines = _.isEmpty(lines) ? _.toArray(lines) : lines.split(",");
		
		_.each(lines, function(line){
			deleteLine($("#"+line));
		});
		var $afters = $memos.find(".memo:gt("+index+")");
		// remove this
		$memo.remove();	
		// re-arrange all memos
		_.each($afters, function(memo){
			var $memo = $(memo);
			var offsetX = $memo.attr("left"), offsetY = $memo.attr("top");
			$memo.offset({left : offsetX, top : offsetY});
		});

	};
	var moveTo = function($dom, x, y, e){
		var offset = $memos.offset();
		var offsetX = calX(x) + offset.left - 1, offsetY = calY(y) + offset.top - 1;
		$dom.offset({left : offsetX, top : offsetY});
		$dom.attr({left : offsetX, top : offsetY});
		console.log("move To (" + x +", " + y + ")");
	};
	
	var addNewMemo = function(x, y){
		var $cloneMemoSample = $($memoSample.html());

		$cloneMemoSample.attr("id", Env.id.nextMemoId());
		
		$memos.append($cloneMemoSample);
		moveTo($cloneMemoSample, x, y);
		registEvents($cloneMemoSample);
		$cloneMemoSample.find(".memo-content").click();
		
	};
	var changeDateColor = function($memo){
		var date = $memo.find(".d_datepicker").val();
		var today = EnvFun.getTodayDate("yy-mm-dd");
		if(date <= today){
			$memo.addClass("ui-state-error");
		} else {
			$memo.removeClass("ui-state-error");
		}
	};
	var calX = function(x){
		return (x + 156 <= 1000 ? (x < 6 ? 6 : x) : 1000 - 156);
	};
	var calY = function(y){
		return (y + 156 <= 800 ? (y < 6 ? 6 : y) : 800 - 156);
	};
	
	var drawLine = function($from, $to, $this){

		var fromLine = $from.attr("lines") || "", toLine = $to.attr("lines") || "";
		fromLine = _.isEmpty(fromLine) ? _.toArray(fromLine) : fromLine.split(",");
		toLine = _.isEmpty(toLine) ? _.toArray(toLine) : toLine.split(",");
		if(!isLinked(fromLine, toLine)){
			var parentX = $this.parent().offset().left, parentY = $this.parent().offset().top;
			var fromX = $from.offset().left - parentX + 1, fromY = $from.offset().top - parentY + 1;
			var fromSizeX = $from.width() + 2, fromSizeY = $from.height() + 2;
			if(!!debug){
				console.log("from (" + fromX + ", " + fromY + ")");	
			}
			var toX = $to.offset().left - parentX + 1, toY = $to.offset().top - parentY + 1;
			var toSizeX = $to.width() + 2, toSizeY = $to.height() + 2;
			if(!!debug){
				console.log("to (" + toX + ", " + toY + ")");	
			}
			
			var svg = $this.parent().svg('get');
			var lineId = Env.id.nextLineId();
			var settings = {
				stroke: 'navy', 
				strokeWidth: 1, 
				id : lineId
			};
			svg.line(fromX + (fromSizeX / 2), fromY + (fromSizeY / 2), toX + (toSizeX / 2), toY + (toSizeY / 2), settings);
			var $line = $("#"+lineId);
			$line.attr({from : $from.attr("id"), to : $to.attr("id")});
			registLineEvents($line);
			
			fromLine.push(lineId), toLine.push(lineId);
			$from.attr("lines", fromLine), $to.attr("lines", toLine);
		} else {
			if(!!debug){
				console.log("exist");
			}
		}
		
	};
	var registLineEvents = function($line){
		$line.mouseover(function(e){
			var $this = $(this);
			if(!!debug){
				console.log("over");	
			}
			if(Env.rubbing.isStandBy()){
				Env.rubbing.setRubbingElement($this);
				Env.rubbing.addCount();
				if(!!debug){
					console.log(Env.rubbing.getCount());	
				}
				if(Env.rubbing.isInvokeRubbingEvent()){
					deleteLine($this);					
				}
			}
		});
	};
	var isLinked = function(from, to){
		var result = false;
		_.each(from, function(item){
			result = result || _.find(to, function(target){ return target === item; }) !== undefined ? true : false;
		});	
		return result;
	};
	
	var deleteLine = function($dom){
		var lineId = $dom.attr("id");
		var $from = $("#" + $dom.attr("from")), $to = $("#" + $dom.attr("to"));
		removeLineIdFromMemo($from, lineId);
		removeLineIdFromMemo($to, lineId);
		
		$dom.unbind();
		$dom.remove();
	};
	
	var removeLineIdFromMemo = function($memo, lineId){
		var lines = $memo.attr("lines") || "";
		lines = _.isEmpty(lines) ? _.toArray(lines) : lines.split(",");
		$memo.attr("lines", _.without(lines, lineId));
		
	};
	
	var isEqual = function($first, $second){
		var id1 = $first === null ? "null1" : $first.attr("id") || "empty1", 
			id2 = $second === null ? "null2" : $second.attr("id") ||  "empty2";
		return id1 === id2;
	};
	setDefaults();
})