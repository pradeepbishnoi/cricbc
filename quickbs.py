from bs4 import BeautifulSoup
import requests

url="http://www.cricbuzz.com/cricket-scorecard/12896/ire-vs-pak-42nd-match-pool-b-icc-cricket-world-cup-2015"
r=requests.get(url)
print "Status Code",r.status_code

soup=BeautifulSoup(r.text)

class CricParser(object):
    def __init__(self, url):
        self.url=url
        self.response=self.get_response(self.url)
        self.soup=self.get_soup(self.response)

    def get_response(self, url):
        return requests.get(url)

    def get_soup(self, response):
        soup=None
        if response.status_code == 200:
            soup = BeautifulSoup(response.text)
        return soup

    def batsman_parser(self, divs):
        batsman_list=[]
        for child in divs.contents:
            name=None
            try:
                #print child.attrs
                name=self.class_string(child,"div span.left a")
                status=self.class_string(child,"div.pDesc1")
                runs=self.class_string(child,"div.pRun2")
                balls=self.class_string(child,"div.pBall1")
                fours=self.class_string(child,"div.pFours1")
                sixes=self.class_string(child,"div.pSixes1")
                #print child.select("div.pSixes1")[0].string
                batsman_list.append({"name": name, "status": status, "runs": runs, "balls": balls, "fours":fours, "sixes":sixes})
            except Exception as e:
                #batsman_dict={}
                if (name is not None):
                     batsman_list.append({"name": name, "status": "", "runs": 0, "balls": 0, "fours": 0, "sixes": 0})
        return batsman_list

    def bowler_parser(self, divs):
        try:
            name=self.class_string(divs,"div span.left a")
            overs=self.class_string(divs,"div.bOver")
            maidens=self.class_string(divs,"div.bMaiden")
            runs=self.class_string(divs,"div.bRun")
            wickets=self.class_string(divs,"div.bWicket")   
            bowl_dict={"overs": overs, "maidens": maidens, "runs": runs, "wickets": wickets, "name": name}
        except Exception as e:
            bowl_dict=None
            #pass #print "Exception ", e
        return bowl_dict

    def class_string(self, child, css):
        #print "Trying node",child
        return child.select(css)[0].string


    #print soup.find(id="Inngs_1").find_all('div', class_="fixedwidth")
    def full_score_json(self, soup, class_id):
        try:
            json_full_score={}
            batsman_score=[]
            bowler_score=[]
            for i, divs in enumerate(soup.find(id=class_id).find_all('div', class_="fixedwidth" )):
                #print "table - ", i, divs
                last_div="" 
                if i==0:
                    batsman_score = self.batsman_parser(divs)
                    json_full_score['extra']=divs.select("div.extraDesc i")[0].string
                    json_full_score['extra_total']=divs.select("div.extraTot b")[0].string
                elif i==1:
                    continue
                else:
                    temp=self.bowler_parser(divs)
                    if temp:
                        bowler_score.append(temp)
                last_div=divs
                #break#find_all('tr'))
            json_full_score['fow']=self.class_string(last_div,"div.fowWicketBname")
            json_full_score['batsmans']=batsman_score
            json_full_score['bowlers']=bowler_score
            return json_full_score     
        except Exception as e:
            print "Exception", e
            return {"empty": "true"}

if __name__=='__main__':
    obj = CricParser(url)
    print obj.full_score_json(obj.soup, "Inngs_1")
    print
    print obj.full_score_json(obj.soup, "Inngs_0")