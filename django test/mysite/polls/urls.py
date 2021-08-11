from django.urls import path
from . import views

urlpatterns = [
  path('', views.get_nai_zi, name='get_nai_zi')
]