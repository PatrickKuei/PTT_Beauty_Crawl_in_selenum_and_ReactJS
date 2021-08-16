from django.urls import path
from . import views

urlpatterns = [
  path('apart_detail',views.get_apart_detail, name="get_apart_detail"),
  path('', views.index, name='index')
]