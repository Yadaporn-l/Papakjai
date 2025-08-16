from django.urls import path
from myapp import views
urlpatterns = [
    path('', views.homepage),
    # Add more URL patterns here as needed
    
]