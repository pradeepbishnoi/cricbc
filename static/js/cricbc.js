

$(document).ready(function(){
	
	current_inng="";
	json_score_dump = "";
	json_full_score_dump = "";
	//Calling the ajax_call_score when page is ready
	ajax_call_score
	//ajax_call_full_score();

	setInterval(function() {
		ajax_call_score();
	}, 7000); 

	function ajax_call_score() {
			console.log("I am called");
			$.ajax({
				type: "GET",
				url: "/score",
			    datatype: "jsonp",
			    crossDomain: true,
			    error: function(data){
			    	console.log("Error" + data);
			    },
			    success: function(data){
			    	console.log("Success quick score" + data);
			    }
			})
			 .then( function(data){
				//console.log(data.bat_team_runs);
				update_scorecard(data);
				json_score_dump = data;
				ajax_call_full_score();
			});
	};

	function ajax_call_full_score() {
			$.ajax({
				type: "GET",
				url: "/full_score",
			    //url: "/full_score_1",
			    datatype: "jsonp",
			    crossDomain: true,
			    error: function(data){
			    	console.log("Error" + data);
			    },
			    success: function(data){
			    	console.log("Success Full score" + data);
			    }
			})
			 .then( function(data){
				//console.log(data.bat_team_runs);
				json_full_score_dump = data;
				//console.log(json_full_score_dump);
				//update_scorecard(data);
			});
	};
	function update_scorecard(json_data){
		$("#batting_score").text(json_data.bat_team_runs);
		$("#batting_overs").text(json_data.bat_team_overs);
		$("#batting_wickets").text(json_data.bat_team_wickets);
		$("#match_result").text(json_data.match_result);
		$("#batting_team").text(json_data.bat_team); //.append("<span class='boxx'>HI</span>");
		$("#bowling_team").text(json_data.bowl_team);
		score_target = "" + json_data.target;
		current_inng=json_data.inning;
		$("#bowling_score").text(score_target);
		match_string = json_data.team1 + " vs " + json_data.team2
		$("h2").text(match_string);
		$("h2").append("<small> in " + json_data.venue + "</small>");
		//console.log(json_data);

	};

	function update_batsmen_full_score(json_data, update_rows, bowling_team){
		if (update_rows === false) {
			if (bowling_team === true) {
				$('#team2-batsman-details').empty();
			}
			else {
				$('#batsman-details').empty();
			}
		}
		else {
			//batsmans=json_data.inngs_1.batsmans;
			batsmans=json_data.batsmans_1;
			console.log("inning" + json_score_dump.inning);
			inning=json_score_dump.inning;
			console.log(json_data.batsmans_1);
			selec='#batsman-details'; //selec = "";
			if ((inning == 2) && (bowling_team == false)){
				batsmans=json_data.batsmans_2;
			}
			else {
				if (bowling_team == true){
					selec='#team2-batsman-details'; 
				}
			}
			$(selec).append("<tbody></tbody>");
			selec = selec + ' > tbody:last';
			console.log(selec);
			console.log(batsmans);
			for (x=0; x<batsmans.length; x++){
				console.log("test" + x);
				console.log(batsmans[x]);
				data = "<tr><td>" + batsmans[x]['name'] + "</td><td>" + batsmans[x]['status'] + "</td>";
				//if (batsmans[x]['status'].toLowerCase().trim() === "not out"){
				//	data = "<tr class='notout'><td>" + batsmans[x]['name'] + "</td><td>" + batsmans[x]['status'] + "</td>";
					
				//}
				data = data + "<td>( " + batsmans[x]['fours']  + " x 4s, " + batsmans[x]['sixes'] + "x 6s )</td><td>" + batsmans[x]['runs'] + " ( " + batsmans[x]['balls'] + " )</td></tr>"
				console.log(data);
				$(selec).append(data);
			}
		}
	};

	function update_batsmen_score(json_data, update_rows){
		if (update_rows == false) {
			$('#batsman-details').empty();
		}
		else {
			selec = '#batsman-details';
			$(selec).append("<tbody></tbody>");
			selec = selec + ' > tbody:last';
			batsmans = json_data.batsmans;
			for (x=0; x<batsmans.length; x++){
				data = "<tr><td>" + batsmans[x]['name'] + "</td>";
				data = data + "<td>( " + batsmans[x]['fours']  + " x 4s, " + batsmans[x]['sixes'] + "x 6s )</td><td>" + batsmans[x]['runs'] + " ( " + batsmans[x]['balls'] + " )</td></tr>"
				console.log(data);
				$(selec).append(data);
			}
		}
	};

	function update_bowler_score(json_data, update_rows){
		if (update_rows == false) {
			$('#bowler-details').empty();
		}
		else {
			selec = '#bowler-details';
			$(selec).append("<tbody></tbody>");
			selec = selec + ' > tbody:last';
			bowlers = json_data.bowlers;
			for (x=0; x<bowlers.length; x++) {
				data = "<tr><td>" + bowlers[x]['name'] + "</td><td>" + bowlers[x]['overs'] + " - " + bowlers[x]['maidens'] + " - " + bowlers[x]['runs'] + " - " + bowlers[x]['wickets'] + "</td></tr>";
				console.log(data);
				$(selec).append(data);
			}
		}
	};

	$( "#batting_score" ).click(function() {
	  $( "#details" ).toggle( "fast", function() {
	  	console.log("Visible ?" + $('#details').is(':visible'));
	  	if ($('#details').is(':visible') == true) {
	  		console.log("SHOW");
		    update_batsmen_score(json_score_dump);
	  	}
	  	else {
	  		console.log("HIDE");
	  		update_batsmen_score(json_score_dump, false);
	  		$("#match_result").focus();
			//console.log($("#batting_score").is(':active'));
			//console.log($("#batting_score").is(':focus'));
	  		//console.log($("#batting_score").hasClass('active'));
	  	}
	  });
	});

	$( "#batting_overs" ).click(function() {
	  $( "#bowl-details" ).toggle( "fast", function() {
	  	console.log("Visible ?" + $('#details').is(':visible'));
	  	if ($('#bowl-details').is(':visible') == true) {
	  		console.log("SHOW");
		    update_bowler_score(json_score_dump);
	  	}
	  	else {
	  		console.log("HIDE");
	  		update_bowler_score(json_score_dump, false);
	  		$("#match_result").focus();
			//console.log($("#batting_score").is(':active'));
			//console.log($("#batting_score").is(':focus'));
	  		//console.log($("#batting_score").hasClass('active'));
	  	}
	  });
	});

	$( "#batting_team" ).click(function() {
	  $( "#details" ).toggle( "fast", function() {
	  	console.log("Clicked batting team");
	  	try {
	  	if ($('#details').is(':visible') == true) {
	  		console.log("SHOW");
		    update_batsmen_full_score(json_full_score_dump, true, false);
	  	}
	  	else {
	  		console.log("HIDE");
	  		update_batsmen_full_score(json_full_score_dump, false, false);
	  		$("#match_result").focus();
			//console.log($("#batting_score").is(':active'));
			//console.log($("#batting_score").is(':focus'));
	  		//console.log($("#batting_score").hasClass('active'));
	  	}
	  }
	  catch (ex) {
	  	console.log("Exception" + ex);
	  }
	  });
	});

	$( "#bowling_team" ).click(function() {
	  $( "#team2-details" ).toggle( "fast", function() {
	  	console.log("Clicked batting team");
	  	try {
	  	if ($('#team2-details').is(':visible') == true) {
	  		console.log("SHOW");
		    update_batsmen_full_score(json_full_score_dump, true, true);
	  	}
	  	else {
	  		console.log("HIDE");
	  		update_batsmen_full_score(json_full_score_dump, false, true);
	  		$("#match_result").focus();
			//console.log($("#batting_score").is(':active'));
			//console.log($("#batting_score").is(':focus'));
	  		//console.log($("#batting_score").hasClass('active'));
	  	}
	  }
	  catch (ex) {
	  		console.log("Exception" + ex);

	  }	
	  });
	});
});
