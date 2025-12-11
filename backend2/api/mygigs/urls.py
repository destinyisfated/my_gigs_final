
from django.urls import path
from django.urls import include
from rest_framework.routers import DefaultRouter
from .views import FreelancerProfileUpdateView, FreelancerViewSet, ProfessionViewSet, ReviewViewSet, JobViewSet, TestimonialViewSet
  
router = DefaultRouter()
router.register(r'freelancers', FreelancerViewSet, basename='freelancer')
router.register(
     r'freelancers/(?P<freelancer_id>\d+)/reviews',
     ReviewViewSet,
     basename='freelancer-review'
 ) 
router.register(r'professions', ProfessionViewSet, basename='profession')
router.register(r'job', JobViewSet, basename='job')
router.register(r'testimonial', TestimonialViewSet, basename='testimonial')
router.register(r'reviews', ReviewViewSet, basename='review')
urlpatterns = [
    path('', include(router.urls)),
    path("freelancers/me/", FreelancerProfileUpdateView.as_view(), name="freelancer-profile-update"),

]

 
