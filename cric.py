import sched, time
import requests
from flask import Flask, jsonify, request, render_template
from flask import  make_response, current_app, session
from datetime import timedelta
from functools import update_wrapper
import json
import os
from bs4 import BeautifulSoup
from quickbs import CricParser

team_name_map={ "RSA": "South Africa"
                , "PAK": "Pakistan"
                , "IND": "India"
                , "NZ": "New Zealand"
                , "AFG": "Afghanistan"
                , "AUS": "Australia"
                , "SL": "Sri Lanka"
                , "ENG": "England"
                , "BAN": "Bangladesh"
                , "IRE": "Ireland"
                , "SCO": "Scotland"
                , "UAE": "United Arab Emirates"
                , "ZIM": "Zimbabwe"
                , "WI": "West Indies"}
score_card={}
score_card_new=[]
score_card_dict={}
BASE_URL="http://www.cricbuzz.com/livecricketscore"
END_URL="/commentary-push.json?1"
new_url=BASE_URL + "/2015/2015_WC/BAN_IND_MAR19" + END_URL
FULL_SCORE="http://www.cricbuzz.com/live-cricket-scorecard-ajax/12898/"
FULL_SCORE_1="http://www.cricbuzz.com/cricket-scorecard/12898"

app = Flask(__name__, static_url_path='/static')
app.secret_key='F12Zr47j\3yX R~X@H!jmM]Lwf/,?KT'
config=os.path.join(app.root_path, 'config.cfg')
print app.config.from_pyfile(config)
#app.config["new_url"]=new_url

def batting_parser(bat_soup):
    batsman_score=[]
    for row in bat_soup:
        try:
            #print row.td.a.string
            status = []
            for sib in row.td.next_siblings:
                if "\n" not in sib.string:
                    #print sib.string
                    status.append(sib.string)
            batsman_score.append({'name' : row.td.a.string, 'status': status[0], 'runs': status[1], 'balls': status[2], 'fours': status[3], 'sixes': status[4]})
        except Exception as e:
            print "Nonetype", e
    return batsman_score

def bowler_parser(bowl_soup):
    bowl_score=[]
    for row in bowl_soup:
        try:
            status=[]
        except Exception as e:
            print "Bowler Parser Exception", e

def parse_full_score():
    resp=requests.get(FULL_SCORE)
    print "Response Code" ,type(resp.status_code)
    #if resp.status_code is 200:
        #print "Here response code"
        #return {"empty" : "true"}
    soup=BeautifulSoup(resp.text)
    json_full_score={}
    try:
        for i, table in enumerate(soup.find(id="innings_1").find_all('table')):
            #print "table - ", len(table.find_all('tr'))
            if (table.find_all('tr')[0].th.string).lower() == "batting":
                json_full_score["batsmans_1"] = batting_parser(table.find_all('tr'))
            elif ((table.find_all('tr')[0].th.string).lower() == "batting"):
                pass
        for i, table in enumerate(soup.find(id="innings_2").find_all('table')):
            if (table.find_all('tr')[0].th.string).lower() == "batting":
                json_full_score["batsmans_2"] = batting_parser(table.find_all('tr'))
    except AttributeError as ae:
        print "ArrtibuteError exception", ae
        #json_full_score = {"empty": "true"}
    except Exception as e:
        print "Exception", e
        #json_full_score = {"empty": "true"}
    print json_full_score
    return json_full_score

def fetch_score():
    global score_card, score_card_new, score_card_dict
    score_card_new=[]
    score_card_dict={}
    #print "Score", time.time()
    print "Fetch Score " , app.config["NEW_URL"]
    score = requests.get(app.config["NEW_URL"]) #session["URL"])
    print "Got response from server"
    score_json = score.json()
    #print score_json[-2]['batteamruns'], score_json[-2]['batteamovers']
    try:
        score_card_dict['team1']=score_json[-2]['team1']
        score_card_dict['team2']=score_json[-2]['team2']
        score_card_dict['break_state']=score_json[-2]['break_state'].strip()
        score_card_dict['match_result']=score_json[-2]['status']
        score_card_dict['inning']=score_json[-2]['currentInng']
        score_card_dict['venue']=score_json[-2]['venue_city'] + ',' + score_json[-2]['venue_country']
        if score_card_dict['inning'] == "0":
            score_card_dict['match_result'] = "Match NOT started"
        score_card_dict['bat_team']=team_name_map[score_json[-2]['batteamname']]
        if score_card_dict['inning'] == "1" :
            score_card_dict['match_result'] = score_card_dict['bat_team'] + "   is batting first"
        score_card_dict['bat_team_runs']=score_json[-2]['batteamruns']
        score_card_dict['bat_team_overs']=score_json[-2]['batteamovers']
        score_card_dict['bat_team_wickets']=score_json[-2]['batteamwkts']
        score_card_dict['match_state']=score_json[-2]['match_state']
        score_card_dict['curr_run_rate']=score_json[-2]['curr_runrate']
        score_card_dict['bowl_team']=team_name_map[score_json[-2]['bwlteamname']]
        score_card_dict['target']=score_json[-2]['bwlteamdesc']

        for idx, bowler in enumerate(score_json[-2]['batsman']):
            batsman=score_json[-2]['batsman'][idx]
            score_card_new.append({'name': batsman['name'], 'runs': batsman['runs'], 'balls': batsman['balls_faced'], 'fours': batsman['fours'], 'sixes': batsman['sixes']})

        score_card_dict['batsmans']=score_card_new    
        score_card_new=[]
        
        for idx, bowler in enumerate(score_json[-2]['bowler']):
            bowler=score_json[-2]['bowler'][idx]
            score_card_new.append({'name': bowler['name'], 'runs': bowler['runs'], 'overs': bowler['overs'], 'wickets': bowler['wickets'], 'maidens': bowler['maidens']})
        
        score_card_dict['bowlers']=score_card_new
    except Exception as e:
        print "Exception while getting JSON", e

@app.route('/admin', methods = ['GET', 'POST'])
def admin():
    if request.method == 'POST':
        global new_url
        new_url = BASE_URL + request.form['new_url'] + END_URL
        print app.config["NEW_URL"]
        app.config["NEW_URL"]=new_url
    return render_template('admin.html')

@app.route('/', methods = ['GET'])
def index():
    print app.config["NEW_URL"]
    return render_template('cric.html')

@app.route('/full_score_1', methods = ['POST', 'GET'])
def full_score_update_1():
    cricbc=CricParser(FULL_SCORE_1)
    inngs_1 = cricbc.full_score_json(cricbc.soup, "Inngs_1")
    inngs_0 = cricbc.full_score_json(cricbc.soup, "Inngs_0")
    temp = {"inngs_0": inngs_0, "inngs_1": inngs_1}
    return jsonify(temp)

@app.route('/full_score', methods = ['POST', 'GET'])
def full_score_update():
    full_scor=""
    try:
        full_scor=parse_full_score()
    except Exception as e:
        full_scor={"empty": "true"}
    return jsonify(full_scor)

@app.route('/score', methods = ['POST', 'GET'])
def score_update():
    print "Fetching Score"
    fetch_score()
    #print score_card
    #score_card_dict['batsman'] = score_card_new
    #print score_card_dict
    return jsonify(score_card_dict)

if __name__ == '__main__':
    '''Run the WebApp server using Flask'''
    #print parse_full_score()
    port = int(os.environ.get("PORT",5000))
    app.run(host='0.0.0.0', port=port, debug = True)
    
