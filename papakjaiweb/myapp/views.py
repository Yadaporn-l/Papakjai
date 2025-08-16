from django.shortcuts import render
from django.http import HttpResponse
# from django.views import View
# Create your views here.

# Create your views here.
def homepage(request):
   
    return render(request,"homepage.html")