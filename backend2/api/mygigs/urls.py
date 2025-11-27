
from django.urls import path
from django.urls import include
from rest_framework.routers import DefaultRouter
from .views import FreelancerViewSet, ProfessionViewSet, ReviewViewSet, JobViewSet, TestimonialViewSet
  
router = DefaultRouter()
router.register(r'freelancer', FreelancerViewSet, basename='freelancer')
router.register(
     r'freelancer/(?P<freelancer_id>\d+)/reviews',
     ReviewViewSet,
     basename='freelancer-review'
 ) 
router.register(r'profession', ProfessionViewSet, basename='profession')
router.register(r'job', JobViewSet, basename='job')
router.register(r'testimonial', TestimonialViewSet, basename='testimonial')
urlpatterns = [
    path('', include(router.urls)),
]

 
