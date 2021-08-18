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

## 取得租屋列表
def index(request):
  print('accept request')
  selected_cities = request.GET.get('selectedCity').split(',')
  str_selected_sections = request.GET.get('selectedSections')
  aparts = get_aparts(selected_cities, str_selected_sections)
  return JsonResponse(aparts, safe=False)

def get_aparts(selected_cities, str_selected_sections):
  apart_results = []

  # 複選城市 可以全取
  for city in selected_cities:
    params = {"kind":"1", "region":selected_cities,'section': str_selected_sections, "pattern": "2", "rentprice": ",25000"}
    driver = webdriver.Chrome(executable_path='chromedriver.exe', chrome_options=chrome_options)
    response = requests.get(RENT_WEB_URL, params=params)
    driver.get(response.url)
    try:
      target_city = driver.find_element_by_css_selector(f'div.area-box-body dd[data-id="{city}"]')
      target_city.click()
      
      ## 等頁面讀取結束
      soup = ""
      WebDriverWait(driver, 10).until(
          EC.invisibility_of_element_located((By.ID, "j_loading"))
      )
      soup = BeautifulSoup(driver.page_source, "lxml")

      rent_infos = soup.select("div#content ul.listInfo")

      for rent_info in rent_infos:

        ## 移除租屋資訊上空白字元
        apart_info_arr = "".join(rent_info.select("p")[0].text.split()).split("|")
        apart_info = {
          "kind": apart_info_arr[0],
          "room": apart_info_arr[1],
          "floor": apart_info_arr[3]
        }
        
        ## 取得必須租屋資訊
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

        ##將該筆租屋資訊存進回傳陣列內
        apart_results.append(apart_info)
    finally:
      print(f"got {apart_results.__len__()} aparts")
      driver.close()

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
