from time import timezone
from django.db import models
from django.contrib.auth.models import User   
from django.core.validators import MinValueValidator, MaxValueValidator


# Create your models here.
class Freelancer(models.Model):
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    county = models.CharField(max_length=200)
    constituency = models.CharField(max_length=200)
    ward = models.CharField(max_length=200)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    reviews = models.IntegerField(default=0)
    completed_jobs = models.IntegerField(default=0)
    skills = models.JSONField(default=list)  # or ManyToManyField to Skill model
    avatar = models.ImageField(upload_to='freelancers/')  # or ImageField for actual images
    years_experience = models.IntegerField()
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Profession(models.Model):
    name = models.CharField(max_length=100, unique=True)
    image = models.ImageField(upload_to='professions/')
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
     
    def get_freelancer_count(self):
        return self.freelancer_set.count()
    
 
class Review(models.Model):
    freelancer = models.ForeignKey('Freelancer', on_delete=models.CASCADE, related_name='review')
    client = models.ForeignKey(User, on_delete=models.CASCADE)
    client_name = models.CharField(max_length=200)
    client_avatar = models.CharField(max_length=10)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    content = models.TextField()
    helpful_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
 
class ReviewReply(models.Model):
    review = models.OneToOneField('Review', on_delete=models.CASCADE, related_name='reply')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Job(models.Model):
    JOB_TYPES = [
         ('full-time', 'Full-time'),
         ('part-time', 'Part-time'),
         ('contract', 'Contract'),
     ]
     
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=JOB_TYPES)
    budget = models.CharField(max_length=100)
    skills = models.JSONField(default=list)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
     
    def posted_time_ago(self):
          # Calculate time difference
         from django.utils import timezone
         delta = timezone.now() - self.created_at
         if delta.days == 0:
             return "Today"
         elif delta.days == 1:
             return "1 day ago"
         else:
             return f"{delta.days} days ago"
 

class Testimonial(models.Model):
    name = models.CharField(max_length=200)
    content = models.TextField()
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    avatar = models.CharField(max_length=10)  # or ImageField
    is_approved = models.BooleanField(default=False)  # For moderation
    created_at = models.DateTimeField(auto_now_add=True)

 
