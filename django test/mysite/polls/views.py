import re
from django.http.response import JsonResponse
from django.shortcuts import render
from bs4 import BeautifulSoup
import requests

PTT_URL = "https://www.ptt.cc/"

def get_nai_zi(request):
  current = request.GET.get('current')
  page_size = request.GET.get('pageSize')
  imgs = get_ptt_beauty(current, page_size)
  return JsonResponse(imgs, safe=False)

## current: 第幾篇文章開始
## page_size: 要看幾篇文章
def get_ptt_beauty(current, page_size):
  int_page_size = int(page_size) ## 要看多少篇文章
  current_page = str(int(current) // 21 + 1) ## 從哪一頁開始, *一頁共有20篇文章
  int_started_article = int(current) % 21 ## 從該頁第幾篇文章開始看
  ## 舉例: 輸入current: 5, page_size=10, 表示要從第一頁第5篇文章開始看, 共看10篇文章
  ## 若輸入current: 24, page_size=10, 表示要從第二頁第4篇開始看, 共看10篇文章

  print(f"need to get {page_size} articles, start at page {current_page}, {int_started_article}st article")

  web_contain = get_web_contain("bbs/Beauty/search", {"q": "recommend:99", "page": current_page})
  article_links = web_contain.select("div.title>a")
  total_articles = article_links.__len__() ## 已經取得多少文章的連結

  ## 若取得的文章數不足需求要看幾篇文章, 則繼續取下一頁文章連結
  while int_page_size > total_articles: 
    web_contain = get_web_contain("bbs/Beauty/search", {"q": "recommend:99", "page": str(int(current_page)+1)})
    article_links += web_contain.select("div.title>a")
    total_articles = article_links.__len__()

  article_hrefs = get_article_hrefs(article_links, int_page_size, int_started_article)
  nai_zi_imgs = get_img_inside_articles(article_hrefs)
  return nai_zi_imgs

def get_web_contain(path, params=None):
  response = requests.get(PTT_URL+path, cookies={"over18": "1"}, params=params)
  print('go to url: ', response.url)
  soup = BeautifulSoup(response.text, "html.parser")
  return soup

def get_article_hrefs(article_links, page_size, started_at):
  print(f'got {article_links.__len__()} articles, prepare to get {page_size} articles...')
  result = []
  for i in range(started_at, started_at + page_size): 
    result.append(article_links[i]['href'])

  return result

def get_img_inside_articles(article_hrefs):
  result = [] 
  for article_href in article_hrefs:
    article_contain = get_web_contain(article_href)
    for links_in_article in article_contain.find_all("a"):
      if re.match(r'https.*i\.imgur.*\.jpg', links_in_article["href"]):
        result.append(links_in_article["href"])

  print(f'get {result.__len__()} nai zi!!')
  return result

# get_ptt_beauty("24", "3")