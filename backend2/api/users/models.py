from django.db import models
from django.contrib.auth.models import User

class ClerkProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="clerk_profile")
    clerk_id = models.CharField(max_length=255, unique=True)
    profile_image = models.URLField(blank=True, null=True)
    role=models.CharField(max_length=100, default="user")

    def __str__(self):
        return f"Clerk profile for {self.user.username}"
