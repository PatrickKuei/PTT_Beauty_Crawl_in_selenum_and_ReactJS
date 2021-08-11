from django.shortcuts import render
from django.http.response import JsonResponse
from django.http import HttpResponse
import requests
from bs4 import BeautifulSoup

RENT_WEB_URL = "https://rent.591.com.tw/"

# Create your views here.
def index(request):
  aparts = get_aparts()
  return JsonResponse(aparts, safe=False)

# kind:
#   1: 整層
#   2: 獨套
#   3: 分租套
#   4: 雅房
# region: 
#   1: 台北
#   3: 新北
# section:
# firstRow:
#  0 30 60 90
def get_aparts():
  response = requests.get(RENT_WEB_URL, params={"kind":"1", "region":"3", "pattern": "2", "rentprice": ",25000"})
  soup = BeautifulSoup(response.text, "html.parser")
  rent_infos = soup.select("div#content ul.listInfo")

  apart_results = []
  for rent_info in rent_infos:
    # remove whitespace
    apart_info_arr = "".join(rent_info.select("p")[0].text.split()).split("|")
    apart_info = {
      "kind": apart_info_arr[0],
      "room": apart_info_arr[1],
      "floor": apart_info_arr[3]
    }

    is_apart_owner = rent_info.select("em")[1].text[:2] == "屋主"
    apart_info["is_apart_owner"] = is_apart_owner

    apart_imgs = rent_info.select("li.imageBox img")
    apart_info["apart_img"] = apart_imgs[0]["data-original"]

    apart_links = rent_info.select("li.infoContent a")
    apart_info["apart_link"] = apart_links[0]["href"][2:]

    apart_title = rent_info.select("li.infoContent a")[0].text
    apart_info["apart_title"] = apart_title

    apart_address = rent_info.select("em")[0].text
    apart_info["apart_address"] = apart_address
    
    apart_price = rent_info.select("div.price")
    apart_info["apart_price"] = apart_price[0].select('i')[0].text

    apart_results.append(apart_info)
  
  return apart_results


