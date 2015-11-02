$("document").ready(function(){
	if(!!debug){
		// debug mode
	}	
	if(!!!debug){
		// not debug mode 
	}
	var Env = {
		id : {
			memoId : 0,
			nextMemoId : function(){
				Env.id.memoId++;
				return Env.id.memoId;
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
			isFocused : function(){
				return Env.focus.$el !== null;
			},
			giveFocus : function($target){
				if($target !== undefined && $target !== null && $target.hasClass("memo")){
					Env.focus.$el = $target;
				}
			},
			removeFocus : function(){
				Env.focus.$el = null;
			}
		}
	};
	var EnvFun = {
		cleanUp : function(){
			// TODO remove textarea focus
			Env.focus.removeFocus();
		}
	};
	var $memos = $("#memos"),
		$memoSample = $("#memo_sample");
	var paddingX = 146, paddingY = 146;
	
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
		'mouseup' : function(e) {
			if(Env.focus.isFocused()){
				var $target = Env.focus.$el, $this = $(e.currentTarget);
				if(!isEqual($target, $this)){
					e.stopPropagation();
					e.preventDefault();
	
					moveTo($target, e.offsetX, e.offsetY);
					Env.focus.removeFocus();
					// TODO redraw if line exists
				}
			}	
		},
		'dblclick' : function(e){
			e.stopPropagation();
			e.preventDefault();
			if(Env.add.isAddable()){
				addNewMemo(e.offsetX, e.offsetY);	
			}
			
		}
	});
	
	
	var registEvents = function(){
		
		$(".memo-content").click(function(e){
			e.stopPropagation();
			e.preventDefault();
			var $this = $(e.currentTarget);
			if($this.parent().data("readonly") !== "true"){
				var content = $this.find("span").text();
				$this.find("textarea").val(content);
				$this.addClass("focus");
				Env.add.setAddable(false);
				$this.find("textarea").focus();
			}

		});
		$(".memo-content textarea").blur(function(e){
			var $this = $(e.currentTarget);
			var content = $this.val();
			$this.parent().find("span").text(content);
			$this.parent().removeClass("focus");
			Env.focus.removeFocus();
			Env.add.setAddable(true);
		});
		$(".memo-button.important").click(function(e){
			e.stopPropagation();
			e.preventDefault();
			var $this = $(e.currentTarget);
			if($this.parent().parent().data("readonly") !== "true"){
				Env.add.useAddableTimer();
				if($this.data("checked") === "true"){
					if($this.hasClass("checked")){
						$this.removeClass("checked");
					}		
					$this.data("checked", "false");
				} else {
					$this.addClass("checked");
					$this.data("checked", "true");				
				}
			}
			Env.focus.removeFocus();
		});	
		$(".memo-button.remove").click(function(e){
			e.stopPropagation();
			e.preventDefault();
			Env.add.useAddableTimer();
			var $this = $(e.currentTarget);
			var $memo = $this.parent().parent();
			var $span = $memo.find(".memo-content span");
			if($span.text() === ""){
				$memo.unbind();
				$memo.remove();
			} else {
				$span.addClass("stroke-out");
				$memo.addClass("readonly");
				$memo.data("remove", "true");
				$memo.data("readonly", "true");
			}
			Env.focus.removeFocus();
		});
		$(".memo").on({
			'mousedown' : function(e){
				var $this = $(e.currentTarget);
				console.log("mouseDown : " + $this.data("id"));
// 				if($this === $(e.target)){
					Env.focus.giveFocus($this);	
// 				}
				
			},
			'mouseup' : function(e){
				var $this = $(e.currentTarget);
				console.log("mouseUp : " + $this.data("id"));
// 				if($this === $(e.target)){
					if(Env.focus.isFocused() && !isEqual(Env.focus.$el, $this)){
						drawLine(Env.focus.$el, $this);
					}
					Env.focus.removeFocus();	
// 				}
				
			}
		});
	};
	
	var moveTo = function($dom, x, y){
		$dom.css({marginLeft : calX(x), marginTop : calY(y)});
		console.log("move To (" + x +", " + y + ")");
	};
	
	var addNewMemo = function(x, y){
// 		var innerX = calX(x);
// 		var innerY = calY(y);
		var $cloneMemoSample = $($memoSample.html());
		moveTo($cloneMemoSample, x, y);
// 		$cloneMemoSample.css({marginLeft: innerX, marginTop: innerY});
		$cloneMemoSample.data("id", "Memo"+Env.id.nextMemoId());
		var $datepicker = $cloneMemoSample.find(".datepicker");
		var minDate = new Date();
	    $datepicker.datepicker({
	        minDate : minDate,
	        changeMonth : true,
	        changeYear : true        
	    });
		$datepicker.datepicker('setDate', new Date());
		$datepicker.click(function(e){
			Env.add.useAddableTimer();
		});
		$memos.append($cloneMemoSample);
		registEvents();
		$cloneMemoSample.find(".memo-content").click();
		
	};
	
	var calX = function(x){
		return (x + 156 <= 1000 ? (x < 6 ? 6 : x) : x - 156);
	};
	var calY = function(y){
		return (y + 156 <= 800 ? (y < 6 ? 6 : y) : y - 156);
	};
	
	var drawLine = function($from, $to){
		var fromX = $from.css("margin-left"), fromY = $from.css("margin-top");
		console.log("from (" + fromX + ", " + fromY + ")");
		var toX = $to.css("margin-left"), toY = $to.css("margin-top");
		console.log("to (" + toX + ", " + toY + ")");
		var $div = $("<div class='line'></div>");
		
	};
	
	var isEqual = function($first, $second){
		var id1 = $first.data("id") || "empty1", id2 = $second.data("id") || "empty2";
		return id1 === id2;
	};
})