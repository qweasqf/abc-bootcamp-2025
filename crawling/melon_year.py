import requests
from bs4 import BeautifulSoup

page_url = "https://www.melon.com/chart/age/list.htm"

params = {
    "idx" : "1",
    "chartType" : "YE",
    "chartGenre" : "KPOP",
    "chartDate" : "2019",
    "moved" : "Y",
}

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
}

res = requests.get(page_url, params=params, headers=headers)
print(res) #상태코드 출력

html:str = res.text
with open("melon_dump.html", "wt", encoding="utf8") as f:
    f.write(html)
    print("written to", f.name)

soup = BeautifulSoup(html, "html.parser")

el_list = soup.select(".lst50")
for el in el_list:
    song_el = el.select_one("[href*=playSong]") # *은 포함이라는뜻
    song_title = song_el.text.strip()
    print(song_title)