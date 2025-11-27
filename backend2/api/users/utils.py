from django.contrib.auth.models import User
from .models import ClerkProfile

def get_or_create_user_from_clerk(clerk_id, email, first_name="", last_name="", image_url=None):
    # Try getting existing profile
    try:
        profile = ClerkProfile.objects.get(clerk_id=clerk_id)
        return profile.user

    except ClerkProfile.DoesNotExist:
        pass

    # User does not exist → create Django user
    username = f"user_{clerk_id}"

    user = User.objects.create(
        username=username,
        first_name=first_name or "",
        last_name=last_name or "",
        email=email or "",
    )

    # Create Clerk profile
    ClerkProfile.objects.create(
        user=user,
        clerk_id=clerk_id,
        profile_image=image_url
    )

    return user
