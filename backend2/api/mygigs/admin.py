from django.contrib import admin

from .models import Freelancer, Profession, Review, ReviewReply, Job, Testimonial

# Register your models here.

class ProfessionAdmin(admin.ModelAdmin):
    list_display = ('name', 'image', 'description')
admin.site.register(Profession, ProfessionAdmin)

class FreelancerAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'county', 'constituency', 'ward', 'rating', 'hourly_rate', 'is_featured', 'created_at')
    search_fields = ('name', 'title', 'county', 'constituency', 'ward')
    list_filter = ('is_featured', 'created_at')
    ordering = ('-created_at',)
admin.site.register(Freelancer, FreelancerAdmin)


class ReviewAdmin(admin.ModelAdmin):
    list_display = ('freelancer', 'client_name', 'rating', 'helpful_count', 'created_at')
    search_fields = ('freelancer__name', 'client_name', 'content')
    list_filter = ('rating', 'created_at')
    ordering = ('-created_at',)
admin.site.register(Review, ReviewAdmin)

class ReviewReplyAdmin(admin.ModelAdmin):
    list_display = ('review', 'content', 'created_at')
    search_fields = ('review__client_name', 'content')
    ordering = ('-created_at',)
admin.site.register(ReviewReply, ReviewReplyAdmin)

class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'location' )
    search_fields = ('title', 'company', 'location')

   
admin.site.register(Job, JobAdmin)  

class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'content', 'rating', 'created_at')
    search_fields = ('name', 'freelancer__name', 'content')
    list_filter = ('rating', 'created_at')
    ordering = ('-created_at',)
admin.site.register(Testimonial, TestimonialAdmin)