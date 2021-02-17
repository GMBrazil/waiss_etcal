from django.urls import path, include
from . import views


app_name = 'etcal'

urlpatterns = [
    path('', views.index, name='index'),
    path('signup/', views.signup, name='signup'),
    path('database/', views.database, name='database'),
    path('calculator/', views.calculator, name='calculator'),
    path('getstarted/', views.get_started, name='get_started'),
    path('contribute/', views.contribute, name='contribute'),
    path('load/crop/', views.load_crop, name='load_crop'),
    path('load/soil/', views.load_soil, name='load_soil'),
    path('load/station/', views.load_station, name='load_station'),
    path('farm/dashboard/', views.dashboard, name='dashboard')
]