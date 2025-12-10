

from rest_framework import serializers
from .models import Freelancer, Job, Profession, Review, ReviewReply, Testimonial


# class FreelancerSerializer(serializers.ModelSerializer):
#       county = serializers.StringRelatedField()
#       constituency = serializers.StringRelatedField()
#       ward = serializers.StringRelatedField()
      
#       class Meta:
#           model = Freelancer
#           fields = '__all__'

  
# class ProfessionSerializer(serializers.ModelSerializer):
#     image_url = serializers.SerializerMethodField()
#     count = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Profession
#         fields = ['id', 'name', 'image_url', 'count', 'description']
    
#     def get_image_url(self, obj):
#         request = self.context.get('request')
#         if obj.image and hasattr(obj.image, 'url'):
#             return request.build_absolute_uri(obj.image.url)
#         return None
    
#     def get_count(self, obj):
#         return obj.get_freelancer_count()
    
class ProfessionSerializer(serializers.ModelSerializer):
    count = serializers.SerializerMethodField()
    imageUrl = serializers.SerializerMethodField()
    
    class Meta:
        model = Profession
        fields = ['id', 'name', 'description', 'imageUrl', 'count']
    
    def get_count(self, obj):
        return obj.freelancers.filter(is_active=True).count()
    
    def get_imageUrl(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url)
        return None


class FreelancerListSerializer(serializers.ModelSerializer):
    """Serializer for listing freelancers (lightweight)"""
    profession_name = serializers.CharField(source='profession.name', read_only=True)
    avatar_initials = serializers.SerializerMethodField()
    
    class Meta:
        model = Freelancer
        fields = [
            'id', 'name', 'profession_name', 'county', 'constituency', 'ward',
            'rating', 'review_count', 'hourly_rate', 'years_experience',
            'completed_jobs', 'skills', 'avatar', 'avatar_initials', 'availability'
        ]
    
    def get_avatar_initials(self, obj):
        parts = obj.name.split()
        if len(parts) >= 2:
            return f"{parts[0][0]}{parts[1][0]}".upper()
        return obj.name[:2].upper()


class FreelancerDetailSerializer(serializers.ModelSerializer):
    """Full serializer for freelancer detail page"""
    profession = ProfessionSerializer(read_only=True)
    reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Freelancer
        fields = '__all__'
    
    def get_reviews(self, obj):
        reviews = obj.review.all().order_by('-created_at')[:5]
        return ReviewSerializer(reviews, many=True).data


class ReviewReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReply
        fields = ['content', 'created_at']
 
class ReviewSerializer(serializers.ModelSerializer):
    reply = ReviewReplySerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    posted = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = '__all__'
    
    def get_posted(self, obj):
        return obj.posted_time_ago()
    
class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'