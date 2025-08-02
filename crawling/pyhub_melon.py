import requests
from bs4 import BeautifulSoup

url = "https://pyhub.kr/melon/20231204.html"

res = requests.get(url)
html = res.text
soup = BeautifulSoup(html, "html.parser")
el_list = soup.select("#song-list li")
for el in el_list:
    song_title = el.select_one("h2").text.strip()
    song_title = " ".join(song_title.split())
    print(song_title)
