from django.shortcuts import render
import time
from django.http.response import JsonResponse
from django.http import HttpResponse
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
chrome_options = Options()
chrome_options.add_argument("--headless")

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
    apart_info['id'] = apart_imgs[0]["data-bind"]

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

def get_apart_detail(request):
  print('request accept!!!!!!!!')
  apart_detail_url = request.GET.get('apartDetailUrl')

  driver = webdriver.Chrome(executable_path='chromedriver.exe', chrome_options=chrome_options)
  driver.get("http://" + apart_detail_url)
  try:
    img_list = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CLASS_NAME, "big-images"))
    )
  finally:
    img_list.click()

  soup = ''
  try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "big-images"))
    )
  finally:
    soup = BeautifulSoup(driver.page_source, "lxml")

  total_imgs_count =int(soup.select_one(".indicator").text.split("/")[1])
  big_imgs = []
  for i in range(0, total_imgs_count):
    soup = BeautifulSoup(driver.page_source, "lxml")
    big_imgs.append(soup.select_one(".detail-image img")['src'])
    try:
      next_btn = WebDriverWait(driver, 10).until(
          EC.presence_of_element_located((By.CLASS_NAME, "next-btn"))
      )
    finally:
      next_btn.click()
  # print(*big_imgs, sep = "\n")

  return JsonResponse(big_imgs, safe=False)
