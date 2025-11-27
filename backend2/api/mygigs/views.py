from django.shortcuts import render
from rest_framework import viewsets
from .serializers import FreelancerSerializer, JobSerializer, ProfessionSerializer, ReviewSerializer, ReviewReplySerializer, TestimonialSerializer
from rest_framework import filters
from rest_framework.response import Response
from .models import Freelancer, Job, Review, Testimonial, Profession
from rest_framework.decorators import action   

# Create your views here.
class FreelancerViewSet(viewsets.ModelViewSet):
    queryset = Freelancer.objects.all()
    serializer_class = FreelancerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'title', 'skills']
    ordering_fields = ['rating', 'hourly_rate', 'created_at']
     
    def get_queryset(self):
        queryset = super().get_queryset()
          # Filter by location
        county = self.request.query_params.get('county')
        constituency = self.request.query_params.get('constituency')
        ward = self.request.query_params.get('ward')
         # Filter by profession
        profession = self.request.query_params.get('profession')
        # Filter by price range
        min_rate = self.request.query_params.get('min_rate')
        max_rate = self.request.query_params.get('max_rate')
          
        if county:
            queryset = queryset.filter(county__name=county)
        if constituency:
            queryset = queryset.filter(constituency__name=constituency)
        if ward:
            queryset = queryset.filter(ward__name=ward)
        if profession:
            queryset = queryset.filter(title__icontains=profession)
        if min_rate:
            queryset = queryset.filter(hourly_rate__gte=min_rate)
        if max_rate:
            queryset = queryset.filter(hourly_rate__lte=max_rate)
          
        return queryset
 
class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        freelancer_id = self.kwargs.get('freelancer_id')
        return Review.objects.filter(freelancer_id=freelancer_id).order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        review = self.get_object()
        review.helpful_count += 1
        review.save()
        return Response({'helpful_count': review.helpful_count})
    
    @action(detail=True, methods=['post'])
    def add_reply(self, request, pk=None):
        review = self.get_object()
        serializer = ReviewReplySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(review=review)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
  
class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer

class ProfessionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Profession.objects.all()
    serializer_class = ProfessionSerializer

class JobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer