from django.shortcuts import get_object_or_404, render
from rest_framework import viewsets
from .serializers import FreelancerListSerializer, JobSerializer, ProfessionSerializer, ReviewSerializer, ReviewReplySerializer, TestimonialSerializer, FreelancerDetailSerializer, FreelancerSerializer
from rest_framework import filters
from rest_framework.response import Response
from rest_framework.views import APIView   
from .models import Freelancer, Job, Review, Testimonial, Profession
from rest_framework.decorators import action   

# Create your views here.
#
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

class FreelancerProfileUpdateView(APIView):
    # authentication_classes = [ClerkAuthentication]
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        freelancer = get_or_create_freelancer(request.user)
        serializer = FreelancerSerializer(freelancer)
        return Response(serializer.data)

    def put(self, request):
        freelancer = get_or_create_freelancer(request.user)
        serializer = FreelancerSerializer(
            freelancer, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)



class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        freelancer_id = self.kwargs.get('freelancer_id')
        return Review.objects.filter(freelancer_id=freelancer_id).order_by('-created_at')
    
    # def create(self, request, *args, **kwargs):
    #     freelancer_id = self.kwargs.get("freelancer_id")
    #     freelancer = get_object_or_404(Freelancer, id=freelancer_id)
    #     print("Creating review...")
    #     client = request.user

    #     # Compute initials
    #     name_parts = client.username.split()
    #     initials = "".join(part[0].upper() for part in name_parts)[:2]

    #     data = {
    #         "freelancer": freelancer.id,
    #         "client": client.id,
    #         "client_name": client.username,
    #         "client_avatar": initials,
    #         "rating": request.data.get("rating"),
    #         "content": request.data.get("content"),
    #     }

    #     serializer = self.get_serializer(data=data)
    #     serializer.is_valid(raise_exception=True)
    #     serializer.save()

    #     return Response(serializer.data, status=201)
    def perform_create(self, serializer):
        print("Creating review...")  # DEBUG
        user = self.request.user
        freelancer_id = self.kwargs.get('freelancer_id')

        client_name = user.full_name or user.username
        client_avatar = "".join([part[0].upper() for part in client_name.split()[:2]])

        serializer.save(
            freelancer_id=freelancer_id,
            client=user,
            client_name=client_name,
            client_avatar=client_avatar,
            helpful_count=0
        )

    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        review = self.get_object()
        review.helpful_count += 1
        review.save()
        return Response({'helpful_count': review.helpful_count})
    
    @action(detail=True, methods=['post'])
    def add_reply(self, request, pk=None, *args, **kwargs):
        review = self.get_object()

        serializer = ReviewReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save(review=review)
        return Response(serializer.data, status=201)
    
  
class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer

class JobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer