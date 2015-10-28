$("document").ready(function(){
	var $memos = $("#memos"),
		$memoSample = $("#memo_sample");
	var paddingX = 146, paddingY = 146;
	
	$.datepicker.setDefaults({
        showOtherMonths: true,
        numberOfMonths: 1,
        selectOtherMonths: true,
        dateFormat : "yy-mm-dd"
    });
	
	$memos.dblclick(function(e){
		e.preventDefault();
		addNewMemo(e.offsetX, e.offsetY);
	});
	
	var registEvents = function(){
		$(".memo-content").click(function(e){
			e.preventDefault();
			var $this = $(e.currentTarget);
			if($this.parent().data("readonly") !== "true"){
				var content = $this.find("span").text();
				$this.find("textarea").val(content);
				$this.addClass("focus");
				$this.find("textarea").focus();
			}

		});
		$(".memo-content textarea").blur(function(e){
			var $this = $(e.currentTarget);
			var content = $this.val();
			$this.parent().find("span").text(content);
			$this.parent().removeClass("focus");
		});
		$(".memo-button.important").click(function(e){
			e.preventDefault();
			var $this = $(e.currentTarget);
			if($this.parent().parent().data("readonly") !== "true"){
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
			
		});	
		$(".memo-button.remove").click(function(e){
			e.preventDefault();
			var $this = $(e.currentTarget);
			var $memo = $this.parent().parent();
			var $span = $memo.find(".memo-content span");
			if($span.text() === ""){
				$memo.remove();
			} else {
				$span.addClass("stroke-out");
				$memo.addClass("readonly");
				$memo.data("remove", "true");
				$memo.data("readonly", "true");
			}
		});
	};
	
	var moveTo = function($dom, x, y){
		$dom.css({marginLeft : calX(x), marginTop : calY(y)});
	};
	
	var addNewMemo = function(x, y){
		var innerX = calX(x);
		var innerY = calY(y);
		var $cloneMemoSample = $($memoSample.html());
		$cloneMemoSample.css({marginLeft: innerX, marginTop: innerY});
		
		var $datepicker = $cloneMemoSample.find(".datepicker");
		var minDate = new Date();
	    $datepicker.datepicker({
	        minDate : minDate,
	        changeMonth : true,
	        changeYear : true        
	    });
		$datepicker.datepicker('setDate', new Date());
		$memos.append($cloneMemoSample);
		registEvents();
		$cloneMemoSample.find(".memo-content").click();
		
	};
	
	var calX = function(x){
		return (x + 156 <= 1000 ? (x < 6 ? 6 : x) : x - 156);
	};
	var calY = function(y){
		return (y + 156 <= 800 ? (y < 6 ? 6 : y) : y - 156);
	}
})