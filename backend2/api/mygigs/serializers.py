

from rest_framework import serializers
from .models import Freelancer, Job, Profession, Review, ReviewReply, Testimonial


class FreelancerSerializer(serializers.ModelSerializer):
      county = serializers.StringRelatedField()
      constituency = serializers.StringRelatedField()
      ward = serializers.StringRelatedField()
      
      class Meta:
          model = Freelancer
          fields = '__all__'

  
class ProfessionSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    count = serializers.SerializerMethodField()
    
    class Meta:
        model = Profession
        fields = ['id', 'name', 'image_url', 'count', 'description']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None
    
    def get_count(self, obj):
        return obj.get_freelancer_count()
    
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