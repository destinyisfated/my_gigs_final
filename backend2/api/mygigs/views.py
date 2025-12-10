from django.shortcuts import render
from rest_framework import viewsets
from .serializers import FreelancerListSerializer, JobSerializer, ProfessionSerializer, ReviewSerializer, ReviewReplySerializer, TestimonialSerializer, FreelancerDetailSerializer
from rest_framework import filters
from rest_framework.response import Response
from .models import Freelancer, Job, Review, Testimonial, Profession
from rest_framework.decorators import action   

# Create your views here.
# class FreelancerViewSet(viewsets.ModelViewSet):
#     queryset = Freelancer.objects.all()
#     serializer_class = FreelancerSerializer
#     filter_backends = [filters.SearchFilter, filters.OrderingFilter]
#     search_fields = ['name', 'title', 'skills']
#     ordering_fields = ['rating', 'hourly_rate', 'created_at']
     
#     def get_queryset(self):
#         queryset = super().get_queryset()
#           # Filter by location
#         county = self.request.query_params.get('county')
#         constituency = self.request.query_params.get('constituency')
#         ward = self.request.query_params.get('ward')
#          # Filter by profession
#         profession = self.request.query_params.get('profession')
#         # Filter by price range
#         min_rate = self.request.query_params.get('min_rate')
#         max_rate = self.request.query_params.get('max_rate')
          
#         if county:
#             queryset = queryset.filter(county__name=county)
#         if constituency:
#             queryset = queryset.filter(constituency__name=constituency)
#         if ward:
#             queryset = queryset.filter(ward__name=ward)
#         if profession:
#             queryset = queryset.filter(title__icontains=profession)
#         if min_rate:
#             queryset = queryset.filter(hourly_rate__gte=min_rate)
#         if max_rate:
#             queryset = queryset.filter(hourly_rate__lte=max_rate)
          
#         return queryset
 

class ProfessionViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve professions"""
    queryset = Profession.objects.filter(is_active=True)
    serializer_class = ProfessionSerializer
    
    @action(detail=True, methods=['get'])
    def freelancers(self, request, pk=None):
        """Get all freelancers for a specific profession"""
        profession = self.get_object()
        freelancers = profession.freelancers.filter(is_active=True)
        
        # Apply filters
        county = request.query_params.get('county')
        constituency = request.query_params.get('constituency')
        ward = request.query_params.get('ward')
        min_rating = request.query_params.get('min_rating')
        min_experience = request.query_params.get('min_experience')
        search = request.query_params.get('search')
        
        if county:
            freelancers = freelancers.filter(county__iexact=county)
        if constituency:
            freelancers = freelancers.filter(constituency__iexact=constituency)
        if ward:
            freelancers = freelancers.filter(ward__iexact=ward)
        if min_rating:
            freelancers = freelancers.filter(rating__gte=float(min_rating))
        if min_experience:
            freelancers = freelancers.filter(years_experience__gte=int(min_experience))
        if search:
            freelancers = freelancers.filter(
                Q(name__icontains=search) | 
                Q(skills__icontains=search)
            )
        
        page = self.paginate_queryset(freelancers)
        serializer = FreelancerListSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class FreelancerViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve freelancers"""
    queryset = Freelancer.objects.filter(is_active=True).select_related('profession')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FreelancerDetailSerializer
        return FreelancerListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filters
        profession = self.request.query_params.get('profession')
        county = self.request.query_params.get('county')
        constituency = self.request.query_params.get('constituency')
        ward = self.request.query_params.get('ward')
        min_rating = self.request.query_params.get('min_rating')
        min_experience = self.request.query_params.get('min_experience')
        search = self.request.query_params.get('search')
        
        if profession:
            queryset = queryset.filter(profession__id=profession)
        if county:
            queryset = queryset.filter(county__iexact=county)
        if constituency:
            queryset = queryset.filter(constituency__iexact=constituency)
        if ward:
            queryset = queryset.filter(ward__iexact=ward)
        if min_rating:
            queryset = queryset.filter(rating__gte=float(min_rating))
        if min_experience:
            queryset = queryset.filter(years_experience__gte=int(min_experience))
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(skills__icontains=search) |
                Q(profession__name__icontains=search)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured freelancers for homepage"""
        featured = self.get_queryset().filter(is_featured=True)[:8]
        serializer = FreelancerListSerializer(featured, many=True)
        return Response(serializer.data)


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

# class ProfessionViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = Profession.objects.all()
#     serializer_class = ProfessionSerializer


class JobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer