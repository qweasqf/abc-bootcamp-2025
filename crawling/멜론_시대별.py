import requests

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
# with open("melon_dump.html", "wt", encoding="utf8") as f:
#     f.write(html)
#     print("written to", f.name)
    
# BeautifulSoup4로 melon_dump.html 파싱 및 JSON 저장
from bs4 import BeautifulSoup
import json

def parse_melon_chart(html_path, json_path):
    with open(html_path, "rt", encoding="utf8") as f:
        soup = BeautifulSoup(f, "html.parser")

    result = []
    # 1~100위 tr 태그 모두 가져오기
    trs = soup.select("tr.lst50") + soup.select("tr.lst100")
    for tr in trs:
        tds = tr.find_all("td")
        if len(tds) < 4:
            continue
        # 순위
        rank = tds[1].get_text(strip=True)
        # 앨범명
        album = tds[2].get_text(strip=True)
        # 곡정보(곡명, 가수명)
        info_td = tds[3]
        # 곡명
        title_tag = info_td.find("div", class_="wrap_song_info")
        if title_tag:
            title = title_tag.find("a").get_text(strip=True)
        else:
            title = info_td.get_text(strip=True)
        # 가수명
        artist_tag = info_td.find("span", class_="checkEllipsis")
        artist = artist_tag.get_text(strip=True) if artist_tag else ""
        # 곡 id, 앨범 id 추출
        song_id = ""
        album_id = ""
        a_tags = info_td.find_all("a")
        for a in a_tags:
            href = a.get("href", "")
            if href.startswith("javascript:melon.play.playSong"):
                # 예: javascript:melon.play.playSong('19070206', '1234567');
                import re
                m = re.search(r"'([0-9]+)'", href)
                if m:
                    song_id = m.group(1)
            if href.startswith("javascript:melon.link.goAlbumDetail"):
                m = re.search(r"'([0-9]+)'", href)
                if m:
                    album_id = m.group(1)
        result.append({
            "rank": rank,
            "title": title,
            "artist": artist,
            "album": album,
            "song_id": song_id,
            "album_id": album_id
        })

    with open(json_path, "wt", encoding="utf8") as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
        print(f"JSON saved to {json_path}")

# 파싱 실행
parse_melon_chart("melon_dump.html", "melon_kpop_2019.json")
