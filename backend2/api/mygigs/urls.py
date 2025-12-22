from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from .views import (
    FreelancerDocumentViewSet,
    FreelancerConversionViewSet,
    MpesaCallbackAPIView,
    MpesaSTKPushAPIView,
    whoami,
    FreelancerProfileUpdateView,
    FreelancerViewSet,
    ProfessionViewSet,
    ReviewViewSet,
    JobViewSet,
    TestimonialViewSet,
    MpesaSTKPushAPIView, 
    MpesaCallbackAPIView, 
    MpesaTransactionListAPIView, 
    MpesaTransactionStatusAPIView, 
    clerk_webhook_handler,
    me,
    me_reviews,
    AdminOverviewView
   
)

router = DefaultRouter()
router.register(r'freelancers', FreelancerViewSet, basename='freelancer')
router.register(r'reviews', ReviewViewSet, basename='review')  # 👈 IMPORTANT
router.register(r'professions', ProfessionViewSet, basename='profession')
router.register(r'job', JobViewSet, basename='job')
router.register(r'testimonials', TestimonialViewSet, basename='testimonial')
router.register(r'freelancer-conversions', FreelancerConversionViewSet, basename='freelancer-conversion')

freelancer_router = NestedDefaultRouter(
    router, r'freelancers', lookup='freelancer'
)
freelancer_router.register(
    r'reviews',
    ReviewViewSet,
    basename='freelancer-reviews'
)
router.register(
    r"freelancer-documents",
    FreelancerDocumentViewSet,
    basename="freelancer-documents"
)


urlpatterns = [
    path("freelancers/me/", FreelancerProfileUpdateView.as_view(), name="freelancer-profile-update"),
    path('freelancers/me/reviews/', me_reviews, name="freelancer-me-reviews"),
    path("whoami/", whoami, name="whoami"),
    path("", include(router.urls)),
    path("", include(freelancer_router.urls)),
    path('stk-push/', MpesaSTKPushAPIView.as_view(), name='stk_push_request'),
    path('callback/', MpesaCallbackAPIView.as_view(), name='mpesa_callback'),
    path('transactions-api/', MpesaTransactionListAPIView.as_view(), name='transaction_list_api'),
    # NEW: API endpoint for the frontend to check transaction status
    path('check-status/<str:checkout_request_id>/', MpesaTransactionStatusAPIView.as_view(), name='transaction_status'),
    path('clerk/', clerk_webhook_handler, name='clerk-webhook'),
    path('me/',me, name="me"),
        path('admin-overview/', AdminOverviewView.as_view(), name='admin-overview'),  # Added

    
]
